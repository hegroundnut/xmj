const api = require('../request')

function getUserInfo() {
  return api.get('user/info')
}

function updateUserInfo(data) {
  return api.post('user/update', data)
}

function uploadImage(filePath) {
  return api.upload('upload/image', filePath)
}

module.exports = { getUserInfo, updateUserInfo, uploadImage }
