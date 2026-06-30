const app = getApp()

Page({
  data: {
    plans: [
      { id: 'year', name: '年卡', price: '299', unit: '/年', original: '828', save: '省 ¥529', badge: '推荐' }
    ],
    activePlan: 0,
    isLogin: false,
    statusBarHeight: 20
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight, isLogin: app.globalData.isLogin })
  },

  onShow() {
    this.setData({ isLogin: app.globalData.isLogin })
  },

  onPlanSelect(e) {
    this.setData({ activePlan: parseInt(e.currentTarget.dataset.index) })
  },

  onPay() {
    const { isLogin, plans, activePlan } = this.data
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    const plan = plans[activePlan]
    wx.showModal({
      title: '开通会员',
      content: '支付 ¥' + plan.price + ' 开通' + plan.name + '，请联系客服完成购买。',
      showCancel: true,
      confirmText: '知道了',
      cancelText: '取消'
    })
  },

  onClose() {
    wx.navigateBack()
  }
})
