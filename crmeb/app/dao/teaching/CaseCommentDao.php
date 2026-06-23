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
use app\model\teaching\CaseComment;

/**
 * 案例评论 DAO
 */
class CaseCommentDao extends BaseDao
{
    /**
     * @return string
     */
    protected function setModel(): string
    {
        return CaseComment::class;
    }

    /**
     * 获取案例的评论列表（含回复）
     * @param int $caseId
     * @param int $page
     * @param int $limit
     * @return array
     */
    public function commentList(int $caseId, int $page = 0, int $limit = 0)
    {
        return $this->getModel()
            ->where('case_id', $caseId)
            ->where('pid', 0)
            ->where('status', 1)
            ->field('id,case_id,uid,nickname,avatar,content,pid,reply_uid,reply_nickname,add_time')
            ->order('add_time desc')
            ->when($page > 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })
            ->select()
            ->toArray();
    }

    /**
     * 获取评论的回复列表
     * @param array $pids
     * @return array
     */
    public function replyList(array $pids)
    {
        return $this->getModel()
            ->whereIn('pid', $pids)
            ->where('status', 1)
            ->field('id,case_id,uid,nickname,avatar,content,pid,reply_uid,reply_nickname,add_time')
            ->order('add_time asc')
            ->select()
            ->toArray();
    }

    /**
     * 获取案例的评论总数
     * @param int $caseId
     * @return int
     */
    public function commentCount(int $caseId)
    {
        return $this->getModel()
            ->where('case_id', $caseId)
            ->where('status', 1)
            ->count();
    }

    /**
     * 管理后台评论列表
     * @param array $where
     * @param int $page
     * @param int $limit
     * @return array
     */
    public function adminList(array $where, int $page = 0, int $limit = 0)
    {
        return $this->getModel()
            ->when(isset($where['case_id']) && $where['case_id'] > 0, function ($query) use ($where) {
                $query->where('case_id', $where['case_id']);
            })
            ->when(isset($where['status']) && $where['status'] !== '', function ($query) use ($where) {
                $query->where('status', $where['status']);
            })
            ->when(isset($where['keyword']) && $where['keyword'] !== '', function ($query) use ($where) {
                $query->where('content|nickname', 'like', '%' . $where['keyword'] . '%');
            })
            ->field('id,case_id,uid,nickname,avatar,content,pid,reply_uid,reply_nickname,status,add_time')
            ->order('add_time desc')
            ->when($page > 0, function ($query) use ($page, $limit) {
                $query->page($page, $limit);
            })
            ->select()
            ->toArray();
    }

    /**
     * 管理后台评论总数
     * @param array $where
     * @return int
     */
    public function adminCount(array $where)
    {
        return $this->getModel()
            ->when(isset($where['case_id']) && $where['case_id'] > 0, function ($query) use ($where) {
                $query->where('case_id', $where['case_id']);
            })
            ->when(isset($where['status']) && $where['status'] !== '', function ($query) use ($where) {
                $query->where('status', $where['status']);
            })
            ->when(isset($where['keyword']) && $where['keyword'] !== '', function ($query) use ($where) {
                $query->where('content|nickname', 'like', '%' . $where['keyword'] . '%');
            })
            ->count();
    }
}
