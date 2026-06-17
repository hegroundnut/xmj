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

use app\adminapi\controller\AuthController;
use app\services\teaching\OfflineBookingServices;
use think\facade\App;

/**
 * 预约记录控制器（只读）
 */
class BookingController extends AuthController
{
    protected $services;

    public function __construct(App $app, OfflineBookingServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 预约记录列表
     */
    public function index()
    {
        $where = $this->request->getMore([
            ['class_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        return app('json')->success($this->services->getList(array_filter($where)));
    }

    /**
     * 取消预约（管理员操作）
     */
    public function cancel($id)
    {
        $this->services->update((int)$id, ['status' => 1]);
        return app('json')->success([], '已取消');
    }
}
