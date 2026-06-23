<?php
use think\facade\Route;

Route::group('my', function () {
    Route::get('favorites', 'v2.MyController/favorites')->option(['real_name' => '我的收藏']);
    Route::get('courses', 'v2.MyController/courses')->option(['real_name' => '已购课程']);
    Route::get('bookings', 'v2.MyController/bookings')->option(['real_name' => '线下预约']);
    Route::get('comments', 'v2.MyController/comments')->option(['real_name' => '我的评论']);
    Route::get('posts', 'v2.MyController/posts')->option(['real_name' => '我的发帖']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);
