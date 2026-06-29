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

use app\services\teaching\CourseServices;
use app\services\teaching\CourseOrderServices;
use app\services\teaching\CoursePayServices;
use think\facade\App;

/**
 * 教学课程控制器
 */
class CourseController
{
    protected $services;

    public function __construct(App $app, CourseServices $services)
    {
        $this->services = $services;
    }

    /**
     * 课程列表
     * GET /api/v2/course/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['category_id', 0],
            ['page', 0],
            ['limit', 0],
        ]);
        $uid = request()->uid ?? 0;
        return app('json')->success($this->services->getList($where, $uid));
    }

    /**
     * 课程详情
     * GET /api/v2/course/detail/:id
     */
    public function get_detail($id)
    {
        $uid = request()->uid ?? 0;
        return app('json')->success($this->services->getDetail((int)$id, $uid));
    }

    /**
     * 创建试听订单
     * POST /api/v2/course/create_order
     */
    public function create_order(CourseOrderServices $orderServices)
    {
        [$courseId] = request()->getMore([
            ['course_id', 0],
        ], true);
        if (!$courseId) return app('json')->fail('参数错误');
        $uid = request()->uid;
        $course = $this->services->getDetail((int)$courseId, $uid);
        if ($course['can_watch']) {
            return app('json')->fail('您已可观看此课程，无需购买');
        }
        $orderSn = $orderServices->createOrder($uid, (int)$courseId, (float)$course['price']);

        $result = ['order_sn' => $orderSn, 'price' => $course['price']];
        try {
            /** @var CoursePayServices $coursePayServices */
            $coursePayServices = app()->make(CoursePayServices::class);
            $payParams = $coursePayServices->pay($orderSn, (float)$course['price'], 'routine');
            $result['pay_params'] = $payParams;
        } catch (\Exception $e) {
            $result['pay_error'] = $e->getMessage();
        }
        return app('json')->success($result);
    }
}
