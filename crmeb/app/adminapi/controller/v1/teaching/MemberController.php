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
namespace app\adminapi\controller\v1\teaching;

use app\services\user\UserServices;
use app\model\user\User;
use think\facade\App;

/**
 * 教学会员管理控制器
 */
class MemberController
{
    /**
     * @var UserServices
     */
    protected $services;

    /**
     * @param App $app
     * @param UserServices $services
     */
    public function __construct(App $app, UserServices $services)
    {
        $this->services = $services;
    }

    /**
     * 用户列表（含会员状态）
     * @return mixed
     */
    public function index()
    {
        $where = request()->getMore([
            ['keyword', ''],
            ['member_type', ''],
        ]);
        [$page, $limit] = $this->services->getPageValue();
        $model = User::where('is_del', 0);
        if (!empty($where['keyword'])) {
            $model = $model->where(function ($q) use ($where) {
                $q->whereLike('nickname', '%' . $where['keyword'] . '%')
                  ->whereOr('phone', $where['keyword'])
                  ->whereOr('uid', $where['keyword']);
            });
        }
        $now = time();
        if ($where['member_type'] === 'super') {
            $model = $model->where('is_teaching_member', 1);
        } elseif ($where['member_type'] === 'regular') {
            $model = $model->where('is_teaching_member', '<>', 1)
                ->where('overdue_time', '>', $now);
        } elseif ($where['member_type'] === 'none') {
            $model = $model->where('is_teaching_member', '<>', 1)
                ->where(function ($q) use ($now) {
                    $q->where('overdue_time', '<=', $now)
                      ->whereOr('overdue_time', 0);
                });
        }
        $count = $model->count();
        $list = $model->field('uid,nickname,avatar,phone,is_teaching_member,overdue_time,is_money_level,is_ever_level,add_time')
            ->order('uid', 'desc')
            ->page($page, $limit)
            ->select()
            ->toArray();
        foreach ($list as &$item) {
            $item['add_time'] = $item['add_time'] ? date('Y-m-d H:i', $item['add_time']) : '';
            if ($item['is_teaching_member'] == 1) {
                $item['member_type'] = 'super';
                $item['member_type_text'] = '超级会员';
            } elseif ($item['overdue_time'] > $now) {
                $item['member_type'] = 'regular';
                $item['member_type_text'] = '普通会员';
                $item['overdue_time_text'] = date('Y-m-d', $item['overdue_time']);
            } else {
                $item['member_type'] = 'none';
                $item['member_type_text'] = '非会员';
                $item['overdue_time_text'] = '';
            }
        }
        return app('json')->success(compact('list', 'count'));
    }

    /**
     * 设置/取消超级会员
     * @param int $uid
     * @return mixed
     */
    public function setMember($uid)
    {
        [$status] = request()->getMore([
            ['is_teaching_member', 0],
        ], true);
        $this->services->update((int)$uid, ['is_teaching_member' => (int)$status]);
        return app('json')->success($status ? '已设为超级会员' : '已取消超级会员');
    }
}
