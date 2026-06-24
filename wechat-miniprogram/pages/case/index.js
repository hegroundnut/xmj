const { caseApi } = require('../../utils/api/index')

Page({
  data: { activeType: 0, list: [], page: 1, limit: 10, hasMore: true, loading: true, error: false },
  onLoad() { this.loadData() },
  onPullDownRefresh() { this.setData({ page: 1, list: [], hasMore: true }); this.loadData().finally(() => wx.stopPullDownRefresh()) },
  loadData() {
    this.setData({ loading: true, error: false })
    const { activeType, page, limit } = this.data
    return caseApi.getCaseList({ type: activeType, page, limit }).then(res => {
      const newList = (res.data && res.data.list) || []
      this.setData({
        list: page === 1 ? newList : [...this.data.list, ...newList],
        hasMore: newList.length >= limit,
        loading: false
      })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onTabChange(e) {
    const type = parseInt(e.currentTarget.dataset.type)
    if (type === this.data.activeType) return
    this.setData({ activeType: type, page: 1, list: [], hasMore: true })
    this.loadData()
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },
  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    // Navigate to case detail or preview
  }
})
