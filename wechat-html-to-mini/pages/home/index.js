const { homeApi, publicApi } = require('../../utils/api/index')

Page({
  data: {
    banners: [],
    currentSlide: 0,
    products: [],
    cases: [],
    casesTitle: '精选案例',
    courses: [],
    coursesTitle: '热门课程',
    heroText: null,
    contact: null,
    loading: true,
    error: false,
    navHeight: 0,
    isMember: false,
    showGateQR: false,
    qrCode: ''
  },

  onLoad() {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight), isMember: app.globalData.isMember })
    this.loadData()
    this.loadQrCode()
  },

  onShow() {
    const app = getApp()
    this.setData({ isMember: app.globalData.isMember })
    if (!this.data.loading && !this.data.error && (!this.data.banners.length || !this.data.products.length)) {
      this.loadData()
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

  loadData() {
    this.setData({ loading: true, error: false })
    Promise.all([
      homeApi.getHomeConfig(),
      publicApi.getProductList({})
    ]).then(([configRes, productRes]) => {
      const config = configRes.data || {}
      const list = (productRes.data && productRes.data.list) || productRes.data || []
      const products = (Array.isArray(list) ? list : [list])
        .filter(p => p.is_home === 1)
        .map(p => ({
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
        casesTitle: (config.featured_cases && config.featured_cases.title) || '精选案例',
        courses: (config.latest_courses && config.latest_courses.data) || [],
        coursesTitle: (config.latest_courses && config.latest_courses.title) || '热门课程',
        heroText: config.hero_text || null,
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

  // 案例式：点击 banner 用系统全屏预览
  onPreviewBanner() {
    const { banners, currentSlide } = this.data
    const urls = banners.map(b => b.image).filter(Boolean)
    if (!urls.length) return
    const item = banners[currentSlide]
    const current = (item && item.image) || urls[0]
    wx.previewImage({ current, urls })
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
      const item = this.data.cases.find(c => c.id == id)
      const type = item ? item.type : 1
      wx.navigateTo({ url: '/pages/case-detail/index?id=' + id + '&type=' + type })
    }
  },

  onMoreCases() {
    wx.switchTab({ url: '/pages/case/index' })
  },

  onCourseTap(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    // 非会员拦截：弹不可关闭的会员码，不进课程详情
    if (!this.data.isMember) {
      this.setData({ showGateQR: true })
      if (!this.data.qrCode) this.loadQrCode()
      return
    }
    wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onBuyCourse(e) {
    const id = e.currentTarget.dataset.id
    if (id) wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onMoreCourses() {
    wx.switchTab({ url: '/pages/teaching/index' })
  },

  // 拨打客服电话
  onCallPhone() {
    const phone = (this.data.contact && this.data.contact.phone) || '400-888-9999'
    wx.makePhoneCall({ phoneNumber: phone.replace(/[^0-9+]/g, '') })
  },

  // 复制客服电话
  onCopyPhone() {
    const phone = (this.data.contact && this.data.contact.phone) || '400-888-9999'
    wx.setClipboardData({ data: phone })
  },

  // 复制微信号
  onCopyWechat() {
    const wechat = (this.data.contact && this.data.contact.wechat) || 'alilaoxi_official'
    wx.setClipboardData({ data: wechat })
  },

  onCloseGateQR() {
    this.setData({ showGateQR: false })
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
  }
})
