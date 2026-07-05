// +----------------------------------------------------------------------
// | CRMEB [ CRMEB赋能开发者，助力企业发展 ]
// +----------------------------------------------------------------------
// | Copyright (c) 2016~2026 https://www.crmeb.com All rights reserved.
// +----------------------------------------------------------------------
// | Licensed CRMEB并不是自由软件，未经许可不能去掉CRMEB相关版权
// +----------------------------------------------------------------------
// | Author: CRMEB Team <admin@crmeb.com>
// +----------------------------------------------------------------------

import request from '@/libs/request';

/**
 * 产品管理
 */
export function getProductList() {
  return request({ url: 'teaching_product/list', method: 'get' });
}
export function getProductInfo() {
  return request({ url: 'teaching_product/info', method: 'get' });
}
export function getProductDetail(id) {
  return request({ url: `teaching_product/detail/${id}`, method: 'get' });
}
export function saveProductInfo(data) {
  return request({ url: 'teaching_product/save', method: 'post', data });
}
export function deleteProduct(id) {
  return request({ url: `teaching_product/delete/${id}`, method: 'delete' });
}

/**
 * 案例管理
 */
export function getCaseList(params) {
  return request({ url: 'teaching_case/list', method: 'get', params });
}
export function saveCase(data) {
  return request({ url: 'teaching_case/save', method: 'post', data });
}
export function updateCase(id, data) {
  return request({ url: `teaching_case/update/${id}`, method: 'put', data });
}
export function deleteCase(id) {
  return request({ url: `teaching_case/delete/${id}`, method: 'delete' });
}

/**
 * 课程管理
 */
export function getCourseList(params) {
  return request({ url: 'teaching_course/list', method: 'get', params });
}
export function saveCourse(data) {
  return request({ url: 'teaching_course/save', method: 'post', data });
}
export function updateCourse(id, data) {
  return request({ url: `teaching_course/update/${id}`, method: 'put', data });
}
export function deleteCourse(id) {
  return request({ url: `teaching_course/delete/${id}`, method: 'delete' });
}

/**
 * 线下排期管理
 */
export function getOfflineClassList(params) {
  return request({ url: 'teaching_offline/list', method: 'get', params });
}
export function saveOfflineClass(data) {
  return request({ url: 'teaching_offline/save', method: 'post', data });
}
export function updateOfflineClass(id, data) {
  return request({ url: `teaching_offline/update/${id}`, method: 'put', data });
}
export function deleteOfflineClass(id) {
  return request({ url: `teaching_offline/delete/${id}`, method: 'delete' });
}

/**
 * 预约记录
 */
export function getBookingList(params) {
  return request({ url: 'teaching_booking/list', method: 'get', params });
}
export function cancelBooking(id) {
  return request({ url: `teaching_booking/cancel/${id}`, method: 'put' });
}

/**
 * 案例评论管理
 */
export function getCaseCommentList(params) {
  return request({ url: 'teaching_case_comment/list', method: 'get', params });
}
export function setCaseCommentStatus(id, status) {
  return request({ url: `teaching_case_comment/status/${id}`, method: 'put', data: { status } });
}
export function deleteCaseComment(id) {
  return request({ url: `teaching_case_comment/delete/${id}`, method: 'delete' });
}

/**
 * 首页配置
 */
export function getHomeConfig() {
  return request({ url: 'teaching_home_config/info', method: 'get' });
}
export function saveHomeConfig(data) {
  return request({ url: 'teaching_home_config/save', method: 'post', data });
}

/**
 * 教学会员管理
 */
export function getTeachingMemberList(params) {
  return request({ url: 'teaching_member/list', method: 'get', params });
}
export function setTeachingMember(uid, status) {
  return request({ url: `teaching_member/set/${uid}`, method: 'put', data: { is_teaching_member: status } });
}
export function setRegularMember(uid, data) {
  return request({ url: `teaching_member/set_regular/${uid}`, method: 'put', data });
}

/**
 * 分类管理
 */
export function getCategoryList(params) {
  return request({ url: 'teaching_category/list', method: 'get', params });
}
export function saveCategory(data) {
  return request({ url: 'teaching_category/save', method: 'post', data });
}
export function updateCategory(id, data) {
  return request({ url: `teaching_category/update/${id}`, method: 'put', data });
}
export function deleteCategory(id) {
  return request({ url: `teaching_category/delete/${id}`, method: 'delete' });
}

/**
 * 图片素材管理
 */
export function getImageMaterialList(params) {
  return request({ url: 'teaching_material/list', method: 'get', params });
}
export function uploadImageMaterial(data) {
  return request({ url: 'teaching_material/upload_image', method: 'post', data, file: true });
}
export function deleteImageMaterial(ids) {
  return request({ url: 'teaching_material/delete', method: 'post', data: { ids } });
}
export function renameImageMaterial(id, realName) {
  return request({ url: `teaching_material/rename/${id}`, method: 'put', data: { real_name: realName } });
}
export function moveImageMaterial(data) {
  return request({ url: 'teaching_material/move', method: 'put', data });
}

/**
 * 视频素材管理
 */
export function getVideoMaterialList(params) {
  return request({ url: 'teaching_material/video_list', method: 'get', params });
}
export function uploadVideoMaterial(data) {
  return request({ url: 'teaching_material/upload_video', method: 'post', data, file: true, timeout: 600000 });
}
export function saveCloudVideo(data) {
  return request({ url: 'teaching_material/video_save', method: 'post', data });
}
export function deleteVideoMaterial(ids) {
  return request({ url: 'teaching_material/video_delete', method: 'post', data: { ids } });
}
export function renameVideoMaterial(id, realName) {
  return request({ url: `teaching_material/video_rename/${id}`, method: 'put', data: { real_name: realName } });
}