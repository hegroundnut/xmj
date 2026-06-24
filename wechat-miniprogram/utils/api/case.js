const api = require('../request')

function getCaseList(params) {
  return api.get('v2/case/list', params || {}, { noAuth: true })
}

function getCaseComments(caseId) {
  return api.get('v2/case_comment/list', { case_id: caseId }, { noAuth: true })
}

function addCaseComment(data) {
  return api.post('v2/case_comment/add', data)
}

function toggleCaseFavorite(id) {
  return api.post('v2/case/favorite/' + id)
}

function getCaseFavorites(params) {
  return api.get('v2/case/favorites', params)
}

module.exports = { getCaseList, getCaseComments, addCaseComment, toggleCaseFavorite, getCaseFavorites }
