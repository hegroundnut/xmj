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
        $isSuperMember = ($user->is_teaching_member ?? 0) == 1;
        $isRegularMember = ($user->overdue_time ?? 0) > time();
        $data = [
            'uid' => $user->uid,
            'nickname' => $user->nickname ?? '',
            'avatar' => $user->avatar ?? '',
            'phone' => $user->phone ?? '',
            'is_teaching_member' => $user->is_teaching_member ?? 0,
            'overdue_time' => $user->overdue_time ?? 0,
            'is_member' => ($isSuperMember || $isRegularMember) ? 1 : 0,
            'member_type' => $isSuperMember ? 'super' : ($isRegularMember ? 'regular' : 'none'),
        ];
        return app('json')->success($data);
    }

    /**
     * 修改当前用户资料（昵称、头像）
     * POST /api/v2/user/update
     * @param Request $request
     * @return mixed
     */
    public function update(Request $request)
    {
        $uid = (int)$request->uid();
        $data = $request->postMore([
            ['nickname', ''],
            ['avatar', ''],
        ]);
        $update = [];
        $nickname = trim($data['nickname']);
        if ($nickname !== '') {
            if (mb_strlen($nickname) > 16) {
                return app('json')->fail('昵称不能超过16个字符');
            }
            $update['nickname'] = $nickname;
        }
        if (trim($data['avatar']) !== '') {
            $update['avatar'] = trim($data['avatar']);
        }
        if (empty($update)) {
            return app('json')->fail('没有需要修改的内容');
        }
        $this->services->update($uid, $update);
        return app('json')->success('修改成功');
    }
}
