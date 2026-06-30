Component({
  properties: { images: { type: Array, value: [] }, column: { type: Number, value: 3 } },
  methods: {
    onPreview(e) {
      const idx = e.currentTarget.dataset.index
      wx.previewImage({ urls: this.data.images, current: this.data.images[idx] })
    }
  }
})
