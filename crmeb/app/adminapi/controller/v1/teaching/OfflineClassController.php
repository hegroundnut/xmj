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
use app\services\teaching\OfflineClassServices;
use app\adminapi\validate\v1\teaching\OfflineClassValidator;
use think\facade\App;

/**
 * 线下排期管理控制器
 */
class OfflineClassController extends AuthController
{
    protected $services;

    public function __construct(App $app, OfflineClassServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where));
    }

    public function save(OfflineClassValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['class_date', ''],
            ['start_time', ''],
            ['end_time', ''],
            ['address', ''],
            ['max_people', 0],
            ['qrcode', ''],
            ['desc', ''],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success('添加成功');
    }

    public function update($id, OfflineClassValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['cover', ''],
            ['class_date', ''],
            ['start_time', ''],
            ['end_time', ''],
            ['address', ''],
            ['max_people', 0],
            ['qrcode', ''],
            ['desc', ''],
            ['status', 1],
        ]);
        $this->services->update((int)$id, $data);
        return app('json')->success('修改成功');
    }

    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success('删除成功');
    }
}
