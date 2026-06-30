# 原型与后端对齐文档

> 日期: 2026-06-30
> 目的: 确保 HTML 原型内容与后端数据库/API 结构一致，供后端开发对接使用

---

## 一、TabBar 结构

### 原型当前结构（5 Tab）

| 序号 | Tab名 | 原型页面 | 图标文件 |
|------|-------|---------|---------|
| 1 | 首页 | 02-home.html | image_1782813901351_114p3r6.png |
| 2 | 案例 | 03-cases.html | image_1782813901352_trz9vsr.png |
| 3 | 朋友圈 | 04-moments.html | image_1782813901352_i5twl8j.png |
| 4 | 教学 | 05-teaching.html | image_1782813901352_mdf49kf.png |
| 5 | 我的 | 06-profile.html | image_1782710209961_sv3yqm4.png |

### 与文档差异

原始设计规格 (`design.md`) 定义了 4 Tab: 首页/案例/教学/线下课。原型扩展为 5 Tab: 增加了「朋友圈」模块，将「线下课」合并到「教学」Tab 内作为子 Tab（线上课程 / 线下培训），将「我的」替代为个人中心入口。

**后端对接**: `pages.json` 中 tabBar.list 以原型的 5 Tab 为准。后端路由已包含朋友圈模块 (`/api/v2/moment/*`) 和线下课模块 (`/api/v2/offline_class/*`)，无冲突。

---

## 二、分类标签系统

### 2.1 案例分类（案例页 `03-cases.html`）

**分类标签（9个）:**

| 序号 | 标签名 | 后端 `category_id` (建议) | 说明 |
|------|--------|--------------------------|------|
| 0 | 全部 | — | 前端筛选，不传 category_id |
| 1 | 眉部 | 1 | 洗眉/眉形修复相关 |
| 2 | 眼部 | 2 | 眼线/美瞳线相关 |
| 3 | 唇部 | 3 | 唇色修正相关 |
| 4 | 祛斑 | 4 | 雀斑/黄褐斑等 |
| 5 | 纹身 | 5 | 纹身清洗 |
| 6 | 乳晕 | 6 | 乳晕漂红 |
| 7 | 私密 | 7 | 私密色素管理 |
| 8 | 其他 | 8 | 其他色素处理 |

**筛选维度:**
- 类型 Tab: 全部(`all`) / 图片(`photo`) / 视频(`video`) → 对应后端 `type` 字段（1=图片，2=视频）
- 分类 Tag: 全部 / 眉部 / 眼部 / ... → 对应后端 `category_id` 字段

**API 调用映射:**
```
GET /api/v2/case/list
  ?type=0          // 0=全部, 1=图片, 2=视频
  &category_id=1   // 可选，不传=全部
  &page=1&limit=10
```

**当前后端状态:** `CaseDao::getConditionModel()` 仅支持 `type` 筛选，**需要新增 `category_id` 筛选条件**。

### 2.2 课程分类（教学页 `05-teaching.html`）

**分类标签（9个）:** 与案例页完全相同：全部 / 眉部 / 眼部 / 唇部 / 祛斑 / 纹身 / 乳晕 / 私密 / 其他

**设计意图:** 案例和课程共享同一个 `eb_teaching_category` 分类表。前端用同一套分类名称，后端通过 `category_id` 关联。

**API 调用映射:**
```
GET /api/v2/course/list
  ?category_id=1   // 可选
  &page=1&limit=10
```

**当前后端状态:** `CourseDao::getConditionModel()` 仅支持 `type` 筛选（此处 type 无业务意义，课程无图片/视频类型区分），**需要新增 `category_id` 筛选条件，移除 type 条件**。

### 2.3 产品分类（产品列表页 `07a-products.html`）

**分类标签（6个）:**

| 序号 | 标签名 | 后端 `category_id` (建议) | 说明 |
|------|--------|--------------------------|------|
| 0 | 全部 | — | 前端筛选，不传 category_id |
| 1 | 无创洗眉机 | 1 | 核心产品线 |
| 2 | 二氧化碳点阵 | 2 | 点阵激光设备 |
| 3 | 超皮秒 | 3 | 皮秒激光设备 |
| 4 | 脱毛仪 | 4 | 脱毛设备 |
| 5 | 其他产品 | 5 | 其他设备 |

**当前产品:**
- SEE洗眉 mini → `data-cat="无创洗眉机"` → category_id=1
- SEE洗眉 Ultra → `data-cat="无创洗眉机"` → category_id=1

**API 调用映射:**
```
GET /api/v2/product/list
  ?category_id=1   // 可选
  &page=1&limit=20
```

**当前后端状态:** 产品 API 仅有 `GET /api/v2/product/info`（单条产品信息），**缺少产品列表 API 和 category_id 筛选**。

---

## 三、数据库表对齐

### 3.1 需要新建的表

#### `eb_teaching_category` — 教学分类表（案例和课程共用）

```sql
CREATE TABLE IF NOT EXISTS `eb_teaching_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '分类名称',
  `type` tinyint(1) NOT NULL DEFAULT 0 COMMENT '适用类型: 1=案例 2=课程 3=通用',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教学分类';
```

种子数据:

```sql
INSERT INTO `eb_teaching_category` (`name`, `type`, `sort`, `status`, `add_time`) VALUES
('眉部', 3, 1, 1, UNIX_TIMESTAMP()),
('眼部', 3, 2, 1, UNIX_TIMESTAMP()),
('唇部', 3, 3, 1, UNIX_TIMESTAMP()),
('祛斑', 3, 4, 1, UNIX_TIMESTAMP()),
('纹身', 3, 5, 1, UNIX_TIMESTAMP()),
('乳晕', 3, 6, 1, UNIX_TIMESTAMP()),
('私密', 3, 7, 1, UNIX_TIMESTAMP()),
('其他', 3, 8, 1, UNIX_TIMESTAMP());
```

#### `eb_product_category` — 产品分类表

```sql
CREATE TABLE IF NOT EXISTS `eb_product_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '分类名称',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类';
```

种子数据:

```sql
INSERT INTO `eb_product_category` (`name`, `sort`, `status`, `add_time`) VALUES
('无创洗眉机', 1, 1, UNIX_TIMESTAMP()),
('二氧化碳点阵', 2, 1, UNIX_TIMESTAMP()),
('超皮秒', 3, 1, UNIX_TIMESTAMP()),
('脱毛仪', 4, 1, UNIX_TIMESTAMP()),
('其他产品', 5, 1, UNIX_TIMESTAMP());
```

### 3.2 需要新增的字段

| 表名 | 新增字段 | 类型 | 说明 |
|------|---------|------|------|
| `eb_case` | `category_id` | int(11) DEFAULT 0 | 关联 eb_teaching_category.id |
| `eb_course` | `category_id` | int(11) DEFAULT 0 | 关联 eb_teaching_category.id |
| `eb_product_info` | `category_id` | int(11) DEFAULT 0 | 关联 eb_product_category.id |
| `eb_product_info` | `is_home` | tinyint(1) DEFAULT 0 | 1=首页展示 0=不展示 |

### 3.3 迁移 SQL 文件

上述表结构合并到一个迁移脚本: `crmeb/sql/migration_category_product.sql`（admin-startup-guide.md 中已引用但文件尚未创建）。

---

## 四、API 端点对齐

### 4.1 已实现的 API

| 端点 | 方法 | 认证 | 状态 |
|------|------|------|------|
| `/api/v2/home/config` | GET | 无 | ✅ 已实现 |
| `/api/v2/product/info` | GET | 无 | ✅ 已实现（单条） |
| `/api/v2/case/list` | GET | 无 | ✅ 已实现（缺 category_id 筛选） |
| `/api/v2/case_comment/list` | GET | 无 | ✅ 已实现 |
| `/api/v2/case_comment/add` | POST | 登录 | ✅ 已实现 |
| `/api/v2/course/list` | GET | 可选 | ✅ 已实现（缺 category_id 筛选） |
| `/api/v2/course/detail/:id` | GET | 可选 | ✅ 已实现 |
| `/api/v2/course/create_order` | POST | 登录 | ✅ 已实现 |
| `/api/v2/offline_class/list` | GET | 无 | ✅ 已实现 |
| `/api/v2/offline_class/detail/:id` | GET | 无 | ✅ 已实现 |
| `/api/v2/offline_class/booking` | POST | 登录 | ✅ 已实现 |

### 4.2 需要新增/修改的 API

| 端点 | 方法 | 说明 | 优先级 |
|------|------|------|--------|
| `/api/v2/category/case` | GET | 案例分类列表（返回 eb_teaching_category WHERE type IN (1,3) AND status=1） | 高 |
| `/api/v2/category/course` | GET | 课程分类列表（返回 eb_teaching_category WHERE type IN (2,3) AND status=1） | 高 |
| `/api/v2/category/product` | GET | 产品分类列表（返回 eb_product_category WHERE status=1） | 高 |
| `/api/v2/product/list` | GET | 产品列表（支持 category_id 筛选，返回含 category_name） | 高 |
| `/api/v2/case/list` | GET | **修改**: 新增 category_id 查询参数 | 高 |
| `/api/v2/course/list` | GET | **修改**: 新增 category_id 查询参数，移除 type 参数 | 高 |
| `/api/v2/user/info` | GET | 用户信息（需包含 is_teaching_member 字段） | 中 |

### 4.3 管理后台 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/adminapi/teaching/category_list` | GET | 分类列表管理 |
| `/adminapi/teaching/category_save` | POST | 新增/编辑分类 |
| `/adminapi/teaching/category_delete/:id` | DELETE | 删除分类 |

---

## 五、各页面完整清单

### 5.1 TabBar 页面（5个主Tab）

| 页面 | 文件 | 标题 | 主要功能 |
|------|------|------|---------|
| 首页 | 02-home.html | 首页 - 阿利老西 | 轮播图、产品卡片、精选案例、热门课程、联系我们 |
| 案例 | 03-cases.html | 案例展示 - 阿利老西 | 类型Tab(全部/图片/视频) + 分类Tag(9个) + 横滑卡片 |
| 朋友圈 | 04-moments.html | 朋友圈 - 阿利老西 | 帖子流、点赞/收藏/评论 |
| 教学 | 05-teaching.html | 教学中心 - 阿利老西 | 会员卡片 + 子Tab(线上/线下) + 分类Tag(9个) + 课程列表 |
| 我的 | 06-profile.html | 个人中心 - 阿利老西 | 用户信息、我的课程、我的预约、收藏 |

### 5.2 二级页面

| 页面 | 文件 | 标题 | 主要功能 |
|------|------|------|---------|
| 案例详情-图 | 03a-case-detail-image.html | — | 图片案例大图 + 评论 |
| 案例详情-视频 | 03b-case-detail-video.html | — | 视频播放 + 评论 |
| 帖子详情 | 04a-moment-detail.html | — | 帖子完整内容 + 评论树 |
| 发布帖子 | 04b-moment-publish.html | — | 上传图片/视频 + 发布 |
| 课程详情 | 05a-course-detail.html | — | 视频播放 + 课程信息 |
| 线下课详情 | 05b-offline-detail.html | — | 排期详情 + 预约表单 |
| 线下课列表 | 05c-offline-list.html | — | 从教学页进入，线下排期列表 |
| 个人中心子页 | 06a-profile-sub.html | — | 设置/关于等 |
| 产品详情Mini | 07-product-detail.html | 产品详情 - 阿利老西 | 轮播 + 参数 + 案例 + 特色 + 亮点 |
| 产品列表 | 07a-products.html | 全部产品 - 阿利老西 | 分类筛选(6个) + 双列网格 |
| 产品详情Ultra | 07b-product-ultra.html | 产品详情 Ultra - 阿利老西 | 同上结构，Ultra版产品 |
| 会员支付 | 08-membership-pay.html | — | 会员购买页 |
| 我的收藏 | 09-favorites.html | — | 收藏列表 |

### 5.3 入口页面

| 页面 | 文件 | 说明 |
|------|------|------|
| 引导页 | 00-splash.html | 品牌展示，进入App |
| 登录页 | 01-login.html | 手机号/微信登录 |
| 绑定手机 | 01b-bind-phone.html | 微信授权绑定手机号 |
| 隐私协议 | 01c-privacy.html | 用户隐私政策 |

---

## 六、产品详情页内容区块顺序

`07-product-detail.html` 和 `07b-product-ultra.html` 的区块排列顺序:

1. 产品轮播图（顶部固定）
2. 产品标题 + 描述
3. 参数规格（spec-chips + spec-table）
4. **真实案例**（case-gallery，横滑展示）
5. **产品特色**（feat-grid，4个特色卡片）
6. 服务亮点（feat-list，4条亮点文字）
7. 相关产品（related-products，横滑推荐）

---

## 七、筛选逻辑统一规范

所有带分类筛选的页面遵循相同的前端模式:

```
HTML:
  分类标签: <div class="cat-tag" data-cat="分类名" onclick="switchCat(this)">分类名</div>
  数据项:   存储在 JS 数组中，每条数据包含 `cat` 或 `c` 字段（值为分类名）

JS:
  点击分类标签 → 获取 data-cat 属性值 → 过滤数据数组 → 重新渲染列表

后端映射:
  前端分类名 → 通过 API 获取分类列表时建立 name → id 映射
  筛选时传 category_id 参数给后端
```

**已对齐的页面:**
- `03-cases.html`: `.cat-tag` + `switchCat()` + `curCat` + JS field `c.cat`
- `05-teaching.html`: `.cat-tag` + `switchCat()` + `curCat` + JS field `c.c`
- `07a-products.html`: `.filter-tag[data-cat]` + `switchFilter()` + `cat` + `data-cat` attribute ✅ 已修复

---

## 八、需要后端补充的工作清单

### 高优先级

1. **创建 `migration_category_product.sql`** — 包含 `eb_teaching_category`、`eb_product_category` 两张分类表，以及 `eb_case`/`eb_course`/`eb_product_info` 表的 `category_id` 和 `is_home` 字段
2. **DAO 层增加 category_id 筛选** — `CaseDao::getConditionModel()` 和 `CourseDao::getConditionModel()` 新增 `category_id` 条件
3. **新增分类 API** — `GET /api/v2/category/case`、`GET /api/v2/category/course`、`GET /api/v2/category/product`
4. **新增产品列表 API** — `GET /api/v2/product/list`（支持分页和 category_id 筛选）

### 中优先级

5. **后台分类管理** — 管理后台新增分类 CRUD 页面
6. **案例/课程表单增加分类选择** — 后台编辑案例和课程时可选择分类
7. **产品表单增加分类选择和首页开关** — 后台编辑产品时选择分类 + 设置 `is_home`
8. **用户信息接口返回会员状态** — `GET /api/v2/user/info` 返回 `is_teaching_member`

### 低优先级

9. **产品列表接口返回 category_name** — JOIN 查询返回分类中文名
10. **案例列表返回 category_name** — 同上
11. **课程列表返回 category_name** — 同上
