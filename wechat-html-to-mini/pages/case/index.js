const { caseApi } = require('../../utils/api/index')

Page({
  data: {
    activeType: 'all',
    activeCat: '全部',
    categories: [],
    allCases: [],
    list: [],
    currentSlide: 0,
    liked: {},
    loading: true,
    error: false,
    swiperHeight: 500,
    mediaHeight: 300,
    navHeight: 0,
    isLogin: false,
    isMember: false
  },

  onLoad() {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    const navHeight = capsule.bottom + (capsule.top - sys.statusBarHeight)
    // rpx→px: px = rpx * screenWidth / 750
    const r2p = (rpx) => rpx * sys.screenWidth / 750
    // 估算swiper上方所有元素总高度(rpx): header(224) + tabs(108) + cat(66) + nav(48) + wrapPadding(16)
    const overheadRpx = 224 + 108 + 66 + 48 + 16
    const overheadPx = r2p(overheadRpx) + navHeight
    // 底部tab栏约50px + 安全区
    const bottomH = (sys.safeArea ? (sys.screenHeight - sys.safeArea.bottom) : 0) + 50
    const h = sys.windowHeight - overheadPx - bottomH - 20
    const swiperHeight = Math.max(h, 350)
    // slide内部元素(info+actions+padding)约200rpx
    const mediaHeight = Math.max(swiperHeight - r2p(200) - 10, 200)
    this.setData({ swiperHeight, mediaHeight, navHeight, isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    this.loadData()
  },

  onShow() {
    // 登录/会员状态可能在其他页面变化（tab 页常驻），回来时刷新水印显隐
    const app = getApp()
    const isLogin = app.globalData.isLogin
    const isMember = app.globalData.isMember
    if (isLogin !== this.data.isLogin || isMember !== this.data.isMember) {
      this.setData({ isLogin, isMember })
    }
  },

  loadData() {
    this.setData({ loading: true, error: false })
    Promise.all([
      caseApi.getCaseCategories(),
      caseApi.getCaseList({ type: 0, page: 1, limit: 100 })
    ]).then(([catRes, caseRes]) => {
      const cats = (catRes.data || []).map(c => c.name)
      const cases = (caseRes.data && caseRes.data.list) || []
      this.setData({
        categories: ['全部', ...cats],
        allCases: cases,
        loading: false
      }, () => {
        // setData 是异步的，必须在回调里操作才能拿到最新 allCases
        this.filterList()
      })
      getApp().globalData.caseList = cases
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  filterList() {
    const { activeType, activeCat, allCases } = this.data
    let list = allCases
    if (activeType === 'photo') list = list.filter(c => c.type === 1)
    if (activeType === 'video') list = list.filter(c => c.type === 2)
    if (activeCat !== '全部') list = list.filter(c => c.category_name === activeCat)
    this.setData({ list, currentSlide: 0 })
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.activeType) return
    this.setData({ activeType: type }, () => this.filterList())
  },

  onCatChange(e) {
    const cat = e.currentTarget.dataset.cat
    if (cat === this.data.activeCat) return
    this.setData({ activeCat: cat }, () => this.filterList())
  },

  onCarouselChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find(c => c.id == id)
    const type = item ? item.type : 1
    wx.navigateTo({ url: '/pages/case-detail/index?id=' + id + '&type=' + type })
  },

  onToggleFav(e) {
    const id = e.currentTarget.dataset.id
    const liked = { ...this.data.liked }
    liked[id] = !liked[id]
    this.setData({ liked })
    if (liked[id]) {
      caseApi.toggleCaseFavorite(id).catch(() => {})
    }
  },

  onSaveAlbum(e) {
    const id = e.currentTarget.dataset.id
    wx.showToast({ title: '已保存至相册', icon: 'success' })
    setTimeout(() => { wx.hideToast() }, 1800)
  }
})
