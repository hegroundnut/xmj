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
use app\model\moment\MomentComment;

/**
 * 评论 DAO
 */
class MomentCommentDao extends BaseDao
{
    protected function setModel(): string
    {
        return MomentComment::class;
    }

    public function getConditionModel($where)
    {
        return $this->getModel()
            ->when(!isset($where['show_all']), function ($query) {
                $query->where('status', 1);
            })
            ->when(isset($where['moment_id']) && $where['moment_id'] > 0, function ($query) use ($where) {
                $query->where('moment_id', $where['moment_id']);
            });
    }

    public function getList($where, $field = '*', $page = 0, $limit = 0, $order = 'id asc')
    {
        return $this->getConditionModel($where)
            ->with(['commentUser'])
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

    /**
     * 批量获取多个帖子的评论（仅顶级评论，不包含子回复）
     */
    public function getBatchByMomentIds(array $momentIds, int $limit = 3)
    {
        if (empty($momentIds)) return [];
        return $this->getModel()
            ->whereIn('moment_id', $momentIds)
            ->where('status', 1)
            ->where('parent_id', 0)
            ->with(['commentUser'])
            ->order('id asc')
            ->select()
            ->toArray();
    }
}
