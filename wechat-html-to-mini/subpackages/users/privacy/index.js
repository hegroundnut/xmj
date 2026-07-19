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
          content: '<h1 style="font-size:22px;font-weight:300;color:#1A1A1A;margin-bottom:6px;letter-spacing:2px;">阿利老西隐私政策</h1>' +
            '<p style="font-size:11px;color:rgba(0,0,0,0.2);margin-bottom:28px;">更新日期：2026年6月1日 · 生效日期：2026年6月1日</p>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">阿利老西（以下简称"我们"）非常重视用户的隐私和个人信息保护。您在使用我们的服务时，我们可能会收集和使用您的相关信息。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">一、信息收集</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">为提供服务，我们可能收集以下信息：您的微信账号信息（昵称、头像）、手机号码、设备信息、使用记录、您主动发布的内容（包括文字、图片和视频）、位置信息（当您授权时），以及您主动提交的教学预约信息。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">二、信息使用</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">我们收集的信息将用于：提供核心功能服务（包括登录认证、课程学习、案例浏览、社区互动）、个性化推荐与体验优化、安全验证与反作弊、以及服务通知推送。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">三、信息存储与保护</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">您的个人信息存储于中华人民共和国境内的安全服务器中。我们采用行业标准的安全技术措施保护您的信息，包括但不限于数据加密传输、访问控制、安全审计等。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">四、信息共享</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">未经您的明确同意，我们不会将您的个人信息共享给第三方。以下情况除外：经您明确授权同意、法律法规要求、以及为保护合法权益所必需时。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">五、您的权利</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">您有权访问、更正、删除您的个人信息，也有权撤回您的授权同意。如需行使相关权利，请通过小程序内"联系客服"功能与我们联系。</p>' +
            '<h2 style="font-size:13px;font-weight:500;color:#1A1A1A;margin:24px 0 10px;letter-spacing:1px;">六、联系我们</h2>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;margin-bottom:10px;font-weight:300;">如果您对本隐私政策有任何疑问，请联系客服热线 15956920979。</p>',
          loading: false
        })
      } else {
        this.setData({
          content: '<h1 style="font-size:22px;font-weight:300;color:#1A1A1A;margin-bottom:6px;letter-spacing:2px;">ALI LAOXI STUDIO</h1>' +
            '<p style="font-size:13px;color:rgba(0,0,0,0.5);line-height:2;font-weight:300;">客服热线：15956920979</p>',
          loading: false
        })
      }
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
