const { userApi } = require('../../utils/api/index')
const { store } = require('../../store/app')

Page({
  data: {
    avatar: '',
    nickname: '',
    submitting: false,
    statusBarHeight: 20,
    navHeight: 0
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const capsule = wx.getMenuButtonBoundingClientRect()
    const info = store.getUserInfo() || {}
    this.setData({
      navHeight: capsule.bottom + (capsule.top - sys.statusBarHeight), statusBarHeight: sys.statusBarHeight,
      avatar: info.avatar || '',
      nickname: info.nickname || ''
    })
  },

  onBack() { wx.navigateBack() },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onChooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const filePath = res.tempFilePaths[0]
        wx.showLoading({ title: '上传中...' })
        userApi.uploadImage(filePath).then(up => {
          const url = (up.data && up.data.url) || ''
          if (url) this.setData({ avatar: url })
          else wx.showToast({ title: '上传失败', icon: 'none' })
        }).catch(err => {
          wx.showToast({ title: (err && err.msg) || '上传失败', icon: 'none' })
        }).finally(() => wx.hideLoading())
      }
    })
  },

  onSubmit() {
    const { avatar, nickname } = this.data
    const name = (nickname || '').trim()
    if (!name) return wx.showToast({ title: '请输入昵称', icon: 'none' })
    if (name.length > 16) return wx.showToast({ title: '昵称不能超过16个字符', icon: 'none' })
    this.setData({ submitting: true })
    userApi.updateUserInfo({ nickname: name, avatar: avatar }).then(() => {
      const info = Object.assign({}, store.getUserInfo() || {}, { nickname: name, avatar: avatar })
      store.setUserInfo(info)
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    }).catch(err => {
      wx.showToast({ title: (err && err.msg) || '保存失败', icon: 'none' })
    }).finally(() => this.setData({ submitting: false }))
  }
})
