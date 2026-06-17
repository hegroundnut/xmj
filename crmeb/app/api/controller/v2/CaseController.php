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

use app\services\teaching\CaseServices;
use think\facade\App;

/**
 * 案例控制器
 */
class CaseController
{
    protected $services;

    public function __construct(App $app, CaseServices $services)
    {
        $this->services = $services;
    }

    /**
     * 案例列表（支持按类型筛选）
     * GET /api/v2/case/list
     */
    public function get_list()
    {
        $where = request()->getMore([
            ['type', 0],     // 0=全部 1=图片 2=视频
            ['page', 0],
            ['limit', 0],
        ]);
        return app('json')->success($this->services->getList(array_filter($where)));
    }
}
