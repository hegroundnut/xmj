const { teachingApi } = require('../../utils/api/index')

Page({
  data: {
    courseId: '',
    course: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false,
    isSuperMember: false,
    memberType: 'none',
    showVideo: false,
    videoError: false,
    showQR: false,
    qrCode: '',
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad(options) {
    const app = getApp()
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      isSuperMember: userInfo.is_teaching_member === 1,
      memberType: userInfo.member_type || 'none',
      statusBarHeight: sys.statusBarHeight,
      navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight)
    })
    if (options.id) {
      this.setData({ courseId: options.id })
      this.loadData(options.id)
    }
    this.loadQrCode()
  },

  onShow() {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      isSuperMember: userInfo.is_teaching_member === 1,
      memberType: userInfo.member_type || 'none'
    })
  },

  loadQrCode() {
    const { homeApi } = require('../../utils/api/index')
    homeApi.getHomeConfig().then(res => {
      const config = res.data || {}
      const qrCode = (config.contact && config.contact.qrcode) || ''
      if (qrCode) this.setData({ qrCode })
    }).catch(() => {})
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

  // 校验当前用户是否有权限观看该课程
  canWatch() {
    const { course, isLogin, isSuperMember, isMember } = this.data
    if (!course || !isLogin) return false
    if (isSuperMember) return true  // 超级会员可看所有
    if (course.member_level === 1 && isMember) return true  // 普通会员可看普通会员课程
    return false
  },

  // 点击播放：校验登录 + 会员权限，再打开播放器
  onPlay() {
    const { course, isLogin } = this.data
    if (!course) return
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!course.video_url) {
      wx.showToast({ title: '暂无视频', icon: 'none' })
      return
    }
    if (!this.canWatch()) {
      this.setData({ showQR: true })
      return
    }
    this.setData({ showVideo: true, videoError: false })
  },

  onBuy() { this.onPlay() },

  onOpenQR() {
    this.setData({ showQR: true })
  },

  onCloseQR() {
    this.setData({ showQR: false })
  },

  onCloseVideo() {
    this.setData({ showVideo: false, videoError: false })
  },

  // COS/CDN 失效或视频无法加载时提示联系管理员
  onVideoError() {
    this.setData({ videoError: true })
  },

  onToggleFav() {
    const course = this.data.course
    if (!course || !course.id) return
    const { teachingApi } = require('../../utils/api/index')
    teachingApi.toggleCourseFavorite(course.id).then(res => {
      const action = (res.data && res.data.action) || 'unfavorited'
      course.is_favorited = action === 'favorited'
      this.setData({ course })
      wx.showToast({ title: course.is_favorited ? '已收藏' : '已取消收藏', icon: 'none' })
    }).catch(() => {
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  onMember() {
    wx.navigateTo({ url: '/pages/member/index' })
  }
})
