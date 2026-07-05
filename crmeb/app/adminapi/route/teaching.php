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
 * 知识分享教学管理路由
 */

// 产品管理
Route::group('teaching_product', function () {
    Route::get('list', 'v1.teaching.ProductInfoController/index')->option(['real_name' => '产品列表']);
    Route::get('info', 'v1.teaching.ProductInfoController/index')->option(['real_name' => '产品信息']);
    Route::get('detail/:id', 'v1.teaching.ProductInfoController/detail')->option(['real_name' => '产品详情']);
    Route::post('save', 'v1.teaching.ProductInfoController/save')->option(['real_name' => '保存产品信息']);
    Route::delete('delete/:id', 'v1.teaching.ProductInfoController/delete')->option(['real_name' => '删除产品']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

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
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 课程管理
Route::group('teaching_course', function () {
    Route::get('list', 'v1.teaching.CourseController/index')->option(['real_name' => '课程列表']);
    Route::post('save', 'v1.teaching.CourseController/save')->option(['real_name' => '新增课程']);
    Route::put('update/:id', 'v1.teaching.CourseController/update')->option(['real_name' => '编辑课程']);
    Route::delete('delete/:id', 'v1.teaching.CourseController/delete')->option(['real_name' => '删除课程']);
    Route::post('upload_video', 'v1.teaching.CourseController/upload_video')->option(['real_name' => '上传课程视频']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

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
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 首页配置管理
Route::group('teaching_home_config', function () {
    Route::get('info', 'v1.teaching.HomeConfigController/index')->option(['real_name' => '首页配置信息']);
    Route::post('save', 'v1.teaching.HomeConfigController/save')->option(['real_name' => '保存首页配置']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 案例评论管理
Route::group('teaching_case_comment', function () {
    Route::get('list', 'v1.teaching.CaseCommentController/index')->option(['real_name' => '评论列表']);
    Route::put('status/:id', 'v1.teaching.CaseCommentController/setStatus')->option(['real_name' => '审核评论']);
    Route::delete('delete/:id', 'v1.teaching.CaseCommentController/delete')->option(['real_name' => '删除评论']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 预约记录
Route::group('teaching_booking', function () {
    Route::get('list', 'v1.teaching.BookingController/index')->option(['real_name' => '预约记录列表']);
    Route::put('cancel/:id', 'v1.teaching.BookingController/cancel')->option(['real_name' => '取消预约']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 用户会员管理
Route::group('teaching_member', function () {
    Route::get('list', 'v1.teaching.MemberController/index')->option(['real_name' => '教学会员列表']);
    Route::put('set/:uid', 'v1.teaching.MemberController/setMember')->option(['real_name' => '设置超级会员']);
    Route::put('set_regular/:uid', 'v1.teaching.MemberController/setRegularMember')->option(['real_name' => '设置普通会员']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 分类管理
Route::group('teaching_category', function () {
    Route::get('list', 'v1.teaching.CategoryController/index')->option(['real_name' => '分类列表']);
    Route::post('save', 'v1.teaching.CategoryController/save')->option(['real_name' => '新增分类']);
    Route::put('update/:id', 'v1.teaching.CategoryController/update')->option(['real_name' => '编辑分类']);
    Route::delete('delete/:id', 'v1.teaching.CategoryController/delete')->option(['real_name' => '删除分类']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);

// 图片素材管理
Route::group('teaching_material', function () {
    Route::get('list', 'v1.teaching.MaterialController/imageList')->option(['real_name' => '图片素材列表']);
    Route::post('upload_image', 'v1.teaching.MaterialController/uploadImage')->option(['real_name' => '上传图片']);
    Route::post('delete', 'v1.teaching.MaterialController/deleteImage')->option(['real_name' => '删除图片']);
    Route::put('rename/:id', 'v1.teaching.MaterialController/renameImage')->option(['real_name' => '重命名图片']);
    Route::put('move', 'v1.teaching.MaterialController/moveImage')->option(['real_name' => '移动图片分类']);
    Route::get('video_list', 'v1.teaching.MaterialController/videoList')->option(['real_name' => '视频素材列表']);
    Route::post('upload_video', 'v1.teaching.MaterialController/uploadVideo')->option(['real_name' => '上传视频']);
    Route::post('video_save', 'v1.teaching.MaterialController/saveCloudVideo')->option(['real_name' => '保存云视频']);
    Route::post('video_delete', 'v1.teaching.MaterialController/deleteVideo')->option(['real_name' => '删除视频']);
    Route::put('video_rename/:id', 'v1.teaching.MaterialController/renameVideo')->option(['real_name' => '重命名视频']);
})->middleware([
    \app\http\middleware\AllowOriginMiddleware::class,
    \app\adminapi\middleware\AdminAuthTokenMiddleware::class,
    \app\adminapi\middleware\AdminCheckRoleMiddleware::class,
    \app\adminapi\middleware\AdminLogMiddleware::class
])->option(['mark' => 'teaching', 'mark_name' => '知识分享']);