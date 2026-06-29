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
use app\services\teaching\CourseServices;
use app\adminapi\validate\v1\teaching\CourseValidator;
use think\facade\App;

/**
 * 课程管理控制器
 */
class CourseController extends AuthController
{
    protected $services;

    public function __construct(App $app, CourseServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    public function index()
    {
        $where = $this->request->getMore([
            ['title', ''],
            ['status', ''],
            ['category_id', 0],
            ['page', 1],
            ['limit', 15],
        ]);
        $where['show_all'] = 1;
        return app('json')->success($this->services->getList($where, 0));
    }

    public function save(CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['category_id', 0],
            ['cover', ''],
            ['desc', ''],
            ['video_url', ''],
            ['price', 9.90],
            ['is_free_for_member', 1],
            ['sort', 0],
            ['status', 1],
        ]);
        $data['add_time'] = time();
        $this->services->save($data);
        return app('json')->success('添加成功');
    }

    public function update($id, CourseValidator $validator)
    {
        $data = $this->request->getMore([
            ['title', ''],
            ['category_id', 0],
            ['cover', ''],
            ['desc', ''],
            ['video_url', ''],
            ['price', 9.90],
            ['is_free_for_member', 1],
            ['sort', 0],
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
