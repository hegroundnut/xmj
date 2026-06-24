const { momentApi } = require('../../utils/api/index')

Page({
  data: { content: '', images: [], videoPath: '', submitting: false },
  onContentInput(e) { this.setData({ content: e.detail.value }) },
  onChooseImage() {
    const remain = 9 - this.data.images.length
    wx.chooseImage({ count: remain, sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ images: [...this.data.images, ...res.tempFilePaths] })
      }
    })
  },
  onDelImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== idx)
    this.setData({ images })
  },
  onChooseVideo() {
    wx.chooseVideo({ sourceType: ['album', 'camera'], maxDuration: 60,
      success: res => this.setData({ videoPath: res.tempFilePath })
    })
  },
  onDelVideo() { this.setData({ videoPath: '' }) },
  onSubmit() {
    const { content, images, videoPath } = this.data
    if (!content.trim() && images.length === 0 && !videoPath) {
      return wx.showToast({ title: '请输入内容或上传图片/视频', icon: 'none' })
    }
    this.setData({ submitting: true })
    momentApi.createMoment({
      content: content.trim(),
      images: images.length > 0 ? JSON.stringify(images) : undefined,
      video_url: videoPath || undefined
    }).then(() => {
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(err => {
      wx.showToast({ title: err.msg || '发布失败', icon: 'none' })
    }).finally(() => this.setData({ submitting: false }))
  }
})
