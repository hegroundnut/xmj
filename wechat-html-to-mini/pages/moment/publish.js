const { momentApi, userApi } = require('../../utils/api/index')

Page({
  data: {
    content: '',
    images: [],
    videoPath: '',
    submitting: false,
    isLogin: false,
    isMember: false,
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad() {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      statusBarHeight: sys.statusBarHeight,
      navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight)
    })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onChooseImage() {
    const remain = 9 - this.data.images.length
    if (remain <= 0) return wx.showToast({ title: '最多9张图片', icon: 'none' })
    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ images: [...this.data.images, ...res.tempFilePaths] })
      }
    })
  },

  onDelImage(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ images: this.data.images.filter((_, i) => i !== idx) })
  },

  onChooseVideo() {
    if (this.data.images.length > 0) return wx.showToast({ title: '图片和视频不能同时选择', icon: 'none' })
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: res => this.setData({ videoPath: res.tempFilePath })
    })
  },

  onDelVideo() {
    this.setData({ videoPath: '' })
  },

  onSubmit() {
    const { content, images, videoPath } = this.data
    if (!content.trim() && images.length === 0 && !videoPath) {
      return wx.showToast({ title: '请输入内容或上传图片/视频', icon: 'none' })
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })
    // 先把本地图片上传到服务器（服务器会压缩存储），拿到 URL 后再发布
    this.uploadImages(images).then(urls => {
      return momentApi.createMoment({
        content: content.trim(),
        images: urls.length > 0 ? JSON.stringify(urls) : undefined,
        video_url: videoPath || undefined
      })
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: (err && err.msg) || '发布失败', icon: 'none' })
    }).finally(() => this.setData({ submitting: false }))
  },

  uploadImages(images) {
    if (!images || images.length === 0) return Promise.resolve([])
    const tasks = images.map(path => {
      // 微信小程序临时文件路径（http://tmp/... 或 wxfile://tmp_...），必须上传到服务器
      if (/^(http:\/\/tmp\/|wxfile:\/\/)/.test(path)) {
        return userApi.uploadImage(path).then(res => (res.data && res.data.url) || '')
      }
      // 已经是正常网络地址（以 http:// 或 https:// 开头，且不是 tmp 临时文件）的直接保留
      if (/^https?:\/\//.test(path)) return Promise.resolve(path)
      // 未知路径，尝试上传
      return userApi.uploadImage(path).then(res => (res.data && res.data.url) || '')
    })
    return Promise.all(tasks).then(urls => urls.filter(u => !!u))
  },

  onCancel() {
    wx.navigateBack()
  }
})
