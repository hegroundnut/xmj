const { myApi } = require('../../utils/api/index')
const { store } = require('../../store/app')
const { logout } = require('../../utils/auth')

Page({
  data: {
    userInfo: {},
    isLogin: false,
    isMember: false,
    isSuperMember: false,
    memberType: 'none',
    loading: true,
    showQR: false,
    qrCode: '',
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ statusBarHeight: sys.statusBarHeight, navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight) })
    this.loadQrCode()
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) {
        this.setData({ qrCode })
        console.log('[my] qrCode loaded:', qrCode)
      }
    }).catch(err => {
      console.error('[my] loadQrCode failed:', err)
    })
  },

  onShow() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      userInfo: app.globalData.userInfo || {}
    })
    if (app.globalData.isLogin) {
      myApi.getUserInfo().then(res => {
        const info = res.data
        if (info) {
          store.setUserInfo(info)
          // 会员判定统一读 store 的单一来源，不做页面级重复计算
          // member_type 以后端返回为准，不覆盖计算
          const memberType = info.member_type || 'none'
          this.setData({
            userInfo: info,
            isMember: app.globalData.isMember,
            isSuperMember: store.computeIsSuperMember(info),
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

  onNavAbout() {
    wx.navigateTo({ url: '/subpackages/users/privacy/index?type=about' })
  },

  onEditProfile() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url: '/pages/my/edit' })
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
          this.setData({ isLogin: false, isMember: false, isSuperMember: false, memberType: 'none', userInfo: {} })
        }
      }
    })
  },

  onOpenQR() {
    this.setData({ showQR: true })
    if (!this.data.qrCode) {
      this.loadQrCode()
    }
  },

  onCloseQR() {
    this.setData({ showQR: false })
  },

  onSaveQR() {
    const qrCode = this.data.qrCode
    if (!qrCode) return
    wx.showLoading({ title: '保存中...' })
    wx.getImageInfo({
      src: qrCode,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => { wx.hideLoading(); wx.showToast({ title: '已保存到相册' }) },
          fail: () => { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'none' }) }
        })
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '下载失败', icon: 'none' }) }
    })
  }
})
