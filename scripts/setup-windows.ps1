<#
============================================================================
  Brow-Washing Mini Program — Windows Deployment Script
  Usage: Right-click "Run with PowerShell" or: .\setup-windows.ps1
  Covers: Docker backend + DB init + Admin build + Mini program prep
============================================================================
#>
$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Brow-Washing Mini Program Setup"

# Paths
$ROOT = Split-Path -Parent $PSScriptRoot
$DOCKER_DIR = Join-Path $ROOT "help\docker"
$MYSQL_CONF_DIR = Join-Path $DOCKER_DIR "mysql\conf.d"

$UNI_APP_DIR = Join-Path $ROOT "template\uni-app"
$ADMIN_DIR = Join-Path $ROOT "template\admin"
$CONFIG_FILE = Join-Path $UNI_APP_DIR "config\app.js"
$MANIFEST_FILE = Join-Path $UNI_APP_DIR "manifest.json"
$CRM_DIR = Join-Path $ROOT "crmeb"

$CRMEB_SQL = Join-Path $CRM_DIR "public\install\crmeb.sql"
$TEACHING_SQL = Join-Path $CRM_DIR "sql\migration_teaching.sql"
$HIDE_MENUS_SQL = Join-Path $CRM_DIR "sql\hide_shop_menus.sql"

$DB_ROOT_PASS = "123456"
$HTTP_PORT = "8011"

function info  { Write-Host "[OK] $args" -ForegroundColor Green }
function warn  { Write-Host "[!!] $args" -ForegroundColor Yellow }
function fatal { Write-Host "[ERROR] $args" -ForegroundColor Red; pause; exit 1 }

# ======================================================================
#  Main Menu
# ======================================================================
Clear-Host
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Brow-Washing Mini Program - Windows Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Full deploy (Docker + DB + Admin + Mini Program)"
Write-Host "  2. Docker backend only (containers + DB init)"
Write-Host "  3. Admin frontend build only"
Write-Host "  4. Mini program client prep only (API URL + AppID + HBuilderX)"
Write-Host "  0. Exit"
Write-Host ""
$choice = Read-Host "Choose [1]"
if ($choice -eq '0') { exit }

# ======================================================================
#  Step A: Docker Backend
# ======================================================================
if ($choice -in '1','2') {
    Write-Host "`n--- A-1. Check Docker Desktop ---" -ForegroundColor Yellow

    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerCmd) { fatal "Docker Desktop not found. Install from: https://www.docker.com/products/docker-desktop/" }

    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        warn "Docker not running. Please start Docker Desktop, then press Enter..."
        Read-Host
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { fatal "Docker still not running. Start Docker Desktop manually." }
    }
    info "Docker Desktop is running"

    # Docker Compose
    docker compose version 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { fatal "docker compose not found — update Docker Desktop" }
    info "Compose: docker compose"

    # ---- MySQL Config ----
    Write-Host "`n--- A-2. MySQL config ---" -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $MYSQL_CONF_DIR | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "mysql\data") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "mysql\log") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "nginx\log") | Out-Null

    $customCnf = Join-Path $MYSQL_CONF_DIR "custom.cnf"
    "[mysqld]`nsql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION`n" | Out-File -FilePath $customCnf -Encoding ascii
    info "MySQL sql_mode config written: $customCnf"

    # ---- Start Containers ----
    Write-Host "`n--- A-3. Start Docker containers ---" -ForegroundColor Yellow
    $COMPOSE_FILE = Join-Path $DOCKER_DIR "docker-compose.yml"
    if (-not (Test-Path $COMPOSE_FILE)) {
        fatal "Compose file not found: $COMPOSE_FILE"
    }

    Push-Location $DOCKER_DIR
    try {
        # docker compose -f <file> down
        & docker compose -f $COMPOSE_FILE down --remove-orphans *>$null
        # docker compose -f <file> up -d
        & docker compose -f $COMPOSE_FILE up -d
        if ($LASTEXITCODE -ne 0) {
            fatal "Docker compose up failed. Check: $COMPOSE_FILE"
        }
        info "Containers started"
    } finally {
        Pop-Location
    }

    # ---- Wait for MySQL ----
    Write-Host "Waiting for MySQL..." -NoNewline
    for ($i = 0; $i -lt 30; $i++) {
        docker exec crmeb_mysql mysqladmin ping -uroot -p$DB_ROOT_PASS --silent 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ready"
            break
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    # ---- Import SQL ----
    Write-Host "`n--- A-4. Initialize database ---" -ForegroundColor Yellow

    Write-Host "  Creating database..."
    docker exec crmeb_mysql mysql -uroot -p$DB_ROOT_PASS -e "DROP DATABASE IF EXISTS crmeb; CREATE DATABASE crmeb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

    Write-Host "  Importing base tables (crmeb.sql)..."
    Get-Content $CRMEB_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4 --init-command="SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';"

    Write-Host "  Importing teaching module tables..."
    Get-Content $TEACHING_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4

    Write-Host "  Hiding shop menus..."
    Get-Content $HIDE_MENUS_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4

    info "Database init complete"

    # ---- Fix Permissions ----
    Write-Host "`n--- A-5. Fix permissions ---" -ForegroundColor Yellow
    docker exec crmeb_php chown -R www-data:www-data /var/www/runtime 2>&1 | Out-Null
    info "Permissions fixed"

    info "Docker backend deployed: http://localhost:$HTTP_PORT"
}

# ======================================================================
#  Step B: Admin Frontend Build
# ======================================================================
if ($choice -in '1','3') {
    Write-Host "`n--- B. Build Admin Frontend ---" -ForegroundColor Yellow

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) { fatal "Node.js not found. Install from: https://nodejs.org" }
    info "Node.js: $(node -v)"

    Push-Location $ADMIN_DIR
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  npm install..."
            npm install --registry=https://registry.npmmirror.com
            if ($LASTEXITCODE -ne 0) { fatal "npm install failed" }
            info "npm install done"
        }

        Write-Host "  npm run build..."
        npm run build
        if ($LASTEXITCODE -ne 0) { fatal "Build failed" }

        if (Test-Path "dist") {
            Write-Host "  Deploying to PHP container..."
            docker exec crmeb_php rm -rf /var/www/public/admin 2>&1 | Out-Null
            docker cp dist\. crmeb_php:/var/www/public/admin/
            info "Admin frontend deployed: http://localhost:$HTTP_PORT/admin/"
        } else {
            fatal "Build output dist/ not found"
        }
    } finally {
        Pop-Location
    }
}

# ======================================================================
#  Step C: Mini Program Client Prep
# ======================================================================
if ($choice -in '1','4') {
    Write-Host "`n--- C-1. Set API URL ---" -ForegroundColor Yellow

    $useLocal = Read-Host "Use local Docker backend? [Y/n]"
    if ($useLocal -eq '' -or $useLocal -eq 'y' -or $useLocal -eq 'Y') {
        $NEW_URL = "http://localhost:$HTTP_PORT"
    } else {
        $ip = Read-Host "Enter server IP (e.g. 121.41.54.226)"
        $NEW_URL = "http://${ip}:$HTTP_PORT"
    }

    $OLD_URL = "http://121.41.54.226:8011"
    if (Test-Path $CONFIG_FILE) {
        (Get-Content $CONFIG_FILE -Raw -Encoding UTF8).Replace($OLD_URL, $NEW_URL) | Set-Content $CONFIG_FILE -Encoding UTF8
        info "API URL: $NEW_URL"
    } else {
        warn "Config file not found: $CONFIG_FILE"
    }

    # ---- AppID ----
    Write-Host "`n--- C-2. Set WeChat AppID ---" -ForegroundColor Yellow
    $appid = Read-Host "Enter WeChat Mini Program AppID (press Enter to skip)"
    if ($appid) {
        try {
            $manifest = Get-Content $MANIFEST_FILE -Raw -Encoding UTF8 | ConvertFrom-Json
            $manifest.'mp-weixin'.appid = $appid
            $manifest | ConvertTo-Json -Depth 20 | Set-Content $MANIFEST_FILE -Encoding UTF8
            info "AppID set to: $appid"
        } catch {
            warn "Failed to set AppID. Edit manifest.json mp-weixin.appid manually."
        }
    } else {
        warn "AppID not set (placeholder works for test account only)"
    }

    # ---- HBuilderX ----
    Write-Host "`n--- C-3. Check HBuilderX ---" -ForegroundColor Yellow

    $hbPaths = @(
        "$env:LOCALAPPDATA\Programs\HBuilderX\HBuilderX.exe",
        "${env:ProgramFiles}\HBuilderX\HBuilderX.exe",
        "D:\HBuilderX\HBuilderX.exe",
        "$env:USERPROFILE\AppData\Local\Programs\HBuilderX\HBuilderX.exe"
    )

    $hbx = $null
    foreach ($p in $hbPaths) {
        if (Test-Path $p) { $hbx = $p; break }
    }

    if ($hbx) {
        info "HBuilderX found: $hbx"
        $open = Read-Host "Open HBuilderX now? [Y/n]"
        if ($open -eq '' -or $open -eq 'y') { Start-Process $hbx }
    } else {
        warn "HBuilderX not found. Download: https://www.dcloud.io/hbuilderx.html"
        Write-Host "  NOTE: Must use HBuilderX (NOT HBuilder 2018 edition)" -ForegroundColor Red
    }
}

# ======================================================================
#  Verify APIs
# ======================================================================
if ($choice -in '1','2') {
    Write-Host "`n--- Verify APIs ---" -ForegroundColor Yellow

    $tests = @(
        @{path="product/info";       desc="Product Info"},
        @{path="case/list";          desc="Case List"},
        @{path="course/list";        desc="Course List"},
        @{path="offline_class/list"; desc="Offline Class"}
    )

    foreach ($t in $tests) {
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:$HTTP_PORT/api/v2/$($t.path)" -UseBasicParsing -TimeoutSec 5
            if ($res.StatusCode -eq 200) { info "$($t.desc): 200 OK" }
            else { warn "$($t.desc): $($res.StatusCode)" }
        } catch {
            warn "$($t.desc): unreachable"
        }
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Admin:    http://localhost:8011/admin/"
Write-Host "  API:      http://localhost:8011/api/v2/product/info"
Write-Host ""
Write-Host "  [Next Steps for Mini Program]"
Write-Host "  1. In HBuilderX: File -> Import -> From Local Directory"
Write-Host "  2. Select: template\uni-app"
Write-Host "  3. Run -> Run to Mini Program Simulator -> WeChat Mini Program"
pause
