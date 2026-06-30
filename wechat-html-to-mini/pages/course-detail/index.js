const { teachingApi } = require('../../utils/api/index')
const { requestPayment } = require('../../utils/payment')

Page({
  data: {
    courseId: '',
    course: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false,
    statusBarHeight: 20
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      statusBarHeight: sys.statusBarHeight
    })
    if (options.id) {
      this.setData({ courseId: options.id })
      this.loadData(options.id)
    }
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    teachingApi.getCourseDetail(id).then(res => {
      let course = res.data || null
      if (!course && res.msg) {
        try {
          const parsed = JSON.parse(res.msg)
          if (typeof parsed === 'object') course = parsed
        } catch (e) {}
      }
      if (course && !course.lessons) course.lessons = []
      if (course && !course.reviews) course.reviews = []
      this.setData({ course, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onBack() { wx.navigateBack() },

  onBuy() {
    const { course, isLogin, isMember } = this.data
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (isMember || (course && course.is_free_for_member === 1)) {
      // Direct play
      wx.showToast({ title: '开始学习', icon: 'success' })
      return
    }
    const price = (course && course.price) || '9.90'
    wx.showModal({
      title: '购买课程',
      content: '支付 ¥' + price + ' 购买本课程',
      success: res => {
        if (res.confirm) {
          teachingApi.createCourseOrder(course.id).then(orderRes => {
            const payParams = (orderRes.data && orderRes.data.pay_params) || orderRes.data
            return requestPayment(payParams)
          }).then(() => {
            wx.showToast({ title: '支付成功', icon: 'success' })
            this.setData({ 'course.can_watch': true })
          }).catch(err => {
            if (err && err.code !== 'cancel') {
              wx.showToast({ title: (err && err.msg) || '支付失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  onToggleFav() {
    const course = this.data.course
    if (!course) return
    course.is_favorited = !course.is_favorited
    this.setData({ course })
    wx.showToast({ title: course.is_favorited ? '已收藏' : '已取消收藏', icon: 'none' })
  },

  onMember() {
    wx.navigateTo({ url: '/pages/member/index' })
  }
})
