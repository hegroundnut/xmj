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

module.exports = { getCaseList, getCaseComments, addCaseComment, toggleCaseFavorite, getCaseFavorites }
