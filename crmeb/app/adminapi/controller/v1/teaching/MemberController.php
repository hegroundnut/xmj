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
            ['is_teaching_member', ''],
        ]);
        [$page, $limit] = $this->services->getPageValue();
        $model = $this->services->getModel();
        if (!empty($where['keyword'])) {
            $model = $model->where(function ($q) use ($where) {
                $q->whereLike('nickname', '%' . $where['keyword'] . '%')
                  ->whereOr('phone', $where['keyword'])
                  ->whereOr('uid', $where['keyword']);
            });
        }
        if ($where['is_teaching_member'] !== '') {
            $model = $model->where('is_teaching_member', (int)$where['is_teaching_member']);
        }
        $count = $model->count();
        $list = $model->field('uid,nickname,avatar,phone,is_teaching_member,add_time')
            ->order('uid', 'desc')
            ->page($page, $limit)
            ->select()
            ->toArray();
        foreach ($list as &$item) {
            $item['add_time'] = $item['add_time'] ? date('Y-m-d H:i', $item['add_time']) : '';
        }
        return app('json')->success(compact('list', 'count'));
    }

    /**
     * 设置/取消教学会员
     * @param int $uid
     * @return mixed
     */
    public function setMember($uid)
    {
        [$status] = request()->getMore([
            ['is_teaching_member', 0],
        ], true);
        $this->services->update((int)$uid, ['is_teaching_member' => (int)$status]);
        return app('json')->success($status ? '已设为会员' : '已取消会员');
    }
}
