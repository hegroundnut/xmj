const api = require('../request')

function getHomeConfig() {
  return api.get('v2/home/config', {}, { noAuth: true })
}

function getProductInfo() {
  return api.get('v2/product/info', {}, { noAuth: true })
}

module.exports = { getHomeConfig, getProductInfo }
