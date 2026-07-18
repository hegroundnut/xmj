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
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({
      isLogin: app.globalData.isLogin,
      statusBarHeight: sys.statusBarHeight,
      navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight)
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
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      list.forEach(item => {
        // 日期徽章取 start_date
        if (item.start_date) {
          const d = new Date(item.start_date.replace(/-/g, '/'))
          const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
          item.month_short = months[d.getMonth()]
          item.day = d.getDate()
        }
        // 状态判断：已过期 > 已满 > 报名中
        const endDate = new Date((item.end_date || item.start_date).replace(/-/g, '/'))
        endDate.setHours(0, 0, 0, 0)
        if (endDate < today) {
          item.status_label = '已结束'
          item.is_ended = true
        } else {
          item.status_label = item.is_full ? '已满' : '报名中'
          item.is_ended = false
        }
      })
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
      let classData = res.data || null
      if (classData) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date((classData.end_date || classData.start_date).replace(/-/g, '/'))
        endDate.setHours(0, 0, 0, 0)
        classData.status_label = endDate < today ? '已结束' : (classData.is_full ? '已满' : '报名中')
        classData.is_ended = endDate < today
        // 格式化照片
        classData.photos = classData.photos || []
      }
      this.setData({ classData, loading: false, error: !classData })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
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

  onPreviewPhoto(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.previewImage({ current: url, urls: this.data.classData.photos })
    }
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
