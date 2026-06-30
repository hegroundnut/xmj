const { teachingApi } = require('../../utils/api/index')

Page({
  data: {
    classId: '',
    classData: null,
    loading: true,
    error: false,
    bookingName: '',
    bookingPhone: '',
    bookingSubmitting: false,
    isLogin: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin })
    if (options.id) {
      this.setData({ classId: options.id })
      this.loadData(options.id)
    }
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    teachingApi.getOfflineClassDetail(id).then(res => {
      this.setData({ classData: res.data || null, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onNameInput(e) {
    this.setData({ bookingName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ bookingPhone: e.detail.value })
  },

  onSubmitBooking() {
    const { classId, bookingName, bookingPhone, isLogin } = this.data
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!bookingName.trim()) return wx.showToast({ title: '请输入姓名', icon: 'none' })
    if (!bookingPhone.trim() || !/^1[3-9]\d{9}$/.test(bookingPhone.trim())) {
      return wx.showToast({ title: '请输入有效手机号', icon: 'none' })
    }

    this.setData({ bookingSubmitting: true })
    teachingApi.createOfflineBooking({
      class_id: classId,
      name: bookingName.trim(),
      phone: bookingPhone.trim()
    }).then(() => {
      wx.showToast({ title: '预约成功', icon: 'success' })
      this.setData({ bookingName: '', bookingPhone: '', bookingSubmitting: false })
    }).catch(err => {
      wx.showToast({ title: (err && err.msg) || '预约失败', icon: 'none' })
      this.setData({ bookingSubmitting: false })
    })
  },

  onShare() {}
})
