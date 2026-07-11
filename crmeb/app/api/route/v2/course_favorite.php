<?php
use think\facade\Route;

Route::group('course', function () {
    Route::post('favorite/:id', 'v2.CourseFavoriteController/toggle')->option(['real_name' => '课程收藏/取消']);
    Route::get('favorites', 'v2.CourseFavoriteController/favorites')->option(['real_name' => '课程收藏列表']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);
