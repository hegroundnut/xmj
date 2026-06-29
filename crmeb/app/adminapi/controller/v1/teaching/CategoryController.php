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
use app\services\teaching\TeachingCategoryServices;
use think\facade\App;

/**
 * 教学分类管理控制器
 */
class CategoryController extends AuthController
{
    protected $services;

    public function __construct(App $app, TeachingCategoryServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 分类列表（按类型）
     * @param int $type 1=案例 2=课程
     * @return mixed
     */
    public function index()
    {
        $type = (int)$this->request->get('type', 1);
        $list = $this->services->getCategoryList($type);
        return app('json')->success($list);
    }

    /**
     * 新增分类
     * @return mixed
     */
    public function save()
    {
        $data = $this->request->getMore([
            ['name', ''],
            ['type', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        if (empty($data['name'])) {
            return app('json')->fail('分类名称不能为空');
        }
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success('添加成功');
    }

    /**
     * 编辑分类
     * @param int $id
     * @return mixed
     */
    public function update($id)
    {
        $data = $this->request->getMore([
            ['name', ''],
            ['sort', 0],
            ['status', 1],
        ]);
        if (empty($data['name'])) {
            return app('json')->fail('分类名称不能为空');
        }
        $this->services->update((int)$id, $data);
        return app('json')->success('修改成功');
    }

    /**
     * 删除分类
     * @param int $id
     * @return mixed
     */
    public function delete($id)
    {
        $this->services->delete((int)$id);
        return app('json')->success('删除成功');
    }
}
