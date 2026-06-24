const api = require('../request')

function getMomentList(params) {
  return api.get('v2/moment/list', params, { noAuth: true })
}

function getMomentDetail(id) {
  return api.get('v2/moment/detail/' + id, {}, { noAuth: true })
}

function createMoment(data) {
  return api.post('v2/moment/create', data)
}

function deleteMoment(id) {
  return api.post('v2/moment/delete/' + id)
}

function toggleLike(id) {
  return api.post('v2/moment/like/' + id)
}

function toggleFavorite(id) {
  return api.post('v2/moment/favorite/' + id)
}

function getFavorites(params) {
  return api.get('v2/moment/favorites', params)
}

function createComment(data) {
  return api.post('v2/moment/comment', data)
}

function deleteComment(id) {
  return api.post('v2/moment/comment/delete/' + id)
}

function shareMoment(id) {
  return api.post('v2/moment/share/' + id)
}

module.exports = {
  getMomentList, getMomentDetail, createMoment, deleteMoment,
  toggleLike, toggleFavorite, getFavorites,
  createComment, deleteComment, shareMoment
}
