const api = require('../request')

function authType(data) {
  return api.get('routine/auth_type', data, { noAuth: true })
}

function authLogin(data) {
  return api.get('routine/auth_login', data, { noAuth: true })
}

function routineBindingPhone(data) {
  return api.post('routine/auth_binding_phone', data, { noAuth: true })
}

function phoneLogin(data) {
  return api.post('routine/phone_login', data, { noAuth: true })
}

function silenceAuth(data) {
  return api.get('wechat/silence_auth', data, { noAuth: true })
}

function getUserAgreement(type) {
  return api.get('get_agreement/' + type, {}, { noAuth: true })
}

function getProductCategories() {
  return api.get('category/product', {}, { noAuth: true })
}

function getProductList(params) {
  return api.get('product/list', params || {}, { noAuth: true })
}

function getProductDetail(id) {
  return api.get('product/info', {}, { noAuth: true })
}

module.exports = { authType, authLogin, routineBindingPhone, phoneLogin, silenceAuth, getUserAgreement, getProductCategories, getProductList, getProductDetail }
