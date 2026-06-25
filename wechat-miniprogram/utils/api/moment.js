const api = require('../request')

function getMomentList(params) {
  return api.get('moment/list', params, { noAuth: true })
}

function getMomentDetail(id) {
  return api.get('moment/detail/' + id, {}, { noAuth: true })
}

function createMoment(data) {
  return api.post('moment/create', data)
}

function deleteMoment(id) {
  return api.post('moment/delete/' + id)
}

function toggleLike(id) {
  return api.post('moment/like/' + id)
}

function toggleFavorite(id) {
  return api.post('moment/favorite/' + id)
}

function getFavorites(params) {
  return api.get('moment/favorites', params)
}

function createComment(data) {
  return api.post('moment/comment', data)
}

function deleteComment(id) {
  return api.post('moment/comment/delete/' + id)
}

function shareMoment(id) {
  return api.post('moment/share/' + id)
}

module.exports = {
  getMomentList, getMomentDetail, createMoment, deleteMoment,
  toggleLike, toggleFavorite, getFavorites,
  createComment, deleteComment, shareMoment
}
