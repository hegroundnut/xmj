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
namespace app\dao\moment;

use app\dao\BaseDao;
use app\model\moment\Moment;

/**
 * 帖子 DAO
 */
class MomentDao extends BaseDao
{
    protected function setModel(): string
    {
        return Moment::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()
            ->when(!isset($where['show_all']), function ($query) {
                $query->where('status', 1);
            })
            ->when(isset($where['uid']) && $where['uid'] > 0, function ($query) use ($where) {
                $query->where('uid', $where['uid']);
            })
            ->when(isset($where['keyword']) && $where['keyword'] !== '', function ($query) use ($where) {
                $query->whereLike('content', '%' . $where['keyword'] . '%');
            })
            ->when(isset($where['status']) && $where['status'] !== '', function ($query) use ($where) {
                $query->where('status', $where['status']);
            });
    }

    public function getList($where, $field = '*', $page = 0, $limit = 0, $order = 'id desc')
    {
        return $this->getConditionModel($where)
            ->with(['user'])
            ->field($field)
            ->order($order)
            ->when($page != 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })->select()->toArray();
    }

    public function getCount($where)
    {
        return $this->getConditionModel($where)->count();
    }
}
