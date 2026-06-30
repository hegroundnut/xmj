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
 * 洗眉机教学路由
 */

// 首页配置 — 无需登录
Route::group('home', function () {
    Route::get('config', 'v2.HomeConfigController/get_config')->option(['real_name' => '首页配置']);
});

// 分类 — 无需登录
Route::group('category', function () {
    Route::get('case', 'v2.CategoryController/case_categories')->option(['real_name' => '案例分类列表']);
    Route::get('course', 'v2.CategoryController/course_categories')->option(['real_name' => '课程分类列表']);
    Route::get('product', 'v2.CategoryController/product_categories')->option(['real_name' => '产品分类列表']);
});

// 产品 — 无需登录
Route::group('product', function () {
    Route::get('info', 'v2.ProductController/get_info')->option(['real_name' => '产品信息']);
    Route::get('list', 'v2.ProductController/get_list')->option(['real_name' => '产品列表']);
});

// 案例 — 无需登录
Route::group('case', function () {
    Route::get('list', 'v2.CaseController/get_list')->option(['real_name' => '案例列表']);
});

// 案例评论 — 列表无需登录，发表需要登录
Route::group('case_comment', function () {
    Route::get('list', 'v2.CaseCommentController/get_list')->option(['real_name' => '案例评论列表']);
    Route::post('add', 'v2.CaseCommentController/add')
        ->middleware(\app\api\middleware\AuthTokenMiddleware::class, false)
        ->option(['real_name' => '发表评论']);
});

// 教学课程 — 需要登录
Route::group('course', function () {
    Route::get('list', 'v2.CourseController/get_list')->option(['real_name' => '课程列表']);
    Route::get('detail/:id', 'v2.CourseController/get_detail')->option(['real_name' => '课程详情']);
    Route::post('create_order', 'v2.CourseController/create_order')->option(['real_name' => '创建试听订单']);
})->middleware(\app\api\middleware\AuthTokenMiddleware::class, false);

// 线下课程 — 需要登录（预约部分）
Route::group('offline_class', function () {
    Route::get('list', 'v2.OfflineClassController/get_list')->option(['real_name' => '线下排期列表']);
    Route::get('detail/:id', 'v2.OfflineClassController/get_detail')->option(['real_name' => '线下排期详情']);
    Route::post('booking', 'v2.OfflineClassController/create_booking')
        ->middleware(\app\api\middleware\AuthTokenMiddleware::class, false)
        ->option(['real_name' => '提交预约']);
});