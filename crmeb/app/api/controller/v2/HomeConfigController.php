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

use app\services\teaching\TeachingHomeConfigServices;
use app\services\teaching\CaseServices;
use app\services\teaching\CourseServices;
use think\facade\App;

/**
 * 首页配置控制器（前端API）
 */
class HomeConfigController
{
    /**
     * @var TeachingHomeConfigServices
     */
    protected $services;

    /**
     * @param App $app
     * @param TeachingHomeConfigServices $services
     */
    public function __construct(App $app, TeachingHomeConfigServices $services)
    {
        $this->services = $services;
    }

    /**
     * 获取首页配置及数据
     * GET /api/v2/home/config
     * @return mixed
     */
    public function get_config()
    {
        $config = $this->services->getHomeConfig();

        // 精选案例：获取 is_home=1 的案例
        if (!empty($config['featured_cases']['enabled'])) {
            $limit = $config['featured_cases']['limit'] ?? 4;
            /** @var CaseServices $caseServices */
            $caseServices = app()->make(CaseServices::class);
            $caseData = $caseServices->getList(['is_home' => 1]);
            $config['featured_cases']['data'] = array_slice($caseData['list'] ?? [], 0, $limit);
        }

        // 热门课程
        if (!empty($config['latest_courses']['enabled'])) {
            $limit = $config['latest_courses']['limit'] ?? 3;
            /** @var CourseServices $courseServices */
            $courseServices = app()->make(CourseServices::class);
            $uid = request()->uid ?? 0;
            $courseData = $courseServices->getList([], $uid);
            $config['latest_courses']['data'] = array_slice($courseData['list'] ?? [], 0, $limit);
        }

        return app('json')->success($config);
    }
}
