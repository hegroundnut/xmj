const api = require('../request')

function getUserInfo() {
  return api.get('v2/user/info')
}

module.exports = { getUserInfo }
