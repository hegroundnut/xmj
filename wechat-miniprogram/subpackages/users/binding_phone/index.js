const { bindPhone, wxLogin } = require('../../../utils/auth')
const { phoneLogin } = require('../../../utils/api/public')
const { store } = require('../../../store/app')

Page({
  data: { phone: '', code: '', loading: false, codeDisabled: false, codeText: '获取验证码' },
  onGetPhoneNumber(e) {
    if (!e.detail.code) return wx.showToast({ title: '授权失败', icon: 'none' })
    this.setData({ loading: true })
    wxLogin().then(() => {
      return bindPhone(e.detail.code)
    }).then(() => {
      wx.navigateBack({ delta: 2 })
    }).catch(err => {
      wx.showToast({ title: err.msg || '绑定失败', icon: 'none' })
    }).finally(() => this.setData({ loading: false }))
  },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },
  onCodeInput(e) { this.setData({ code: e.detail.value }) },
  onSendCode() {
    const { phone } = this.data
    if (!/^1\d{10}$/.test(phone)) return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    this.setData({ codeDisabled: true })
    phoneLogin({ phone }).then(() => {
      let s = 60
      const timer = setInterval(() => {
        if (s <= 0) { clearInterval(timer); this.setData({ codeDisabled: false, codeText: '重新获取' }) }
        else { this.setData({ codeText: --s + 's' }) }
      }, 1000)
    }).catch(err => {
      this.setData({ codeDisabled: false })
      wx.showToast({ title: err.msg || '发送失败', icon: 'none' })
    })
  },
  onPhoneLogin() {
    const { phone, code } = this.data
    if (!phone || !code) return wx.showToast({ title: '请填写完整', icon: 'none' })
    wxLogin().then(() => phoneLogin({ phone, code })).then(data => {
      if (data.data && data.data.token) {
        store.setToken(data.data.token)
        if (data.data.userInfo) store.setUserInfo(data.data.userInfo)
        store.emit(store.EVENTS.LOGIN)
        wx.navigateBack({ delta: 2 })
      }
    }).catch(err => wx.showToast({ title: err.msg || '登录失败', icon: 'none' }))
  }
})
