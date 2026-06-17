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

class CaseValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'type' => 'require|in:1,2',
        'cover' => 'require',
        'media_url' => 'require',
    ];

    protected $message = [
        'title.require' => '案例标题不能为空',
        'type.require' => '请选择案例类型',
        'cover.require' => '请上传封面图',
        'media_url.require' => '请上传图片或视频',
    ];
}