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
use think\facade\Route;

/**
 * 朋友圈后台管理路由
 */

// 帖子管理
Route::group('moment', function () {
    Route::get('list', 'v1.moment.MomentController/index')->option(['real_name' => '帖子列表']);
    Route::delete('delete/:id', 'v1.moment.MomentController/delete')->option(['real_name' => '删除帖子']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'moment', 'mark_name' => '朋友圈']);

// 评论管理
Route::group('moment_comment', function () {
    Route::get('list', 'v1.moment.MomentController/comment_list')->option(['real_name' => '评论列表']);
    Route::delete('delete/:id', 'v1.moment.MomentController/delete_comment')->option(['real_name' => '删除评论']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'moment', 'mark_name' => '朋友圈']);
