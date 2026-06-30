const { myApi } = require('../../utils/api/index')

Page({
  data: {
    list: [],
    loading: true,
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight })
    this.loadData()
  },

  loadData() {
    myApi.getMyBookings().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  onBack() {
    wx.navigateBack()
  }
})
