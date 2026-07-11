const { myApi, momentApi, caseApi } = require('../../utils/api/index')

Page({
  data: {
    activeTab: 'all',
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
      promise = momentApi.getFavorites({ page: 1, limit: 100 }).then(res => {
        const list = ((res.data && res.data.list) || res.data || [])
        return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'moment', type_label: '帖子' }))
      })
    } else if (activeTab === 'case') {
      promise = caseApi.getCaseFavorites({ page: 1, limit: 100 }).then(res => {
        const list = ((res.data && res.data.list) || res.data || [])
        return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'case', type_label: '案例' }))
      })
    } else if (activeTab === 'course') {
      promise = myApi.getMyFavorites({ type: 'course', page: 1, limit: 100 }).then(res => {
        const list = ((res.data && res.data.list) || res.data || [])
        return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'course', type_label: '课程' }))
      })
    } else {
      // 'all' tab: merge all three types
      promise = Promise.all([
        momentApi.getFavorites({ page: 1, limit: 100 }).then(res => {
          const list = ((res.data && res.data.list) || res.data || [])
          return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'moment', type_label: '帖子' }))
        }).catch(() => []),
        caseApi.getCaseFavorites({ page: 1, limit: 100 }).then(res => {
          const list = ((res.data && res.data.list) || res.data || [])
          return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'case', type_label: '案例' }))
        }).catch(() => []),
        myApi.getMyFavorites({ type: 'course', page: 1, limit: 100 }).then(res => {
          const list = ((res.data && res.data.list) || res.data || [])
          return (Array.isArray(list) ? list : []).map(item => ({ ...item, type: 'course', type_label: '课程' }))
        }).catch(() => [])
      ]).then(([moments, cases, courses]) => {
        // 合并并去重：同一id优先保留先出现的（帖子>案例>课程）
        const merged = [...moments, ...cases, ...courses]
        const seen = {}
        const deduped = merged.filter(item => {
          const key = item.id + '_' + (item.type || '')
          if (seen[key]) return false
          seen[key] = true
          return true
        })
        return deduped
      })
    }

    promise.then(list => {
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
