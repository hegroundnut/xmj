# 知识分享管理后台 - 从零启动指南

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

# 6. 创建分类表 + 产品/案例/课程新增字段 (category_id, is_home)
#    分类表 type: 1=案例 2=课程 3=产品
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < scripts/migration_category_product.sql

# 7. 案例表新增精选字段 (is_home)
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < scripts/migration_member_featured.sql

# 8. 课程表新增会员等级字段 (member_level)、取消价格
docker exec -i crmeb_mysql mysql -uroot -p123456 crmeb < scripts/migration_member_level.sql
```

### 2.2 验证表创建

```bash
docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "SHOW TABLES LIKE 'eb_%';"
```

应包含以下新增表:
- `eb_product_info` — 产品信息（支持多条，含 is_home、category_id 字段）
- `eb_teaching_category` — 教学分类（案例/课程/产品共用，type: 1=案例 2=课程 3=产品）
- `eb_case` — 案例（含 category_id、is_home 字段）
- `eb_course` — 教学课程（含 category_id, member_level 字段，无价格）
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

> 注意：后台前端已隐藏除「朋友圈」和「知识分享」之外的所有菜单（通过 routers.js 注释导入 + routesList store 过滤实现）。登录后默认跳转至知识分享产品管理页面。

```
├── 朋友圈
│   ├── 帖子管理
│   └── 评论管理
└── 知识分享
    ├── 产品管理        ← 支持多产品CRUD + 首页显示开关 + 分类筛选/管理
    ├── 案例管理        ← 支持分类筛选 + 分类管理弹窗 + 精选开关（首页展示）
    ├── 课程管理        ← 支持分类筛选 + 分类管理弹窗 + 可看等级选择 + 视频上传到COS（或手动填写视频链接）
    ├── 线下排期
    ├── 预约记录
    ├── 评论管理
    ├── 首页配置
    └── 会员管理        ← 显示超级会员/普通会员/非会员，支持设为/取消超级会员、设为/取消普通会员
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
- 后台前端已通过 `routers.js` 隐藏非教学/朋友圈菜单
- 若数据库层面还需隐藏，确认 `hide_shop_menus.sql` 已执行
- 检查 `eb_system_menus` 表中 `is_show_path=1` 的记录

### 表不存在错误
- 确认所有 migration SQL 已执行（包括 `scripts/migration_category_product.sql`、`scripts/migration_member_featured.sql` 和 `scripts/migration_member_level.sql`）
- `docker exec crmeb_mysql mysql -uroot -p123456 crmeb -e "SHOW TABLES LIKE 'eb_%';"` 检查

### 会员管理页报错
- 如果出现 `getModel()` 错误,确认 MemberController.php 已更新
- 最新版已改用 `User::where()` 直接查询

### 课程视频上传报错 "COS 未配置"
- 说明服务器 `crmeb/.env` 未填写腾讯云 COS 配置，见「九、腾讯云 COS 视频存储配置」
- 也可暂不配置 COS，直接在课程表单「视频链接」中手动填写外部视频地址

## 九、腾讯云 COS 视频存储配置

课程视频上传到腾讯云 COS（对象存储），不使用 CDN。管理员在「课程管理」表单中点击「上传视频到COS」即可，成功后自动回填视频链接；小程序端播放时若 COS 视频失效会提示「视频失效，请联系管理员」。

### 9.1 需要在腾讯云控制台准备的信息

| 配置项 | 说明 | 获取位置 |
| --- | --- | --- |
| SecretId | API 密钥 SecretId | 访问管理 → API密钥管理（https://console.cloud.tencent.com/cam/capi） |
| SecretKey | API 密钥 SecretKey | 同上 |
| APPID | 账号 APPID（纯数字） | 账号信息 / 存储桶概览 |
| BUCKET | 存储桶名称，格式 `名称-APPID`（如 `xmj-video-1250000000`） | 对象存储 → 存储桶列表 |
| REGION | 存储桶所在地域（如 `ap-shanghai`） | 存储桶基本信息 |
| DOMAIN | 存储桶访问域名（如 `https://xmj-video-1250000000.cos.ap-shanghai.myqcloud.com`） | 存储桶 → 概览 → 访问域名 |

另外需在存储桶中做两项设置：
1. **权限设置为「公有读私有写」**（否则小程序无法直接播放视频 URL）。
2. **配置跨域访问 CORS**：来源 Origin 填 `*`（或小程序/后台域名），允许 `PUT/POST/GET` 方法，用于后台直传。

### 9.2 在 crmeb/.env 中填写

```ini
[COS]
SECRET_ID  = 你的SecretId
SECRET_KEY = 你的SecretKey
APPID      = 1250000000
BUCKET     = xmj-video-1250000000
REGION     = ap-shanghai
DOMAIN     = https://xmj-video-1250000000.cos.ap-shanghai.myqcloud.com
```

填写后重启 PHP 容器：`docker restart crmeb_php`。

## 十、图片压缩说明

- 用户上传到朋友圈的图片、后台管理员上传的图片统一存储在服务器本地（`public/uploads/`），上传时由服务端自动压缩：等比缩放至最长边 ≤ 1600px、JPEG 质量 75%，仅处理 jpg/jpeg/png。
- 该逻辑在 `crmeb/crmeb/services/upload/storage/Local.php` 的 `compressImage()` 中实现，对所有走本地存储的图片生效，无需额外配置。
