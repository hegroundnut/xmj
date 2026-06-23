import request from '@/utils/request.js';

export function getUserInfo() {
  return request.get('v2/user/info');
}

export function getMyFavorites(params) {
  return request.get('v2/my/favorites', params);
}

export function getMyCourses(params) {
  return request.get('v2/my/courses', params);
}

export function getMyBookings(params) {
  return request.get('v2/my/bookings', params);
}

export function getMyComments(params) {
  return request.get('v2/my/comments', params);
}

export function getMyPosts(params) {
  return request.get('v2/my/posts', params);
}
