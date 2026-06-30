Component({
  properties: { comments: { type: Array, value: [] } },
  methods: {
    onReply(e) {
      const { id, nickname } = e.currentTarget.dataset
      this.triggerEvent('reply', { parentId: id, nickname })
    },
    onDelete(e) {
      const { id } = e.currentTarget.dataset
      this.triggerEvent('delete', { id })
    }
  }
})
