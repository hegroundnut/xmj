const { getUserAgreement } = require('../../../utils/api/public')

Page({
  data: {
    type: 'privacy',
    title: '',
    content: '',
    loading: true,
    error: false,
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad(options) {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    this.setData({ statusBarHeight: sys.statusBarHeight, navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight) })
    const type = (options && options.type) || 'privacy'
    if (type === 'about') {
      this.setData({ type: 'about', title: '关于我们' })
    } else {
      this.setData({ type: 'privacy', title: '隐私政策' })
    }
    this.loadData()
  },

  loadData() {
    this.setData({ loading: true, error: false })
    const id = this.data.type === 'about' ? 2 : 1
    getUserAgreement(id).then(res => {
      const data = res.data || {}
      this.setData({
        content: data.content || data.value || '',
        loading: false
      })
    }).catch(() => {
      // API 不可用时展示默认文案
      if (this.data.type === 'privacy') {
        this.setData({
          content: '<p>我们重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的个人信息。</p><p>1. 信息收集：我们仅收集必要的用户信息以提供服务。</p><p>2. 信息使用：您的信息仅用于提供和改进我们的服务。</p><p>3. 信息保护：我们采用行业标准的安全措施保护您的数据。</p><p>如有疑问，请联系客服。</p>',
          loading: false
        })
      } else {
        this.setData({
          content: '<p>阿利老西 —— 专业洗眉设备与教学平台</p><p>我们致力于提供高品质的洗眉设备和专业教学服务，帮助美业从业者提升技术水平。</p><p>联系我们：13355535553</p>',
          loading: false
        })
      }
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
