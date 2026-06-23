# 洗眉机管理后台 - 从零启动指南

## 环境要求

- Docker Desktop (Windows/Mac) 或 Docker Engine (Linux)
- Node.js 16+ (用于构建前端)
- Git

## 一、启动 Docker 服务

```bash
# 进入项目目录
cd C:\Users\HeNut\Desktop\TODO\xcx\洗眉\xmj

# 启动所有容器
docker-compose up -d

# 确认容器运行正常
docker ps
# 应该看到: crmeb_php, crmeb_mysql, crmeb_nginx, crmeb_redis
```

## 二、初始化数据库

### 2.1 依次执行 SQL 文件

```bash
# 1. 创建教学模块表 (8张表: 产品/案例/课程/订单/排期/预约/评论/首页配置)
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < crmeb/sql/migration_teaching.sql

# 2. 创建朋友圈表 (4张表: 帖子/评论/点赞/收藏)
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < crmeb/sql/migration_moment.sql

# 3. 隐藏商城菜单 + 添加教学和朋友圈管理菜单
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < crmeb/sql/hide_shop_menus.sql

# 4. 导入种子数据 (产品信息 + 8个案例)
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < crmeb/sql/seed_teaching.sql

# 5. 导入朋友圈种子数据 (25条帖子 + 评论/点赞/收藏)
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < crmeb/sql/seed_moment.sql
```

### 2.2 验证表创建

```bash
docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "SHOW TABLES LIKE 'eb_%';"
```

应包含以下新增表:
- `eb_product_info` — 产品信息
- `eb_case` — 案例
- `eb_course` — 教学课程
- `eb_course_order` — 课程订单
- `eb_offline_class` — 线下排期
- `eb_offline_booking` — 线下预约
- `eb_case_comment` — 案例评论
- `eb_teaching_home_config` — 首页配置
- `eb_moment` — 朋友圈帖子
- `eb_moment_comment` — 朋友圈评论
- `eb_moment_like` — 朋友圈点赞
- `eb_moment_favorite` — 朋友圈收藏

## 三、构建前端

### 3.1 管理后台

```bash
cd template/admin
npm install
npm run build
# 输出: dist/ 目录
# 部署到: crmeb/public/admin/
cp -r dist/* ../crmeb/public/admin/
```

### 3.2 小程序/H5 前端

```bash
cd template/uni-app
npm install
npm run build:h5
# 输出: dist/build/h5/ 目录
# 部署到: crmeb/public/
cp -r dist/build/h5/* ../crmeb/public/
```

## 四、同步代码到 Docker

```bash
# PHP 代码同步 (修改后端代码后执行)
docker exec crmeb_php sh -c "rm -f /var/www_native/.version"
# 等待 ~30秒 让同步完成，日志显示 "Code copy complete. OPcache installed. fpm is running"
docker logs crmeb_php --tail 5

# 前端文件同步
docker exec crmeb_php sh -c "cp -r /var/www_mount/public/. /var/www_native/public/"
```

## 五、访问验证

| 服务 | 地址 | 账号/密码 |
|------|------|-----------|
| 管理后台 | http://localhost:8011/admin | admin / admin888 |
| H5前端 | http://localhost:8011 | — |

### 管理后台菜单结构 (登录后左侧)
```
├── 用户
├── 应用
│   └── 小程序
├── 洗眉机
│   ├── 产品管理
│   ├── 案例管理
│   ├── 课程管理
│   ├── 线下排期
│   ├── 预约记录
│   ├── 评论管理
│   ├── 首页配置
│   └── 会员管理
├── 朋友圈
│   ├── 帖子管理
│   └── 评论管理
├── 设置
└── 维护
```

## 六、重置管理员密码

```bash
# 生成新密码的 bcrypt hash
docker exec crmeb_php php -r "echo password_hash('your_password', PASSWORD_BCRYPT);"

# 更新数据库
docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "UPDATE eb_system_admin SET pwd='<上面的hash>' WHERE id=1;"
```

## 七、Docker 相关命令

```bash
# 重启 PHP 容器 (代码同步后生效慢时使用)
docker restart crmeb_php

# 查看 PHP 日志
docker logs crmeb_php --tail 50

# 查看 Nginx 日志
docker logs crmeb_nginx --tail 50

# 进入 MySQL
docker exec -it crmeb_mysql mysql -uroot -p123456 crmeb

# 进入 PHP 容器
docker exec -it crmeb_php bash
```

## 八、问题排查

### 502 Bad Gateway
- 检查 `docker logs crmeb_php` 是否显示 "Code copy complete"
- 等待同步完成后重试
- 如持续502: `docker restart crmeb_php`

### API 返回 401
- token 过期,重新登录获取

### 菜单不显示
- 确认 `hide_shop_menus.sql` 已执行
- 检查 `eb_system_menus` 表中 `is_show_path=1` 的记录

### 表不存在错误
- 确认所有 migration SQL 已执行
- `docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "SHOW TABLES LIKE 'eb_%';"` 检查

### 会员管理页报错
- 如果出现 `getModel()` 错误,确认 MemberController.php 已更新
- 最新版已改用 `User::where()` 直接查询
