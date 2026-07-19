const { myApi, momentApi } = require('../../utils/api/index')

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
    myApi.getMyPosts().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
  },

  // 案例式：点击图片用系统全屏预览
  onPreviewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    if (urls && urls.length) {
      wx.previewImage({ urls, current: current || urls[0] })
    }
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定删除这条帖子？',
      success: res => {
        if (res.confirm) {
          momentApi.deleteMoment(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadData()
          })
        }
      }
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
