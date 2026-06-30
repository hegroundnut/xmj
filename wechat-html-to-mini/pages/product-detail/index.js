const { publicApi } = require('../../utils/api/index')

Page({
  data: {
    productId: '',
    product: null,
    loading: true,
    error: false,
    currentSlide: 0
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id })
      this.loadData(options.id)
    }
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    publicApi.getProductDetail(id).then(res => {
      const product = res.data || null
      this.setData({ product, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onSwiperChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onPreviewImage(e) {
    const { product } = this.data
    const urls = (product && product.images) || []
    wx.previewImage({ current: urls[e.detail.current] || urls[0], urls })
  },

  onConsult() {
    wx.showToast({ title: '请联系客服咨询', icon: 'none' })
  },

  onBuy() {
    wx.showToast({ title: '购买功能开发中', icon: 'none' })
  }
})
