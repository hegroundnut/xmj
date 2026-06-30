const { teachingApi } = require('../../utils/api/index')

Page({
  data: {
    viewingDetail: false,
    classData: null,
    classId: '',
    offlineList: [],
    loading: true,
    error: false,
    bookingName: '',
    bookingPhone: '',
    submitting: false,
    isLogin: false,
    statusBarHeight: 20
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    this.setData({
      isLogin: app.globalData.isLogin,
      statusBarHeight: sys.statusBarHeight
    })
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

  onNameInput(e) { this.setData({ bookingName: e.detail.value }) },
  onPhoneInput(e) { this.setData({ bookingPhone: e.detail.value }) },

  onSubmit() {
    const { classData, bookingName, bookingPhone, isLogin, submitting } = this.data
    if (submitting) return
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!bookingName.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    if (!/^1[3-9]\d{9}$/.test(bookingPhone.trim())) {
      return wx.showToast({ title: '请输入有效手机号', icon: 'none' })
    }
    this.setData({ submitting: true })
    teachingApi.createOfflineBooking({
      class_id: classData.id,
      name: bookingName.trim(),
      phone: bookingPhone.trim()
    }).then(() => {
      wx.showToast({ title: '预约成功', icon: 'success' })
      this.setData({ bookingName: '', bookingPhone: '', submitting: false })
    }).catch(err => {
      wx.showToast({ title: (err && err.msg) || '预约失败', icon: 'none' })
      this.setData({ submitting: false })
    })
  },

  onPreviewQR() {
    const { classData } = this.data
    if (classData && classData.qr_code) {
      wx.previewImage({ urls: [classData.qr_code] })
    }
  }
})
