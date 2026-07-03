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
}
