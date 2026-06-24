const { myApi } = require('../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyComments().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  }
})
