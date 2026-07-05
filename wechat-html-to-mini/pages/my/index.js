const { myApi } = require('../../utils/api/index')
const { store } = require('../../store/app')
const { logout } = require('../../utils/auth')

Page({
  data: {
    userInfo: null,
    isLogin: false,
    isMember: false,
    isSuperMember: false,
    memberType: 'none',
    loading: true,
    showQR: false,
    qrCode: '',
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight })
    this.loadQrCode()
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) this.setData({ qrCode })
    }).catch(() => {})
  },

  onShow() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      userInfo: app.globalData.userInfo || null
    })
    if (app.globalData.isLogin) {
      myApi.getUserInfo().then(res => {
        const info = res.data
        if (info) {
          store.setUserInfo(info)
          const memberType = info.member_type || (info.is_teaching_member === 1 ? 'super' : (info.is_member === 1 ? 'regular' : 'none'))
          this.setData({
            userInfo: info,
            isMember: info.is_member === 1,
            isSuperMember: info.is_teaching_member === 1,
            memberType: memberType
          })
        }
      }).finally(() => this.setData({ loading: false }))
    } else {
      this.setData({ loading: false })
    }
  },

  onOpenMember() {
    wx.navigateTo({ url: '/pages/member/index' })
  },

  onEditProfile() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.showToast({ title: '编辑资料', icon: 'none' })
  },

  onNav(e) {
    const url = e.currentTarget.dataset.url
    if (!url) return
    if (!getApp().globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url })
  },

  onGoLogin() {
    wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: res => {
        if (res.confirm) {
          logout()
          this.setData({ isLogin: false, isMember: false, isSuperMember: false, memberType: 'none', userInfo: null })
        }
      }
    })
  },

  onOpenQR() {
    this.setData({ showQR: true })
  },

  onCloseQR() {
    this.setData({ showQR: false })
  }
})
