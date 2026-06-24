const { myApi } = require('../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyCourses().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) { /* navigate to course detail/player */ }
})
