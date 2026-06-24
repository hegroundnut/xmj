Component({
  properties: { src: { type: String, value: '' }, poster: { type: String, value: '' } },
  methods: {
    onPlay() { this.triggerEvent('play') },
    onEnded() { this.triggerEvent('ended') }
  }
})
