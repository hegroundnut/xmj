const { homeApi, publicApi } = require('../../utils/api/index')

Page({
  data: {
    banners: [],
    currentSlide: 0,
    products: [],
    cases: [],
    courses: [],
    contact: null,
    loading: true,
    error: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    if (!this.data.loading && !this.data.error && (!this.data.banners.length || !this.data.products.length)) {
      this.loadData()
    }
  },

  loadData() {
    this.setData({ loading: true, error: false })
    Promise.all([
      homeApi.getHomeConfig(),
      publicApi.getProductList({})
    ]).then(([configRes, productRes]) => {
      const config = configRes.data || {}
      const list = (productRes.data && productRes.data.list) || productRes.data || []
      const products = (Array.isArray(list) ? list : [list]).slice(0, 2).map(p => ({
        id: p.id,
        name: p.title || p.name,
        subtitle: p.desc || p.subtitle || '',
        price: p.price || '',
        image: (p.banner && p.banner[0]) || p.image || p.thumb || ''
      }))
      this.setData({
        banners: (config.banner && config.banner.items) || [],
        products,
        cases: (config.featured_cases && config.featured_cases.data) || [],
        courses: (config.latest_courses && config.latest_courses.data) || [],
        contact: config.contact || null,
        loading: false
      })
      getApp().globalData.caseList = (config.featured_cases && config.featured_cases.data) || []
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onSwiperChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/product-detail/index?id=' + id })
  },

  onMoreProducts() {
    wx.navigateTo({ url: '/pages/product-list/index' })
  },

  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) {
      wx.navigateTo({ url: '/pages/case-detail/index?id=' + id + '&type=1' })
    }
  },

  onMoreCases() {
    wx.switchTab({ url: '/pages/case/index' })
  },

  onCourseTap(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onBuyCourse(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onMoreCourses() {
    wx.switchTab({ url: '/pages/teaching/index' })
  }
})
