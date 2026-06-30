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

use app\services\teaching\TeachingCategoryServices;
use think\facade\App;

/**
 * 分类控制器（前端公开接口）
 */
class CategoryController
{
    protected $services;

    public function __construct(App $app, TeachingCategoryServices $services)
    {
        $this->services = $services;
    }

    /**
     * 获取案例分类列表
     * GET /api/v2/category/case
     * @return mixed
     */
    public function case_categories()
    {
        $list = $this->services->getCategoryList(1, true);
        return app('json')->success($list);
    }

    /**
     * 获取课程分类列表
     * GET /api/v2/category/course
     * @return mixed
     */
    public function course_categories()
    {
        $list = $this->services->getCategoryList(2, true);
        return app('json')->success($list);
    }

    /**
     * 获取产品分类列表
     * GET /api/v2/category/product
     * @return mixed
     */
    public function product_categories()
    {
        $list = $this->services->getCategoryList(3, true);
        return app('json')->success($list);
    }
}
