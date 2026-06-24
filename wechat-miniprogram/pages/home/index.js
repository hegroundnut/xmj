const { homeApi } = require('../../utils/api/index')
const { store } = require('../../store/app')

Page({
  data: { sections: [], loading: true, error: false, navHeight: 0 },
  onLoad() {
    const info = wx.getSystemInfoSync()
    const menuBtn = wx.getMenuButtonBoundingClientRect()
    this.setData({ navHeight: menuBtn.bottom + 8 })
    this.loadData()
  },
  onShow() { if (!this.data.sections.length && !this.data.error) this.loadData() },
  loadData() {
    this.setData({ loading: true, error: false })
    homeApi.getHomeConfig().then(res => {
      const sections = (res.data && res.data.sections) || []
      this.setData({ sections, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },
  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh())
  },
  onBannerTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNoticeTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNavTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.switchTab({ url: link }) },
  onGoCase() { wx.switchTab({ url: '/pages/case/index' }) },
  onCaseTap(e) { wx.switchTab({ url: '/pages/case/index' }) },
  onGoTeaching() { wx.switchTab({ url: '/pages/teaching/index' }) },
  onCourseTap(e) { wx.switchTab({ url: '/pages/teaching/index' }) }
})
