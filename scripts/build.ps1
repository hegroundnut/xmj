# ============================================================
# CRMEB 前端一键编译脚本 (Windows PowerShell)
# ============================================================
# 用法:
#   .\scripts\build.ps1              # 交互式选择
#   .\scripts\build.ps1 -All          # 编译全部三个前端
#   .\scripts\build.ps1 -H5           # 仅编译 H5 移动端
#   .\scripts\build.ps1 -Admin        # 仅编译后台管理界面
#   .\scripts\build.ps1 -MpWeixin     # 仅编译微信小程序
# ============================================================

param(
    [switch]$All,
    [switch]$H5,
    [switch]$Admin,
    [switch]$MpWeixin
)

$ROOT = Split-Path -Parent $PSScriptRoot

# 如果没有任何参数，显示帮助
if (-not ($All -or $H5 -or $Admin -or $MpWeixin)) {
    Write-Host "`n=== CRMEB 前端编译 ===" -ForegroundColor Cyan
    Write-Host "  [1] 全部编译"
    Write-Host "  [2] H5 移动端"
    Write-Host "  [3] 后台管理界面"
    Write-Host "  [4] 微信小程序"
    Write-Host "  [0] 退出"
    $choice = Read-Host "`n请选择"
    switch ($choice) {
        '1' { $All = $true }
        '2' { $H5 = $true }
        '3' { $Admin = $true }
        '4' { $MpWeixin = $true }
        default { exit }
    }
}

# ---- 编译后台管理界面 (Admin SPA) ----
# 技术栈: Vue 2 + Element UI + Webpack
# 输入:   template/admin/src/
# 输出:   template/admin/dist/  → 复制到 crmeb/public/admin/
# 访问:   http://服务器IP:8011/admin
if ($All -or $Admin) {
    Write-Host "`n[1/3] 编译后台管理界面..." -ForegroundColor Yellow
    Set-Location "$ROOT\template\admin"

    if (-not (Test-Path "node_modules")) {
        Write-Host "  安装依赖..." -ForegroundColor Gray
        npm install
    }

    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Host "  后台编译失败!" -ForegroundColor Red; exit 1 }

    # 复制到 crmeb/public/admin/
    $dest = "$ROOT\crmeb\public\admin"
    Write-Host "  复制到 $dest ..." -ForegroundColor Gray
    Remove-Item "$dest\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item -Path "dist\*" -Destination $dest -Recurse -Force

    Write-Host "  后台管理界面 编译完成" -ForegroundColor Green
    Set-Location $ROOT
}

# ---- 编译 H5 移动端 (UniApp H5) ----
# 技术栈: UniApp (Vue 2) + Webpack 4
# 输入:   template/uni-app/src/
# 输出:   template/uni-app/dist/build/h5/  → 复制到 crmeb/public/
# 访问:   http://服务器IP:8011/
# API地址: 自动跟随浏览器域名 (src/config/app.js)
if ($All -or $H5) {
    Write-Host "`n[2/3] 编译 H5 移动端..." -ForegroundColor Yellow
    Set-Location "$ROOT\template\uni-app"

    if (-not (Test-Path "node_modules")) {
        Write-Host "  安装依赖..." -ForegroundColor Gray
        npm install --legacy-peer-deps
    }

    npm run build:h5
    if ($LASTEXITCODE -ne 0) { Write-Host "  H5 编译失败!" -ForegroundColor Red; exit 1 }

    # 复制到 crmeb/public/ (覆盖 index.html 和 static/)
    $dest = "$ROOT\crmeb\public"
    Write-Host "  复制到 $dest ..." -ForegroundColor Gray

    # 删除旧的 H5 文件 (保留 admin/ 和 home/ 目录)
    Get-ChildItem "$dest\static\js\pages-*.js" -ErrorAction SilentlyContinue | Remove-Item -Force
    Copy-Item -Path "dist\build\h5\index.html" -Destination $dest -Force
    Copy-Item -Path "dist\build\h5\static\*" -Destination "$dest\static" -Recurse -Force

    Write-Host "  H5 移动端 编译完成" -ForegroundColor Green
    Set-Location $ROOT
}

# ---- 编译微信小程序 (UniApp mp-weixin) ----
# 技术栈: UniApp (Vue 2) + Webpack 4
# 输入:   template/uni-app/src/
# 输出:   template/uni-app/dist/build/mp-weixin/
# 使用:   微信开发者工具 → 导入 dist/build/mp-weixin/
# API地址: src/config/app.js → HTTP_REQUEST_URL (小程序/APP 段)
if ($All -or $MpWeixin) {
    Write-Host "`n[3/3] 编译微信小程序..." -ForegroundColor Yellow
    Set-Location "$ROOT\template\uni-app"

    if (-not (Test-Path "node_modules")) {
        Write-Host "  安装依赖..." -ForegroundColor Gray
        npm install --legacy-peer-deps
    }

    npm run build:mp-weixin
    if ($LASTEXITCODE -ne 0) { Write-Host "  小程序编译失败!" -ForegroundColor Red; exit 1 }

    Write-Host "  微信小程序 编译完成" -ForegroundColor Green
    Write-Host "  请用 微信开发者工具 打开: template\uni-app\dist\build\mp-weixin\" -ForegroundColor Cyan
    Set-Location $ROOT
}

Write-Host "`n=== 全部编译完成 ===" -ForegroundColor Green
