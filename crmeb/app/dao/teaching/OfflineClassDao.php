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
use app\model\teaching\OfflineClass;

/**
 * 线下课程 DAO
 */
class OfflineClassDao extends BaseDao
{
    protected function setModel(): string
    {
        return OfflineClass::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()->where('status', 1)
            ->when(isset($where['show_all']) && $where['show_all'] == 1, function ($query) {
                // 管理后台看全部
            }, function ($query) {
                $query->where('class_date', '>=', date('Y-m-d'));
            });
    }

    public function offlineClassList($where, $field, $page = 0, $limit = 0, $order = 'class_date asc')
    {
        return $this->getConditionModel($where)
            ->field($field)
            ->order($order)
            ->when($page != 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })->select()->toArray();
    }

    public function offlineClassCount($where)
    {
        return $this->getConditionModel($where)->count();
    }
}