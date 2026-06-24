Page({
  data: {
    slides: [
      { image: '/static/images/1-001.png', title: '洗眉教学', desc: '专业洗眉技术培训平台' },
      { image: '/static/images/2-001.png', title: '案例分享', desc: '海量真实案例供参考学习' },
      { image: '/static/images/3-001.png', title: '互动交流', desc: '朋友圈分享经验共同进步' }
    ]
  },
  onEnter() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
