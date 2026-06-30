const { caseApi } = require('../../utils/api/index')

Page({
  data: {
    caseId: '',
    type: 1,        // 1=图片 2=视频
    caseData: null,
    comments: [],
    commentText: '',
    replyTo: null,
    liked: false,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    if (options.id) {
      this.setData({ caseId: options.id, type: parseInt(options.type) || 1 })
      this.loadData(options.id)
    }
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    const app = getApp()
    const caseList = (app.globalData.caseList) || []
    let caseData = caseList.find(c => c.id == id) || null

    const resolveComments = () => {
      caseApi.getCaseComments(id).then(commentsRes => {
        const comments = (commentsRes.data && commentsRes.data.list) || []
        this.setData({ caseData, comments, liked: !!(caseData && caseData.is_liked), loading: false })
      }).catch(() => {
        this.setData({ caseData, comments: [], liked: false, loading: false })
      })
    }

    if (caseData) {
      caseData.images = caseData.images || (caseData.cover ? [caseData.cover] : [])
      caseData.tags = caseData.tags || (caseData.category_name ? [caseData.category_name] : [])
      resolveComments()
    } else {
      caseApi.getCaseList({ type: 0, page: 1, limit: 100 }).then(res => {
        const list = (res.data && res.data.list) || []
        getApp().globalData.caseList = list
        caseData = list.find(c => c.id == id) || null
        if (caseData) {
          caseData.images = [caseData.cover || caseData.media_url].filter(Boolean)
          caseData.tags = caseData.category_name ? [caseData.category_name] : []
        }
        resolveComments()
      }).catch(() => {
        this.setData({ loading: false, error: true })
      })
    }
  },

  onBack() { wx.navigateBack() },

  onToggleLike() {
    if (!this.data.isLogin) return wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
    const caseData = this.data.caseData
    caseApi.toggleCaseFavorite(caseData.id).then(res => {
      const action = (res.data && res.data.action)
      this.setData({ liked: action === 'liked' })
    })
  },

  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },

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

  onConsult() { wx.showToast({ title: '请联系客服咨询', icon: 'none' }) },

  onGoLogin() { wx.navigateTo({ url: '/subpackages/users/wechat_login/index' }) },

  onPreviewImage(e) {
    const { url, urls } = e.currentTarget.dataset
    const list = urls ? JSON.parse(urls) : [url]
    wx.previewImage({ current: url, urls: list })
  }
})
