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
use app\model\teaching\CourseOrder;

/**
 * 课程订单 DAO
 */
class CourseOrderDao extends BaseDao
{
    protected function setModel(): string
    {
        return CourseOrder::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()
            ->when(isset($where['uid']) && $where['uid'] > 0, function ($query) use ($where) {
                $query->where('uid', $where['uid']);
            })->when(isset($where['paid']) && $where['paid'] !== '', function ($query) use ($where) {
                $query->where('paid', $where['paid']);
            });
    }

    public function courseOrderList($where, $field, $page = 0, $limit = 0, $order = 'id desc')
    {
        return $this->getConditionModel($where)
            ->field($field)
            ->order($order)
            ->when($page != 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })->select()->toArray();
    }

    public function courseOrderCount($where)
    {
        return $this->getConditionModel($where)->count();
    }
}