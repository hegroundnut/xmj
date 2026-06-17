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
export function getProductInfo() {
  return request({ url: 'teaching_product/info', method: 'get' });
}
export function saveProductInfo(data) {
  return request({ url: 'teaching_product/save', method: 'post', data });
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
 * 用户会员管理
 */
export function setTeachingMember(uid, status) {
  return request({ url: `user/set_teaching_member/${uid}`, method: 'put', params: { is_teaching_member: status } });
}