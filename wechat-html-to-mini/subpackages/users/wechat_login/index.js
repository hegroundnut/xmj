const { wxLogin } = require('../../../utils/auth')
const { store } = require('../../../store/app')
const { caseApi } = require('../../../utils/api/index')

Page({
  data: {
    loading: false,
    agreed: false,
    currentSlide: 0,
    slides: [
      {
        image: '',
        number: '01',
        label: 'PROFESSIONAL',
        title: '专业洗眉',
        enTitle: 'BROW WASHING'
      },
      {
        image: '',
        number: '02',
        label: 'MASTER CLASS',
        title: '匠心教学',
        enTitle: 'MASTER CLASS'
      },
      {
        image: '',
        number: '03',
        label: 'STUDIO',
        title: '阿利老西',
        enTitle: 'ALI LAOXI STUDIO'
      }
    ]
  },

  onLoad() {
    this.loadSlides()
  },

  loadSlides() {
    caseApi.getCaseList({ type: 0, page: 1, limit: 3 }).then(res => {
      const cases = (res.data && res.data.list) || []
      if (cases.length) {
        const slides = this.data.slides.map((s, i) => {
          if (cases[i] && cases[i].cover) {
            s.image = cases[i].cover
          }
          return s
        })
        this.setData({ slides })
      }
    }).catch(() => {})
  },

  onSlideChange(e) {
    this.setData({ currentSlide: e.detail.current })
  },

  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  onWechatLogin() {
    if (this.data.loading) return
    if (!this.data.agreed) {
      wx.showToast({ title: '请先阅读并同意用户协议', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    wxLogin().then(res => {
      if (res.isBindPhone) {
        store.emit(store.EVENTS.LOGIN)
        wx.navigateBack({ delta: 1 })
      } else {
        wx.redirectTo({ url: '/subpackages/users/binding_phone/index?key=' + (res.authKey || '') })
      }
    }).catch(err => {
      wx.showToast({ title: err.msg || '登录失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  onPrivacy() {
    wx.navigateTo({ url: '/subpackages/users/privacy/index' })
  }
})
