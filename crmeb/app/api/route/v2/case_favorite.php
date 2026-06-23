<?php
use think\facade\Route;

Route::group('case', function () {
    Route::post('favorite/:id', 'v2.CaseFavoriteController/toggle')->option(['real_name' => '案例收藏/取消']);
    Route::get('favorites', 'v2.CaseFavoriteController/favorites')->option(['real_name' => '案例收藏列表']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);
