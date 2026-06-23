import request from '@/utils/request.js';

export function getCaseList(params) {
  return request.get('v2/case/list', params, { noAuth: true });
}

export function getCaseComments(caseId) {
  return request.get('v2/case_comment/list', { case_id: caseId }, { noAuth: true });
}

export function addCaseComment(data) {
  return request.post('v2/case_comment/add', data);
}

export function toggleCaseFavorite(id) {
  return request.post(`v2/case/favorite/${id}`);
}

export function getCaseFavorites(params) {
  return request.get('v2/case/favorites', params);
}
