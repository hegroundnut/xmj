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

use app\services\teaching\TeachingHomeConfigServices;
use think\facade\App;

/**
 * 首页配置管理控制器（后台）
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
     * 获取首页配置
     * @return mixed
     */
    public function index()
    {
        return app('json')->success($this->services->getHomeConfig());
    }

    /**
     * 保存首页配置
     * @return mixed
     */
    public function save()
    {
        $data = request()->post();
        $this->services->saveHomeConfig($data);
        return app('json')->success('保存成功');
    }
}
