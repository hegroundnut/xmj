const { momentApi } = require('../../../utils/api/index')
const { store } = require('../../../store/app')

Page({
  data: { list: [], page: 1, limit: 10, hasMore: true, loading: false, error: false, isMember: false },
  onLoad() { this.setData({ isMember: getApp().globalData.isMember }) },
  onShow() {
    if (this.data.list.length === 0) this.loadData()
    this.setData({ isMember: getApp().globalData.isMember })
  },
  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true })
    this.loadData().finally(() => wx.stopPullDownRefresh())
  },
  loadData() {
    this.setData({ loading: true, error: false })
    return momentApi.getMomentList({ page: this.data.page, limit: this.data.limit }).then(res => {
      const newList = (res.data && res.data.list) || []
      this.setData({
        list: this.data.page === 1 ? newList : [...this.data.list, ...newList],
        hasMore: newList.length >= this.data.limit,
        loading: false
      })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },
  onLike(e) {
    const { id, index } = e.currentTarget.dataset
    momentApi.toggleLike(id).then(res => {
      const action = res.data && res.data.action
      const list = this.data.list
      list[index].is_liked = action === 'liked'
      list[index].like_count += action === 'liked' ? 1 : -1
      this.setData({ list })
    })
  },
  onFavorite(e) {
    const { id, index } = e.currentTarget.dataset
    momentApi.toggleFavorite(id).then(res => {
      const action = res.data && res.data.action
      const list = this.data.list
      list[index].is_favorited = action === 'favorited'
      this.setData({ list })
    })
  },
  onComment(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
  },
  onShare(e) {
    const { id } = e.currentTarget.dataset
    momentApi.shareMoment(id).then(() => wx.showToast({ title: '已分享', icon: 'success' }))
  },
  onPublish() {
    if (!getApp().globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url: '/pages/moment/publish' })
  }
})
