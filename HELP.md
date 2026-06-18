# 洗眉机小程序 — 新设备从零启动指南

## 前置环境

| 软件 | 版本要求 | 用途 |
|------|---------|------|
| Git | 任意 | 拉代码 |
| Docker + Docker Compose | Docker 20.x+ | 运行 MySQL/Redis/PHP/Nginx |
| Node.js | 12+ | 编译 admin 前端 |
| HBuilderX | 最新正式版 | 编译小程序（**不是** HBuilder 2018） |

---

## 一、克隆项目

```bash
git clone <仓库地址> /root/codes/xcx/CRMEB
cd /root/codes/xcx/CRMEB
```

仓库包含所有源码 + 已修改的 docker-compose + 已写好的 SQL 迁移脚本。

---

## 二、启动 Docker 服务

```bash
cd help/docker

# 1. 确保目录存在
mkdir -p mysql/data mysql/log mysql/conf.d nginx/log

# 2. MySQL 5.7 配置（持久化关闭 only_full_group_by）
cat > mysql/conf.d/custom.cnf << 'EOF'
[mysqld]
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
EOF

# 3. 修改 .env 中的 API URL（如换服务器）
# 编辑 crmeb/.env，确保 DATABASE.HOSTNAME=crmeb_mysql，REDIS.REDIS_HOSTNAME=crmeb_redis

# 4. 启动
docker compose up -d

# 5. 确认四个容器都在跑
docker ps
# 应看到: crmeb_mysql, crmeb_redis, crmeb_php, crmeb_nginx
```

---

## 三、初始化数据库

```bash
# 1. 先建库（防止字符集问题）
docker exec crmeb_mysql mysql -uroot -p123456 -e "
DROP DATABASE IF EXISTS crmeb;
CREATE DATABASE crmeb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
"

# 2. 导入基础表
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb \
  --default-character-set=utf8mb4 \
  --init-command="SET SESSION sql_mode='NO_ENGINE_SUBSTITUTION';" \
  < ../crmeb/public/install/crmeb.sql

# 3. 导入洗眉机自定义表 + 隐藏商城菜单
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb \
  --default-character-set=utf8mb4 \
  < ../crmeb/sql/migration_teaching.sql

docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb \
  --default-character-set=utf8mb4 \
  < ../crmeb/sql/hide_shop_menus.sql
```

`migration_teaching.sql` 做了：
- 创建 6 张教学表（product_info, case, course, course_order, offline_class, offline_booking）
- 给 `eb_user` 加 `is_teaching_member` 列
- 插入产品/案例/课程示例数据

`hide_shop_menus.sql` 做了：
- 隐藏商品/订单/分销/营销/财务/客服/装修等 9 个商城菜单
- 添加「洗眉机」顶级菜单 + 5 个子项

---

## 四、配置后端

```bash
cd crmeb

# .env 已存在即可，关键配置：
#   DATABASE.HOSTNAME = crmeb_mysql
#   REDIS.REDIS_HOSTNAME = crmeb_redis
#   数据库密码均为 123456

# 修复 runtime 权限
docker exec crmeb_php chown -R www-data:www-data /var/www/runtime

# 验证 API 可用
curl http://<你的IP>:8011/api/v2/product/info
# 应返回: {"status":200,"msg":"success","data":{...}}
```

---

## 五、编译管理后台前端（解决小组件 404）

```bash
cd template/admin

# 首次需安装依赖
npm install

# 编译
npm run build
```

编译产物在 `template/admin/dist/`，部署到 PHP public 目录：

```bash
# 备份旧文件
docker exec crmeb_php mv /var/www/public/admin /var/www/public/admin.bak

# 复制新编译产物
docker cp dist/. crmeb_php:/var/www/public/admin/
```

> **为什么需要这步？** admin 前端是 Vue 2 SPA，打包时会生成模块 js 文件。之前隐藏了 15 个后端路由文件，但旧的前端编译产物仍引用那些模块，导致浏览器请求时 404。重新编译后只打包实际存在的模块，404 消失。

---

## 六、小程序端

### 6.1 修改 API 地址

编辑 `template/uni-app/config/app.js`：

```javascript
// 第 5 行左右
HTTP_REQUEST_URL: 'http://121.41.54.226:8011',  // 改成你的服务器 IP
```

### 6.2 修改 AppID

编辑 `template/uni-app/manifest.json`，搜索 `mp-weixin`，改：

```json
"mp-weixin": {
  "appid": "你自己的微信小程序AppID"
}
```

### 6.3 用 HBuilderX 编译

1. Windows 安装 **HBuilderX**（不是 HBuilder）
2. 将 `template/uni-app/` 目录拖入 HBuilderX
3. 菜单：运行 → 运行到小程序模拟器 → 微信小程序
4. 自动打开微信开发者工具

### 6.4 预览/上传

- 微信开发者工具中扫码预览（测试号也行）
- AppID 必须是自己在 mp.weixin.qq.com 注册的小程序

---

## 七、关键文件速查

| 文件 | 作用 |
|------|------|
| `crmeb/.env` | 数据库/Redis 连接配置 |
| `crmeb/sql/migration_teaching.sql` | 教学模块建表 + 示例数据 |
| `crmeb/sql/hide_shop_menus.sql` | 隐藏商城菜单 SQL |
| `crmeb/app/api/route/v2.php` | 小程序 API v2 路由（精简版） |
| `crmeb/app/api/route/v2/teaching.php` | 教学模块 6 个接口路由 |
| `crmeb/app/adminapi/route/` | admin 后端路由（15 个 `.bak` 已禁用） |
| `help/docker/docker-compose.yml` | Docker 四容器编排 |
| `help/docker/mysql/conf.d/custom.cnf` | MySQL sql_mode 持久化 |
| `template/admin/` | 管理后台 Vue 2 源码 |
| `template/uni-app/` | 小程序 UniApp 源码 |
| `template/uni-app/pages/teaching/*/index.vue` | 小程序 4 个教学页面 |
| `template/uni-app/main.js` | 注册了 `$api` 全局请求方法 |

---

## 八、docker exec 速查

用 docker exec 替代宿主机直接操作：

```bash
# 进入 MySQL
docker exec -it crmeb_mysql mysql -uroot -p123456 crmeb

# 执行一条 SQL
docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "SELECT * FROM eb_teaching_product_info"

# 导入 SQL 文件
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < file.sql

# 进入 PHP 容器
docker exec -it crmeb_php bash

# PHP 容器内执行 ThinkPHP 命令
docker exec crmeb_php php /var/www/think

# 查看 nginx/php 日志
docker logs crmeb_nginx --tail 50
docker logs crmeb_php --tail 50

# 重启某个容器
docker restart crmeb_php
docker restart crmeb_nginx

# 全部重启
cd help/docker && docker compose restart
```

---

## 九、常见问题

### Q: admin 后台 404 一片小组件
**A:** 没做步骤五。执行 `cd template/admin && npm run build` 重新编译，然后 `docker cp` 到容器。

### Q: API 返回 404
**A:** 确认 URL 正确。教学接口路径是 `/api/v2/product/info`、`/api/v2/case/list` 等，没有 `teaching` 前缀。

### Q: SQL 中文乱码
**A:** 导入时必须加 `--default-character-set=utf8mb4`，并且建库时指定 `CHARACTER SET utf8mb4`。

### Q: only_full_group_by 错误
**A:** `mysql/conf.d/custom.cnf` 必须有正确的 sql_mode，且 MySQL 容器首次启动前就得放好。如果改了配置文件，需 `docker compose up -d --force-recreate mysql`。

### Q: runtime 目录 Permission denied
**A:** `docker exec crmeb_php chown -R www-data:www-data /var/www/runtime`

### Q: 小程序主包超过 2MB
**A:** 已优化完毕（lazyCodeLoading + 关闭 easycom + 删除 ~300K 静态文件）。如需进一步缩减，检查 `static/` 目录中的图片是否超过 200K。

### Q: HBuilder 编译找不到模拟器
**A:** 必须用 **HBuilderX**，不是 HBuilder 2018。
