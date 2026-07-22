const { publicApi } = require('../../utils/api/index')

Page({
  data: {
    productId: '',
    product: null,
    loading: true,
    error: false,
    currentSlide: 0,
    showQR: false,
    qrCode: '',
    statusBarHeight: 20,
    navHeight: 0,
    activeVideoIndex: -1,
    videoErrors: []
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ statusBarHeight: sys.statusBarHeight, navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight) })
    if (options.id) {
      this.setData({ productId: options.id })
      this.loadData(options.id)
    }
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) this.setData({ qrCode })
    }).catch(() => {})
  },

  // 从 detail HTML 中提取 <video> 和 <img> 的 src
  parseMediaFromDetail(detail) {
    const videos = []
    const images = []
    if (!detail) return { videos, images }

    const videoRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    while ((match = videoRegex.exec(detail)) !== null) {
      let url = match[1]
      if (url && url.startsWith('http://')) url = url.replace('http://', 'https://')
      if (url) videos.push(url)
    }

    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    while ((match = imgRegex.exec(detail)) !== null) {
      let url = match[1]
      if (url && url.startsWith('http://')) url = url.replace('http://', 'https://')
      if (url) images.push(url)
    }

    return { videos, images }
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    publicApi.getProductDetail(id).then(res => {
      const product = res.data || null
      if (!product) return this.setData({ product: null, loading: false })

      if (!product.images) product.images = product.banner || []

      // 从 detail HTML 中提取视频和图片
      const { videos, images } = this.parseMediaFromDetail(product.detail || '')
      product.detailVideos = videos
      product.detailImages = images

      // 合并图集：banner + detail 中的图片
      const seen = new Set(product.images || [])
      images.forEach(url => { if (!seen.has(url)) { product.images.push(url); seen.add(url) } })

      const videoErrors = videos.map(() => false)

      this.setData({ product, activeVideoIndex: -1, videoErrors, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onBack() { wx.navigateBack() },

  onSwiperChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onPreviewImage() {
    const { product, currentSlide } = this.data
    const urls = (product && product.images) || []
    if (urls.length) {
      wx.previewImage({ current: urls[currentSlide] || urls[0], urls })
    }
  },

  onOpenQR() {
    this.setData({ showQR: true })
    if (!this.data.qrCode) {
      this.loadQrCode()
    }
  },
  onCloseQR() {
    this.setData({ showQR: false })
  },

  onSaveQR() {
    const qrCode = this.data.qrCode
    if (!qrCode) return
    wx.showLoading({ title: '保存中...' })
    wx.getImageInfo({
      src: qrCode,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => { wx.hideLoading(); wx.showToast({ title: '已保存到相册' }) },
          fail: () => { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'none' }) }
        })
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '下载失败', icon: 'none' }) }
    })
  },

  onPlayVideo(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const videoErrors = this.data.videoErrors.slice()
    videoErrors[index] = false
    this.setData({ activeVideoIndex: index, videoErrors })
  },

  onCloseVideo() {
    this.setData({ activeVideoIndex: -1 })
  },

  onVideoError(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const videoErrors = this.data.videoErrors.slice()
    videoErrors[index] = true
    this.setData({ videoErrors })
  },

  onPreviewGalleryImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = (this.data.product && this.data.product.images) || []
    if (url && urls.length) {
      wx.previewImage({ current: url, urls })
    }
  },

  onConsult() {
    this.setData({ showQR: true })
    if (!this.data.qrCode) {
      this.loadQrCode()
    }
  },

  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/case-detail/index?id=' + id + '&type=1' })
  },

  onMoreCases() {
    wx.switchTab({ url: '/pages/case/index' })
  },

  onRelatedTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.redirectTo({ url: '/pages/product-detail/index?id=' + id })
    } else {
      wx.navigateTo({ url: '/pages/product-list/index' })
    }
  }
})
