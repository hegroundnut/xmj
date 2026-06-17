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
 * 洗眉机教学管理路由
 */

// 产品管理
Route::group('teaching_product', function () {
    Route::get('info', 'v1.teaching.ProductInfoController/index')->option(['real_name' => '产品信息']);
    Route::post('save', 'v1.teaching.ProductInfoController/save')->option(['real_name' => '保存产品信息']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 案例管理
Route::group('teaching_case', function () {
    Route::get('list', 'v1.teaching.CaseController/index')->option(['real_name' => '案例列表']);
    Route::post('save', 'v1.teaching.CaseController/save')->option(['real_name' => '新增案例']);
    Route::put('update/:id', 'v1.teaching.CaseController/update')->option(['real_name' => '编辑案例']);
    Route::delete('delete/:id', 'v1.teaching.CaseController/delete')->option(['real_name' => '删除案例']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 课程管理
Route::group('teaching_course', function () {
    Route::get('list', 'v1.teaching.CourseController/index')->option(['real_name' => '课程列表']);
    Route::post('save', 'v1.teaching.CourseController/save')->option(['real_name' => '新增课程']);
    Route::put('update/:id', 'v1.teaching.CourseController/update')->option(['real_name' => '编辑课程']);
    Route::delete('delete/:id', 'v1.teaching.CourseController/delete')->option(['real_name' => '删除课程']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 线下排期管理
Route::group('teaching_offline', function () {
    Route::get('list', 'v1.teaching.OfflineClassController/index')->option(['real_name' => '线下排期列表']);
    Route::post('save', 'v1.teaching.OfflineClassController/save')->option(['real_name' => '新增排期']);
    Route::put('update/:id', 'v1.teaching.OfflineClassController/update')->option(['real_name' => '编辑排期']);
    Route::delete('delete/:id', 'v1.teaching.OfflineClassController/delete')->option(['real_name' => '删除排期']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 预约记录
Route::group('teaching_booking', function () {
    Route::get('list', 'v1.teaching.BookingController/index')->option(['real_name' => '预约记录列表']);
    Route::put('cancel/:id', 'v1.teaching.BookingController/cancel')->option(['real_name' => '取消预约']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '洗眉机']);

// 用户会员管理（新增到已有用户管理下）
Route::group('user', function () {
    Route::put('set_teaching_member/:uid', 'v1.user.User/setTeachingMember')->option(['real_name' => '设置教学会员']);
});