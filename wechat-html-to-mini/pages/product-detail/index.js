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
    showLightbox: false,
    lightboxIndex: 0,
    statusBarHeight: 20
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight })
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

  onPreviewImage(e) {
    const { product } = this.data
    const urls = (product && product.images) || []
    if (urls.length) {
      this.setData({ showLightbox: true, lightboxIndex: this.data.currentSlide })
    }
  },

  onLightboxChange(e) {
    this.setData({ lightboxIndex: e.detail.current })
  },

  onCloseLightbox() {
    this.setData({ showLightbox: false })
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
