const { wxLogin } = require('../../../utils/auth')
const { store } = require('../../../store/app')

Page({
  data: { loading: false },
  onWechatLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })
    wxLogin().then(res => {
      if (res.isBindPhone) {
        store.emit(store.EVENTS.LOGIN)
        wx.navigateBack({ delta: 1 })
      } else {
        wx.redirectTo({ url: '/subpackages/users/binding_phone/index' })
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
