const { myApi } = require('../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyBookings().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  }
})
