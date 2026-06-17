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