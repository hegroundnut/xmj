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
     * 产品列表
     */
    public function index()
    {
        $list = $this->services->getProductList();
        return app('json')->success($list);
    }

    /**
     * 获取单个产品详情
     * @param int $id
     */
    public function detail($id)
    {
        $info = $this->services->get((int)$id);
        if ($info) {
            $info = $info->toArray();
            $info['banner'] = json_decode($info['banner'], true) ?? [];
            $info['specs'] = json_decode($info['specs'], true) ?? [];
        }
        return app('json')->success($info ?: []);
    }

    /**
     * 保存产品信息（新增或编辑）
     */
    public function save(ProductInfoValidator $validator)
    {
        $data = $this->request->getMore([
            ['id', 0],
            ['banner', []],
            ['title', ''],
            ['desc', ''],
            ['detail', ''],
            ['specs', []],
            ['video_url', ''],
            ['status', 1],
            ['is_home', 0],
            ['category_id', 0],
        ]);
        $id = (int)$data['id'];
        unset($data['id']);
        if (is_array($data['banner'])) $data['banner'] = json_encode($data['banner']);
        if (is_array($data['specs'])) $data['specs'] = json_encode($data['specs']);
        $this->services->saveProductInfo($data, $id);
        return app('json')->success('保存成功');
    }

    /**
     * 删除产品
     * @param int $id
     */
    public function delete($id)
    {
        $this->services->deleteProduct((int)$id);
        return app('json')->success('删除成功');
    }
}
