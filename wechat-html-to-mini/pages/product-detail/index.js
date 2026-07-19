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
    navHeight: 0
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

  loadData(id) {
    this.setData({ loading: true, error: false })
    publicApi.getProductDetail(id).then(res => {
      const product = res.data || null
      if (product && !product.images) product.images = product.banner || []
      this.setData({ product, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onBack() { wx.navigateBack() },

  onSwiperChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  // 案例式：点击图片用系统全屏预览
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
