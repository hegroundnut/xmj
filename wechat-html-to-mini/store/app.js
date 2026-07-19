const KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo'
}

const EVENTS = {
  LOGIN: 'app:login',
  LOGOUT: 'app:logout',
  USER_UPDATE: 'app:userUpdate',
  MEMBER_CHANGE: 'app:memberChange'
}

const store = {
  KEYS,
  EVENTS,

  // 统一判定：是否会员（单一真相来源，所有页面读这个值，不要各自算）
  // 用 == 而非 === 兼容后端可能返回字符串 "1" 而非数字 1
  computeIsMember(info) {
    if (!info) return false
    const now = Math.floor(Date.now() / 1000)
    return !!(info.is_member == 1 || info.is_teaching_member == 1 || (info.overdue_time && info.overdue_time > now))
  },

  // 统一判定：是否超级会员
  computeIsSuperMember(info) {
    return !!(info && info.is_teaching_member == 1)
  },

  init(app) {
    app = app || getApp()
    app.globalData.token = wx.getStorageSync(KEYS.TOKEN) || ''
    app.globalData.userInfo = wx.getStorageSync(KEYS.USER_INFO) || null
    app.globalData.isLogin = !!app.globalData.token
    app.globalData.isMember = this.computeIsMember(app.globalData.userInfo)
  },

  getToken() { return getApp().globalData.token },
  setToken(token) {
    const app = getApp()
    app.globalData.token = token
    app.globalData.isLogin = true
    wx.setStorageSync(KEYS.TOKEN, token)
  },
  clearToken() {
    const app = getApp()
    app.globalData.token = ''
    app.globalData.isLogin = false
    app.globalData.userInfo = null
    app.globalData.isMember = false
    wx.removeStorageSync(KEYS.TOKEN)
    wx.removeStorageSync(KEYS.USER_INFO)
  },

  getUserInfo() { return getApp().globalData.userInfo },
  setUserInfo(info) {
    const app = getApp()
    app.globalData.userInfo = info
    app.globalData.isMember = this.computeIsMember(info)
    wx.setStorageSync(KEYS.USER_INFO, info)
  },

  emit(event, data) {
    const app = getApp()
    app.globalData._events = app.globalData._events || {}
    const cbs = app.globalData._events[event] || []
    cbs.forEach(cb => cb(data))
  },
  on(event, cb) {
    const app = getApp()
    app.globalData._events = app.globalData._events || {}
    if (!app.globalData._events[event]) app.globalData._events[event] = []
    app.globalData._events[event].push(cb)
  },
  off(event, cb) {
    const app = getApp()
    const list = app.globalData._events && app.globalData._events[event]
    if (list) {
      const idx = list.indexOf(cb)
      if (idx > -1) list.splice(idx, 1)
    }
  }
}

module.exports = { store }
