const { store } = require('../store/app')
const { authType, authLogin, routineBindingPhone } = require('./api/public')

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (!res.code) return reject({ msg: 'wx.login 失败' })

        // Step 1: get auth key
        authType({ code: res.code, spread_spid: 0, spread_code: 0 }).then(typeData => {
          const key = typeData.data && typeData.data.key
          if (!key) return reject({ msg: '获取授权key失败' })

          // Step 2: login with key
          authLogin({ key }).then(data => {
            const result = data.data
            if (result.token) {
              store.setToken(result.token)
              if (result.userInfo) store.setUserInfo(result.userInfo)
              resolve({ isBindPhone: result.isBindPhone !== false, token: result.token, userInfo: result.userInfo, authKey: key })
            } else {
              reject({ msg: '登录失败，未获取到token' })
            }
          }).catch(reject)
        }).catch(reject)
      },
      fail: reject
    })
  })
}

function bindPhone(phoneCode, authKey) {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (!res.code) return reject({ msg: 'wx.login 失败' })
        routineBindingPhone({
          code: res.code,
          encryptedData: phoneCode,
          iv: '',
          key: authKey || '',
          spread_spid: 0,
          spread_code: 0
        }).then(data => {
          const result = data.data
          if (result.token) store.setToken(result.token)
          if (result.userInfo) store.setUserInfo(result.userInfo)
          store.emit(store.EVENTS.LOGIN)
          resolve(result)
        }).catch(reject)
      },
      fail: reject
    })
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
