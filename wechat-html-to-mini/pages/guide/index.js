Page({
  data: {
    bgImage: '/static/images/splash_bg.png',
    currentTime: '',
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    this.setData({
      statusBarHeight: sys.statusBarHeight,
      currentTime: `${h}:${m < 10 ? '0' + m : m}`
    })
  },

  onEnter() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
