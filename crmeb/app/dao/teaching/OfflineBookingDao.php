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
use app\model\teaching\OfflineBooking;

/**
 * 线下课报名 DAO
 */
class OfflineBookingDao extends BaseDao
{
    protected function setModel(): string
    {
        return OfflineBooking::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()
            ->when(isset($where['class_id']) && $where['class_id'] > 0, function ($query) use ($where) {
                $query->where('class_id', $where['class_id']);
            })->when(isset($where['uid']) && $where['uid'] > 0, function ($query) use ($where) {
                $query->where('uid', $where['uid']);
            });
    }

    public function offlineBookingList($where, $field, $page = 0, $limit = 0, $order = 'id desc')
    {
        return $this->getConditionModel($where)
            ->field($field)
            ->order($order)
            ->when($page != 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })->select()->toArray();
    }

    public function offlineBookingCount($where)
    {
        return $this->getConditionModel($where)->count();
    }
}