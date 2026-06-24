const { teachingApi } = require('../../utils/api/index')
const { requestPayment } = require('../../utils/payment')
const { store } = require('../../store/app')

Page({
  data: {
    activeTab: 'course', courseList: [], offlineList: [],
    page: 1, limit: 10, loading: true, error: false, isMember: false
  },
  onLoad() { this.loadData() },
  onShow() {
    this.setData({ isMember: getApp().globalData.isMember })
    store.on(store.EVENTS.MEMBER_CHANGE, this.onMemberChange)
  },
  onHide() { store.off(store.EVENTS.MEMBER_CHANGE, this.onMemberChange) },
  onMemberChange() { this.setData({ isMember: getApp().globalData.isMember }); this.loadData() },
  loadData() {
    this.setData({ loading: true, error: false })
    const fetcher = this.data.activeTab === 'course' ? teachingApi.getCourseList : teachingApi.getOfflineClassList
    fetcher({ page: this.data.page, limit: this.data.limit }).then(res => {
      const list = (res.data && res.data.list) || []
      const key = this.data.activeTab === 'course' ? 'courseList' : 'offlineList'
      this.setData({ [key]: list, loading: false })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab, page: 1 })
    this.loadData()
  },
  onCourseTap(e) {
    const item = e.detail.item
    const app = getApp()
    if (app.globalData.isMember || item.is_free_for_member === 1) {
      // member: direct play
    } else {
      wx.showModal({
        title: '试听课程',
        content: '支付 ¥' + (item.price || '9.90') + ' 试听本课程',
        success: res => {
          if (res.confirm) {
            teachingApi.createCourseOrder(item.id).then(orderRes => {
              const payParams = orderRes.data.pay_params
              return requestPayment(payParams)
            }).then(() => {
              wx.showToast({ title: '支付成功', icon: 'success' })
            }).catch(err => {
              if (err.code !== 'cancel') wx.showToast({ title: err.msg || '支付失败', icon: 'none' })
            })
          }
        }
      })
    }
  },
  onOfflineTap(e) {
    const item = e.detail.item
    wx.showModal({
      title: item.title,
      content: '日期：' + item.class_date + '\n时间：' + item.start_time + '-' + item.end_time + '\n地点：' + (item.address || '待定'),
      confirmText: '我要预约',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/teaching/booking?id=' + item.id })
        }
      }
    })
  },
  onOpenMember() {
    wx.showToast({ title: '敬请期待', icon: 'none' })
  }
})
