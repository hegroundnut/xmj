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
use app\model\moment\MomentLike;

/**
 * 点赞 DAO
 */
class MomentLikeDao extends BaseDao
{
    protected function setModel(): string
    {
        return MomentLike::class;
    }

    /**
     * 用户是否已点赞
     */
    public function isLiked($momentId, $uid)
    {
        return $this->getModel()->where('moment_id', $momentId)->where('uid', $uid)->count() > 0;
    }

    /**
     * 获取用户点赞的帖子ID列表
     */
    public function getUserLikeIds($uid, $momentIds)
    {
        return $this->getModel()->where('uid', $uid)->whereIn('moment_id', $momentIds)->column('moment_id');
    }
}
