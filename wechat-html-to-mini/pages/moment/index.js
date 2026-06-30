const { momentApi } = require('../../utils/api/index')

Page({
  data: {
    list: [],
    page: 1,
    limit: 10,
    hasMore: true,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    if (this.data.list.length === 0) this.loadData()
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
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },

  onLike(e) {
    const { id, index } = e.currentTarget.dataset
    const list = this.data.list
    const item = list[index]
    if (!item) return
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!this.data.isMember) return wx.showToast({ title: '仅会员可点赞', icon: 'none' })
    const prev = item.is_liked
    item.is_liked = !item.is_liked
    item.like_count += item.is_liked ? 1 : -1
    this.setData({ list })
    momentApi.toggleLike(id).catch(() => {
      item.is_liked = prev
      item.like_count += item.is_liked ? 1 : -1
      this.setData({ list })
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  onComment(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
  },

  onFavorite(e) {
    const { id, index } = e.currentTarget.dataset
    const list = this.data.list
    const item = list[index]
    if (!item) return
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!this.data.isMember) return wx.showToast({ title: '仅会员可收藏', icon: 'none' })
    const prev = item.is_favorited
    item.is_favorited = !item.is_favorited
    item.favorite_count = (item.favorite_count || 0) + (item.is_favorited ? 1 : -1)
    this.setData({ list })
    momentApi.toggleFavorite(id).catch(() => {
      item.is_favorited = prev
      item.favorite_count = (item.favorite_count || 0) + (item.is_favorited ? 1 : -1)
      this.setData({ list })
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  onShare(e) {
    const id = e.currentTarget.dataset.id
    wx.showShareMenu({ withShareTicket: true })
  },

  onContentTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
  },

  onPreviewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    if (urls && urls.length) {
      wx.previewImage({ urls, current })
    }
  },

  onPublish() {
    if (!this.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!this.data.isMember) {
      wx.showToast({ title: '仅会员可发布', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/moment/publish' })
  }
})
