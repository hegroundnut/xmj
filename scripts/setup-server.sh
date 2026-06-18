#!/usr/bin/env bash
# ============================================================================
# 洗眉机小程序 — Linux 服务端一键部署脚本
# 适用：Ubuntu 20.04+ / Debian 11+ / CentOS 7+
# 用法：chmod +x setup-server.sh && sudo ./setup-server.sh
# ============================================================================
set -euo pipefail

# ======================== 颜色输出 ========================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ======================== 路径常量 ========================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="${ROOT_DIR}/help/docker"

# ======================== 参数或默认值 ========================
SERVER_IP="${1:-$(curl -s ifconfig.me 2>/dev/null || echo '127.0.0.1')}"
ADMIN_BUILD="${ADMIN_BUILD:-yes}"       # 是否编译 admin 前端
SKIP_DB_INIT="${SKIP_DB_INIT:-no}"      # 跳过数据库初始化
DB_ROOT_PASS="123456"

echo "============================================"
echo "  洗眉机小程序 — 服务端部署"
echo "  服务器 IP: ${SERVER_IP}"
echo "  项目目录: ${ROOT_DIR}"
echo "============================================"

# ======================== 1. 检查依赖 ========================
echo ""
info "检查系统依赖..."

command -v docker >/dev/null 2>&1 || error "请先安装 Docker: curl -fsSL https://get.docker.com | sh"

DOCKER_COMPOSE=""
if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  error "请安装 Docker Compose"
fi
info "Docker 已就绪 (compose: ${DOCKER_COMPOSE})"

# ======================== 2. MySQL 配置文件 ========================
echo ""
info "准备 MySQL 配置..."
mkdir -p "${DOCKER_DIR}/mysql/conf.d" "${DOCKER_DIR}/mysql/data" "${DOCKER_DIR}/mysql/log" "${DOCKER_DIR}/nginx/log"

cat > "${DOCKER_DIR}/mysql/conf.d/custom.cnf" << 'MYSQL_EOF'
[mysqld]
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
MYSQL_EOF
info "MySQL 配置已写入"

# ======================== 3. 启动 Docker 容器 ========================
echo ""
info "启动 Docker 容器..."
cd "${DOCKER_DIR}"

${DOCKER_COMPOSE} down --remove-orphans 2>/dev/null || true
${DOCKER_COMPOSE} up -d

# 等 MySQL 就绪
echo -n "等待 MySQL 启动"
for i in $(seq 1 30); do
  if docker exec crmeb_mysql mysqladmin ping -uroot -p${DB_ROOT_PASS} --silent 2>/dev/null; then
    echo ""
    info "MySQL 已就绪"
    break
  fi
  echo -n "."
  sleep 2
done

# ======================== 4. 初始化数据库 ========================
if [ "${SKIP_DB_INIT}" != "yes" ]; then
  echo ""
  info "初始化数据库..."

  docker exec crmeb_mysql mysql -uroot -p${DB_ROOT_PASS} -e "
    DROP DATABASE IF EXISTS crmeb;
    CREATE DATABASE crmeb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  "

  info "导入基础表 (crmeb.sql)..."
  docker exec -i crmeb_mysql mysql -uroot -p${DB_ROOT_PASS} crmeb \
    --default-character-set=utf8mb4 \
    --init-command="SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';" \
    < "${ROOT_DIR}/crmeb/public/install/crmeb.sql"

  info "导入教学模块表..."
  docker exec -i crmeb_mysql mysql -uroot -p${DB_ROOT_PASS} crmeb \
    --default-character-set=utf8mb4 \
    < "${ROOT_DIR}/crmeb/sql/migration_teaching.sql"

  info "隐藏商城菜单..."
  docker exec -i crmeb_mysql mysql -uroot -p${DB_ROOT_PASS} crmeb \
    --default-character-set=utf8mb4 \
    < "${ROOT_DIR}/crmeb/sql/hide_shop_menus.sql"

  info "数据库初始化完成"
else
  warn "跳过数据库初始化 (SKIP_DB_INIT=yes)"
fi

# ======================== 5. 修复权限 ========================
echo ""
info "修复 runtime 权限..."
docker exec crmeb_php chown -R www-data:www-data /var/www/runtime 2>/dev/null || true
info "权限已修复"

# ======================== 6. 编译管理后台前端 ========================
if [ "${ADMIN_BUILD}" = "yes" ]; then
  echo ""
  info "编译管理后台前端..."

  if ! command -v node >/dev/null 2>&1; then
    warn "未安装 Node.js，跳过 admin 编译（可后续手动执行）"
  else
    cd "${ROOT_DIR}/template/admin"

    if [ ! -d "node_modules" ]; then
      info "安装依赖 (npm install)..."
      npm install --registry=https://registry.npmmirror.com
    fi

    info "编译中 (npm run build)..."
    npm run build

    if [ -d "dist" ]; then
      info "部署到 PHP 容器..."
      docker exec crmeb_php rm -rf /var/www/public/admin 2>/dev/null || true
      docker cp dist/. crmeb_php:/var/www/public/admin/
      info "Admin 前端部署完成"
    else
      warn "编译产物 dist/ 不存在，请检查 build 输出"
    fi
  fi
else
  warn "跳过 admin 编译 (ADMIN_BUILD=no)"
fi

# ======================== 7. 验证 ========================
echo ""
echo "============================================"
info "部署完毕，开始验证..."

HTTP_PORT="8011"
BASE_URL="http://${SERVER_IP}:${HTTP_PORT}"

check_api() {
  local path="$1"
  local desc="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v2/${path}" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    info "${desc}: ${code}"
  else
    warn "${desc}: ${code} (请检查)"
  fi
}

echo ""
info "API 接口检查:"
check_api "product/info"        "产品信息"
check_api "case/list"           "案例列表"
check_api "course/list"         "课程列表"
check_api "offline_class/list"  "线下排期"

echo ""
info "访问地址:"
echo "   管理后台:  ${BASE_URL}/admin/"
echo "   产品 API:  ${BASE_URL}/api/v2/product/info"
echo "   案例 API:  ${BASE_URL}/api/v2/case/list"
echo ""
info "全部完成！"
echo "   如需重新编译 admin: cd template/admin && npm run build && docker cp dist/. crmeb_php:/var/www/public/admin/"
