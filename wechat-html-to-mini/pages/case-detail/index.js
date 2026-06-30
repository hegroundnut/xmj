const { caseApi } = require('../../utils/api/index')

Page({
  data: {
    caseId: '',
    caseData: null,
    comments: [],
    commentText: '',
    replyTo: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    if (options.id) {
      this.setData({ caseId: options.id })
      this.loadData(options.id)
    }
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    Promise.all([
      caseApi.getCaseDetail(id),
      caseApi.getCaseComments(id)
    ]).then(([detailRes, commentsRes]) => {
      this.setData({
        caseData: detailRes.data || null,
        comments: (commentsRes.data && commentsRes.data.list) || [],
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onLike() {
    const caseData = this.data.caseData
    caseApi.toggleCaseFavorite(caseData.id).then(res => {
      caseData.is_liked = (res.data && res.data.action) === 'liked'
      this.setData({ caseData })
    })
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  onReply(e) {
    this.setData({
      replyTo: { parentId: e.detail.parentId },
      commentText: '@' + (e.detail.nickname || '') + ' '
    })
  },

  onSendComment() {
    const { caseId, commentText, replyTo, isLogin, isMember } = this.data
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!isMember) return wx.showToast({ title: '仅会员可评论', icon: 'none' })

    const data = { case_id: caseId, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId

    caseApi.addCaseComment(data).then(() => {
      this.setData({ commentText: '', replyTo: null })
      this.loadData(caseId)
    }).catch(err => {
      wx.showToast({ title: err.msg || '评论失败', icon: 'none' })
    })
  },

  onConsult() {
    wx.showToast({ title: '请联系客服咨询', icon: 'none' })
  },

  onGoLogin() {
    wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
  },

  onPreviewImage(e) {
    const { url, urls } = e.currentTarget.dataset
    wx.previewImage({ current: url, urls: urls || [url] })
  }
})
