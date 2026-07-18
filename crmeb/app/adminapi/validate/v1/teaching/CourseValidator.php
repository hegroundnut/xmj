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

class CourseValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'cover' => 'require',
        'type' => 'in:1,2',
        'images' => 'max:5000',
    ];

    protected $message = [
        'title.require' => '课程标题不能为空',
        'cover.require' => '请上传封面图',
        'type.in' => '课程类型只能为 1（视频）或 2（图文）',
        'images.max' => '图片列表数据过长',
    ];
}
