const { momentApi } = require('../../utils/api/index')

Page({
  data: {
    moment: null,
    commentText: '',
    replyTo: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false,
    statusBarHeight: 20,
    showMoreComments: false,
    showEmptyComments: true
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      statusBarHeight: sys.statusBarHeight
    })
    if (options.id) this.loadData(options.id)
  },

  onShow() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember
    })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    momentApi.getMomentDetail(id).then(res => {
      const data = res.data || null
      if (data && !data.comments) data.comments = []
      const len = data && data.comments ? data.comments.length : 0
      this.setData({
        moment: data,
        loading: false,
        showMoreComments: len > 3,
        showEmptyComments: len === 0
      })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onBack() {
    wx.navigateBack()
  },

  onLike() {
    const moment = this.data.moment
    if (!moment) return
    momentApi.toggleLike(moment.id).then(res => {
      const action = res.data && res.data.action
      moment.is_liked = action === 'liked'
      moment.like_count = (moment.like_count || 0) + (action === 'liked' ? 1 : -1)
      this.setData({ moment })
    })
  },

  onToggleLike() {
    this.onLike()
  },

  onReply(e) {
    const { parentId, nickname } = e.currentTarget.dataset
    this.setData({
      replyTo: { parentId, nickname },
      commentText: '@' + (nickname || '') + ' '
    })
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  onSendComment() {
    const { moment, commentText, replyTo, isLogin, isMember } = this.data
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!isMember) return wx.showToast({ title: '仅会员可评论', icon: 'none' })

    const data = { moment_id: moment.id, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId

    momentApi.createComment(data).then(() => {
      this.setData({ commentText: '', replyTo: null })
      this.loadData(moment.id)
    }).catch(err => {
      wx.showToast({ title: err.msg || '评论失败', icon: 'none' })
    })
  },

  onPreviewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    wx.previewImage({ urls, current })
  },

  onGoLogin() {
    wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
  },

  onGoTeaching() {
    wx.switchTab({ url: '/pages/teaching/index' })
  }
})
