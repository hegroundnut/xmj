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
    showQR: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ isMember: app.globalData.isMember })
    this.loadData()
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
    if (id) wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
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
    wx.navigateTo({ url: '/pages/course-detail/index?id=' + id })
  },

  onOpenMember() {
    wx.navigateTo({ url: '/pages/member/index' })
  },

  onOpenQR() {
    this.setData({ showQR: true })
  },

  onCloseQR(e) {
    if (e.target === e.currentTarget) {
      this.setData({ showQR: false })
    }
  },

  onOfflineTap() {
    wx.navigateTo({ url: '/pages/offline/index' })
  },

  onGoOfflineList() {
    wx.showToast({ title: '线下培训列表', icon: 'none' })
  }
})
