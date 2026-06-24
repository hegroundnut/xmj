const { myApi } = require('../../utils/api/index')

Page({
  data: { activeTab: 'moment', list: [], loading: true },
  onLoad() { this.loadData() },
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    this.loadData()
  },
  loadData() {
    this.setData({ loading: true })
    myApi.getMyFavorites({ type: this.data.activeTab }).then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) {
    const { id, type } = e.currentTarget.dataset
    if (type === 'moment') wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
    else wx.switchTab({ url: '/pages/case/index' })
  }
})
