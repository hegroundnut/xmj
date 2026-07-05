const { teachingApi } = require('../../utils/api/index')

Page({
  data: {
    viewingDetail: false,
    classData: null,
    classId: '',
    offlineList: [],
    loading: true,
    error: false,
    isLogin: false,
    showQR: false,
    qrCode: '',
    statusBarHeight: 20
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    this.setData({
      isLogin: app.globalData.isLogin,
      statusBarHeight: sys.statusBarHeight
    })
    this.loadQrCode()
    if (options.id) {
      this.setData({ viewingDetail: true, classId: options.id })
      this.loadDetail(options.id)
    } else {
      this.loadList()
    }
  },

  onShow() {
    this.setData({ isLogin: getApp().globalData.isLogin })
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) this.setData({ qrCode })
    }).catch(() => {})
  },

  loadList() {
    this.setData({ loading: true, error: false })
    teachingApi.getOfflineClassList({ page: 1, limit: 50 }).then(res => {
      const list = (res.data && res.data.list) || []
      this.setData({ offlineList: list, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  loadDetail(id) {
    this.setData({ loading: true, error: false })
    if (!id) {
      this.setData({ loading: false, error: true })
      return
    }
    teachingApi.getOfflineClassDetail(id).then(res => {
      this.setData({ classData: res.data || null, loading: false, error: !res.data })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onViewDetail(e) {
    const id = '' + e.currentTarget.dataset.id
    this.setData({ viewingDetail: true, classId: id })
    this.loadDetail(id)
  },

  onBackToList() {
    this.setData({ viewingDetail: false, classData: null })
  },

  onRetryDetail() {
    this.loadDetail(this.data.classId)
  },

  onGoOnline() {
    wx.navigateBack()
  },

  onBack() {
    wx.navigateBack()
  },

  onOpenQR() {
    this.setData({ showQR: true })
  },

  onCloseQR() {
    this.setData({ showQR: false })
  }
})
