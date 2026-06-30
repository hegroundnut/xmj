const { requestPayment } = require('../../utils/payment')

const PLANS = [
  {
    id: 'monthly',
    name: '月度会员',
    price: '299',
    original: '399',
    unit: '/月',
    save: '省¥100',
    badge: '推荐',
    benefits: [
      { text: '全部课程免费观看', desc: '含会员专属课程' },
      { text: '发布朋友圈帖子', desc: '分享学习心得' },
      { text: '点赞/收藏/评论', desc: '社区互动全解锁' },
      { text: '线下课优先报名', desc: '享受会员专属价' },
      { text: '案例查看', desc: '完整案例库浏览' }
    ]
  },
  {
    id: 'annual',
    name: '年度会员',
    price: '1999',
    original: '3588',
    unit: '/年',
    save: '省¥1,589',
    benefits: [
      { text: '全部课程免费观看', desc: '含会员专属课程' },
      { text: '发布朋友圈帖子', desc: '分享学习心得' },
      { text: '点赞/收藏/评论', desc: '社区互动全解锁' },
      { text: '线下课优先报名', desc: '享受会员专属价' },
      { text: '案例查看', desc: '完整案例库浏览' },
      { text: '1对1在线指导', desc: '专家老师专属答疑' },
      { text: '设备优惠券', desc: '购机享¥500优惠' }
    ]
  }
]

Page({
  data: {
    plans: PLANS,
    activePlan: 1,    // 0=monthly, 1=annual
    paymentMethod: 'wechat',
    agreed: false,
    isLogin: false,
    paying: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin })
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin })
  },

  onPlanSelect(e) {
    this.setData({ activePlan: parseInt(e.currentTarget.dataset.index) })
  },

  onPaymentSelect(e) {
    this.setData({ paymentMethod: e.currentTarget.dataset.method })
  },

  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  onPay() {
    const { isLogin, agreed, paying } = this.data
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!agreed) {
      wx.showToast({ title: '请先同意协议', icon: 'none' })
      return
    }
    if (paying) return

    const plan = PLANS[this.data.activePlan]
    this.setData({ paying: true })

    // Create order and pay
    wx.showModal({
      title: '确认开通',
      content: '开通 ' + plan.name + ' ¥' + plan.price + plan.unit,
      success: res => {
        if (res.confirm) {
          // TODO: call create member order API, then requestPayment
          wx.showToast({ title: '支付功能开发中', icon: 'none' })
        }
        this.setData({ paying: false })
      },
      fail: () => {
        this.setData({ paying: false })
      }
    })
  },

  onGoLogin() {
    wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
  },

  onViewAgreement(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({ url: '/subpackages/users/privacy/index?type=' + (type || 'member') })
  }
})
