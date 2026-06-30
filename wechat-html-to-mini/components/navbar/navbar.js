Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: false }
  },
  data: { statusBarHeight: 20 },
  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync()
      this.setData({ statusBarHeight: info.statusBarHeight })
    }
  },
  methods: {
    onBack() { wx.navigateBack() }
  }
})