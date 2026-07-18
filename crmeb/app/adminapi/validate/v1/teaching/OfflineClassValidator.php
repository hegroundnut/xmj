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

class OfflineClassValidator extends Validate
{
    protected $rule = [
        'title' => 'require|max:255',
        'cover' => 'require',
        'start_date' => 'require|date',
        'end_date' => 'require|date',
        'start_time' => 'require',
        'end_time' => 'require',
        'address' => 'require',
        'max_people' => 'require|number|>=:1',
        'photos' => 'max:5000',
    ];

    protected $message = [
        'title.require' => '排期标题不能为空',
        'cover.require' => '请上传封面图',
        'start_date.require' => '请选择开始日期',
        'start_date.date' => '开始日期格式不正确',
        'end_date.require' => '请选择结束日期',
        'end_date.date' => '结束日期格式不正确',
        'start_time.require' => '请选择开始时间',
        'end_time.require' => '请选择结束时间',
        'address.require' => '请填写地址',
        'max_people.require' => '请设置人数上限',
        'photos.max' => '图片列表过长',
    ];
}