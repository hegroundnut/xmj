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
namespace app\services\product;

use app\dao\product\ProductInfoDao;
use app\services\BaseServices;

/**
 * 洗眉机产品信息服务
 */
class ProductInfoServices extends BaseServices
{
    public function __construct(ProductInfoDao $dao)
    {
        $this->dao = $dao;
    }

    /**
     * 获取产品信息（单条记录，id=1）
     * @return array
     */
    public function getProductInfo()
    {
        $info = $this->dao->get(1);
        if ($info) {
            $info['banner'] = json_decode($info['banner'], true) ?? [];
            $info['specs'] = json_decode($info['specs'], true) ?? [];
            if (isset($info['banner']) && is_array($info['banner'])) {
                foreach ($info['banner'] as &$url) {
                    $url = set_file_url($url);
                }
            }
        }
        return $info ?: [];
    }

    /**
     * 保存产品信息（存在则更新，不存在则新增）
     * @param array $data
     * @return mixed
     */
    public function saveProductInfo(array $data)
    {
        $data['update_time'] = time();
        $exists = $this->dao->get(1);
        if ($exists) {
            return $this->dao->update(1, $data);
        } else {
            $data['add_time'] = time();
            return $this->dao->save($data);
        }
    }
}
