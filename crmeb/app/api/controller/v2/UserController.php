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
namespace app\api\controller\v2;

use app\Request;
use app\services\user\UserServices;

/**
 * 用户控制器
 */
class UserController
{
    protected $services;

    public function __construct(UserServices $services)
    {
        $this->services = $services;
    }

    /**
     * 获取当前用户信息
     * GET /api/v2/user/info
     */
    public function info(Request $request)
    {
        $user = $request->user();
        $data = [
            'uid' => $user->uid,
            'nickname' => $user->nickname ?? '',
            'avatar' => $user->avatar ?? '',
            'phone' => $user->phone ?? '',
            'is_teaching_member' => $user->is_teaching_member ?? 0,
            'overdue_time' => $user->overdue_time ?? 0,
        ];
        return app('json')->success($data);
    }
}
