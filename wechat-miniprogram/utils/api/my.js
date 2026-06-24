const api = require('../request')

function getUserInfo() {
  return api.get('v2/user/info')
}

function getMyFavorites(params) {
  return api.get('v2/my/favorites', params)
}

function getMyCourses(params) {
  return api.get('v2/my/courses', params)
}

function getMyBookings(params) {
  return api.get('v2/my/bookings', params)
}

function getMyComments(params) {
  return api.get('v2/my/comments', params)
}

function getMyPosts(params) {
  return api.get('v2/my/posts', params)
}

module.exports = { getUserInfo, getMyFavorites, getMyCourses, getMyBookings, getMyComments, getMyPosts }
