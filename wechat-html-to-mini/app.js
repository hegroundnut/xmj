const { store } = require('./store/app')

App({
  globalData: {
    token: '',
    userInfo: null,
    isLogin: false,
    isMember: false,
    _events: {}
  },

  onLaunch() {
    store.init(this)

    const updateManager = wx.getUpdateManager()
    if (wx.canIUse('getUpdateManager')) {
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已下载，是否重启应用？',
              success(res) { if (res.confirm) updateManager.applyUpdate() }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({ title: '发现新版本', content: '请删除小程序后重新搜索打开' })
          })
        }
      })
    }

    wx.getSystemInfo({ success: () => {} })

    // 防截屏/录屏
    this.applyCaptureProtection()
  },

  onShow() {
    // 热启动/切后台回来后部分机型设置会丢失，每次前台重新应用
    this.applyCaptureProtection()
  },

  // 防截屏/录屏（Android 防截图+录屏；iOS 仅防录屏且需 iOS16+ 与新基础库，截图 iOS 系统层面无法拦截）
  applyCaptureProtection() {
    if (wx.setVisualEffectOnCapture) {
      wx.setVisualEffectOnCapture({
        visualEffect: 'hidden',
        fail: (err) => console.warn('setVisualEffectOnCapture fail:', err)
      })
    }
  }
})
