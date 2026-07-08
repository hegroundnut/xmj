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

function uploadFile(url, filePath, name) {
  return new Promise((resolve, reject) => {
    const token = store.getToken()
    if (!token) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return reject({ msg: '未登录' })
    }
    // 部分服务器/代理会在 multipart 上传请求中丢弃自定义鉴权头，
    // 同时通过 header 和 query 参数携带 token，双保险避免误报“登录已过期”
    const sep = url.indexOf('?') === -1 ? '?' : '&'
    wx.uploadFile({
      url: API_BASE_URL + '/' + url + sep + 'token=' + encodeURIComponent(token),
      filePath: filePath,
      name: name || 'file',
      header: { 'Authori-zation': 'Bearer ' + token },
      success(res) {
        let data = res.data
        try { data = JSON.parse(res.data) } catch (e) {}
        if (res.statusCode === 200 && data && data.status === 200) {
          return resolve(data)
        }
        reject(data || res)
      },
      fail(err) {
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
api.upload = uploadFile

module.exports = api
