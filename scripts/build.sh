#!/bin/bash
# ============================================================
# CRMEB 前端一键编译脚本 (Linux/macOS)
# ============================================================
# 用法:
#   bash scripts/build.sh            # 交互式选择
#   bash scripts/build.sh all        # 编译全部三个前端
#   bash scripts/build.sh h5         # 仅编译 H5 移动端
#   bash scripts/build.sh admin      # 仅编译后台管理界面
#   bash scripts/build.sh mp         # 仅编译微信小程序
# ============================================================

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ---- 交互式选择 ----
if [ $# -eq 0 ]; then
    echo ""
    echo "=== CRMEB 前端编译 ==="
    echo "  [1] 全部编译"
    echo "  [2] H5 移动端"
    echo "  [3] 后台管理界面"
    echo "  [4] 微信小程序"
    echo "  [0] 退出"
    read -p "请选择: " choice
    case "$choice" in
        1) MODE="all" ;;
        2) MODE="h5" ;;
        3) MODE="admin" ;;
        4) MODE="mp" ;;
        *) exit 0 ;;
    esac
else
    MODE="$1"
fi

# ---- 编译后台管理界面 (Admin SPA) ----
# 技术栈: Vue 2 + Element UI + Webpack
# 输入:   template/admin/src/
# 输出:   template/admin/dist/  → 复制到 crmeb/public/admin/
# 访问:   http://服务器IP:8011/admin
# API地址: template/admin/.env.production → VUE_APP_API_URL (留空=自动)
build_admin() {
    echo ""
    echo "[1/3] 编译后台管理界面..."
    cd "$ROOT/template/admin"

    if [ ! -d "node_modules" ]; then
        echo "  安装依赖..."
        npm install
    fi

    npm run build || { echo "  后台编译失败!"; exit 1; }

    # 复制到 crmeb/public/admin/
    echo "  复制到 $ROOT/crmeb/public/admin/"
    rm -rf "$ROOT/crmeb/public/admin"/*
    cp -r dist/* "$ROOT/crmeb/public/admin/"

    echo "  后台管理界面 编译完成"
    cd "$ROOT"
}

# ---- 编译 H5 移动端 (UniApp H5) ----
# 技术栈: UniApp (Vue 2) + Webpack 4
# 输入:   template/uni-app/src/
# 输出:   template/uni-app/dist/build/h5/  → 复制到 crmeb/public/
# 访问:   http://服务器IP:8011/
# API地址: src/config/app.js → HTTP_REQUEST_URL (H5段自动跟随浏览器)
build_h5() {
    echo ""
    echo "[2/3] 编译 H5 移动端..."
    cd "$ROOT/template/uni-app"

    if [ ! -d "node_modules" ]; then
        echo "  安装依赖..."
        npm install --legacy-peer-deps
    fi

    npm run build:h5 || { echo "  H5 编译失败!"; exit 1; }

    # 复制到 crmeb/public/
    echo "  复制到 $ROOT/crmeb/public/"
    cp dist/build/h5/index.html "$ROOT/crmeb/public/"
    cp -r dist/build/h5/static/* "$ROOT/crmeb/public/static/"

    echo "  H5 移动端 编译完成"
    cd "$ROOT"
}

# ---- 编译微信小程序 (UniApp mp-weixin) ----
# 技术栈: UniApp (Vue 2) + Webpack 4
# 输入:   template/uni-app/src/
# 输出:   template/uni-app/dist/build/mp-weixin/
# 使用:   微信开发者工具 → 导入 dist/build/mp-weixin/
# API地址: src/config/app.js → HTTP_REQUEST_URL (MP段写死地址)
#         本地开发: localhost:8011  正式环境: https://你的域名
build_mp() {
    echo ""
    echo "[3/3] 编译微信小程序..."
    cd "$ROOT/template/uni-app"

    if [ ! -d "node_modules" ]; then
        echo "  安装依赖..."
        npm install --legacy-peer-deps
    fi

    npm run build:mp-weixin || { echo "  小程序编译失败!"; exit 1; }

    echo "  微信小程序 编译完成"
    echo "  请用 微信开发者工具 打开: template/uni-app/dist/build/mp-weixin/"
    cd "$ROOT"
}

case "$MODE" in
    all)
        build_admin
        build_h5
        build_mp
        ;;
    admin)  build_admin ;;
    h5)     build_h5 ;;
    mp)     build_mp ;;
    *)      echo "用法: bash scripts/build.sh [all|h5|admin|mp]"; exit 1 ;;
esac

echo ""
echo "=== 全部编译完成 ==="
