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
    store.init()

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
  }
})
