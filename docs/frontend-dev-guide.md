# 洗眉机小程序 - 前端开发文档

## 环境信息

| 项目 | 值 |
|------|------|
| 小程序API地址 | `http://localhost:8011/api/v2/` |
| 管理后台地址 | `http://localhost:8011/admin` |
| H5前端地址 | `http://localhost:8011` |
| 小程序源码 | `template/uni-app/src/` |
| 管理后台源码 | `template/admin/src/` |
| Apifox导入文件 | `docs/api-apifox.json` |

## 小程序页面路由 (pages.json)

```
TabBar 底部导航 (5个Tab):
├── 首页        pages/teaching/home/index    icon: 1-001/1-002
├── 案例        pages/teaching/case/index    icon: 2-001/2-002
├── 朋友圈       pages/moment/index          icon: 3-001/3-002
├── 教学        pages/teaching/course/index  icon: 4-001/4-002
└── 线下课       pages/teaching/offline/index icon: 5-001/5-002

其他页面:
├── 引导页       pages/guide/index
├── 产品详情     pages/teaching/product/index
├── 帖子详情     pages/moment/detail
├── 发布帖子     pages/moment/publish
├── 我的收藏     pages/moment/my_favorites
└── 用户分包     pages/users/ (wechat_login, binding_phone, login, privacy)
```

## 核心业务流程

### 1. 用户登录流程

```
用户打开小程序
  → 调用 GET /api/v2/routine/auth_type?code=<wx_code>
  → 返回 { bindPhone: true/false, key: "缓存key" }
  → 如果 bindPhone=true (需要绑定手机号):
      → 调用 POST /api/v2/routine/auth_binding_phone  (微信一键授权手机号)
      → 或跳转手机号登录页 调用 POST /api/v2/routine/phone_login
  → 如果 bindPhone=false (已绑定手机号):
      → 调用 GET /api/v2/routine/auth_login?key=<key>
  → 返回 { token, expires_time }
  → 前端存储 token，后续所有需要登录的接口在 Header 中传:
      Authori-zation: Bearer <token>
```

### 2. 会员体系流程

```
用户微信登录后:
  1. 自动在 eb_user 表创建记录
  2. 默认 is_teaching_member = 0 (非会员)
  3. 前端通过 GET /api/v2/user/info 获取用户会员状态

会员判定逻辑 (后端 MomentServices::isMember):
  is_teaching_member == 1   → 管理员手动设置的会员
  OR overdue_time > time()  → 付费会员且未过期
  满足其一即为"会员"

管理员操作:
  后台 → 洗眉机 → 会员管理 → 点击"设为会员"
  调用 PUT /adminapi/teaching_member/set/{uid}  { is_teaching_member: 1 }

会员可使用的功能:
  - 发布朋友圈帖子
  - 点赞 / 取消点赞
  - 收藏 / 取消收藏
  - 发表评论 / 回复
  - 分享计数
  - 免费观看"会员免费"课程

非会员限制:
  - 只能浏览朋友圈列表和详情
  - 可以查看课程列表(需要登录但无会员要求)
  - 不能发布/点赞/收藏/评论/分享
  - 前端应在调用会员接口前检查 is_teaching_member 状态
```

### 3. 朋友圈功能流程

```
朋友圈列表页 (pages/moment/index.vue):
  - 调用 GET /api/v2/moment/list?page=1&limit=10
  - 返回帖子列表，每条含:
    * 用户信息 (昵称/头像)
    * 内容 (文字/图片/视频)
    * 互动数据 (like_count, comment_count, share_count)
    * 当前用户状态 (is_liked, is_favorited)
    * 前3条预览评论 (preview_comments)
  - 支持下拉刷新、滚动加载更多
  - 右下角"+"按钮(仅会员可见) → 跳转发布页

帖子详情页 (pages/moment/detail.vue):
  - 调用 GET /api/v2/moment/detail/{id}
  - 返回完整评论树(parent → children 嵌套结构)
  - 支持评论/回复、点赞、收藏、分享
  - 支持保存图片、保存视频

发布帖子页 (pages/moment/publish.vue):
  - 上传图片(最多9张)或视频
  - 调用 POST /api/v2/moment/create { content, images, video_url }

我的收藏 (pages/moment/my_favorites.vue):
  - 调用 GET /api/v2/moment/favorites
  - 支持取消收藏
```

### 4. 课程购买流程

```
课程列表 → 点击课程 → 课程详情 (GET /api/v2/course/detail/{id})
  → 如果 can_watch=true: 直接播放
  → 如果 can_watch=false:
      → 调用 POST /api/v2/course/create_order { course_id }
      → 返回 { order_sn, price, pay_params }
      → 前端调起微信支付 (使用 pay_params 参数)
      → 支付成功后 can_watch变为true
```

### 5. 线下课预约流程

```
线下课列表 (GET /api/v2/offline_class/list)
  → 点击排期 → 排期详情 (GET /api/v2/offline_class/detail/{id})
  → 填写姓名+手机号 → 提交预约
  → POST /api/v2/offline_class/booking { class_id, name, phone }
  → 返回"预约成功"
```

## API 调用规范

### 请求头
```
Content-Type: application/json
Authori-zation: Bearer <token>   (需要登录的接口必传)
```

### 响应格式
```json
{
  "status": 200,        // 200=成功, 400=失败
  "msg": "success",     // 提示信息
  "data": {}            // 返回数据
}
```

### 错误码
| status | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 业务错误(msg中有具体原因) |
| 401 | 未登录或token过期 |

### 无需登录的公开接口
- GET /api/v2/home/config — 首页配置
- GET /api/v2/product/info — 产品信息（首页展示的产品，is_home=1，返回含 category_name）
- GET /api/v2/product/list — 全部产品列表（仅启用的，按is_home倒序，返回含 category_name）
- GET /api/v2/category/case — 案例分类列表（仅启用）
- GET /api/v2/category/course — 课程分类列表（仅启用）
- GET /api/v2/category/product — 产品分类列表（仅启用）
- GET /api/v2/case/list — 案例列表（支持 category_id 筛选，返回含 category_name）
- GET /api/v2/case_comment/list — 案例评论
- GET /api/v2/offline_class/list — 线下排期列表
- GET /api/v2/offline_class/detail/:id — 排期详情
- 所有登录相关接口 (/routine/*)

### 需要登录的接口
- GET /api/v2/user/info — 用户信息
- GET /api/v2/course/list — 课程列表（支持 category_id 筛选，返回含 category_name）
- GET /api/v2/course/detail/:id — 课程详情
- POST /api/v2/course/create_order — 创建订单
- POST /api/v2/offline_class/booking — 提交预约
- POST /api/v2/case_comment/add — 发表评论
- 所有 /api/v2/moment/* 接口

### 需要会员的接口 (在登录基础上还需要 is_teaching_member=1)
- POST /api/v2/moment/create — 发布帖子
- POST /api/v2/moment/like/:id — 点赞
- POST /api/v2/moment/favorite/:id — 收藏
- POST /api/v2/moment/comment — 评论
- POST /api/v2/moment/share/:id — 分享

## 前端数据流

```
用户登录 → token存储 → 获取用户信息(user/info)
  → is_teaching_member 控制会员功能可见性
  → 会员功能按钮根据此状态显示/隐藏

朋友圈列表:
  → getMomentList() → 渲染动态流
  → 点赞: toggleLike(id) → 前端即时更新UI (action: liked/unliked)
  → 收藏: toggleFavorite(id) → 前端即时更新UI (action: favorited/unfavorited)

图片URL: 接口返回的图片路径如果是相对路径,需要拼接 baseUrl
  (后端 set_file_url() 已处理,返回的是完整URL)
```
