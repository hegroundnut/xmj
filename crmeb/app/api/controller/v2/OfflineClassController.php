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

use app\services\teaching\OfflineClassServices;
use app\services\teaching\OfflineBookingServices;
use think\facade\App;

/**
 * 线下课程控制器
 */
class OfflineClassController
{
    protected $services;

    public function __construct(App $app, OfflineClassServices $services)
    {
        $this->services = $services;
    }

    /**
     * 排期列表
     * GET /api/v2/offline_class/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['page', 0],
            ['limit', 0],
        ]);
        return app('json')->success($this->services->getList($where));
    }

    /**
     * 排期详情
     * GET /api/v2/offline_class/detail/:id
     */
    public function get_detail($id)
    {
        $info = $this->services->getDetail((int)$id);
        if (!$info) return app('json')->fail('课程不存在');
        return app('json')->success($info);
    }

    /**
     * 提交预约
     * POST /api/v2/offline_class/booking
     */
    public function create_booking(OfflineBookingServices $bookingServices)
    {
        [$classId, $name, $phone] = request()->getMore([
            ['class_id', 0],
            ['name', ''],
            ['phone', ''],
        ], true);
        if (!$classId || !$name || !$phone) {
            return app('json')->fail('请填写完整信息');
        }
        $uid = request()->uid;
        $bookingServices->createBooking($uid, (int)$classId, $name, $phone);
        return app('json')->success('预约成功');
    }
}
