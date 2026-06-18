<#
============================================================================
 洗眉机小程序 — Windows 一键部署脚本 (PowerShell)
 用法: 右键 "使用 PowerShell 运行" 或终端: .\setup-windows.ps1
 涵盖: Docker 后端部署 + 数据库初始化 + 小程序客户端准备
============================================================================
#>
$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "洗眉机小程序部署"

# ======================== 路径常量 ========================
$ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
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
$ENV_FILE = Join-Path $CRM_DIR ".env"

$DB_ROOT_PASS = "123456"
$HTTP_PORT = "8011"

function Write-Step { param($Msg) Write-Host "`n============================================" -ForegroundColor Cyan; Write-Host "  $Msg" -ForegroundColor Cyan; Write-Host "============================================" -ForegroundColor Cyan }
function info { Write-Host "[✓] $args" -ForegroundColor Green }
function warn { Write-Host "[!] $args" -ForegroundColor Yellow }
function err  { Write-Host "[✗] $args" -ForegroundColor Red; throw $args }

# ======================================================================
#  主菜单
# ======================================================================
Clear-Host
Write-Host @'
  ╔═══════════════════════════════════════╗
  ║     洗眉机小程序 — Windows 部署     ║
  ╚═══════════════════════════════════════╝
'@
Write-Host ""
Write-Host "  1. 完整部署 (Docker 后端 + 数据库导入 + Admin 编译 + 小程序准备)"
Write-Host "  2. 仅 Docker 后端 (启动容器 + 数据库导入)"
Write-Host "  3. 仅 Admin 前端编译"
Write-Host "  4. 仅小程序客户端准备 (改 IP / AppID / HBuilderX)"
Write-Host "  0. 退出"
Write-Host ""
$choice = Read-Host "请选择 [1]"

if ($choice -eq '0') { exit }

# ======================================================================
#  Step A: Docker 后端部署
# ======================================================================
if ($choice -in '1','2') {
    Write-Step "A-1. 检查 Docker Desktop"

    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $docker) { err "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop/" }

    $dockerRunning = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        warn "Docker 未运行，请先启动 Docker Desktop，然后回车继续..."
        Read-Host
        docker info 2>&1
        if ($LASTEXITCODE -ne 0) { err "Docker 仍然未运行" }
    }
    info "Docker Desktop 已运行"

    # Docker Compose 命令
    docker compose version 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $compose = "docker compose"
    } else {
        docker-compose --version 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $compose = "docker-compose" }
        else { err "未找到 docker compose" }
    }
    info "Docker Compose: $compose"

    # ---- MySQL 配置 ----
    Write-Step "A-2. 准备 MySQL 配置"
    New-Item -ItemType Directory -Force -Path $MYSQL_CONF_DIR | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "mysql\data") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "mysql\log") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $DOCKER_DIR "nginx\log") | Out-Null

    $customCnf = Join-Path $MYSQL_CONF_DIR "custom.cnf"
    @"
[mysqld]
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
"@ | Out-File -FilePath $customCnf -Encoding ascii
    info "MySQL sql_mode 配置已写入: $customCnf"

    # ---- 启动容器 ----
    Write-Step "A-3. 启动 Docker 容器"
    Push-Location $DOCKER_DIR
    try {
        Invoke-Expression "$compose down --remove-orphans 2>`$null" -ErrorAction SilentlyContinue
        Invoke-Expression "$compose up -d"
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            err "Docker 启动失败，请检查 $DOCKER_DIR\docker-compose.yml"
        }
        info "容器已启动"
    } finally {
        Pop-Location
    }

    # ---- 等待 MySQL ----
    Write-Host "等待 MySQL 就绪..." -NoNewline
    for ($i=0; $i -lt 30; $i++) {
        $ping = docker exec crmeb_mysql mysqladmin ping -uroot -p$DB_ROOT_PASS --silent 2>&1
        if ($LASTEXITCODE -eq 0) { Write-Host ""; info "MySQL 已就绪"; break }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }

    # ---- 导入 SQL ----
    Write-Step "A-4. 初始化数据库"

    Write-Host "  创建数据库..."
    docker exec crmeb_mysql mysql -uroot -p$DB_ROOT_PASS -e @"
DROP DATABASE IF EXISTS crmeb;
CREATE DATABASE crmeb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
"@

    Write-Host "  导入基础表 (crmeb.sql)..."
    Get-Content $CRMEB_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4 --init-command="SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';"

    Write-Host "  导入教学模块表..."
    Get-Content $TEACHING_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4

    Write-Host "  隐藏商城菜单..."
    Get-Content $HIDE_MENUS_SQL -Raw | docker exec -i crmeb_mysql mysql -uroot -p$DB_ROOT_PASS crmeb --default-character-set=utf8mb4

    info "数据库初始化完成"

    # ---- 修复权限 ----
    Write-Step "A-5. 修复 runtime 权限"
    docker exec crmeb_php chown -R www-data:www-data /var/www/runtime 2>$null
    info "权限已修复"

    $SERVER_IP = "localhost"
    info "Docker 后端部署完成! 访问地址: http://localhost:$HTTP_PORT"
}

# ======================================================================
#  Step B: Admin 前端编译
# ======================================================================
if ($choice -in '1','3') {
    Write-Step "B. 编译管理后台前端"

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) { err "未安装 Node.js，请从 https://nodejs.org 安装后重试" }
    info "Node.js: $(node -v)"

    Push-Location $ADMIN_DIR
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  安装依赖 (npm install)..."
            npm install --registry=https://registry.npmmirror.com
            if ($LASTEXITCODE -ne 0) { err "npm install 失败" }
        }

        Write-Host "  编译中 (npm run build)..."
        npm run build
        if ($LASTEXITCODE -ne 0) { err "编译失败" }

        if (Test-Path "dist") {
            Write-Host "  部署到 PHP 容器..."
            docker exec crmeb_php rm -rf /var/www/public/admin 2>$null
            docker cp dist\. crmeb_php:/var/www/public/admin/
            info "Admin 前端编译并部署完成"
            info "访问: http://localhost:$HTTP_PORT/admin/"
        } else {
            err "编译产物 dist/ 不存在"
        }
    } finally {
        Pop-Location
    }
}

# ======================================================================
#  Step C: 小程序客户端准备
# ======================================================================
if ($choice -in '1','4') {
    Write-Step "C-1. 配置 API 地址"

    $useLocal = Read-Host "是否使用本地 Docker 后端? [Y/n]"
    if ($useLocal -eq '' -or $useLocal -eq 'y' -or $useLocal -eq 'Y') {
        $NEW_URL = "http://localhost:$HTTP_PORT"
    } else {
        $ip = Read-Host "请输入服务器 IP（如 121.41.54.226）"
        $NEW_URL = "http://${ip}:$HTTP_PORT"
    }

    $OLD_URL = "http://121.41.54.226:8011"
    (Get-Content $CONFIG_FILE -Raw -Encoding UTF8).Replace($OLD_URL, $NEW_URL) | Set-Content $CONFIG_FILE -Encoding UTF8
    info "API 地址: $NEW_URL"

    # ---- AppID ----
    Write-Host ""
    Write-Host "[C-2] 配置微信小程序 AppID"
    $appid = Read-Host "请输入 AppID（可回车跳过，先填占位符用测试号预览）"
    if ($appid) {
        try {
            $manifest = Get-Content $MANIFEST_FILE -Raw -Encoding UTF8 | ConvertFrom-Json
            $manifest.'mp-weixin'.appid = $appid
            $manifest | ConvertTo-Json -Depth 20 | Set-Content $MANIFEST_FILE -Encoding UTF8
            info "AppID: $appid"
        } catch {
            warn "AppID 写入失败，请手动修改 manifest.json 中 mp-weixin.appid 字段"
        }
    } else {
        warn "跳过 AppID（当前占位 AppID 仅可在测试号体验）"
    }

    # ---- HBuilderX ----
    Write-Host ""
    Write-Host "[C-3] 检查 HBuilderX"

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
        info "HBuilderX: $hbx"
        $open = Read-Host "是否立即打开 HBuilderX? [Y/n]"
        if ($open -eq '' -or $open -eq 'y') { Start-Process $hbx }
    } else {
        warn "未找到 HBuilderX"
        Write-Host "  下载: https://www.dcloud.io/hbuilderx.html"
        Write-Host "  注意: 必须 HBuilderX，不要用 2018 版 HBuilder"
    }
}

# ======================================================================
#  验证 & 收尾
# ======================================================================
if ($choice -in '1','2') {
    Write-Step "验证 API"

    $tests = @(
        @{path="product/info";       desc="产品信息"},
        @{path="case/list";          desc="案例列表"},
        @{path="course/list";        desc="课程列表"},
        @{path="offline_class/list"; desc="线下排期"}
    )

    foreach ($t in $tests) {
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:$HTTP_PORT/api/v2/$($t.path)" -UseBasicParsing -TimeoutSec 5
            if ($res.StatusCode -eq 200) { info "$($t.desc): OK" }
            else { warn "$($t.desc): $($res.StatusCode)" }
        } catch {
            warn "$($t.desc): 无法访问"
        }
    }
}

Write-Host ""
Write-Host @'
  ╔═══════════════════════════════════════╗
  ║            部署完成!                  ║
  ╚═══════════════════════════════════════╝

  管理后台:  http://localhost:8011/admin/
  产品 API:  http://localhost:8011/api/v2/product/info

  【小程序下一步】在 HBuilderX 中:
    文件 → 导入 → 从本地目录导入
    → 选择 template\uni-app
    → 运行 → 运行到小程序模拟器 → 微信小程序
'@
