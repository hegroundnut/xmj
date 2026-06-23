// 朋友圈 API
import request from '@/utils/request.js';

export function getMomentList(params) {
  return request.get('v2/moment/list', params, { noAuth: true });
}

export function getMomentDetail(id) {
  return request.get(`v2/moment/detail/${id}`, {}, { noAuth: true });
}

export function createMoment(data) {
  return request.post('v2/moment/create', data);
}

export function deleteMoment(id) {
  return request.post(`v2/moment/delete/${id}`);
}

export function toggleLike(id) {
  return request.post(`v2/moment/like/${id}`);
}

export function toggleFavorite(id) {
  return request.post(`v2/moment/favorite/${id}`);
}

export function getFavorites(params) {
  return request.get('v2/moment/favorites', params);
}

export function createComment(data) {
  return request.post('v2/moment/comment', data);
}

export function deleteComment(id) {
  return request.post(`v2/moment/comment/delete/${id}`);
}

export function shareMoment(id) {
  return request.post(`v2/moment/share/${id}`);
}
