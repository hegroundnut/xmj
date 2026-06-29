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
use app\services\teaching\CaseServices;
use app\adminapi\validate\v1\teaching\CaseValidator;
use think\facade\App;

/**
 * 案例管理控制器
 */
class CaseController extends AuthController
{
    protected $services;

    public function __construct(App $app, CaseServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 案例列表
     */
    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['type', 0],
            ['category_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        // 管理后台看全部 status，不加筛选
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where));
    }

    /**
     * 新增案例
     */
    public function save(CaseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['type', 1],
            ['category_id', 0],
            ['cover', ''],
            ['media_url', ''],
            ['sort', 0],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success([], '添加成功');
    }

    /**
     * 编辑案例
     */
    public function update($id, CaseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['type', 1],
            ['category_id', 0],
            ['cover', ''],
            ['media_url', ''],
            ['sort', 0],
            ['status', 1],
        ]);
        $this->services->update((int)$id, $data);
        return app('json')->success([], '修改成功');
    }

    /**
     * 删除案例（软删除改状态）
     */
    public function delete($id)
    {
        $this->services->update((int)$id, ['status' => 0]);
        return app('json')->success([], '删除成功');
    }
}
