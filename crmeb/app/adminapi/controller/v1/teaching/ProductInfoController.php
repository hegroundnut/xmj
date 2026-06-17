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
use app\services\product\ProductInfoServices;
use app\adminapi\validate\v1\teaching\ProductInfoValidator;
use think\facade\App;

/**
 * 产品管理控制器
 */
class ProductInfoController extends AuthController
{
    protected $services;

    public function __construct(App $app, ProductInfoServices $services)
    {
        parent::__construct($app);
        $this->services = $services;
    }

    /**
     * 获取产品信息（编辑表单回显）
     */
    public function index()
    {
        $info = $this->services->getProductInfo();
        return app('json')->success($info);
    }

    /**
     * 保存产品信息
     */
    public function save(ProductInfoValidator $validator)
    {
        $data = $this->request->getMore([
            ['banner', []],
            ['title', ''],
            ['desc', ''],
            ['detail', ''],
            ['specs', []],
            ['video_url', ''],
            ['status', 1],
        ]);
        // banner 和 specs 转为 JSON 存储
        if (is_array($data['banner'])) $data['banner'] = json_encode($data['banner']);
        if (is_array($data['specs'])) $data['specs'] = json_encode($data['specs']);
        $this->services->saveProductInfo($data);
        return app('json')->success([], '保存成功');
    }
}
