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
namespace app\services\moment;

use app\dao\moment\MomentDao;
use app\dao\moment\MomentCommentDao;
use app\dao\moment\MomentLikeDao;
use app\dao\moment\MomentFavoriteDao;
use app\model\user\User;
use app\services\BaseServices;
use crmeb\exceptions\ApiException;

/**
 * 朋友圈服务
 */
class MomentServices extends BaseServices
{
    protected $commentDao;
    protected $likeDao;
    protected $favoriteDao;

    public function __construct(
        MomentDao $dao,
        MomentCommentDao $commentDao,
        MomentLikeDao $likeDao,
        MomentFavoriteDao $favoriteDao
    ) {
        $this->dao = $dao;
        $this->commentDao = $commentDao;
        $this->likeDao = $likeDao;
        $this->favoriteDao = $favoriteDao;
    }

    /**
     * 判断用户是否为会员
     */
    public function isMember($uid)
    {
        $user = User::find($uid);
        if (!$user) return false;
        return $user->is_teaching_member == 1 || $user->overdue_time > time();
    }

    /**
     * 帖子列表（带用户点赞/收藏状态）
     */
    public function getList(array $where, $uid = 0)
    {
        [$page, $limit] = $this->getPageValue();
        $field = 'id,uid,content,images,video_url,like_count,comment_count,share_count,status,add_time';
        $list = $this->dao->getList($where, $field, $page, $limit);
        $count = $this->dao->getCount($where);

        // 基础数据处理（图片/视频URL转换、时间格式化）
        if (!empty($list)) {
            $this->formatMomentList($list);
        }

        // 注入当前用户的点赞/收藏状态 + 评论预览
        $momentIds = $list ? array_column($list, 'id') : [];
        if ($uid > 0 && !empty($list)) {
            $likedIds = $this->likeDao->getUserLikeIds($uid, $momentIds);
            $favIds = $this->favoriteDao->getUserFavoriteIds($uid, $momentIds);
            $likedMap = array_flip($likedIds);
            $favMap = array_flip($favIds);
            foreach ($list as &$item) {
                $item['is_liked'] = isset($likedMap[$item['id']]);
                $item['is_favorited'] = isset($favMap[$item['id']]);
                $item['preview_comments'] = [];
            }
        }

        // 为每个帖子加载前3条评论
        if (!empty($momentIds)) {
            $allComments = $this->commentDao->getBatchByMomentIds($momentIds);

            $commentMap = [];
            foreach ($allComments as $c) {
                $c['add_time'] = date('Y-m-d H:i', $c['add_time']);
                if (!empty($c['user_avatar'])) {
                    $c['user_avatar'] = set_file_url($c['user_avatar']);
                }
                $commentMap[$c['moment_id']][] = $c;
            }

            foreach ($list as &$item) {
                $mid = $item['id'];
                $all = $commentMap[$mid] ?? [];
                $item['preview_comments'] = array_slice($all, 0, 3);
                $item['has_more_comments'] = count($all) > 3;
            }
        }

        return compact('list', 'count');
    }

    /**
     * 帖子详情
     */
    public function getDetail($id, $uid = 0)
    {
        $moment = $this->dao->get($id);
        if (!$moment || $moment['status'] == 0) {
            throw new ApiException('帖子不存在或已删除');
        }
        if (isset($moment['images']) && is_string($moment['images'])) {
            $images = json_decode($moment['images'], true);
            $moment['images'] = is_array($images) ? array_map('set_file_url', $images) : [];
        }
        if (!empty($moment['video_url'])) {
            $moment['video_url'] = set_file_url($moment['video_url']);
        }
        if (!empty($moment['user_avatar'])) {
            $moment['user_avatar'] = set_file_url($moment['user_avatar']);
        }
        $moment['add_time'] = date('Y-m-d H:i', $moment['add_time']);

        // 当前用户状态
        if ($uid > 0) {
            $moment['is_liked'] = $this->likeDao->isLiked($id, $uid);
            $moment['is_favorited'] = $this->favoriteDao->isFavorited($id, $uid);
        }

        // 评论列表
        $comments = $this->commentDao->getList(['moment_id' => $id], '*', 0, 0);
        foreach ($comments as &$c) {
            $c['add_time'] = date('Y-m-d H:i', $c['add_time']);
            if (!empty($c['user_avatar'])) {
                $c['user_avatar'] = set_file_url($c['user_avatar']);
            }
        }

        // 构建评论树
        $commentTree = [];
        $commentMap = [];
        foreach ($comments as $c) {
            $commentMap[$c['id']] = $c;
            $commentMap[$c['id']]['children'] = [];
        }
        foreach ($comments as $c) {
            if ($c['parent_id'] > 0 && isset($commentMap[$c['parent_id']])) {
                $commentMap[$c['parent_id']]['children'][] = &$commentMap[$c['id']];
            } elseif ($c['parent_id'] == 0) {
                $commentTree[] = &$commentMap[$c['id']];
            }
        }
        $moment['comments'] = $commentTree;
        $moment['comment_total'] = count($comments);

        return $moment;
    }

    /**
     * 发布帖子
     */
    public function create($uid, array $data)
    {
        if (!$this->isMember($uid)) {
            throw new ApiException('仅会员可发布帖子');
        }
        $data['uid'] = $uid;
        $data['add_time'] = time();
        $data['status'] = 1;
        return $this->dao->save($data);
    }

    /**
     * 删除帖子（仅作者或管理员）
     */
    public function deleteMoment($id, $uid = 0, $isAdmin = false)
    {
        $moment = $this->dao->get($id);
        if (!$moment) throw new ApiException('帖子不存在');
        if ($moment['status'] == 0) throw new ApiException('帖子已删除');
        if (!$isAdmin && $moment['uid'] != $uid) {
            throw new ApiException('无权删除');
        }
        return $this->dao->update($id, ['status' => 0]);
    }

    /**
     * 点赞/取消点赞
     */
    public function toggleLike($momentId, $uid)
    {
        $moment = $this->dao->get($momentId);
        if (!$moment || $moment['status'] == 0) {
            throw new ApiException('帖子不存在或已删除');
        }
        if (!$this->isMember($uid)) {
            throw new ApiException('仅会员可点赞');
        }
        $liked = $this->likeDao->isLiked($momentId, $uid);
        if ($liked) {
            // 取消点赞
            $this->likeDao->getModel()->where('moment_id', $momentId)->where('uid', $uid)->delete();
            $this->dao->getModel()->where('id', $momentId)->dec('like_count')->update();
            return 'unliked';
        } else {
            // 点赞
            $this->likeDao->save(['moment_id' => $momentId, 'uid' => $uid, 'add_time' => time()]);
            $this->dao->getModel()->where('id', $momentId)->inc('like_count')->update();
            return 'liked';
        }
    }

    /**
     * 收藏/取消收藏
     */
    public function toggleFavorite($momentId, $uid)
    {
        $moment = $this->dao->get($momentId);
        if (!$moment || $moment['status'] == 0) {
            throw new ApiException('帖子不存在或已删除');
        }
        if (!$this->isMember($uid)) {
            throw new ApiException('仅会员可收藏');
        }
        $fav = $this->favoriteDao->isFavorited($momentId, $uid);
        if ($fav) {
            $this->favoriteDao->getModel()->where('moment_id', $momentId)->where('uid', $uid)->delete();
            return 'unfavorited';
        } else {
            $this->favoriteDao->save(['moment_id' => $momentId, 'uid' => $uid, 'add_time' => time()]);
            return 'favorited';
        }
    }

    /**
     * 发表评论
     */
    public function addComment($uid, array $data)
    {
        $moment = $this->dao->get($data['moment_id']);
        if (!$moment || $moment['status'] == 0) {
            throw new ApiException('帖子不存在或已删除');
        }
        if (!$this->isMember($uid)) {
            throw new ApiException('仅会员可评论');
        }
        $data['uid'] = $uid;
        $data['add_time'] = time();
        $data['status'] = 1;
        $data['parent_id'] = $data['parent_id'] ?? 0;
        $data['reply_uid'] = $data['reply_uid'] ?? 0;
        $result = $this->commentDao->save($data);
        // 递增帖子评论数
        $this->dao->getModel()->where('id', $data['moment_id'])->inc('comment_count')->update();
        return $result;
    }

    /**
     * 删除评论（仅作者或管理员）
     */
    public function deleteComment($id, $uid = 0, $isAdmin = false)
    {
        $comment = $this->commentDao->get($id);
        if (!$comment) throw new ApiException('评论不存在');
        if ($comment['status'] == 0) throw new ApiException('评论已删除');
        if (!$isAdmin && $comment['uid'] != $uid) {
            throw new ApiException('无权删除');
        }
        $this->commentDao->update($id, ['status' => 0]);
        // 递减帖子评论数
        $this->dao->getModel()->where('id', $comment['moment_id'])->dec('comment_count')->update();
        return true;
    }

    /**
     * 分享计数
     */
    public function incrShare($id, $uid = 0)
    {
        $moment = $this->dao->get($id);
        if (!$moment || $moment['status'] == 0) {
            throw new ApiException('帖子不存在或已删除');
        }
        if ($uid > 0 && !$this->isMember($uid)) {
            throw new ApiException('仅会员可分享');
        }
        return $this->dao->getModel()->where('id', $id)->inc('share_count')->update();
    }

    /**
     * 后台评论列表（含已删除）
     */
    public function getAdminCommentList($where)
    {
        [$page, $limit] = $this->getPageValue();
        $list = $this->commentDao->getList($where, '*', $page, $limit, 'id desc');
        $count = $this->commentDao->getCount($where);
        foreach ($list as &$c) {
            $c['add_time'] = date('Y-m-d H:i', $c['add_time']);
        }
        return compact('list', 'count');
    }

    /**
     * 我的收藏列表
     */
    public function getFavorites($uid)
    {
        [$page, $limit] = $this->getPageValue();
        $list = $this->favoriteDao->getFavoriteList($uid, $page, $limit);
        $count = $this->favoriteDao->getFavoriteCount($uid);
        foreach ($list as &$item) {
            if (isset($item['images']) && is_string($item['images'])) {
                $images = json_decode($item['images'], true);
                $item['images'] = is_array($images) ? array_map('set_file_url', $images) : [];
            }
            if (!empty($item['video_url'])) {
                $item['video_url'] = set_file_url($item['video_url']);
            }
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
        return compact('list', 'count');
    }

    /**
     * 基础数据处理：图片/视频URL转换、时间格式化
     * @param array $list
     */
    private function formatMomentList(array &$list)
    {
        foreach ($list as &$item) {
            if (isset($item['images']) && is_string($item['images'])) {
                $images = json_decode($item['images'], true);
                $item['images'] = is_array($images) ? array_map('set_file_url', $images) : [];
            }
            if (!empty($item['video_url'])) {
                $item['video_url'] = set_file_url($item['video_url']);
            }
            if (!empty($item['user_avatar'])) {
                $item['user_avatar'] = set_file_url($item['user_avatar']);
            }
            $item['add_time'] = date('Y-m-d H:i', $item['add_time']);
        }
    }
}
