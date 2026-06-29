# 洗眉机微信小程序 — 设计规格说明书

> 日期: 2026-06-18
> 基于: CRMEB v6.0.0（ThinkPHP 6 + UniApp）
> 原则: 最小改动、最大化复用、只隐藏不删除

---

## 一、项目目标

基于 CRMEB 现有系统改造，构建一个独立的洗眉机业务微信小程序，包含 4 个核心页面：
1. **首页** — 产品展示（洗眉机）
2. **案例页** — 照片 + 视频案例
3. **教学页** — 课程学习（会员制）
4. **线下课页** — 排期查看 + 预约

---

## 二、技术决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 基础框架 | CRMEB 减法改造 | 复用微信登录、支付、上传、主题系统 |
| 部署方式 | Docker | 已有 `docker-compose.yml`，volume 挂载改代码无影响 |
| 小程序范围 | 独立小程序（去掉商城） | 用户只需 4 个业务页 |
| 会员模式 | 混合制 | 购买会员费 + 后台白名单 + 9.9 试听 |
| 课程排期 | 不定期排期 | 后台灵活添加每期课程 |
| 前端改造 | 只隐藏不删除 | 用 git 追溯，最小化风险 |

---

## 三、新增数据库表（7 张）

### 3.1 `eb_product_info` — 产品内容

支持多条产品记录，后台 CRUD 列表管理。通过 `is_home` 字段标记首页展示的产品。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| banner | text | 轮播图 JSON（复数图片 URL） |
| title | varchar(255) | 产品标题 |
| `desc` | text | 产品描述/卖点 |
| detail | longtext | 图文详情（富文本 HTML） |
| specs | text | 参数规格 JSON（键值对数组） |
| video_url | varchar(500) | 产品视频链接（可选） |
| status | tinyint(1) | 1=启用，0=停用 |
| is_home | tinyint(1) | 1=首页显示，0=不显示 |
| add_time | int(11) | 创建时间戳 |
| update_time | int(11) | 更新时间戳 |

### 3.2 `eb_teaching_category` — 教学分类（案例/课程共用）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| name | varchar(100) | 分类名称 |
| type | tinyint(1) | 1=案例分类，2=课程分类 |
| sort | int(11) | 排序，越大越靠前 |
| status | tinyint(1) | 1=启用，0=禁用 |
| add_time | int(11) | 创建时间戳 |

### 3.3 `eb_case` — 案例

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| title | varchar(255) | 案例标题 |
| type | tinyint(1) | 1=图片，2=视频 |
| category_id | int(11) | 分类 ID，关联 eb_teaching_category |
| cover | varchar(500) | 封面图 URL |
| media_url | varchar(500) | 图片或视频完整 URL |
| sort | int(11) | 排序数值，越大越靠前 |
| status | tinyint(1) | 1=显示，0=隐藏 |
| add_time | int(11) | 创建时间戳 |

### 3.4 `eb_course` — 教学课程

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| title | varchar(255) | 课程标题 |
| category_id | int(11) | 分类 ID，关联 eb_teaching_category |
| cover | varchar(500) | 封面图 URL |
| `desc` | text | 课程简介 |
| video_url | varchar(500) | 课程视频 URL |
| price | decimal(8,2) | 试听价格（默认 9.9） |
| is_free_for_member | tinyint(1) | 1=会员免费，0=需购买 |
| sort | int(11) | 排序 |
| status | tinyint(1) | 1=上架，0=下架 |
| add_time | int(11) | 创建时间戳 |

### 3.5 `eb_course_order` — 课程订单（试听支付）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| uid | int(11) | 用户 ID |
| course_id | int(11) | 课程 ID |
| order_sn | varchar(32) | 订单号（唯一） |
| price | decimal(8,2) | 实际支付金额 |
| pay_type | varchar(20) | 支付方式，默认 `wechat` |
| pay_time | int(11) | 支付成功时间 |
| paid | tinyint(1) | 0=未支付，1=已支付 |
| add_time | int(11) | 创建时间戳 |

> 支付流程完全复用 CRMEB 现有微信支付服务 (`crmeb/services/pay/`)，仅新增支付场景标识 `product_type = 'course_trial'`。

### 3.6 `eb_offline_class` — 线下课程排期

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| title | varchar(255) | 课程名称 |
| cover | varchar(500) | 封面图（可选） |
| class_date | date | 开课日期 |
| start_time | time | 开始时间 |
| end_time | time | 结束时间 |
| address | varchar(500) | 上课地点 |
| max_people | int(11) | 人数限额，0=不限 |
| qrcode | varchar(500) | 店主微信二维码图片 URL |
| `desc` | text | 课程详情描述 |
| status | tinyint(1) | 1=启用，0=停用 |
| add_time | int(11) | 创建时间戳 |

### 3.7 `eb_offline_booking` — 线下预约记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 主键，自增 |
| uid | int(11) | 用户 ID |
| class_id | int(11) | 排期 ID |
| name | varchar(50) | 联系人姓名 |
| phone | varchar(20) | 联系人手机号 |
| status | tinyint(1) | 0=已预约，1=已取消 |
| add_time | int(11) | 创建时间戳 |

---

## 四、会员体系设计

### 4.1 会员判定

在 CRMEB 现有 `eb_user` 表新增字段：

```sql
ALTER TABLE `eb_user` ADD COLUMN `is_teaching_member` tinyint(1) NOT NULL DEFAULT 0 COMMENT '教学会员: 0=否 1=是';
```

### 4.2 会员获取途径

1. **购买会员** — 小程序内「开通会员 ¥299」，走 CRMEB 微信支付，支付成功后回调标记 `is_teaching_member = 1`
2. **后台手动授予** — 管理后台用户列表一键设为/取消会员

### 4.3 课程访问权限

```
用户点击课程
  ├── is_teaching_member = 1 → 直接播放视频
  └── is_teaching_member = 0
        ├── is_free_for_member = 1 → 弹出 9.9 试听支付
        └── is_free_for_member = 0 → 提示「会员专属课程」
```

---

## 五、小程序页面设计

### 5.1 底部导航

```json
{
  "tabBar": {
    "list": [
      { "text": "首页", "pagePath": "pages/index/index" },
      { "text": "案例", "pagePath": "pages/case/index" },
      { "text": "教学", "pagePath": "pages/course/index" },
      { "text": "线下课", "pagePath": "pages/offline/index" }
    ]
  }
}
```

### 5.2 首页 — 产品展示

- **渲染方式**: 走 CRMEB DIY 主题系统，注册 `page_type = 'product'`，兼容主题市场换肤
- **内容区**: 轮播图 → 核心卖点 → 富文本图文详情 → 视频（可选）
- **数据源**: `eb_product_info` 表单记录
- **主题兼容**: 主题数据存入 `eb_theme` 表 `home_data` 字段，使用 CRMEB 已有的 DIY 组件渲染

### 5.3 案例页

- **布局**: 顶部 Tab（全部 / 图片 / 视频），下方瀑布流或 2 列网格
- **交互**: 
  - 图片案例 → 点击放大预览（UniApp `uni.previewImage`）
  - 视频案例 → 封面 + 播放图标，点击全屏播放（UniApp `uni.createVideoContext`）
- **分页**: 下拉加载更多
- **API**: GET `/api/case/list?type=&page=&limit=`

### 5.4 教学页

- **顶部横幅**: 显示用户身份 — 会员显示「您已是会员，全部课程免费看」；非会员显示「开通会员，解锁全部课程」
- **课程列表**: 封面 + 标题 + 简介 + 价格标签（会员显示「免费」，非会员显示「¥9.9 试听」）
- **点击行为**:
  - 会员 → 跳转课程详情，直接播放视频
  - 非会员 → 弹出确认框「¥9.9 试听本课」→ 调起微信支付 → 支付成功跳转播放
- **底部固定按钮**（仅非会员显示）: 「开通会员 ¥299」
- **API**:
  - GET `/api/course/list` — 课程列表
  - GET `/api/course/detail/:id` — 课程详情
  - POST `/api/course/trial_order` — 创建试听订单
  - POST `/api/course/member_order` — 创建会员购买订单

### 5.5 线下课页

- **列表**: 按日期倒序，只显示 `class_date >= today` 且 `status = 1` 的排期
- **每项显示**: 日期 | 课程名 | 时间范围 | 地点 | 剩余名额
- **点击**: 进入详情页，展示课程介绍 + 完整信息
- **预约按钮**: 
  1. 弹出表单：姓名（必填）+ 手机号（必填）
  2. 提交 → 创建预约记录
  3. 成功后弹窗：显示店主微信二维码 + 文字「请添加店主微信确认预约」
  4. 一个排期一个用户只能预约一次
- **API**:
  - GET `/api/offline_class/list?page=&limit=` — 排期列表
  - GET `/api/offline_class/detail/:id` — 排期详情
  - POST `/api/offline_class/booking` — 提交预约

---

## 六、管理后台设计

复用 CRMEB admin 框架（Vue 2 + Element UI），使用 `xaboy/form-builder` 生成表单。

### 6.1 产品管理

- **菜单**: `洗眉机 > 产品管理`
- **页面**: CRUD 列表页，支持多个产品
- **列表列**: 轮播图缩略图 | 产品标题 | 首页显示 | 状态 | 操作
- **表单**: 轮播图 → 标题 → 描述 → 图文详情 → 参数规格 → 视频链接 → 首页显示开关 → 状态开关
- **操作**: 添加、编辑、删除。通过 `is_home` 开关标记首页展示的产品

### 6.2 案例管理

- **菜单**: `洗眉机 > 案例管理`
- **页面**: 标准 CRUD 列表页
- **筛选**: 类型筛选（图片/视频）+ 分类筛选
- **列表列**: 封面缩略图 | 标题 | 分类 | 类型标签 | 排序 | 状态开关 | 操作
- **表单**: 上传封面 → 选择分类 → 选择类型 → 上传图片/视频 → 标题 → 排序数字 → 状态
- **分类管理**: 列表页顶部「管理分类」按钮，弹窗内可增删案例分类

### 6.3 课程管理

- **菜单**: `洗眉机 > 课程管理`
- **页面**: 标准 CRUD 列表页
- **筛选**: 分类筛选
- **列表列**: 封面缩略图 | 标题 | 分类 | 试听价格 | 会员免费标签 | 状态 | 操作
- **表单**: 封面 → 选择分类 → 标题 → 简介 → 视频 → 试听价 → 会员免费开关 → 排序 → 状态
- **分类管理**: 列表页顶部「管理分类」按钮，弹窗内可增删课程分类

### 6.4 会员管理

- **位置**: 在 CRMEB 已有「用户管理」列表中增强，不创建新菜单
- **新增列**: 「教学会员」标签列（是/否）
- **操作**: 每行增加「设为会员 / 取消会员」按钮，点击调接口改 `is_teaching_member` 字段
- **可选增强**: 筛选条件增加「是否为教学会员」

### 6.5 线下排期管理

- **菜单**: `洗眉机 > 线下排期`
- **页面**: 标准 CRUD 列表页
- **列表列**: 日期 | 课程名 | 时间 | 地点 | 限额 | 已约数 | 状态 | 操作
- **表单**: 课程名 → 日期选择器 → 开始/结束时间 → 地点 → 限额 → 店主微信二维码上传 → 详情（富文本）
- **行操作**: 「查看预约名单」按钮，展示该排期的预约记录

### 6.6 预约记录

- **菜单**: `洗眉机 > 预约记录`
- **页面**: 只读列表页
- **筛选**: 按排期下拉筛选
- **列表列**: 排期名称 | 姓名 | 手机 | 预约时间 | 状态

---

## 七、后端代码结构

所有新增代码遵循 CRMEB 标准分层：

```
crmeb/app/
├── model/
│   ├── product/ProductInfo.php          # 产品（多条）
│   ├── teaching/TeachingCategory.php    # 教学分类
│   ├── teaching/TeachingCase.php        # 案例
│   ├── teaching/Course.php              # 课程
│   ├── teaching/CourseOrder.php         # 课程订单
│   ├── teaching/OfflineClass.php        # 线下排期
│   └── teaching/OfflineBooking.php      # 线下预约
├── dao/
│   ├── product/ProductInfoDao.php
│   └── teaching/
│       ├── TeachingCategoryDao.php
│       ├── CaseDao.php
│       ├── CourseDao.php
│       ├── CourseOrderDao.php
│       ├── OfflineClassDao.php
│       └── OfflineBookingDao.php
├── services/
│   ├── product/ProductInfoServices.php
│   └── teaching/
│       ├── TeachingCategoryServices.php
│       ├── CaseServices.php
│       ├── CourseServices.php
│       ├── CourseOrderServices.php
│       ├── OfflineClassServices.php
│       └── OfflineBookingServices.php
├── api/controller/v2/                   # 小程序 API
│   ├── ProductController.php
│   ├── CategoryController.php
│   ├── CaseController.php
│   ├── CourseController.php
│   └── OfflineClassController.php
├── api/validate/v2/                     # 小程序请求验证
│   ├── CourseValidator.php
│   └── OfflineClassValidator.php
├── adminapi/controller/v1/teaching/     # 后台管理 API
│   ├── ProductInfoController.php
│   ├── CategoryController.php
│   ├── CaseController.php
│   ├── CourseController.php
│   ├── OfflineClassController.php
│   └── BookingController.php
└── adminapi/validate/v1/teaching/
    └── ... (同上结构)
```

路由注册在各模块的 `route/route.php` 文件中：

- API 路由 (小程序端): `crmeb/app/api/route/v2/teaching.php`
- Admin 路由 (管理后台): `crmeb/app/adminapi/route/v1/teaching.php`

---

## 八、隐藏与去品牌化

### 8.1 后台前端隐藏

后台管理界面仅保留「朋友圈」和「洗眉机」两个菜单，其他所有页面均通过注释 router 导入隐藏。
修改文件：`template/admin/src/router/routers.js`，注释掉 product、order、user、setting、agent、finance、cms、marketing、app、system、statistic、division、crud 等模块的导入和 frameIn 注册。

### 8.2 前端隐藏（UniApp）

| 操作 | 方法 |
|------|------|
| 底部导航替换 | 修改 `pages.json` 中 `tabBar.list`，只保留 4 个新 tab |
| 商城页面 | 保留源文件不删除，从 tabBar 移除入口即自然不可达 |
| 个人中心精简 | 修改 `pages/users/` 相关页面，只保留登录、我的课程、我的预约三项 |
| 购物车入口 | 从所有页面移除按钮/链接 |

### 8.3 后端保护

- 所有 CRMEB 原有 Controller / Services / Model 代码**不删除、不修改**
- 通过前端不调用实现功能不可达
- 新路由写在独立文件，不与旧路由冲突

### 8.4 去品牌化

| 位置 | 改动内容 |
|------|----------|
| `template/uni-app/manifest.json` | `mp-weixin.appid` 改为你的小程序 AppID，`name` 改为品牌名 |
| `template/uni-app/App.vue` | 移除 CRMEB 版权信息 |
| `template/admin/src/` 登录页 | 替换 logo 图片 + 平台标题文字 |
| `template/admin/src/layout/` | 替换侧边栏 logo + 平台名称 |
| `eb_system_config` 表 | `site_name` 字段值改为你的品牌名 |
| 微信支付商户信息 | 在微信支付后台配置你自己的商户号，与代码无关 |

---

## 九、部署方案

使用已有 Docker Compose，不新增部署复杂度：

```bash
cd CRMEB/help/docker
docker-compose up -d
```

- PHP 代码通过 volume 挂载，宿主机修改即时生效
- 数据库迁移（新增 7 张表 + 字段变更）使用 SQL 迁移脚本 `scripts/migration_category_product.sql`，首次部署时手动执行
- 后续代码更新：`git pull` + 清理缓存即可

---

## 十、不涉及的内容（明确排除）

- 商城购物车、商品分类、SKU 管理 — 仅隐藏，不改造
- 优惠券、积分、秒杀、拼团 — 不动
- 分销、推广 — 不动
- 客服 WebSocket — 不动（除非将来需要）
- 支付宝支付 — 不动，仅用微信支付
- PC 端、H5 端 — 不动，仅发布微信小程序

---

## 十一、版权声明

本项目基于 CRMEB v6.0.0 开源代码二次开发。CRMEB 原始版权声明保留在原文件内，不删除。新增代码版权归项目方所有。
