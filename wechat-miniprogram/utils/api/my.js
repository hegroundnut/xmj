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

module.exports = { getUserInfo, getMyFavorites, getMyCourses, getMyBookings, getMyComments, getMyPosts }
