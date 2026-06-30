const api = require('../request')

function getUserInfo() {
  return api.get('user/info')
}

function getMyFavorites(params) {
  return api.get('my/favorites', params)
}

function getMyCourses(params) {
  return api.get('my/courses', params)
}

function getMyBookings(params) {
  return api.get('my/bookings', params)
}

function getMyComments(params) {
  return api.get('my/comments', params)
}

function getMyPosts(params) {
  return api.get('my/posts', params)
}

function createMemberOrder(data) {
  return api.post('member/order', data)
}

function getMemberPlans() {
  return api.get('member/plans', {}, { noAuth: true })
}

function removeFavorite(id, type) {
  if (type === 'moment') return api.post('moment/favorite/' + id)
  if (type === 'case') return api.post('case/favorite/' + id)
  return api.post('my/favorite/remove', { id: id, type: type })
}

module.exports = { getUserInfo, getMyFavorites, getMyCourses, getMyBookings, getMyComments, getMyPosts, createMemberOrder, getMemberPlans, removeFavorite }
