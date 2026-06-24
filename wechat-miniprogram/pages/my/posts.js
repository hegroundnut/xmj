const { myApi, momentApi } = require('../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyPosts().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) {
    wx.navigateTo({ url: '/pages/moment/detail?id=' + e.currentTarget.dataset.id })
  },
  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除帖子', content: '确定删除？',
      success: res => {
        if (res.confirm) {
          momentApi.deleteMoment(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadData()
          })
        }
      }
    })
  }
})