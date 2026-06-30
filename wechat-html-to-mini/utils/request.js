const { API_BASE_URL } = require('./config')
const { store } = require('../store/app')

function request(url, method, data, opts) {
  const { noAuth, noVerify } = opts || {}
  const app = getApp()

  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' }

    const token = store.getToken()
    if (token) {
      header['Authori-zation'] = 'Bearer ' + token
    }

    if (!noAuth && !token) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return reject({ msg: '未登录' })
    }

    wx.request({
      url: API_BASE_URL + '/' + url,
      method: method || 'GET',
      header: header,
      data: data || {},
      timeout: 15000,
      success(res) {
        if (noVerify) return resolve(res.data)
        if (res.statusCode === 200 && res.data && res.data.status === 200) {
          return resolve(res.data)
        }
        if (res.data && res.data.status === 401) {
          store.clearToken()
          wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
          return reject(res.data)
        }
        reject(res.data || res)
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

const api = {}
;['get', 'post', 'put', 'delete'].forEach(method => {
  api[method] = function (url, data, opts) {
    return request(url, method.toUpperCase(), data, opts)
  }
})

module.exports = api
