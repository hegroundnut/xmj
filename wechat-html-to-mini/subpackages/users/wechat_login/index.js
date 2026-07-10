const { wxLogin } = require('../../../utils/auth')
const { store } = require('../../../store/app')
const { LOGIN_SLIDES } = require('../../../utils/config')

Page({
  data: {
    loading: false,
    agreed: false,
    currentSlide: 0,
    slides: [
      {
        image: LOGIN_SLIDES[0] || '',
        number: '01',
        label: 'PROFESSIONAL',
        title: '专业清洗',
        enTitle: 'BROW WASHING'
      },
      {
        image: LOGIN_SLIDES[1] || '',
        number: '02',
        label: 'MASTER CLASS',
        title: '匠心教学',
        enTitle: 'MASTER CLASS'
      },
      {
        image: LOGIN_SLIDES[2] || '',
        number: '03',
        label: 'STUDIO',
        title: '阿利老西',
        enTitle: 'ALI LAOXI STUDIO'
      }
    ]
  },

  onLoad() {},

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
