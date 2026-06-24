const { myApi } = require('../../utils/api/index')
const { store } = require('../../store/app')
const { logout } = require('../../utils/auth')

Page({
  data: { userInfo: null, isLogin: false, isMember: false, loading: true },
  onShow() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      userInfo: app.globalData.userInfo || {}
    })
    if (app.globalData.isLogin && !app.globalData.userInfo) {
      myApi.getUserInfo().then(res => {
        const info = res.data
        if (info) {
          store.setUserInfo(info)
          this.setData({ userInfo: info, isMember: info.is_teaching_member === 1 })
        }
      }).finally(() => this.setData({ loading: false }))
    } else {
      this.setData({ loading: false })
    }
    store.on(store.EVENTS.LOGIN, this.refresh)
  },
  onHide() { store.off(store.EVENTS.LOGIN, this.refresh) },
  refresh() {
    const app = getApp()
    this.setData({ isLogin: true, isMember: app.globalData.isMember, userInfo: app.globalData.userInfo })
  },
  onNav(e) {
    const url = e.currentTarget.dataset.url
    if (!getApp().globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url })
  },
  onLogout() {
    wx.showModal({
      title: '提示', content: '确定退出登录？',
      success: res => {
        if (res.confirm) {
          logout()
          this.setData({ isLogin: false, isMember: false, userInfo: null })
        }
      }
    })
  }
})
