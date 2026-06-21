# ============================================================
# CRMEB 后台服务一键启动/管理 (Windows PowerShell)
# ============================================================
# 用法:
#   .\scripts\start.ps1              # 启动所有后台服务
#   .\scripts\start.ps1 -Stop        # 停止所有服务
#   .\scripts\start.ps1 -Restart     # 重启所有服务
#   .\scripts\start.ps1 -Status      # 查看服务状态
#   .\scripts\start.ps1 -Logs        # 查看日志
# ============================================================
# 后台服务组成 (Docker Compose):
#   MySQL 5.7   → 端口 33061   (内部3306)
#   Redis       → 端口 63791   (内部6379)
#   PHP-FPM 7.4 → 端口 9000
#   Nginx       → 端口 8011    (内部80)
# ============================================================

param(
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Logs
)

$ROOT = Split-Path -Parent $PSScriptRoot
$DOCKER_DIR = "$ROOT\help\docker"

Set-Location $DOCKER_DIR

if ($Stop) {
    Write-Host "=== 停止所有后台服务 ===" -ForegroundColor Yellow
    docker compose down
}
elseif ($Restart) {
    Write-Host "=== 重启所有后台服务 ===" -ForegroundColor Yellow
    docker compose down
    docker compose up -d
    Write-Host "服务已重启" -ForegroundColor Green
}
elseif ($Status) {
    Write-Host "=== 服务状态 ===" -ForegroundColor Cyan
    docker compose ps
}
elseif ($Logs) {
    Write-Host "=== 实时日志 (Ctrl+C 退出) ===" -ForegroundColor Cyan
    docker compose logs -f --tail=50
}
else {
    Write-Host "=== 启动所有后台服务 ===" -ForegroundColor Yellow
    docker compose up -d
    Write-Host ""
    Write-Host "服务启动完成，端口映射:" -ForegroundColor Green
    Write-Host "  H5 前端:    http://服务器IP:8011/"
    Write-Host "  后台管理:   http://服务器IP:8011/admin  (账号:admin 密码:crmeb.com)"
    Write-Host "  MySQL:      端口 33061"
    Write-Host "  Redis:      端口 63791"
}

Set-Location $ROOT
