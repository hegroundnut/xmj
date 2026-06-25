const api = require('../request')

function getHomeConfig() {
  return api.get('home/config', {}, { noAuth: true })
}

function getProductInfo() {
  return api.get('product/info', {}, { noAuth: true })
}

module.exports = { getHomeConfig, getProductInfo }
