const { myApi, momentApi, caseApi } = require('../../utils/api/index')

Page({
  data: {
    activeTab: 'all',
    list: [],
    loading: true,
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight })
    this.loadData()
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true })
    const { activeTab } = this.data
    let promise

    if (activeTab === 'moment') {
      promise = momentApi.getFavorites({ page: 1, limit: 100 })
    } else if (activeTab === 'case') {
      promise = caseApi.getCaseFavorites({ page: 1, limit: 100 })
    } else {
      promise = myApi.getMyFavorites({ type: activeTab, page: 1, limit: 100 })
    }

    promise.then(res => {
      let list = (res.data && res.data.list) || res.data || []
      if (!Array.isArray(list)) list = []
      list = list.map(item => ({
        ...item,
        type_label: activeTab === 'moment' ? '帖子' : activeTab === 'case' ? '案例' : activeTab === 'course' ? '课程' : (item.type_label || '')
      }))
      this.setData({ list, loading: false })
    }).catch(() => this.setData({ loading: false }))
  },

  onTap(e) {
    const { id, type } = e.currentTarget.dataset
    const t = type || this.data.activeTab
    if (t === 'moment') wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
    else if (t === 'case') wx.navigateTo({ url: '/pages/case-detail/index?id=' + id })
    else if (t === 'course') wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onUnsave(e) {
    const { id, type } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确定取消收藏？',
      success: res => {
        if (res.confirm) {
          myApi.removeFavorite(id, type).then(() => {
            wx.showToast({ title: '已取消', icon: 'none' })
            this.loadData()
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
