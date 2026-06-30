const { getUserAgreement } = require('../../../utils/api/public')

Page({
  data: { content: '', error: false },
  onLoad() { this.loadData() },
  loadData() {
    this.setData({ error: false })
    getUserAgreement(1).then(res => {
      this.setData({ content: res.data && res.data.content || '' })
    }).catch(() => this.setData({ error: true }))
  }
})
