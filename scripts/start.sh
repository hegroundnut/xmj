#!/bin/bash
# ============================================================
# CRMEB 后台服务一键启动/管理 (Linux/macOS)
# ============================================================
# 用法:
#   bash scripts/start.sh            # 启动所有后台服务
#   bash scripts/start.sh stop       # 停止所有服务
#   bash scripts/start.sh restart    # 重启所有服务
#   bash scripts/start.sh status     # 查看服务状态
#   bash scripts/start.sh logs       # 查看日志 (ctrl+c 退出)
# ============================================================
# 后台服务组成 (Docker Compose):
#   MySQL 5.7   → 端口 33061   (内部3306)
#   Redis       → 端口 63791   (内部6379)
#   PHP-FPM 7.4 → 端口 9000
#   Nginx       → 端口 8011    (内部80)
# ============================================================

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_DIR="$ROOT/help/docker"

cd "$DOCKER_DIR"

case "${1:-start}" in
    start)
        echo "=== 启动所有后台服务 ==="
        docker compose up -d
        echo ""
        echo "服务启动完成，端口映射:"
        echo "  H5 前端:    http://服务器IP:8011/"
        echo "  后台管理:   http://服务器IP:8011/admin  (账号:admin 密码:crmeb.com)"
        echo "  MySQL:      端口 33061"
        echo "  Redis:      端口 63791"
        ;;

    stop)
        echo "=== 停止所有后台服务 ==="
        docker compose down
        ;;

    restart)
        echo "=== 重启所有后台服务 ==="
        docker compose down
        docker compose up -d
        echo "服务已重启"
        ;;

    status)
        echo "=== 服务状态 ==="
        docker compose ps
        ;;

    logs)
        echo "=== 实时日志 (Ctrl+C 退出) ==="
        docker compose logs -f --tail=50
        ;;

    *)
        echo "用法: bash scripts/start.sh [start|stop|restart|status|logs]"
        exit 1
        ;;
esac
