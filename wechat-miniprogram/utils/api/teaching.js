const api = require('../request')

function getCourseList(params) {
  return api.get('v2/course/list', params || {})
}

function getCourseDetail(id) {
  return api.get('v2/course/detail/' + id)
}

function createCourseOrder(courseId) {
  return api.post('v2/course/create_order', { course_id: courseId })
}

function getOfflineClassList(params) {
  return api.get('v2/offline_class/list', params || {}, { noAuth: true })
}

function getOfflineClassDetail(id) {
  return api.get('v2/offline_class/detail/' + id, {}, { noAuth: true })
}

function createOfflineBooking(data) {
  return api.post('v2/offline_class/booking', data)
}

module.exports = { getCourseList, getCourseDetail, createCourseOrder, getOfflineClassList, getOfflineClassDetail, createOfflineBooking }
