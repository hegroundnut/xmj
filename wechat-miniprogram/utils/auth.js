const { store } = require('../store/app')
const { authLogin, routineBindingPhone } = require('./api/public')

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          authLogin({ code: res.code }).then(data => {
            const result = data.data
            if (result.token) {
              store.setToken(result.token)
              if (result.userInfo) {
                store.setUserInfo(result.userInfo)
              }
              resolve({ isBindPhone: result.isBindPhone !== false, token: result.token, userInfo: result.userInfo })
            } else {
              reject({ msg: '登录失败，未获取到token' })
            }
          }).catch(reject)
        } else {
          reject({ msg: 'wx.login 失败' })
        }
      },
      fail: reject
    })
  })
}

function bindPhone(phoneCode) {
  return new Promise((resolve, reject) => {
    routineBindingPhone({ code: phoneCode }).then(data => {
      const result = data.data
      if (result.token) {
        store.setToken(result.token)
      }
      if (result.userInfo) {
        store.setUserInfo(result.userInfo)
      }
      store.emit(store.EVENTS.LOGIN)
      resolve(result)
    }).catch(reject)
  })
}

function checkLogin() {
  return !!store.getToken()
}

function logout() {
  store.clearToken()
  store.emit(store.EVENTS.LOGOUT)
}

module.exports = { wxLogin, bindPhone, checkLogin, logout }
