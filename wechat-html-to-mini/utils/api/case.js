const api = require('../request')

function getCaseList(params) {
  return api.get('case/list', params || {}, { noAuth: true })
}

function getCaseComments(caseId) {
  return api.get('case_comment/list', { case_id: caseId }, { noAuth: true })
}

function addCaseComment(data) {
  return api.post('case_comment/add', data)
}

function toggleCaseFavorite(id) {
  return api.post('case/favorite/' + id)
}

function getCaseFavorites(params) {
  return api.get('case/favorites', params)
}

function getCaseDetail(id) {
  return api.get('case/detail/' + id, {}, { noAuth: true })
}

module.exports = { getCaseList, getCaseDetail, getCaseComments, addCaseComment, toggleCaseFavorite, getCaseFavorites }
