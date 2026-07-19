const { teachingApi } = require('../../utils/api/index')
const { requestPayment } = require('../../utils/payment')

Page({
  data: {
    activeTab: 'course',
    activeCat: '全部',
    categories: [],
    courseList: [],
    filteredCourses: [],
    offlineList: [],
    loading: true,
    error: false,
    isMember: false,
    showQR: false,
    showGateQR: false,
    qrCode: '',
    navHeight: 0
  },

  onLoad() {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    const navHeight = capsule.bottom + (capsule.top - sys.statusBarHeight)
    this.setData({ isMember: app.globalData.isMember, navHeight })
    this.loadData()
    this.loadQrCode()
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) this.setData({ qrCode })
    }).catch(() => {})
  },

  onShow() {
    const app = getApp()
    this.setData({ isMember: app.globalData.isMember })
  },

  loadData() {
    this.setData({ loading: true, error: false })
    Promise.all([
      teachingApi.getCourseCategories(),
      teachingApi.getCourseList({ page: 1, limit: 100 })
    ]).then(([catRes, courseRes]) => {
      const cats = (catRes.data || []).map(c => c.name)
      const courses = (courseRes.data && courseRes.data.list) || []
      this.setData({
        categories: ['全部', ...cats],
        courseList: courses,
        filteredCourses: courses,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    if (tab === 'offline') {
      wx.switchTab({ url: '/pages/teaching/index' })
    }
  },

  onCatChange(e) {
    const cat = e.currentTarget.dataset.cat
    if (cat === this.data.activeCat) return
    const filtered = cat === '全部'
      ? this.data.courseList
      : this.data.courseList.filter(c => c.category_name === cat)
    this.setData({ activeCat: cat, filteredCourses: filtered })
  },

  onCourseTap(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    // 非会员拦截：直接弹不可关闭的会员码，不进课程详情
    if (!this.data.isMember) {
      this.setData({ showGateQR: true })
      if (!this.data.qrCode) this.loadQrCode()
      return
    }
    wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onBuyCourse(e) {
    const id = e.currentTarget.dataset.id
    const course = this.data.courseList.find(c => c.id == id)
    if (!course) return
    const app = getApp()
    if (!app.globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    // 非会员拦截
    if (!app.globalData.isMember) {
      this.setData({ showGateQR: true })
      if (!this.data.qrCode) this.loadQrCode()
      return
    }
    wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onOpenMember() {
    wx.navigateTo({ url: '/pages/member/index' })
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
  },

  onOfflineTap() {
    wx.navigateTo({ url: '/pages/offline/index' })
  },

  onGoOfflineList() {
    wx.showToast({ title: '线下培训列表', icon: 'none' })
  }
})
