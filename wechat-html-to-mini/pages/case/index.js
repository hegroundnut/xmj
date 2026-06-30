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
    error: false
  },

  onLoad() {
    this.loadData()
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
      })
      getApp().globalData.caseList = cases
      this.filterList()
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  filterList() {
    const { activeType, activeCat, allCases } = this.data
    let list = allCases
    if (activeType === 'photo') list = list.filter(c => !c.is_video)
    if (activeType === 'video') list = list.filter(c => c.is_video)
    if (activeCat !== '全部') list = list.filter(c => c.category_name === activeCat)
    this.setData({ list, currentSlide: 0 })
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.activeType) return
    this.setData({ activeType: type })
    this.filterList()
  },

  onCatChange(e) {
    const cat = e.currentTarget.dataset.cat
    if (cat === this.data.activeCat) return
    this.setData({ activeCat: cat })
    this.filterList()
  },

  onCarouselChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find(c => c.id == id)
    const type = item && item.is_video ? 2 : 1
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
