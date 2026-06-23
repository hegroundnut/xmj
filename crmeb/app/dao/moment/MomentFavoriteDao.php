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
use app\model\moment\MomentFavorite;

/**
 * 收藏 DAO
 */
class MomentFavoriteDao extends BaseDao
{
    protected function setModel(): string
    {
        return MomentFavorite::class;
    }

    /**
     * 用户是否已收藏
     */
    public function isFavorited($momentId, $uid)
    {
        return $this->getModel()->where('moment_id', $momentId)->where('uid', $uid)->count() > 0;
    }

    /**
     * 获取用户收藏的帖子ID列表
     */
    public function getUserFavoriteIds($uid, $momentIds)
    {
        return $this->getModel()->where('uid', $uid)->whereIn('moment_id', $momentIds)->column('moment_id');
    }

    /**
     * 用户收藏列表
     */
    public function getFavoriteList($uid, $page, $limit)
    {
        return $this->getModel()
            ->where('eb_moment_favorite.uid', $uid)
            ->join('eb_moment', 'eb_moment_favorite.moment_id = eb_moment.id')
            ->join('eb_user', 'eb_moment.uid = eb_user.uid')
            ->where('eb_moment.status', 1)
            ->field('eb_moment.*, eb_moment_favorite.add_time as fav_time, eb_user.nickname as user_nickname, eb_user.avatar as user_avatar')
            ->order('eb_moment_favorite.id desc')
            ->page($page, $limit)
            ->select()->toArray();
    }

    public function getFavoriteCount($uid)
    {
        return $this->getModel()
            ->where('eb_moment_favorite.uid', $uid)
            ->join('eb_moment', 'eb_moment_favorite.moment_id = eb_moment.id')
            ->where('eb_moment.status', 1)
            ->count();
    }
}
