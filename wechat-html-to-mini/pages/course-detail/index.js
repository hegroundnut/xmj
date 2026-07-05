const { teachingApi } = require('../../utils/api/index')

Page({
  data: {
    courseId: '',
    course: null,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false,
    showVideo: false,
    videoError: false,
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
    if (!course.can_watch) {
      wx.showModal({
        title: '开通会员观看',
        content: '本课程需' + (course.member_level_text || '会员') + '可观看，前往开通？',
        confirmText: '去开通',
        success: res => {
          if (res.confirm) wx.navigateTo({ url: '/pages/member/index' })
        }
      })
      return
    }
    this.setData({ showVideo: true, videoError: false })
  },

  onBuy() { this.onPlay() },

  onCloseVideo() {
    this.setData({ showVideo: false, videoError: false })
  },

  // COS/CDN 失效或视频无法加载时提示联系管理员
  onVideoError() {
    this.setData({ videoError: true })
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
