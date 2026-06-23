# 洗眉机小程序 API 汇总

## 当前已注册路由 (v2.php)

### 微信登录授权（无需token）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/routine/auth_type` | 小程序登录类型 |
| GET | `/api/v2/routine/auth_login` | 授权登录，返回token |
| POST | `/api/v2/routine/auth_binding_phone` | 授权绑定手机号 |
| POST | `/api/v2/routine/phone_login` | 手机号直接登录 |
| POST | `/api/v2/routine/binding_phone` | 授权后绑定手机号 |

### 首页配置（无需token）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/home/config` | 首页配置（轮播/公告/快捷导航/精选案例/热门课程/联系） |

### 产品（无需token）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/product/info` | 产品信息 |

### 案例（无需token）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/case/list` | 案例列表 `?page=&limit=&type=` |

### 案例评论
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/case_comment/list` | 评论列表（无需token）`?case_id=&page=&limit=` |
| POST | `/api/v2/case_comment/add` | 发表评论（需token）`{case_id, content, pid?, reply_uid?}` |

### 教学课程（需token）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/course/list` | 课程列表 `?page=&limit=` |
| GET | `/api/v2/course/detail/:id` | 课程详情 |
| POST | `/api/v2/course/create_order` | 创建试听订单 `{course_id}` |

### 线下排期
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/offline_class/list` | 线下排期列表 `?page=&limit=` |
| GET | `/api/v2/offline_class/detail/:id` | 排期详情 |
| POST | `/api/v2/offline_class/booking` | 提交预约（需token）`{class_id, name, phone}` |

---

## 控制器存在但路由未注册（已禁用）

这些Controller代码存在，但在 v2.php 中**未加载**路由，API不可用：

| Controller | 功能 |
|------|------|
| `v2/PublicController` | 公共接口(index/getDiy/getVersion等) |
| `v2/wechat/WechatController` | 微信公众号授权 |
| `v2/activity/LuckLotteryController` | 幸运抽奖 |
| `v2/agent/AgentLevel.php` | 分销等级 |
| `v2/order/StoreOrderInvoiceController` | 订单发票 |
| `v2/store/StoreCartController` | 购物车 |
| `v2/store/StoreCouponsController` | 优惠券 |
| `v2/store/StoreProductController` | 商城商品 |
| `v2/user/StoreService.php` | 客服 |
| `v2/user/UserInvoiceController` | 用户发票 |
| `v2/user/UserSearchController` | 用户搜索记录 |

---

## Admin管理后台API (adminapi)

### 教学模块（已注册）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/adminapi/teaching/product_info/list` | 产品管理列表 |
| POST | `/adminapi/teaching/product_info/save` | 保存产品 |
| GET | `/adminapi/teaching/case/list` | 案例列表 |
| POST | `/adminapi/teaching/case/save` | 保存案例 |
| GET | `/adminapi/teaching/course/list` | 课程列表 |
| POST | `/adminapi/teaching/course/save` | 保存课程 |
| GET | `/adminapi/teaching/offline_class/list` | 线下课程列表 |
| POST | `/adminapi/teaching/offline_class/save` | 保存线下课程 |
| GET | `/adminapi/teaching/booking/list` | 预约列表 |
| POST | `/adminapi/teaching/booking/cancel/:id` | 取消预约 |
| GET | `/adminapi/teaching/case_comment/list` | 案例评论列表 |
| PUT | `/adminapi/teaching/case_comment/status/:id` | 评论显示/隐藏 |
| DELETE | `/adminapi/teaching/case_comment/delete/:id` | 删除评论 |
| GET | `/adminapi/teaching/home_config/info` | 首页配置详情 |
| POST | `/adminapi/teaching/home_config/save` | 保存首页配置 |
| GET | `/adminapi/teaching/member/list` | 教学会员列表 |
| PUT | `/adminapi/teaching/member/set/:uid` | 设置/取消教学会员 |

### 商城路由已禁用 (.bak)
product, order, marketing, finance, agent, cms, diy, export, freight, live, merchant, serve, statistic, widget, crud

---

## 前端页面（小程序 uni-app）

### src/pages.json 已注册
| 页面路径 | TabBar | 说明 |
|------|------|------|
| `pages/teaching/home/index` | 首页 | 首页（轮播/公告/快 nav/案例/课程/联系） |
| `pages/teaching/case/index` | 案例 | 案例列表（全部/图片/视频 + 评论） |
| `pages/teaching/course/index` | 教学 | 课程列表+试听购买 |
| `pages/teaching/offline/index` | 线下课 | 线下排期+预约 |
| `pages/guide/index` | - | 启动页→重定向到首页 |
| `pages/teaching/product/index` | - | 产品详情（从首页快 nav进入） |

### src/pages/ 目录中但未在pages.json注册的页面
- pages/index/ (CRMEB主页)
- pages/user/ (用户中心)
- pages/goods*/ (商品相关)
- pages/activity/ (活动)
- pages/extension/ (分销)
- pages/points_mall/ (积分商城)
- pages/annex/ (附件)
- pages/columnGoods/ (栏目商品)

---

## 数据库表（教学模块）

| 表名 | 说明 |
|------|------|
| `eb_product_info` | 产品信息 |
| `eb_case` | 案例 |
| `eb_case_comment` | 案例评论 |
| `eb_course` | 教学课程 |
| `eb_course_order` | 课程订单 |
| `eb_offline_class` | 线下排期 |
| `eb_offline_booking` | 线下预约 |
| `eb_teaching_home_config` | 首页配置(key-value) |

---

## 关键文件位置

| 文件 | 路径 |
|------|------|
| API v2路由 | `crmeb/app/api/route/v2.php` |
| 教学路由 | `crmeb/app/api/route/v2/teaching.php` |
| Admin教学路由 | `crmeb/app/adminapi/route/teaching.php` |
| 小程序源码 | `template/uni-app/src/pages/teaching/` |
| 小程序页面配置 | `template/uni-app/src/pages.json` |
| 小程序API接口层 | `template/uni-app/src/api/` |
| 数据库菜单SQL | `crmeb/sql/hide_shop_menus.sql` |
| 数据库迁移SQL | `crmeb/sql/migration_teaching.sql` |
