# 洗眉机微信小程序 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 基于 CRMEB v6.0.0 改造，构建独立的洗眉机业务微信小程序（4 页面 + 6 后台管理模块 + 隐藏商城 + 去品牌化）。

**Architecture:** 复用 CRMEB ThinkPHP 6 分层架构（Model → DAO → Services → Controller → Route），UniApp 前端照搬 CRMEB 的 API 调用模式。新增代码在独立目录和文件中，原有代码不删除不修改。

**Tech Stack:** PHP 7.4, ThinkPHP 6, MySQL 5.7+, UniApp (Vue 2), Vue 2 + Element UI (admin), Docker Compose

## Global Constraints

- 数据库表前缀: `eb_`
- 命名规范: 表/字段 lowercase_underscore，类 PascalCase，方法 camelCase
- Controller 方法: lowercase_underscore（CRMEB 规范）
- 所有 DB 访问通过 Model（禁止 `Db::table()`）
- 新增代码放在独立文件，原有文件只做最小修改
- 隐藏功能不删除文件，通过前端路由/入口控制
- 每个 task 完成即 commit
- 支付复用 CRMEB 现有微信支付服务（`crmeb/services/pay/`）
- 文件上传复用 CRMEB 现有上传服务

---

## File Structure

```
新增文件:
crmeb/app/model/product/ProductInfo.php
crmeb/app/model/teaching/Case.php
crmeb/app/model/teaching/Course.php
crmeb/app/model/teaching/CourseOrder.php
crmeb/app/model/teaching/OfflineClass.php
crmeb/app/model/teaching/OfflineBooking.php
crmeb/app/dao/product/ProductInfoDao.php
crmeb/app/dao/teaching/CaseDao.php
crmeb/app/dao/teaching/CourseDao.php
crmeb/app/dao/teaching/CourseOrderDao.php
crmeb/app/dao/teaching/OfflineClassDao.php
crmeb/app/dao/teaching/OfflineBookingDao.php
crmeb/app/services/product/ProductInfoServices.php
crmeb/app/services/teaching/CaseServices.php
crmeb/app/services/teaching/CourseServices.php
crmeb/app/services/teaching/CourseOrderServices.php
crmeb/app/services/teaching/OfflineClassServices.php
crmeb/app/services/teaching/OfflineBookingServices.php
crmeb/app/api/controller/v2/ProductController.php
crmeb/app/api/controller/v2/CaseController.php
crmeb/app/api/controller/v2/CourseController.php
crmeb/app/api/controller/v2/OfflineClassController.php
crmeb/app/api/route/v2/teaching.php
crmeb/app/adminapi/controller/v1/teaching/ProductInfoController.php
crmeb/app/adminapi/controller/v1/teaching/CaseController.php
crmeb/app/adminapi/controller/v1/teaching/CourseController.php
crmeb/app/adminapi/controller/v1/teaching/OfflineClassController.php
crmeb/app/adminapi/controller/v1/teaching/BookingController.php
crmeb/app/adminapi/route/teaching.php
crmeb/app/adminapi/validate/v1/teaching/ProductInfoValidator.php
crmeb/app/adminapi/validate/v1/teaching/CaseValidator.php
crmeb/app/adminapi/validate/v1/teaching/CourseValidator.php
crmeb/app/adminapi/validate/v1/teaching/OfflineClassValidator.php
template/admin/src/pages/teaching/productInfo/
template/admin/src/pages/teaching/caseList/
template/admin/src/pages/teaching/courseList/
template/admin/src/pages/teaching/offlineClass/
template/admin/src/pages/teaching/booking/
template/admin/src/api/teaching.js
template/admin/src/router/modules/teaching.js
template/uni-app/pages/teaching/product/
template/uni-app/pages/teaching/case/
template/uni-app/pages/teaching/course/
template/uni-app/pages/teaching/offline/

修改文件:
crmeb/app/api/route/v2.php                          (include teaching route)
crmeb/app/adminapi/route/route.php                   (include teaching route)
template/uni-app/pages.json                           (改 tabBar + 新增页面)
template/uni-app/App.vue                              (去品牌化)
template/admin/src/layout/logo/index.vue             (替换 logo/名称)
template/admin/src/router/index.js                    (login page title)
```

---

### Task 1: 数据库迁移脚本

**Files:**
- Create: `crmeb/sql/migration_teaching.sql`

**Interfaces:**
- Produces: 6 张新表 + 1 个用户表字段，可直接 `source migration_teaching.sql` 执行

- [ ] **Step 1: 编写完整迁移 SQL**

```sql
-- 洗眉机小程序数据库迁移脚本
-- 执行: mysql -u root -p <database> < migration_teaching.sql

-- 1. 产品信息表
CREATE TABLE IF NOT EXISTS `eb_product_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `banner` text COMMENT '轮播图JSON',
  `title` varchar(255) DEFAULT '' COMMENT '产品标题',
  `desc` text COMMENT '产品描述',
  `detail` longtext COMMENT '图文详情HTML',
  `specs` text COMMENT '参数规格JSON',
  `video_url` varchar(500) DEFAULT '' COMMENT '产品视频链接',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机产品信息';

-- 2. 案例表
CREATE TABLE IF NOT EXISTS `eb_case` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '案例标题',
  `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=图片 2=视频',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `media_url` varchar(500) DEFAULT '' COMMENT '图片或视频URL',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=显示 0=隐藏',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机案例';

-- 3. 教学课程表
CREATE TABLE IF NOT EXISTS `eb_course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '课程标题',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `desc` text COMMENT '课程简介',
  `video_url` varchar(500) DEFAULT '' COMMENT '课程视频',
  `price` decimal(8,2) NOT NULL DEFAULT 9.90 COMMENT '试听价格',
  `is_free_for_member` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=会员免费',
  `sort` int(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=上架 0=下架',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机教学课程';

-- 4. 课程订单表
CREATE TABLE IF NOT EXISTS `eb_course_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `course_id` int(11) NOT NULL DEFAULT 0 COMMENT '课程ID',
  `order_sn` varchar(32) NOT NULL DEFAULT '' COMMENT '订单号',
  `price` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT '支付金额',
  `pay_type` varchar(20) DEFAULT 'wechat' COMMENT '支付方式',
  `pay_time` int(11) NOT NULL DEFAULT 0 COMMENT '支付时间',
  `paid` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=未支付 1=已支付',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_sn` (`order_sn`),
  KEY `idx_uid` (`uid`),
  KEY `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机课程订单';

-- 5. 线下课程排期表
CREATE TABLE IF NOT EXISTS `eb_offline_class` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT '' COMMENT '课程名称',
  `cover` varchar(500) DEFAULT '' COMMENT '封面图',
  `class_date` date NOT NULL COMMENT '开课日期',
  `start_time` time NOT NULL COMMENT '开始时间',
  `end_time` time NOT NULL COMMENT '结束时间',
  `address` varchar(500) DEFAULT '' COMMENT '上课地点',
  `max_people` int(11) NOT NULL DEFAULT 0 COMMENT '人数限额 0=不限',
  `qrcode` varchar(500) DEFAULT '' COMMENT '店主微信二维码',
  `desc` text COMMENT '课程详情',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=停用',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_date_status` (`class_date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机线下课程排期';

-- 6. 线下预约记录表
CREATE TABLE IF NOT EXISTS `eb_offline_booking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT 0 COMMENT '用户ID',
  `class_id` int(11) NOT NULL DEFAULT 0 COMMENT '排期ID',
  `name` varchar(50) DEFAULT '' COMMENT '联系人姓名',
  `phone` varchar(20) DEFAULT '' COMMENT '联系人手机号',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=已预约 1=已取消',
  `add_time` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`),
  KEY `idx_class_id` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='洗眉机线下预约记录';

-- 7. 用户表新增教学会员字段
ALTER TABLE `eb_user` ADD COLUMN IF NOT EXISTS `is_teaching_member` tinyint(1) NOT NULL DEFAULT 0 COMMENT '教学会员:0=否 1=是';
```

- [ ] **Step 2: 执行迁移脚本验证**

```bash
mysql -u root -p <database> < crmeb/sql/migration_teaching.sql
```

验证: `SHOW TABLES LIKE 'eb_%';` 确认 6 张表存在，`DESC eb_user;` 确认 `is_teaching_member` 字段存在。

- [ ] **Step 3: Commit**

```bash
git add crmeb/sql/migration_teaching.sql
git commit -m "feat: add brow-washing teaching module database migration

- 6 new tables: eb_product_info, eb_case, eb_course, eb_course_order, eb_offline_class, eb_offline_booking
- 1 new column: eb_user.is_teaching_member

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: 后端 — Models（6 个 Model）

**Files:**
- Create: `crmeb/app/model/product/ProductInfo.php`
- Create: `crmeb/app/model/teaching/Case.php`
- Create: `crmeb/app/model/teaching/Course.php`
- Create: `crmeb/app/model/teaching/CourseOrder.php`
- Create: `crmeb/app/model/teaching/OfflineClass.php`
- Create: `crmeb/app/model/teaching/OfflineBooking.php`

**Interfaces:**
- Produces: 6 个 Model 类，可以被 DAO 层通过 `app()->make(ClassName::class)` 获取

- [ ] **Step 1: 创建 Model 文件**

所有 Model 遵循相同模板，以 `ProductInfo` 为例：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\model\product;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

/**
 * 洗眉机产品信息
 */
class ProductInfo extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';

    protected $name = 'product_info';

    protected $autoWriteTimestamp = false;
}
```

其余 5 个 Model 模式相同，仅 namespace 和 `$name` 不同：

| Model | namespace | $name |
|-------|-----------|-------|
| Case | `app\model\teaching` | `case` |
| Course | `app\model\teaching` | `course` |
| CourseOrder | `app\model\teaching` | `course_order` |
| OfflineClass | `app\model\teaching` | `offline_class` |
| OfflineBooking | `app\model\teaching` | `offline_booking` |

注意：`Case` 是 PHP 保留关键字，但作为类名在 namespace 下是合法的，ThinkPHP 框架会正常处理。

- [ ] **Step 2: Commit**

```bash
git add crmeb/app/model/product/ProductInfo.php crmeb/app/model/teaching/
git commit -m "feat: add 6 models for brow-washing teaching module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: 后端 — DAOs（6 个 DAO）

**Files:**
- Create: `crmeb/app/dao/product/ProductInfoDao.php`
- Create: `crmeb/app/dao/teaching/CaseDao.php`
- Create: `crmeb/app/dao/teaching/CourseDao.php`
- Create: `crmeb/app/dao/teaching/CourseOrderDao.php`
- Create: `crmeb/app/dao/teaching/OfflineClassDao.php`
- Create: `crmeb/app/dao/teaching/OfflineBookingDao.php`

**Interfaces:**
- Consumes: 6 个 Model 类 (Task 2)
- Produces: 6 个 DAO 类，提供 `getConditionModel()` 条件查询和 `XxxList()` `XxxCount()` 列表方法

- [ ] **Step 1: 创建 DAO 文件**

以 `ProductInfoDao` 为例（单条记录用，不需要列表方法）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\dao\product;

use app\dao\BaseDao;
use app\model\product\ProductInfo;

/**
 * 洗眉机产品信息 DAO
 */
class ProductInfoDao extends BaseDao
{
    protected function setModel(): string
    {
        return ProductInfo::class;
    }
}
```

以 `CaseDao` 为例（列表型，需要条件查询）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\dao\teaching;

use app\dao\BaseDao;
use app\model\teaching\Case;

/**
 * 案例 DAO
 */
class CaseDao extends BaseDao
{
    protected function setModel(): string
    {
        return Case::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()->where('status', 1)
            ->when(isset($where['type']) && $where['type'] > 0, function ($query) use ($where) {
                $query->where('type', $where['type']);
            });
    }

    public function caseList($where, $field, $page = 0, $limit = 0, $order = 'sort desc, id desc')
    {
        return $this->getConditionModel($where)
            ->field($field)
            ->order($order)
            ->when($page != 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })->select()->toArray();
    }

    public function caseCount($where)
    {
        return $this->getConditionModel($where)->count();
    }
}
```

其余 4 个 DAO 模式同上：

| DAO | 需要列表方法 | 特点 |
|-----|------------|------|
| `CourseDao` | 是 | 条件: status=1 |
| `CourseOrderDao` | 是 | 条件: 按 uid 筛选，关联查询 |
| `OfflineClassDao` | 是 | 条件: status=1, class_date >= today |
| `OfflineBookingDao` | 是 | 条件: 按 class_id 筛选 |

`CourseOrderDao` 的 `getConditionModel` 增加 uid 筛选：

```php
public function getConditionModel($where)
{
    return $this->getModel()
        ->when(isset($where['uid']) && $where['uid'] > 0, function ($query) use ($where) {
            $query->where('uid', $where['uid']);
        })->when(isset($where['paid']) && $where['paid'] !== '', function ($query) use ($where) {
            $query->where('paid', $where['paid']);
        });
}
```

`OfflineClassDao` 的默认条件只展示未来排期：

```php
public function getConditionModel($where)
{
    return $this->getModel()->where('status', 1)
        ->when(isset($where['show_all']) && $where['show_all'] == 1, function ($query) {
            // 管理后台看全部
        }, function ($query) {
            $query->where('class_date', '>=', date('Y-m-d'));
        });
}
```

- [ ] **Step 2: Commit**

```bash
git add crmeb/app/dao/product/ProductInfoDao.php crmeb/app/dao/teaching/
git commit -m "feat: add 6 DAOs for brow-washing teaching module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: 后端 — Services（6 个 Service）

**Files:**
- Create: `crmeb/app/services/product/ProductInfoServices.php`
- Create: `crmeb/app/services/teaching/CaseServices.php`
- Create: `crmeb/app/services/teaching/CourseServices.php`
- Create: `crmeb/app/services/teaching/CourseOrderServices.php`
- Create: `crmeb/app/services/teaching/OfflineClassServices.php`
- Create: `crmeb/app/services/teaching/OfflineBookingServices.php`

**Interfaces:**
- Consumes: 6 个 DAO 类 (Task 3)
- Produces: 6 个 Service 类，供 Controller 调用

- [ ] **Step 1: 创建 Service 文件**

以 `ProductInfoServices` 为例：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\product;

use app\dao\product\ProductInfoDao;
use app\services\BaseServices;

/**
 * 洗眉机产品信息服务
 */
class ProductInfoServices extends BaseServices
{
    public function __construct(ProductInfoDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取产品信息（单条记录，id=1）
     * @return array
     */
    public function getProductInfo()
    {
        $info = $this->dao->get(1);
        if ($info) {
            $info['banner'] = json_decode($info['banner'], true) ?? [];
            $info['specs'] = json_decode($info['specs'], true) ?? [];
            if (isset($info['banner']) && is_array($info['banner'])) {
                foreach ($info['banner'] as &$url) {
                    $url = set_file_url($url);
                }
            }
        }
        return $info ?: [];
    }

    /**
     * 保存产品信息（存在则更新，不存在则新增）
     * @param array $data
     * @return mixed
     */
    public function saveProductInfo(array $data)
    {
        $data['update_time'] = time();
        $exists = $this->dao->get(1);
        if ($exists) {
            return $this->dao->update(1, $data);
        } else {
            $data['add_time'] = time();
            return $this->dao->save($data);
        }
    }
}
```

以 `CaseServices` 为例（标准 CRUD）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\CaseDao;
use app\services\BaseServices;

/**
 * 案例服务
 */
class CaseServices extends BaseServices
{
    public function __construct(CaseDao $dao)
    {
        $this->dao = $dao;
    }

    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,type,cover,media_url,sort,status,add_time';
        $list = $this->dao->caseList($where, $field, $page, $limit);
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['media_url'] = set_file_url($item['media_url']);
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->caseCount($where);
        return compact('list', 'count');
    }
}
```

以 `CourseServices` 为例（含会员权限判断）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\CourseDao;
use app\services\BaseServices;
use app\services\user\UserServices;
use crmeb\exceptions\ApiException;

/**
 * 教学课程服务
 */
class CourseServices extends BaseServices
{
    public function __construct(CourseDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取课程列表（含会员权限信息）
     * @param array $where
     * @param int $uid
     * @return array
     */
    public function getList(array $where, int $uid)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,cover,desc,price,is_free_for_member,sort,status,add_time';
        $list = $this->dao->courseList($where, $field, $page, $limit);
        // 检查是否教学会员
        $isMember = false;
        if ($uid > 0) {
            /** @var UserServices $userServices */
            $userServices = app()->make(UserServices::class);
            $isMember = (bool)$userServices->value(['uid' => $uid], 'is_teaching_member');
        }
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['is_member'] = $isMember;
            $item['can_watch'] = $isMember || $item['is_free_for_member'];
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->courseCount($where);
        return compact('list', 'count');
    }

    /**
     * 获取课程详情
     * @param int $id
     * @param int $uid
     * @return array
     * @throws ApiException
     */
    public function getDetail(int $id, int $uid)
    {
        $info = $this->dao->get($id);
        if (!$info || !$info['status']) {
            throw new ApiException('课程不存在或已下架');
        }
        $info['cover'] = set_file_url($info['cover']);
        $info['video_url'] = set_file_url($info['video_url']);
        // 检查会员
        $isMember = false;
        if ($uid > 0) {
            $userServices = app()->make(UserServices::class);
            $isMember = (bool)$userServices->value(['uid' => $uid], 'is_teaching_member');
        }
        $info['is_member'] = $isMember;
        $info['can_watch'] = $isMember || $info['is_free_for_member'];
        return $info;
    }
}
```

以 `CourseOrderServices` 为例（含支付创建）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\CourseOrderDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

/**
 * 课程订单服务
 */
class CourseOrderServices extends BaseServices
{
    public function __construct(CourseOrderDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 创建试听订单
     * @param int $uid
     * @param int $courseId
     * @param float $price
     * @return string order_sn
     */
    public function createOrder(int $uid, int $courseId, float $price)
    {
        $orderSn = date('YmdHis') . rand(10000, 99999);
        $this->dao->save([
            'uid' => $uid,
            'course_id' => $courseId,
            'order_sn' => $orderSn,
            'price' => $price,
            'pay_type' => 'wechat',
            'paid' => 0,
            'add_time' => time(),
        ]);
        return $orderSn;
    }

    /**
     * 支付成功回调处理
     * @param string $orderSn
     * @return bool
     */
    public function paySuccess(string $orderSn)
    {
        $order = $this->dao->getOne(['order_sn' => $orderSn]);
        if (!$order) throw new ApiException('订单不存在');
        if ($order['paid']) return true;
        return $this->dao->update($order['id'], [
            'paid' => 1,
            'pay_time' => time(),
        ]);
    }

    /**
     * 检查用户是否购买过某课程
     * @param int $uid
     * @param int $courseId
     * @return bool
     */
    public function hasPurchased(int $uid, int $courseId): bool
    {
        return $this->dao->be(['uid' => $uid, 'course_id' => $courseId, 'paid' => 1]);
    }
}
```

以 `OfflineClassServices` 为例：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\OfflineClassDao;
use app\services\BaseServices;

/**
 * 线下课程排期服务
 */
class OfflineClassServices extends BaseServices
{
    public function __construct(OfflineClassDao $dao)
    {
        $this->dao = $dao;
    }

    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,title,cover,class_date,start_time,end_time,address,max_people,qrcode,desc,status,add_time';
        $list = $this->dao->classList($where, $field, $page, $limit);
        /** @var OfflineBookingServices $bookingServices */
        $bookingServices = app()->make(OfflineBookingServices::class);
        foreach ($list as &$item) {
            $item['cover'] = set_file_url($item['cover']);
            $item['qrcode'] = set_file_url($item['qrcode']);
            $item['booked_count'] = $bookingServices->getBookedCount($item['id']);
        }
        $count = $this->dao->classCount($where);
        return compact('list', 'count');
    }
}
```

以 `OfflineBookingServices` 为例：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\services\teaching;

use app\dao\teaching\OfflineBookingDao;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

/**
 * 线下预约服务
 */
class OfflineBookingServices extends BaseServices
{
    public function __construct(OfflineBookingDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 创建预约
     * @param int $uid
     * @param int $classId
     * @param string $name
     * @param string $phone
     * @return mixed
     * @throws ApiException
     */
    public function createBooking(int $uid, int $classId, string $name, string $phone)
    {
        // 检查是否已预约
        if ($this->dao->be(['uid' => $uid, 'class_id' => $classId, 'status' => 0])) {
            throw new ApiException('您已预约过该课程');
        }
        return $this->dao->save([
            'uid' => $uid,
            'class_id' => $classId,
            'name' => $name,
            'phone' => $phone,
            'status' => 0,
            'add_time' => time(),
        ]);
    }

    /**
     * 获取某排期的已预约人数
     * @param int $classId
     * @return int
     */
    public function getBookedCount(int $classId): int
    {
        return $this->dao->getCount(['class_id' => $classId, 'status' => 0]);
    }

    /**
     * 获取预约列表
     * @param array $where
     * @return array
     */
    public function getList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,uid,class_id,name,phone,status,add_time';
        $list = $this->dao->bookingList($where, $field, $page, $limit);
        foreach ($list as &$item) {
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->bookingCount($where);
        return compact('list', 'count');
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add crmeb/app/services/product/ProductInfoServices.php crmeb/app/services/teaching/
git commit -m "feat: add 6 services for brow-washing teaching module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: 后端 — API v2 Controller + Route（小程序端）

**Files:**
- Create: `crmeb/app/api/controller/v2/ProductController.php`
- Create: `crmeb/app/api/controller/v2/CaseController.php`
- Create: `crmeb/app/api/controller/v2/CourseController.php`
- Create: `crmeb/app/api/controller/v2/OfflineClassController.php`
- Create: `crmeb/app/api/route/v2/teaching.php`
- Modify: `crmeb/app/api/route/v2.php` (include teaching.php)

**Interfaces:**
- Consumes: Service 类 (Task 4)
- Produces: 小程序端可调用的 REST API

- [ ] **Step 1: 创建 API Controller**

`ProductController`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\api\controller\v2;

use app\services\product\ProductInfoServices;
use think\facade\App;

/**
 * 产品展示控制器
 */
class ProductController
{
    protected $services;

    public function __construct(App $app, ProductInfoServices $services)
    {
        $this->services = $services;
    }

    /**
     * 获取产品信息
     * GET /api/v2/product/info
     */
    public function get_info()
    {
        $info = $this->services->getProductInfo();
        return app('json')->success($info);
    }
}
```

`CaseController`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\api\controller\v2;

use app\services\teaching\CaseServices;
use think\facade\App;

/**
 * 案例控制器
 */
class CaseController
{
    protected $services;

    public function __construct(App $app, CaseServices $services)
    {
        $this->services = $services;
    }

    /**
     * 案例列表（支持按类型筛选）
     * GET /api/v2/case/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['type', 0],     // 0=全部 1=图片 2=视频
            ['page', 0],
            ['limit', 0],
        ]);
        return app('json')->success($this->services->getList(array_filter($where)));
    }
}
```

`CourseController`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\api\controller\v2;

use app\services\teaching\CourseServices;
use app\services\teaching\CourseOrderServices;
use think\facade\App;

/**
 * 教学课程控制器
 */
class CourseController
{
    protected $services;

    public function __construct(App $app, CourseServices $services)
    {
        $this->services = $services;
    }

    /**
     * 课程列表
     * GET /api/v2/course/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['page', 0],
            ['limit', 0],
        ]);
        $uid = request()->uid ?? 0;
        return app('json')->success($this->services->getList($where, $uid));
    }

    /**
     * 课程详情
     * GET /api/v2/course/detail/:id
     */
    public function get_detail($id)
    {
        $uid = request()->uid ?? 0;
        return app('json')->success($this->services->getDetail((int)$id, $uid));
    }

    /**
     * 创建试听订单
     * POST /api/v2/course/create_order
     */
    public function create_order(CourseOrderServices $orderServices)
    {
        [$courseId] = request()->getMore([
            ['course_id', 0],
        ], true);
        if (!$courseId) return app('json')->fail('参数错误');
        $uid = request()->uid;
        // 查课程
        $course = $this->services->getDetail((int)$courseId, $uid);
        // 生成订单
        $orderSn = $orderServices->createOrder($uid, (int)$courseId, (float)$course['price']);
        // 调起微信支付（复用 CRMEB 支付）
        // 返回支付参数给小程序调起支付
        return app('json')->success(['order_sn' => $orderSn, 'price' => $course['price']]);
    }
}
```

`OfflineClassController`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\api\controller\v2;

use app\services\teaching\OfflineClassServices;
use app\services\teaching\OfflineBookingServices;
use think\facade\App;

/**
 * 线下课程控制器
 */
class OfflineClassController
{
    protected $services;

    public function __construct(App $app, OfflineClassServices $services)
    {
        $this->services = $services;
    }

    /**
     * 排期列表
     * GET /api/v2/offline_class/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['page', 0],
            ['limit', 0],
        ]);
        return app('json')->success($this->services->getList($where));
    }

    /**
     * 排期详情
     * GET /api/v2/offline_class/detail/:id
     */
    public function get_detail($id)
    {
        $info = $this->services->dao->get((int)$id);
        if (!$info) return app('json')->fail('课程不存在');
        $info['cover'] = set_file_url($info['cover']);
        $info['qrcode'] = set_file_url($info['qrcode']);
        return app('json')->success($info);
    }

    /**
     * 提交预约
     * POST /api/v2/offline_class/booking
     */
    public function create_booking(OfflineBookingServices $bookingServices)
    {
        [$classId, $name, $phone] = request()->getMore([
            ['class_id', 0],
            ['name', ''],
            ['phone', ''],
        ], true);
        if (!$classId || !$name || !$phone) {
            return app('json')->fail('请填写完整信息');
        }
        $uid = request()->uid;
        $bookingServices->createBooking($uid, (int)$classId, $name, $phone);
        return app('json')->success([], '预约成功');
    }
}
```

- [ ] **Step 2: 创建 API 路由文件**

`crmeb/app/api/route/v2/teaching.php`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
use think\facade\Route;

/**
 * 洗眉机教学路由
 */

// 产品 — 无需登录
Route::group('product', function () {
    Route::get('info', 'v2.ProductController/get_info')->option(['real_name' => '产品信息']);
});

// 案例 — 无需登录
Route::group('case', function () {
    Route::get('list', 'v2.CaseController/get_list')->option(['real_name' => '案例列表']);
});

// 教学课程 — 需要登录
Route::group('course', function () {
    Route::get('list', 'v2.CourseController/get_list')->option(['real_name' => '课程列表']);
    Route::get('detail/:id', 'v2.CourseController/get_detail')->option(['real_name' => '课程详情']);
    Route::post('create_order', 'v2.CourseController/create_order')->option(['real_name' => '创建试听订单']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);

// 线下课程 — 需要登录（预约部分）
Route::group('offline_class', function () {
    Route::get('list', 'v2.OfflineClassController/get_list')->option(['real_name' => '线下排期列表']);
    Route::get('detail/:id', 'v2.OfflineClassController/get_detail')->option(['real_name' => '线下排期详情']);
    Route::post('booking', 'v2.OfflineClassController/create_booking')
        ->middleware(\app\api\middleware\AuthTokenMiddleware::class, false)
        ->option(['real_name' => '提交预约']);
});
```

- [ ] **Step 3: 在 v2.php 中 include 新路由**

修改 `crmeb/app/api/route/v2.php`，在文件末尾（最后一个 `})；` 之后）添加：

```php
// 洗眉机教学路由
require __DIR__ . '/v2/teaching.php';
```

> 具体 include 位置：找到 v2.php 中最后一个 `})->middleware(...)` 闭合后添加。因为 v2.php 文件结构可能变化，实际执行时需要先 Read 文件，在合适位置插入 require。

- [ ] **Step 4: Commit**

```bash
git add crmeb/app/api/controller/v2/ProductController.php \
        crmeb/app/api/controller/v2/CaseController.php \
        crmeb/app/api/controller/v2/CourseController.php \
        crmeb/app/api/controller/v2/OfflineClassController.php \
        crmeb/app/api/route/v2/teaching.php
git add crmeb/app/api/route/v2.php
git commit -m "feat: add API v2 controllers and routes for brow-washing mini program

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: 后端 — Admin Controller + Route（管理后台端）

**Files:**
- Create: `crmeb/app/adminapi/controller/v1/teaching/ProductInfoController.php`
- Create: `crmeb/app/adminapi/controller/v1/teaching/CaseController.php`
- Create: `crmeb/app/adminapi/controller/v1/teaching/CourseController.php`
- Create: `crmeb/app/adminapi/controller/v1/teaching/OfflineClassController.php`
- Create: `crmeb/app/adminapi/controller/v1/teaching/BookingController.php`
- Create: `crmeb/app/adminapi/validate/v1/teaching/ProductInfoValidator.php`
- Create: `crmeb/app/adminapi/validate/v1/teaching/CaseValidator.php`
- Create: `crmeb/app/adminapi/validate/v1/teaching/CourseValidator.php`
- Create: `crmeb/app/adminapi/validate/v1/teaching/OfflineClassValidator.php`
- Create: `crmeb/app/adminapi/route/teaching.php`
- Modify: `crmeb/app/adminapi/route/route.php` (include 两处)

**Interfaces:**
- Consumes: Service 类 (Task 4)
- Produces: 管理后台完整 CRUD API

- [ ] **Step 1: 创建 Admin Controller**

所有 Admin Controller 遵循相同模板（继承 `AuthController`，注入 Service，方法名使用 CRMEB 约定的 `index`/`save`/`update`/`delete`）。

`ProductInfoController`（单表单，无列表）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\adminapi\controller\v1\teaching;

use app\adminapi\controller\AuthController;
use app\services\product\ProductInfoServices;
use app\adminapi\validate\v1\teaching\ProductInfoValidator;
use think\facade\App;

/**
 * 产品管理控制器
 */
class ProductInfoController extends AuthController
{
    protected $services;

    public function __construct(App $app, ProductInfoServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 获取产品信息（编辑表单回显）
     */
    public function index()
    {
        $info = $this->services->getProductInfo();
        return app('json')->success($info);
    }

    /**
     * 保存产品信息
     */
    public function save(ProductInfoValidator $validator)
    {
        $data = $this->request->getMore([
            ['banner', []],
            ['title', ''],
            ['desc', ''],
            ['detail', ''],
            ['specs', []],
            ['video_url', ''],
            ['status', 1],
        ]);
        // banner 和 specs 转为 JSON 存储
        if (is_array($data['banner'])) $data['banner'] = json_encode($data['banner']);
        if (is_array($data['specs'])) $data['specs'] = json_encode($data['specs']);
        $this->services->saveProductInfo($data);
        return app('json')->success([], '保存成功');
    }
}
```

`CaseController`（标准 CRUD）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\adminapi\controller\v1\teaching;

use app\adminapi\controller\AuthController;
use app\services\teaching\CaseServices;
use app\adminapi\validate\v1\teaching\CaseValidator;
use think\facade\App;

/**
 * 案例管理控制器
 */
class CaseController extends AuthController
{
    protected $services;

    public function __construct(App $app, CaseServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 案例列表
     */
    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['type', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        // 管理后台看全部 status，不加筛选
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where));
    }

    /**
     * 新增案例
     */
    public function save(CaseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['type', 1],
            ['cover', ''],
            ['media_url', ''],
            ['sort', 0],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success([], '添加成功');
    }

    /**
     * 编辑案例
     */
    public function update($id, CaseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['type', 1],
            ['cover', ''],
            ['media_url', ''],
            ['sort', 0],
            ['status', 1],
        ]);
        $this->services->update((int)$id, $data);
        return app('json')->success([], '修改成功');
    }

    /**
     * 删除案例（软删除改状态）
     */
    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success([], '删除成功');
    }
}
```

`CourseController`（标准 CRUD）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\adminapi\controller\v1\teaching;

use app\adminapi\controller\AuthController;
use app\services\teaching\CourseServices;
use app\adminapi\validate\v1\teaching\CourseValidator;
use think\facade\App;

/**
 * 课程管理控制器
 */
class CourseController extends AuthController
{
    protected $services;

    public function __construct(App $app, CourseServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['status', ''],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where, 0));
    }

    public function save(CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['desc', ''],
            ['video_url', ''],
            ['price', 9.90],
            ['is_free_for_member', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success([], '添加成功');
    }

    public function update($id, CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['desc', ''],
            ['video_url', ''],
            ['price', 9.90],
            ['is_free_for_member', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        $this->services->update((int)$id, $data);
        return app('json')->success([], '修改成功');
    }

    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success([], '删除成功');
    }
}
```

`OfflineClassController`（标准 CRUD）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\adminapi\controller\v1\teaching;

use app\adminapi\controller\AuthController;
use app\services\teaching\OfflineClassServices;
use app\adminapi\validate\v1\teaching\OfflineClassValidator;
use think\facade\App;

/**
 * 线下排期管理控制器
 */
class OfflineClassController extends AuthController
{
    protected $services;

    public function __construct(App $app, OfflineClassServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where));
    }

    public function save(OfflineClassValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['class_date', ''],
            ['start_time', ''],
            ['end_time', ''],
            ['address', ''],
            ['max_people', 0],
            ['qrcode', ''],
            ['desc', ''],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success([], '添加成功');
    }

    public function update($id, OfflineClassValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['class_date', ''],
            ['start_time', ''],
            ['end_time', ''],
            ['address', ''],
            ['max_people', 0],
            ['qrcode', ''],
            ['desc', ''],
            ['status', 1],
        ]);
        $this->services->update((int)$id, $data);
        return app('json')->success([], '修改成功');
    }

    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success([], '删除成功');
    }
}
```

`BookingController`（只读列表）：

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
namespace app\adminapi\controller\v1\teaching;

use app\adminapi\controller\AuthController;
use app\services\teaching\OfflineBookingServices;
use think\facade\App;

/**
 * 预约记录控制器（只读）
 */
class BookingController extends AuthController
{
    protected $services;

    public function __construct(App $app, OfflineBookingServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 预约记录列表
     */
    public function index()
    {
        $where = $this->request->getMore([
            ['class_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        return app('json')->success($this->services->getList(array_filter($where)));
    }

    /**
     * 取消预约（管理员操作）
     */
    public function cancel($id)
    {
        $this->services->update((int)$id, ['status' => 1]);
        return app('json')->success([], '已取消');
    }
}
```

- [ ] **Step 2: 创建 Admin 验证器**

```php
<?php
// crmeb/app/adminapi/validate/v1/teaching/ProductInfoValidator.php
namespace app\adminapi\validate\v1\teaching;

use think\Validate;

class ProductInfoValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'detail' => 'require',
    ];

    protected $message = [
        'title.require' => '产品标题不能为空',
        'detail.require' => '图文详情不能为空',
    ];
}
```

```php
<?php
// crmeb/app/adminapi/validate/v1/teaching/CaseValidator.php
namespace app\adminapi\validate\v1\teaching;

use think\Validate;

class CaseValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'type' => 'require|in:1,2',
        'cover' => 'require',
        'media_url' => 'require',
    ];

    protected $message = [
        'title.require' => '案例标题不能为空',
        'type.require' => '请选择案例类型',
        'cover.require' => '请上传封面图',
        'media_url.require' => '请上传图片或视频',
    ];
}
```

其余验证器模式相同，`CourseValidator` 增加 `price` 验证，`OfflineClassValidator` 增加 `class_date`/`start_time`/`end_time` 验证。

- [ ] **Step 3: 创建 Admin 路由文件**

`crmeb/app/adminapi/route/teaching.php`:

```php
<?php
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------
use think\facade\Route;

/**
 * 洗眉机教学管理路由
 */

// 产品管理
Route::group('teaching_product', function () {
    Route::get('info', 'v1.teaching.ProductInfoController/index')->option(['real_name' => '产品信息']);
    Route::post('save', 'v1.teaching.ProductInfoController/save')->option(['real_name' => '保存产品信息']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 案例管理
Route::group('teaching_case', function () {
    Route::get('list', 'v1.teaching.CaseController/index')->option(['real_name' => '案例列表']);
    Route::post('save', 'v1.teaching.CaseController/save')->option(['real_name' => '新增案例']);
    Route::put('update/:id', 'v1.teaching.CaseController/update')->option(['real_name' => '编辑案例']);
    Route::delete('delete/:id', 'v1.teaching.CaseController/delete')->option(['real_name' => '删除案例']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 课程管理
Route::group('teaching_course', function () {
    Route::get('list', 'v1.teaching.CourseController/index')->option(['real_name' => '课程列表']);
    Route::post('save', 'v1.teaching.CourseController/save')->option(['real_name' => '新增课程']);
    Route::put('update/:id', 'v1.teaching.CourseController/update')->option(['real_name' => '编辑课程']);
    Route::delete('delete/:id', 'v1.teaching.CourseController/delete')->option(['real_name' => '删除课程']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 线下排期管理
Route::group('teaching_offline', function () {
    Route::get('list', 'v1.teaching.OfflineClassController/index')->option(['real_name' => '线下排期列表']);
    Route::post('save', 'v1.teaching.OfflineClassController/save')->option(['real_name' => '新增排期']);
    Route::put('update/:id', 'v1.teaching.OfflineClassController/update')->option(['real_name' => '编辑排期']);
    Route::delete('delete/:id', 'v1.teaching.OfflineClassController/delete')->option(['real_name' => '删除排期']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 预约记录
Route::group('teaching_booking', function () {
    Route::get('list', 'v1.teaching.BookingController/index')->option(['real_name' => '预约记录列表']);
    Route::put('cancel/:id', 'v1.teaching.BookingController/cancel')->option(['real_name' => '取消预约']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 用户会员管理（新增到已有用户管理下）
Route::group('user', function () {
    Route::put('set_teaching_member/:uid', 'v1.user.User/setTeachingMember')->option(['real_name' => '设置教学会员']);
});
```

- [ ] **Step 4: 在 route.php 中 include 新路由**

修改 `crmeb/app/adminapi/route/route.php`，在所有现有 `require` 语句之后添加：

```php
// 洗眉机教学管理路由（需要授权）
require __DIR__ . '/teaching.php';
```

- [ ] **Step 5: 在 UserController 中新增 setTeachingMember 方法**

找到 `crmeb/app/adminapi/controller/v1/user/User.php` 或 `UserController.php`，在类中添加方法：

```php
/**
 * 设置/取消教学会员
 * @param int $uid
 */
public function setTeachingMember($uid)
{
    [$status] = $this->request->getMore([
        ['is_teaching_member', 0],
    ], true);
    /** @var \app\services\user\UserServices $userServices */
    $userServices = app()->make(\app\services\user\UserServices::class);
    $userServices->update((int)$uid, ['is_teaching_member' => (int)$status]);
    return app('json')->success([], $status ? '已设为会员' : '已取消会员');
}
```

- [ ] **Step 6: Commit**

```bash
git add crmeb/app/adminapi/controller/v1/teaching/ \
        crmeb/app/adminapi/validate/v1/teaching/ \
        crmeb/app/adminapi/route/teaching.php \
        crmeb/app/adminapi/route/route.php \
        crmeb/app/adminapi/controller/v1/user/
git commit -m "feat: add admin CRUD controllers, validators and routes for teaching module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Admin 前端 — API 接口层 + 路由模块

**Files:**
- Create: `template/admin/src/api/teaching.js`
- Create: `template/admin/src/router/modules/teaching.js`

**Interfaces:**
- Consumes: Admin API 路由 (Task 6)
- Produces: Vue 前端可调用的 API 函数 + 侧边栏菜单路由

- [ ] **Step 1: 创建前端 API 模块**

`template/admin/src/api/teaching.js`:

```javascript
// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/libs/request';

/**
 * 产品管理
 */
export function getProductInfo() {
  return request({ url: 'teaching_product/info', method: 'get' });
}
export function saveProductInfo(data) {
  return request({ url: 'teaching_product/save', method: 'post', data });
}

/**
 * 案例管理
 */
export function getCaseList(params) {
  return request({ url: 'teaching_case/list', method: 'get', params });
}
export function saveCase(data) {
  return request({ url: 'teaching_case/save', method: 'post', data });
}
export function updateCase(id, data) {
  return request({ url: `teaching_case/update/${id}`, method: 'put', data });
}
export function deleteCase(id) {
  return request({ url: `teaching_case/delete/${id}`, method: 'delete' });
}

/**
 * 课程管理
 */
export function getCourseList(params) {
  return request({ url: 'teaching_course/list', method: 'get', params });
}
export function saveCourse(data) {
  return request({ url: 'teaching_course/save', method: 'post', data });
}
export function updateCourse(id, data) {
  return request({ url: `teaching_course/update/${id}`, method: 'put', data });
}
export function deleteCourse(id) {
  return request({ url: `teaching_course/delete/${id}`, method: 'delete' });
}

/**
 * 线下排期管理
 */
export function getOfflineClassList(params) {
  return request({ url: 'teaching_offline/list', method: 'get', params });
}
export function saveOfflineClass(data) {
  return request({ url: 'teaching_offline/save', method: 'post', data });
}
export function updateOfflineClass(id, data) {
  return request({ url: `teaching_offline/update/${id}`, method: 'put', data });
}
export function deleteOfflineClass(id) {
  return request({ url: `teaching_offline/delete/${id}`, method: 'delete' });
}

/**
 * 预约记录
 */
export function getBookingList(params) {
  return request({ url: 'teaching_booking/list', method: 'get', params });
}
export function cancelBooking(id) {
  return request({ url: `teaching_booking/cancel/${id}`, method: 'put' });
}

/**
 * 用户会员管理
 */
export function setTeachingMember(uid, status) {
  return request({ url: `user/set_teaching_member/${uid}`, method: 'put', params: { is_teaching_member: status } });
}
```

- [ ] **Step 2: 创建前端路由模块**

`template/admin/src/router/modules/teaching.js`:

```javascript
// +---------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +---------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +---------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +---------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +---------------------------------------------------------------------

import LayoutMain from '@/layout';
import setting from '@/setting';
let routePre = setting.routePre;

const pre = 'teaching_';

export default {
  path: routePre + '/teaching',
  name: 'teaching',
  header: 'teaching',
  meta: {
    title: '洗眉机',
    auth: ['admin-teaching-index'],
  },
  redirect: {
    name: `${pre}productInfo`,
  },
  component: LayoutMain,
  children: [
    {
      path: 'product_info',
      name: `${pre}productInfo`,
      meta: {
        title: '产品管理',
        auth: ['admin-teaching-product-info'],
      },
      component: () => import('@/pages/teaching/productInfo/index'),
    },
    {
      path: 'case_list',
      name: `${pre}caseList`,
      meta: {
        title: '案例管理',
        auth: ['admin-teaching-case-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/caseList/index'),
    },
    {
      path: 'course_list',
      name: `${pre}courseList`,
      meta: {
        title: '课程管理',
        auth: ['admin-teaching-course-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/courseList/index'),
    },
    {
      path: 'offline_class',
      name: `${pre}offlineClass`,
      meta: {
        title: '线下排期',
        auth: ['admin-teaching-offline-class'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/offlineClass/index'),
    },
    {
      path: 'booking_list',
      name: `${pre}bookingList`,
      meta: {
        title: '预约记录',
        auth: ['admin-teaching-booking-list'],
        keepAlive: true,
      },
      component: () => import('@/pages/teaching/booking/index'),
    },
  ],
};
```

- [ ] **Step 3: 注册路由到 routers.js**

修改 `template/admin/src/router/routers.js`，在 `export default` 的路由数组中添加：

```javascript
import teaching from './modules/teaching';
// ...添加到路由数组
```

路由数组在文件底部，找到 `export default [{...}, ..., {...}]`，在最后一个 `}` 后、`]` 前插入 `, teaching`。

- [ ] **Step 4: Commit**

```bash
git add template/admin/src/api/teaching.js \
        template/admin/src/router/modules/teaching.js \
        template/admin/src/router/routers.js
git commit -m "feat: add admin frontend API layer and router for teaching module

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Admin 前端 — Vue 页面（6 个管理页面）

**Files:**
- Create: `template/admin/src/pages/teaching/productInfo/index.vue`
- Create: `template/admin/src/pages/teaching/caseList/index.vue`
- Create: `template/admin/src/pages/teaching/courseList/index.vue`
- Create: `template/admin/src/pages/teaching/offlineClass/index.vue`
- Create: `template/admin/src/pages/teaching/booking/index.vue`

**Interfaces:**
- Consumes: `@/api/teaching` (Task 7)

- [ ] **Step 1: 产品管理页（单表单）**

`template/admin/src/pages/teaching/productInfo/index.vue`:

```vue
<template>
  <div class="teaching-product-info">
    <el-card>
      <div slot="header">
        <span>产品信息</span>
      </div>
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="轮播图">
          <upload-list v-model="form.banner" :limit="6" />
        </el-form-item>
        <el-form-item label="产品标题">
          <el-input v-model="form.title" maxlength="255" placeholder="请输入产品标题" />
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请输入产品描述" />
        </el-form-item>
        <el-form-item label="图文详情">
          <ueditor v-model="form.detail" />
        </el-form-item>
        <el-form-item label="参数规格">
          <div v-for="(item, index) in form.specs" :key="index" style="margin-bottom:8px">
            <el-input v-model="item.key" placeholder="参数名" style="width:150px" />
            <el-input v-model="item.value" placeholder="参数值" style="width:200px;margin-left:8px" />
            <el-button type="danger" icon="el-icon-delete" circle size="small" @click="form.specs.splice(index,1)" />
          </div>
          <el-button type="primary" size="small" @click="form.specs.push({key:'',value:''})">+ 添加规格</el-button>
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="form.video_url" placeholder="视频链接（可选）" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getProductInfo, saveProductInfo } from '@/api/teaching';

export default {
  name: 'TeachingProductInfo',
  data() {
    return {
      loading: false,
      form: {
        banner: [],
        title: '',
        desc: '',
        detail: '',
        specs: [],
        video_url: '',
        status: 1,
      },
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      const { data } = await getProductInfo();
      if (data && Object.keys(data).length) {
        this.form = {
          banner: data.banner || [],
          title: data.title || '',
          desc: data.desc || '',
          detail: data.detail || '',
          specs: data.specs || [],
          video_url: data.video_url || '',
          status: data.status ?? 1,
        };
      }
    },
    async handleSave() {
      this.loading = true;
      try {
        await saveProductInfo(this.form);
        this.$message.success('保存成功');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

- [ ] **Step 2: 案例管理页（列表 + 弹窗表单）**

`template/admin/src/pages/teaching/caseList/index.vue`:

```vue
<template>
  <div class="teaching-case-list">
    <el-card>
      <div slot="header" class="clearfix">
        <el-button type="primary" size="small" @click="handleAdd">+ 添加案例</el-button>
        <el-select v-model="filterType" placeholder="类型筛选" clearable size="small" style="margin-left:10px;width:120px" @change="loadList">
          <el-option label="图片" :value="1" />
          <el-option label="视频" :value="2" />
        </el-select>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column label="封面" width="100">
          <template slot-scope="{row}"><img :src="row.cover" style="width:60px;height:60px;object-fit:cover" /></template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column label="类型" width="80">
          <template slot-scope="{row}">{{ row.type == 1 ? '图片' : '视频' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">
            <el-switch :value="row.status" :active-value="1" :inactive-value="0" @change="(v) => handleStatus(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{row}">
            <el-button type="text" @click="handleEdit(row)">编辑</el-button>
            <el-button type="text" style="color:#f56c6c" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :page-size="limit"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :close-on-click-modal="false">
      <el-form ref="caseForm" :model="caseForm" label-width="80px">
        <el-form-item label="封面">
          <upload-image v-model="caseForm.cover" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="caseForm.type">
            <el-radio :label="1">图片</el-radio>
            <el-radio :label="2">视频</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="媒体文件">
          <upload-image v-if="caseForm.type === 1" v-model="caseForm.media_url" />
          <upload-file v-else v-model="caseForm.media_url" />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="caseForm.title" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="caseForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="caseForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCaseList, saveCase, updateCase, deleteCase } from '@/api/teaching';
import UploadImage from '@/components/uploadImage';
import UploadFile from '@/components/uploadFile';

export default {
  name: 'TeachingCaseList',
  components: { UploadImage, UploadFile },
  data() {
    return {
      list: [],
      loading: false,
      page: 1,
      limit: 15,
      total: 0,
      filterType: 0,
      dialogVisible: false,
      dialogTitle: '添加案例',
      submitLoading: false,
      caseForm: { title: '', type: 1, cover: '', media_url: '', sort: 0, status: 1 },
      editId: null,
    };
  },
  created() { this.loadList(); },
  methods: {
    async loadList() {
      this.loading = true;
      try {
        const { data } = await getCaseList({ page: this.page, limit: this.limit, type: this.filterType });
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    handleAdd() {
      this.editId = null;
      this.dialogTitle = '添加案例';
      this.caseForm = { title: '', type: 1, cover: '', media_url: '', sort: 0, status: 1 };
      this.dialogVisible = true;
    },
    handleEdit(row) {
      this.editId = row.id;
      this.dialogTitle = '编辑案例';
      this.caseForm = { title: row.title, type: row.type, cover: row.cover, media_url: row.media_url, sort: row.sort, status: row.status };
      this.dialogVisible = true;
    },
    async handleSubmit() {
      this.submitLoading = true;
      try {
        if (this.editId) {
          await updateCase(this.editId, this.caseForm);
        } else {
          await saveCase(this.caseForm);
        }
        this.$message.success(this.editId ? '修改成功' : '添加成功');
        this.dialogVisible = false;
        this.loadList();
      } finally { this.submitLoading = false; }
    },
    async handleDelete(id) {
      try {
        await this.$confirm('确定删除该案例吗？', '提示', { type: 'warning' });
        await deleteCase(id);
        this.$message.success('删除成功');
        this.loadList();
      } catch {}
    },
    async handleStatus(row, val) {
      await updateCase(row.id, { ...row, status: val });
      this.$message.success('状态已更新');
    },
  },
};
</script>
```

- [ ] **Step 3: 课程管理页** — 结构与案例管理页相同，字段替换为课程字段（`price`/`is_free_for_member`/`desc`/`video_url`）。

- [ ] **Step 4: 线下排期管理页** — 结构与案例管理页相同，字段替换为排期字段（`class_date` 用 `el-date-picker`，`start_time`/`end_time` 用 `el-time-picker`，`qrcode` 用图片上传）。

- [ ] **Step 5: 预约记录页**（只读列表）:

```vue
<template>
  <div class="teaching-booking-list">
    <el-card>
      <el-select v-model="classId" placeholder="按排期筛选" clearable @change="loadList" style="margin-bottom:10px">
        <el-option v-for="item in classList" :key="item.id" :label="item.title + ' (' + item.class_date + ')'" :value="item.id" />
      </el-select>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="add_time" label="预约时间" />
        <el-table-column label="状态" width="80">
          <template slot-scope="{row}">{{ row.status == 0 ? '已预约' : '已取消' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="{row}">
            <el-button v-if="row.status == 0" type="text" style="color:#f56c6c" @click="handleCancel(row.id)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="page" :page-size="limit" :total="total" layout="total, prev, pager, next" @current-change="handlePageChange" />
    </el-card>
  </div>
</template>

<script>
import { getBookingList, cancelBooking, getOfflineClassList } from '@/api/teaching';

export default {
  name: 'TeachingBookingList',
  data() {
    return { list: [], classList: [], classId: null, loading: false, page: 1, limit: 15, total: 0 };
  },
  created() {
    this.loadClassList();
    this.loadList();
  },
  methods: {
    async loadClassList() {
      const { data } = await getOfflineClassList({ show_all: 1, limit: 999 });
      this.classList = data.list || [];
    },
    async loadList() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.classId) params.class_id = this.classId;
        const { data } = await getBookingList(params);
        this.list = data.list || [];
        this.total = data.count || 0;
      } finally { this.loading = false; }
    },
    handlePageChange(p) { this.page = p; this.loadList(); },
    async handleCancel(id) {
      try {
        await this.$confirm('确定取消该预约？', '提示', { type: 'warning' });
        await cancelBooking(id);
        this.$message.success('已取消');
        this.loadList();
      } catch {}
    },
  },
};
</script>
```

- [ ] **Step 6: Commit**

```bash
git add template/admin/src/pages/teaching/
git commit -m "feat: add 5 admin Vue pages for teaching module management

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: UniApp 前端 — 4 个页面

**Files:**
- Create: `template/uni-app/pages/teaching/product/index.vue`
- Create: `template/uni-app/pages/teaching/case/index.vue`
- Create: `template/uni-app/pages/teaching/course/index.vue`
- Create: `template/uni-app/pages/teaching/offline/index.vue`

**Interfaces:**
- Consumes: API v2 接口 (Task 5)
- Produces: 4 个可用的 UniApp 小程序页面

- [ ] **Step 1: 产品展示页**

```vue
<!-- template/uni-app/pages/teaching/product/index.vue -->
<template>
  <view class="product-page">
    <!-- 轮播图 -->
    <swiper v-if="info.banner && info.banner.length" :indicator-dots="true" autoplay circular class="banner">
      <swiper-item v-for="(url, i) in info.banner" :key="i">
        <image :src="url" mode="aspectFill" class="banner-img" />
      </swiper-item>
    </swiper>
    <!-- 标题 -->
    <view class="title-section">
      <text class="title">{{ info.title || '洗眉机' }}</text>
      <text class="desc">{{ info.desc }}</text>
    </view>
    <!-- 参数规格 -->
    <view class="specs-section" v-if="info.specs && info.specs.length">
      <view class="spec-item" v-for="(item, i) in info.specs" :key="i">
        <text class="spec-key">{{ item.key }}</text>
        <text class="spec-value">{{ item.value }}</text>
      </view>
    </view>
    <!-- 图文详情 -->
    <view class="detail-section">
      <rich-text :nodes="info.detail"></rich-text>
    </view>
    <!-- 视频 -->
    <video v-if="info.video_url" :src="info.video_url" class="product-video" />
  </view>
</template>

<script>
export default {
  data() {
    return { info: {} };
  },
  onLoad() {
    this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const res = await this.$api.get('v2/product/info');
        this.info = res.data || {};
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped>
.banner { width: 750rpx; height: 750rpx; }
.banner-img { width: 100%; height: 100%; }
.title-section { padding: 30rpx; }
.title { font-size: 40rpx; font-weight: bold; }
.desc { font-size: 28rpx; color: #666; margin-top: 16rpx; display: block; }
.specs-section { padding: 20rpx 30rpx; background: #f8f8f8; }
.spec-item { display: flex; justify-content: space-between; padding: 12rpx 0; border-bottom: 1rpx solid #eee; }
.detail-section { padding: 20rpx 30rpx; }
.product-video { width: 100%; height: 400rpx; margin-top: 20rpx; }
</style>
```

- [ ] **Step 2: 案例页**

```vue
<!-- template/uni-app/pages/teaching/case/index.vue -->
<template>
  <view class="case-page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <view
        v-for="tab in tabs" :key="tab.value"
        :class="['tab-item', { active: activeTab === tab.value }]"
        @click="switchTab(tab.value)"
      >{{ tab.label }}</view>
    </view>
    <!-- 网格列表 -->
    <view class="case-grid">
      <view class="case-item" v-for="item in list" :key="item.id" @click="handleClick(item)">
        <image :src="item.cover" mode="aspectFill" class="case-cover" />
        <view class="case-info">
          <text class="case-type">{{ item.type == 1 ? '图片' : '视频' }}</text>
          <text class="case-title">{{ item.title }}</text>
        </view>
      </view>
    </view>
    <!-- 加载更多 -->
    <uni-load-more :status="loadStatus" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabs: [
        { label: '全部', value: 0 },
        { label: '图片', value: 1 },
        { label: '视频', value: 2 },
      ],
      activeTab: 0,
      list: [],
      page: 1,
      limit: 10,
      loadStatus: 'more',
    };
  },
  onLoad() { this.loadList(); },
  onReachBottom() { this.loadList(); },
  methods: {
    switchTab(val) {
      this.activeTab = val;
      this.page = 1;
      this.list = [];
      this.loadList();
    },
    async loadList() {
      if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
      this.loadStatus = 'loading';
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.activeTab > 0) params.type = this.activeTab;
        const res = await this.$api.get('v2/case/list', params);
        const data = res.data || {};
        this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
        this.page++;
        this.loadStatus = (data.list || []).length < this.limit ? 'noMore' : 'more';
      } catch (e) {
        this.loadStatus = 'more';
      }
    },
    handleClick(item) {
      if (item.type == 1) {
        uni.previewImage({ urls: [item.media_url] });
      } else {
        uni.navigateTo({ url: `/pages/annex/web_view/index?url=${encodeURIComponent(item.media_url)}` });
      }
    },
  },
};
</script>

<style scoped>
.case-page { padding-bottom: 20rpx; }
.tabs { display: flex; padding: 20rpx 30rpx; background: #fff; }
.tab-item { margin-right: 40rpx; font-size: 28rpx; color: #666; }
.tab-item.active { color: #e93323; font-weight: bold; border-bottom: 4rpx solid #e93323; }
.case-grid { display: flex; flex-wrap: wrap; padding: 10rpx; }
.case-item { width: calc(50% - 20rpx); margin: 10rpx; background: #fff; border-radius: 8rpx; overflow: hidden; }
.case-cover { width: 100%; height: 240rpx; }
.case-info { padding: 12rpx; }
.case-type { font-size: 22rpx; color: #fff; background: #e93323; padding: 2rpx 10rpx; border-radius: 4rpx; margin-right: 10rpx; }
.case-title { font-size: 26rpx; }
</style>
```

- [ ] **Step 3: 教学课程页**

```vue
<!-- template/uni-app/pages/teaching/course/index.vue -->
<template>
  <view class="course-page">
    <!-- 会员横幅 -->
    <view class="member-banner" v-if="!isMember">
      <text>开通会员，解锁全部课程</text>
      <button class="member-btn" @click="openMember">开通会员 ¥299</button>
    </view>
    <view class="member-banner is-member" v-else>
      <text>您是会员，全部课程免费看</text>
    </view>
    <!-- 课程列表 -->
    <view class="course-list">
      <view class="course-item" v-for="item in list" :key="item.id" @click="handleCourse(item)">
        <image :src="item.cover" mode="aspectFill" class="course-cover" />
        <view class="course-info">
          <text class="course-title">{{ item.title }}</text>
          <text class="course-desc">{{ item.desc }}</text>
          <view class="course-bottom">
            <text class="course-price" :class="{ free: item.can_watch }">
              {{ item.can_watch ? '免费' : '¥' + item.price + ' 试听' }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <uni-load-more :status="loadStatus" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      isMember: false,
      list: [],
      page: 1,
      limit: 10,
      loadStatus: 'more',
    };
  },
  onLoad() {
    this.checkMember();
    this.loadList();
  },
  onReachBottom() { this.loadList(); },
  methods: {
    async checkMember() {
      // 可在课程列表 API 中返回 is_member，或单独查
      // 这里从课程列表第一个结果获取
    },
    async loadList() {
      if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
      this.loadStatus = 'loading';
      try {
        const res = await this.$api.get('v2/course/list', { page: this.page, limit: this.limit });
        const data = res.data || {};
        this.isMember = (data.list?.[0]?.is_member) || false;
        this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
        this.page++;
        this.loadStatus = (data.list || []).length < this.limit ? 'noMore' : 'more';
      } catch (e) {
        this.loadStatus = 'more';
      }
    },
    handleCourse(item) {
      uni.navigateTo({ url: `/pages/teaching/course/detail?id=${item.id}` });
    },
    openMember() {
      // 跳转会员购买流程（复用 CRMEB 支付）
      uni.showToast({ title: '会员购买功能', icon: 'none' });
    },
  },
};
</script>

<style scoped>
.member-banner { padding: 30rpx; background: #fff5f5; display: flex; justify-content: space-between; align-items: center; font-size: 28rpx; }
.member-banner.is-member { background: #f0f9f0; color: #2e7d32; }
.member-btn { background: #e93323; color: #fff; font-size: 26rpx; padding: 10rpx 24rpx; border-radius: 30rpx; }
.course-item { display: flex; margin: 20rpx; background: #fff; border-radius: 12rpx; overflow: hidden; }
.course-cover { width: 240rpx; height: 180rpx; flex-shrink: 0; }
.course-info { flex: 1; padding: 16rpx; display: flex; flex-direction: column; }
.course-title { font-size: 30rpx; font-weight: bold; }
.course-desc { font-size: 24rpx; color: #999; margin-top: 8rpx; flex: 1; }
.course-bottom { margin-top: 8rpx; }
.course-price { color: #e93323; font-size: 28rpx; }
.course-price.free { color: #2e7d32; }
</style>
```

- [ ] **Step 4: 线下课程页**

```vue
<!-- template/uni-app/pages/teaching/offline/index.vue -->
<template>
  <view class="offline-page">
    <view class="class-item" v-for="item in list" :key="item.id" @click="handleDetail(item)">
      <view class="class-header">
        <text class="class-title">{{ item.title }}</text>
        <text class="class-date">{{ item.class_date }}</text>
      </view>
      <view class="class-info">
        <text>时间: {{ item.start_time }} - {{ item.end_time }}</text>
        <text>地点: {{ item.address }}</text>
        <text v-if="item.max_people > 0">剩余名额: {{ item.max_people - item.booked_count }} / {{ item.max_people }}</text>
        <text v-else>不限名额 (已约 {{ item.booked_count }} 人)</text>
      </view>
      <button class="book-btn" @click.stop="handleBook(item)">预约</button>
    </view>
    <uni-load-more :status="loadStatus" />

    <!-- 预约弹窗 -->
    <uni-popup ref="bookPopup" type="center">
      <view class="book-form">
        <text class="form-title">填写预约信息</text>
        <input v-model="bookForm.name" placeholder="姓名" class="form-input" />
        <input v-model="bookForm.phone" placeholder="手机号" class="form-input" />
        <button class="submit-btn" :loading="submitting" @click="submitBook">确认预约</button>
        <text class="close-btn" @click="$refs.bookPopup.close()">取消</text>
      </view>
    </uni-popup>

    <!-- 预约成功二维码弹窗 -->
    <uni-popup ref="qrcodePopup" type="center">
      <view class="qrcode-modal">
        <text class="qrcode-title">请添加店主微信确认预约</text>
        <image :src="qrcodeUrl" mode="widthFix" class="qrcode-img" />
        <button class="close-qr-btn" @click="$refs.qrcodePopup.close()">关闭</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      page: 1,
      loadStatus: 'more',
      submitting: false,
      bookForm: { name: '', phone: '' },
      currentClass: null,
      qrcodeUrl: '',
    };
  },
  onLoad() { this.loadList(); },
  onReachBottom() { this.loadList(); },
  methods: {
    async loadList() {
      if (this.loadStatus === 'loading' || this.loadStatus === 'noMore') return;
      this.loadStatus = 'loading';
      try {
        const res = await this.$api.get('v2/offline_class/list', { page: this.page, limit: 10 });
        const data = res.data || {};
        this.list = this.page === 1 ? (data.list || []) : this.list.concat(data.list || []);
        this.page++;
        this.loadStatus = (data.list || []).length < 10 ? 'noMore' : 'more';
      } catch (e) {
        this.loadStatus = 'more';
      }
    },
    handleDetail(item) {
      uni.navigateTo({ url: `/pages/teaching/offline/detail?id=${item.id}` });
    },
    handleBook(item) {
      this.currentClass = item;
      this.bookForm = { name: '', phone: '' };
      this.$refs.bookPopup.open();
    },
    async submitBook() {
      if (!this.bookForm.name || !this.bookForm.phone) {
        return uni.showToast({ title: '请填写完整信息', icon: 'none' });
      }
      this.submitting = true;
      try {
        const res = await this.$api.post('v2/offline_class/booking', {
          class_id: this.currentClass.id,
          name: this.bookForm.name,
          phone: this.bookForm.phone,
        });
        this.$refs.bookPopup.close();
        this.qrcodeUrl = this.currentClass.qrcode;
        this.$refs.qrcodePopup.open();
      } catch (e) {
        uni.showToast({ title: e.msg || '预约失败', icon: 'none' });
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.class-item { margin: 20rpx; padding: 24rpx; background: #fff; border-radius: 12rpx; }
.class-header { display: flex; justify-content: space-between; align-items: center; }
.class-title { font-size: 32rpx; font-weight: bold; }
.class-date { font-size: 26rpx; color: #e93323; }
.class-info { margin-top: 16rpx; }
.class-info text { display: block; font-size: 26rpx; color: #666; margin-bottom: 6rpx; }
.book-btn { margin-top: 20rpx; background: #e93323; color: #fff; font-size: 28rpx; }
.book-form { background: #fff; padding: 40rpx; border-radius: 16rpx; width: 560rpx; }
.form-title { font-size: 32rpx; font-weight: bold; display: block; text-align: center; margin-bottom: 30rpx; }
.form-input { border: 1rpx solid #ddd; padding: 16rpx; margin-bottom: 20rpx; border-radius: 8rpx; font-size: 28rpx; }
.submit-btn { background: #e93323; color: #fff; }
.close-btn { display: block; text-align: center; color: #999; margin-top: 16rpx; }
.qrcode-modal { background: #fff; padding: 40rpx; border-radius: 16rpx; text-align: center; }
.qrcode-title { font-size: 28rpx; display: block; margin-bottom: 20rpx; }
.qrcode-img { width: 360rpx; }
.close-qr-btn { margin-top: 20rpx; background: #e93323; color: #fff; }
</style>
```

- [ ] **Step 5: Commit**

```bash
git add template/uni-app/pages/teaching/
git commit -m "feat: add 4 UniApp pages for brow-washing mini program

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: UniApp 前端 — 底部导航 + 页面注册

**Files:**
- Modify: `template/uni-app/pages.json` (改 tabBar + 注册新页面)

- [ ] **Step 1: 注册新页面到 pages.json**

在 `template/uni-app/pages.json` 的 `"pages"` 数组中添加四个新页面记录。在适当位置（如 `pages/index/index` 记录之后）添加：

```json
{
  "path": "pages/teaching/product/index",
  "style": {
    "navigationBarTitleText": "洗眉机",
    "navigationStyle": "custom",
    "navigationBarTextStyle": "black"
  }
},
{
  "path": "pages/teaching/case/index",
  "style": {
    "navigationBarTitleText": "案例"
  }
},
{
  "path": "pages/teaching/course/index",
  "style": {
    "navigationBarTitleText": "教学课程"
  }
},
{
  "path": "pages/teaching/offline/index",
  "style": {
    "navigationBarTitleText": "线下课程"
  }
}
```

- [ ] **Step 2: 修改底部导航 tabBar**

将 `pages.json` 中 `"tabBar"` → `"list"` 替换为：

```json
"tabBar": {
  "color": "#282828",
  "selectedColor": "#e93323",
  "borderStyle": "white",
  "backgroundColor": "#ffffff",
  "list": [
    {
      "pagePath": "pages/teaching/product/index",
      "iconPath": "static/images/1-001.png",
      "selectedIconPath": "static/images/1-002.png",
      "text": "首页"
    },
    {
      "pagePath": "pages/teaching/case/index",
      "iconPath": "static/images/2-001.png",
      "selectedIconPath": "static/images/2-002.png",
      "text": "案例"
    },
    {
      "pagePath": "pages/teaching/course/index",
      "iconPath": "static/images/3-001.png",
      "selectedIconPath": "static/images/3-002.png",
      "text": "教学"
    },
    {
      "pagePath": "pages/teaching/offline/index",
      "iconPath": "static/images/4-001.png",
      "selectedIconPath": "static/images/4-002.png",
      "text": "线下课"
    }
  ]
}
```

- [ ] **Step 3: 验证 pages.json JSON 合法性**

```bash
node -e "JSON.parse(require('fs').readFileSync('template/uni-app/pages.json','utf8'))" && echo "JSON valid"
```

- [ ] **Step 4: Commit**

```bash
git add template/uni-app/pages.json
git commit -m "feat: update UniApp tabBar and register 4 new teaching pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: 去品牌化

**Files:**
- Modify: `template/uni-app/App.vue` (移除 CRMEB 版权文字)
- Modify: `template/uni-app/manifest.json` (改 appid 和 name)
- Modify: `template/admin/src/layout/logo/index.vue` (替换 logo 和平台名)
- Modify: `template/admin/src/router/index.js` (修改 login 页面标题)

- [ ] **Step 1: App.vue 去版权**

在 `template/uni-app/App.vue` 中查找并移除含有 "CRMEB" 或 "crmeb" 的版权信息文字（通常在 `<template>` 底部或 `<script>` 中的全局设置）。只移除文字，不删代码结构。

- [ ] **Step 2: manifest.json 改名称**

```json
// 修改 mp-weixin.appid 为实际小程序 AppID
// 修改 name 为 "洗眉机" 或你的品牌名
```

- [ ] **Step 3: Admin 登录页去品牌**

在 `template/admin/src/layout/logo/index.vue` 中：
- 替换 logo 图片（默认显示为 `@/assets/images/logo.png`，替换同名文件或修改路径）
- 替换平台标题文字（默认显示为 "CRMEB"，改为你的品牌名）

- [ ] **Step 4: Commit**

```bash
git add template/uni-app/App.vue template/uni-app/manifest.json template/admin/src/layout/logo/index.vue template/admin/src/router/index.js
git commit -m "chore: remove CRMEB branding from mini program and admin

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: 数据库 seed 初始数据

**Files:**
- Create: `crmeb/sql/seed_teaching.sql`

- [ ] **Step 1: 创建种子数据 SQL**

```sql
-- 插入默认产品信息
INSERT INTO `eb_product_info` (`id`, `banner`, `title`, `desc`, `detail`, `specs`, `status`, `add_time`, `update_time`)
VALUES (1, '[]', '洗眉机', '专业洗眉设备，安全高效', '<p>请在后台编辑图文详情</p>', '[]', 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());
```

- [ ] **Step 2: Commit**

```bash
git add crmeb/sql/seed_teaching.sql
git commit -m "feat: add seed data for teaching module default product

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 13: Docker 验证部署

- [ ] **Step 1: 启动 Docker 环境**

```bash
cd help/docker
docker-compose up -d
```

- [ ] **Step 2: 执行数据库迁移**

```bash
docker exec -i <mysql-container> mysql -u root -p<crmeb_password> <database> < crmeb/sql/migration_teaching.sql
docker exec -i <mysql-container> mysql -u root -p<crmeb_password> <database> < crmeb/sql/seed_teaching.sql
```

- [ ] **Step 3: 验证 API 可用**

```bash
# 测试产品 API
curl http://localhost:8080/api/v2/product/info
# 预期: {"status":200,"msg":"ok","data":{...}}

# 测试案例 API
curl http://localhost:8080/api/v2/case/list
# 预期: {"status":200,"msg":"ok","data":{"list":[],"count":0}}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final docker deployment verification

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 任务依赖图

```
Task 1 (DB Migration)
  └─> Task 2 (Models)
        └─> Task 3 (DAOs)
              └─> Task 4 (Services)
                    ├─> Task 5 (API v2 Controllers + Routes)
                    └─> Task 6 (Admin Controllers + Routes)
                          └─> Task 7 (Admin Frontend API + Router)
                                └─> Task 8 (Admin Vue Pages)
Task 5 ──> Task 9 (UniApp Pages)
Task 5 ──> Task 10 (UniApp nav + pages.json)
Task 7,8 ──> Task 11 (去品牌化)
Task 1 ──> Task 12 (Seed Data)
All ──> Task 13 (Docker 验证)
```

**可并行执行:**
- Task 9 + Task 10（两个 UniApp 前端任务）可与 Task 6-8（Admin 后台）并行
- Task 11（去品牌化）可在 Admin Vue 页面前后执行，无强依赖

---

## 后记

所有 CRMEB 原有代码不删除不修改（除 Task 5/6 中的 route include 和 Task 11 去品牌化中的最小改动）。通过 git 可追溯每步变更。

支付回调（WeChat Pay callback）的详细对接在实施时依据 CRMEB 现有 `OrderPaySuccessListener` 事件系统实现，本计划中 `CourseOrderServices::paySuccess()` 方法预留了接口。