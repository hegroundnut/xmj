const api = require('../request')

function authType(data) {
  return api.get('v2/routine/auth_type', data, { noAuth: true })
}

function authLogin(data) {
  return api.get('v2/routine/auth_login', data, { noAuth: true })
}

function routineBindingPhone(data) {
  return api.post('v2/routine/auth_binding_phone', data, { noAuth: true })
}

function phoneLogin(data) {
  return api.post('v2/routine/phone_login', data, { noAuth: true })
}

function silenceAuth(data) {
  return api.get('v2/wechat/silence_auth', data, { noAuth: true })
}

function getUserAgreement(type) {
  return api.get('get_agreement/' + type, {}, { noAuth: true })
}

module.exports = { authType, authLogin, routineBindingPhone, phoneLogin, silenceAuth, getUserAgreement }
