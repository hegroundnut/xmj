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
 * 用户路由
 */
Route::group('user', function () {
    Route::get('info', 'v2.UserController/info');
    Route::post('update', 'v2.UserController/update')->option(['real_name' => '修改用户资料']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, true);

/**
 * 图片上传（朋友圈、头像等，需登录）
 */
Route::group('upload', function () {
    Route::post('image', 'v2.UploadController/image')->option(['real_name' => '图片上传']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, true);
