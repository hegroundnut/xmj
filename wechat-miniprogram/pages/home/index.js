const { homeApi } = require('../../utils/api/index')
const { store } = require('../../store/app')

function parseSections(config) {
  const sections = []

  if (config.banner && config.banner.enabled && config.banner.items && config.banner.items.length) {
    sections.push({ type: 'banner', data: config.banner })
  }
  if (config.notice && config.notice.enabled && config.notice.text) {
    sections.push({ type: 'notice', data: { text: config.notice.text, link: config.notice.link || '' } })
  }
  if (config.quick_nav && config.quick_nav.enabled && config.quick_nav.items && config.quick_nav.items.length) {
    const items = config.quick_nav.items.map(function(item) {
      return { icon: item.icon, text: item.title || item.label, link: item.page || item.path || '' }
    })
    sections.push({ type: 'nav_icons', data: { items: items } })
  }
  if (config.featured_cases && config.featured_cases.enabled && config.featured_cases.data && config.featured_cases.data.length) {
    sections.push({ type: 'case_list', data: { title: config.featured_cases.title || '精选案例', cases: config.featured_cases.data } })
  }
  if (config.latest_courses && config.latest_courses.enabled && config.latest_courses.data && config.latest_courses.data.length) {
    sections.push({ type: 'course_list', data: { title: config.latest_courses.title || '热门课程', courses: config.latest_courses.data } })
  }
  if (config.contact && config.contact.enabled) {
    var html = '<p>' + (config.contact.title || '联系我们') + '</p>'
    if (config.contact.phone) html += '<p>电话：' + config.contact.phone + '</p>'
    if (config.contact.wechat) html += '<p>微信：' + config.contact.wechat + '</p>'
    sections.push({ type: 'rich_text', data: { html: html } })
  }

  return sections
}

Page({
  data: { sections: [], loading: true, error: false, navHeight: 0 },
  onLoad() {
    var menuBtn = wx.getMenuButtonBoundingClientRect()
    this.setData({ navHeight: menuBtn.bottom + 8 })
    this.loadData()
  },
  onShow() { if (!this.data.sections.length && !this.data.error) this.loadData() },
  loadData() {
    this.setData({ loading: true, error: false })
    homeApi.getHomeConfig().then(function(res) {
      var config = res.data || {}
      var sections = parseSections(config)
      this.setData({ sections: sections, loading: false })
    }.bind(this)).catch(function() {
      this.setData({ loading: false, error: true })
    }.bind(this))
  },
  onPullDownRefresh() {
    this.loadData().finally(function() { wx.stopPullDownRefresh() })
  },
  onBannerTap(e) { var link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNoticeTap(e) { var link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNavTap(e) { var link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onGoCase() { wx.switchTab({ url: '/pages/case/index' }) },
  onCaseTap(e) { wx.switchTab({ url: '/pages/case/index' }) },
  onGoTeaching() { wx.switchTab({ url: '/pages/teaching/index' }) },
  onCourseTap(e) { wx.switchTab({ url: '/pages/teaching/index' }) }
})
