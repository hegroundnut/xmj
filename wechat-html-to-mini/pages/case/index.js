const { caseApi } = require('../../utils/api/index')

Page({
  data: {
    activeType: 'all',
    activeCat: '全部',
    categories: [],
    allCases: [],
    list: [],
    liked: {},
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    this.loadData()
  },

  onShow() {
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
    this.setData({ list })
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
  }
})
