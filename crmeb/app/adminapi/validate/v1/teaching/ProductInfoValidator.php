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
namespace app\adminapi\validate\v1\teaching;

use think\Validate;

class ProductInfoValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'detail' => 'require',
    ];

    protected $message = [
        'title.require' => '产品标题不能为空',
        'detail.require' => '图文详情不能为空',
    ];
}