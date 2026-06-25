const api = require('../request')

function getUserInfo() {
  return api.get('user/info')
}

module.exports = { getUserInfo }
