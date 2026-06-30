Component({
  properties: {
    visible: { type: Boolean, value: false },
    description: { type: String, value: '登录后可体验完整功能' }
  },
  methods: {
    onClose() { this.triggerEvent('close') },
    onConfirm() { this.triggerEvent('confirm') },
    preventScroll() {}
  }
})
