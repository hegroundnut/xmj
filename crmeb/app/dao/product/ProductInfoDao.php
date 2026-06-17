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
namespace app\dao\product;

use app\dao\BaseDao;
use app\model\product\ProductInfo;

/**
 * 洗眉机产品信息 DAO
 */
class ProductInfoDao extends BaseDao
{
    protected function setModel(): string
    {
        return ProductInfo::class;
    }
}
