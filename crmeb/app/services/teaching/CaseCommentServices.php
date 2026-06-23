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

use app\dao\teaching\CaseCommentDao;
use app\services\BaseServices;
use app\services\user\UserServices;
use crmeb\exceptions\ApiException;

/**
 * 案例评论服务
 */
class CaseCommentServices extends BaseServices
{
    /**
     * @param CaseCommentDao $dao
     */
    public function __construct(CaseCommentDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取案例评论列表（含回复，前端用）
     * @param int $caseId
     * @return array
     */
    public function getCommentList(int $caseId)
    {
        [$page, $limit] = $this->getPageValue();
        $list = $this->dao->commentList($caseId, $page, $limit);
        if ($list) {
            $pids = array_column($list, 'id');
            $replies = $this->dao->replyList($pids);
            $replyMap = [];
            foreach ($replies as $reply) {
                $reply['add_time'] = date('Y-m-d H:i', $reply['add_time']);
                $replyMap[$reply['pid']][] = $reply;
            }
            foreach ($list as &$item) {
                $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
                $item['replies'] = $replyMap[$item['id']] ?? [];
            }
        }
        $count = $this->dao->commentCount($caseId);
        return compact('list', 'count');
    }

    /**
     * 发表评论
     * @param int $uid
     * @param array $data
     * @return mixed
     */
    public function addComment(int $uid, array $data)
    {
        if (empty($data['content'])) {
            throw new ApiException('评论内容不能为空');
        }
        /** @var UserServices $userServices */
        $userServices = app()->make(UserServices::class);
        $user = $userServices->getUserInfo($uid);
        if (!$user) {
            throw new ApiException('用户不存在');
        }
        $saveData = [
            'case_id' => (int)$data['case_id'],
            'uid' => $uid,
            'nickname' => $user['nickname'] ?? '',
            'avatar' => $user['avatar'] ?? '',
            'content' => trim($data['content']),
            'pid' => (int)($data['pid'] ?? 0),
            'reply_uid' => (int)($data['reply_uid'] ?? 0),
            'reply_nickname' => $data['reply_nickname'] ?? '',
            'status' => 1,
            'add_time' => time(),
        ];
        return $this->dao->save($saveData);
    }

    /**
     * 管理后台评论列表
     * @param array $where
     * @return array
     */
    public function adminList(array $where)
    {
        [$page, $limit] = $this->getPageValue();
        $list = $this->dao->adminList($where, $page, $limit);
        foreach ($list as &$item) {
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        $count = $this->dao->adminCount($where);
        return compact('list', 'count');
    }

    /**
     * 管理后台审核评论
     * @param int $id
     * @param int $status
     * @return bool
     */
    public function setStatus(int $id, int $status)
    {
        $comment = $this->dao->get($id);
        if (!$comment) {
            throw new ApiException('评论不存在');
        }
        return $this->dao->update($id, ['status' => $status]);
    }

    /**
     * 管理后台删除评论
     * @param int $id
     * @return bool
     */
    public function deleteComment(int $id)
    {
        return $this->dao->delete($id);
    }
}
