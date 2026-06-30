const { momentApi } = require('../../utils/api/index')

Page({
  data: { moment: null, commentText: '', replyTo: null, loading: true, error: false, isLogin: false, isMember: false },
  onLoad(options) {
    var app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    console.log('detail onLoad options.id:', options.id, 'type:', typeof options.id)
    if (options.id) this.loadData(options.id)
  },
  onShow() {
    var app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },
  loadData(id) {
    var self = this
    console.log('loadData called with id:', id, 'type:', typeof id)
    self.setData({ loading: true, error: false })
    momentApi.getMomentDetail(id).then(function(res) {
      console.log('getMomentDetail success, res:', JSON.stringify(res))
      var moment = res.data
      if (!moment && res.msg && typeof res.msg === 'string' && res.msg.charAt(0) === '{') {
        moment = JSON.parse(res.msg)
      }
      moment = moment || null
      console.log('moment data:', JSON.stringify(moment))
      if (moment && !moment.comments) moment.comments = []
      self.setData({ moment: moment, loading: false })
    }).catch(function(err) {
      console.log('getMomentDetail error:', JSON.stringify(err))
      self.setData({ loading: false, error: true })
    })
  },
  onLike() {
    var self = this
    var moment = self.data.moment
    momentApi.toggleLike(moment.id).then(function(res) {
      var action = res.data && res.data.action
      moment.is_liked = action === 'liked'
      moment.like_count += action === 'liked' ? 1 : -1
      self.setData({ moment: moment })
    })
  },
  onFavorite() {
    var self = this
    var moment = self.data.moment
    momentApi.toggleFavorite(moment.id).then(function(res) {
      moment.is_favorited = (res.data && res.data.action) === 'favorited'
      self.setData({ moment: moment })
    })
  },
  onReply(e) {
    this.setData({ replyTo: { parentId: e.detail.parentId }, commentText: '@' + (e.detail.nickname || '') + ' ' })
  },
  onDeleteComment(e) {
    var self = this
    wx.showModal({
      title: '删除评论', content: '确定删除？',
      success: function(res) {
        if (res.confirm) {
          momentApi.deleteComment(e.detail.id).then(function() {
            self.loadData(self.data.moment.id)
          })
        }
      }
    })
  },
  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },
  onSendComment() {
    var self = this
    var moment = self.data.moment
    var commentText = self.data.commentText
    var replyTo = self.data.replyTo
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    if (!self.data.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!self.data.isMember) return wx.showToast({ title: '仅会员可评论', icon: 'none' })
    var data = { moment_id: moment.id, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId
    momentApi.createComment(data).then(function() {
      self.setData({ commentText: '', replyTo: null })
      self.loadData(moment.id)
    }).catch(function(err) {
      wx.showToast({ title: err.msg || '评论失败', icon: 'none' })
    })
  },
  onGoLogin() {
    wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
  },
  onGoTeaching() {
    wx.switchTab({ url: '/pages/teaching/index' })
  }
})
