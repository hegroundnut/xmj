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
 * 洗眉机小程序 API v2 路由（精简版）
 * 仅保留登录授权 + 教学模块路由，商城路由已移除
 */
Route::group('v2', function () {
    //无需授权接口 — 微信登录（保留）
    Route::group(function () {
        Route::group(function () {
            //小程序登录页面自动加载，返回用户信息的缓存key，返回是否强制绑定手机号
            Route::get('routine/auth_type', 'v2.wechat.AuthController/authType')->option(['real_name' => '小程序页面登录类型']);
            //小程序授权登录，返回token
            Route::get('routine/auth_login', 'v2.wechat.AuthController/authLogin')->option(['real_name' => '小程序授权登录']);
            //小程序授权绑定手机号
            Route::post('routine/auth_binding_phone', 'v2.wechat.AuthController/authBindingPhone')->option(['real_name' => '小程序授权绑定手机号']);
            //小程序手机号直接登录
            Route::post('routine/phone_login', 'v2.wechat.AuthController/phoneLogin')->option(['real_name' => '手机号直接登录']);
            //小程序授权后绑定手机号
            Route::post('routine/binding_phone', 'v2.wechat.AuthController/BindingPhone')->option(['real_name' => '小程序授权后绑定手机号']);
        })->option(['mark' => 'wechat_auto', 'mark_name' => '微信授权']);
    });

    // 洗眉机教学路由
    require __DIR__ . '/v2/teaching.php';

    // 用户路由
    require __DIR__ . '/v2/user.php';

    // 案例收藏路由
    require __DIR__ . '/v2/case_favorite.php';

    // 我的页面路由
    require __DIR__ . '/v2/my.php';

    // 朋友圈路由
    require __DIR__ . '/v2/moment.php';

    // ==================== 以下商城路由已隐藏 ====================
    // 如需恢复商城功能，请取消注释:
    //   require __DIR__ . '/v2/shop.php'; (将原商城路由移至此文件)

})->middleware(\app\http\middleware\AllowOriginMiddleware::class)->middleware(\app\api\middleware\StationOpenMiddleware::class);
