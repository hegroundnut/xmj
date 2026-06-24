const { momentApi } = require('../../utils/api/index')

Page({
  data: { moment: null, commentText: '', replyTo: null, loading: true, error: false },
  onLoad(options) {
    if (options.id) this.loadData(options.id)
  },
  loadData(id) {
    this.setData({ loading: true, error: false })
    momentApi.getMomentDetail(id).then(res => {
      this.setData({ moment: res.data, loading: false })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onLike() {
    const { moment } = this.data
    momentApi.toggleLike(moment.id).then(res => {
      const action = res.data && res.data.action
      moment.is_liked = action === 'liked'
      moment.like_count += action === 'liked' ? 1 : -1
      this.setData({ moment })
    })
  },
  onFavorite() {
    const { moment } = this.data
    momentApi.toggleFavorite(moment.id).then(res => {
      moment.is_favorited = (res.data && res.data.action) === 'favorited'
      this.setData({ moment })
    })
  },
  onShare() {
    momentApi.shareMoment(this.data.moment.id).then(() => wx.showToast({ title: '分享成功', icon: 'success' }))
  },
  onReply(e) {
    this.setData({ replyTo: { parentId: e.detail.parentId }, commentText: '@' + (e.detail.nickname || '') + ' ' })
  },
  onDeleteComment(e) {
    wx.showModal({
      title: '删除评论', content: '确定删除？',
      success: res => {
        if (res.confirm) {
          momentApi.deleteComment(e.detail.id).then(() => this.loadData(this.data.moment.id))
        }
      }
    })
  },
  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },
  onSendComment() {
    const { moment, commentText, replyTo } = this.data
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    const data = { moment_id: moment.id, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId
    momentApi.createComment(data).then(() => {
      this.setData({ commentText: '', replyTo: null })
      this.loadData(moment.id)
    }).catch(err => wx.showToast({ title: err.msg || '评论失败', icon: 'none' }))
  }
})
