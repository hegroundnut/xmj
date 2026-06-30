const { teachingApi } = require('../../utils/api/index')
const { requestPayment } = require('../../utils/payment')

Page({
  data: {
    courseId: '',
    course: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
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
      const course = res.data || null
      if (course && !course.lessons) course.lessons = []
      if (course && !course.reviews) course.reviews = []
      this.setData({ course, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },

  onPlay() {
    const { course } = this.data
    if (!course || !course.video_url) {
      wx.showToast({ title: '暂无视频', icon: 'none' })
      return
    }
    this.setData({ 'course.playing': true })
  },

  onBuy() {
    const { course, isLogin, isMember } = this.data
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (isMember || (course && course.is_free_for_member === 1)) {
      this.onPlay()
      return
    }

    const price = course.price || '9.90'
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
            this.onPlay()
          }).catch(err => {
            if (err && err.code !== 'cancel') {
              wx.showToast({ title: (err && err.msg) || '支付失败', icon: 'none' })
            }
          })
        }
      }
    })
  },

  onMember() {
    wx.navigateTo({ url: '/pages/member/index' })
  },

  onShare() {
    // wx.showShareMenu not needed - default share
  }
})
