const { myApi } = require('../../utils/api/index')

Page({
  data: {
    list: [],
    loading: true,
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ statusBarHeight: sys.statusBarHeight, navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight) })
    this.loadData()
  },

  loadData() {
    myApi.getMyFavorites({ type: 'course', page: 1, limit: 100 }).then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onBack() {
    wx.navigateBack()
  }
})
