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
 * 朋友圈路由
 */

// 帖子 — 需要登录（查看、互动均需登录）
Route::group('moment', function () {
    Route::get('list', 'v2.MomentController/get_list')->option(['real_name' => '帖子列表']);
    Route::get('detail/:id', 'v2.MomentController/get_detail')->option(['real_name' => '帖子详情']);
    Route::post('create', 'v2.MomentController/create')->option(['real_name' => '发布帖子']);
    Route::post('delete/:id', 'v2.MomentController/delete_moment')->option(['real_name' => '删除帖子']);
    Route::post('like/:id', 'v2.MomentController/toggle_like')->option(['real_name' => '点赞/取消']);
    Route::post('favorite/:id', 'v2.MomentController/toggle_favorite')->option(['real_name' => '收藏/取消']);
    Route::get('favorites', 'v2.MomentController/get_favorites')->option(['real_name' => '我的收藏']);
    Route::post('comment', 'v2.MomentController/create_comment')->option(['real_name' => '发表评论']);
    Route::post('comment/delete/:id', 'v2.MomentController/delete_comment')->option(['real_name' => '删除评论']);
    Route::post('share/:id', 'v2.MomentController/share')->option(['real_name' => '分享计数']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);
