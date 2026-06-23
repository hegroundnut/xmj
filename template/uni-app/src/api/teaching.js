import request from '@/utils/request.js';

export function getHomeConfig() {
  return request.get('v2/home/config', {}, { noAuth: true });
}

export function getProductInfo() {
  return request.get('v2/product/info', {}, { noAuth: true });
}

export function getCourseList(params) {
  return request.get('v2/course/list', params || {});
}

export function getCourseDetail(id) {
  return request.get(`v2/course/detail/${id}`, {});
}

export function createCourseOrder(courseId) {
  return request.post('v2/course/create_order', { course_id: courseId });
}

export function getOfflineClassList(params) {
  return request.get('v2/offline_class/list', params || {}, { noAuth: true });
}

export function getOfflineClassDetail(id) {
  return request.get(`v2/offline_class/detail/${id}`, {}, { noAuth: true });
}

export function createOfflineBooking(data) {
  return request.post('v2/offline_class/booking', data);
}
