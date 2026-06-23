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
namespace app\model\moment;

use crmeb\basic\BaseModel;
use crmeb\traits\ModelTrait;

/**
 * 朋友圈帖子
 */
class Moment extends BaseModel
{
    use ModelTrait;

    protected $pk = 'id';

    protected $name = 'moment';

    protected $autoWriteTimestamp = false;

    /**
     * 用户关联
     */
    public function user()
    {
        return $this->hasOne(\app\model\user\User::class, 'uid', 'uid')->bind([
            'user_nickname' => 'nickname',
            'user_avatar' => 'avatar',
        ]);
    }
}
