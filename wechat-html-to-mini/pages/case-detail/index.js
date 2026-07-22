const { caseApi } = require('../../utils/api/index')

Page({
  data: {
    caseId: '',
    type: 1,        // 1=图片 2=视频
    caseData: null,
    comments: [],
    commentText: '',
    replyTo: null,
    liked: false,
    showVideoPlayer: false,
    loading: true,
    error: false,
    isLogin: false,
    isMember: false
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
    if (options.id) {
      this.setData({ caseId: options.id, type: parseInt(options.type) || 1 })
      this.loadData(options.id)
    }
  },

  onShow() {
    const app = getApp()
    this.setData({ isLogin: app.globalData.isLogin, isMember: app.globalData.isMember })
  },

  loadData(id) {
    this.setData({ loading: true, error: false })
    const app = getApp()
    const caseList = (app.globalData.caseList) || []
    let caseData = caseList.find(c => c.id == id) || null

    const resolveComments = () => {
      caseApi.getCaseComments(id).then(commentsRes => {
        const comments = (commentsRes.data && commentsRes.data.list) || []
        this.setData({ caseData, comments, liked: !!(caseData && caseData.is_liked), loading: false })
      }).catch(() => {
        this.setData({ caseData, comments: [], liked: false, loading: false })
      })
    }

    if (caseData) {
      caseData.images = caseData.media_url ? [caseData.media_url] : []
      caseData.tags = caseData.tags || (caseData.category_name ? [caseData.category_name] : [])
      resolveComments()
    } else {
      caseApi.getCaseList({ type: 0, page: 1, limit: 100 }).then(res => {
        const list = (res.data && res.data.list) || []
        getApp().globalData.caseList = list
        caseData = list.find(c => c.id == id) || null
        if (caseData) {
          caseData.images = caseData.media_url ? [caseData.media_url] : []
          caseData.tags = caseData.category_name ? [caseData.category_name] : []
        }
        resolveComments()
      }).catch(() => {
        this.setData({ loading: false, error: true })
      })
    }
  },

  onBack() { wx.navigateBack() },

  onToggleLike() {
    if (!this.data.isLogin) return wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
    const caseData = this.data.caseData
    caseApi.toggleCaseFavorite(caseData.id).then(res => {
      const action = (res.data && res.data.action)
      this.setData({ liked: action === 'liked' })
    })
  },

  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },

  onReply(e) {
    this.setData({
      replyTo: { parentId: e.detail.parentId },
      commentText: '@' + (e.detail.nickname || '') + ' '
    })
  },

  onSendComment() {
    const { caseId, commentText, replyTo, isLogin, isMember } = this.data
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    if (!isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    if (!isMember) return wx.showToast({ title: '仅会员可评论', icon: 'none' })
    const data = { case_id: caseId, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId
    caseApi.addCaseComment(data).then(() => {
      this.setData({ commentText: '', replyTo: null })
      this.loadData(caseId)
    }).catch(err => {
      wx.showToast({ title: err.msg || '评论失败', icon: 'none' })
    })
  },

  onConsult() { wx.showToast({ title: '请联系客服咨询', icon: 'none' }) },

  onPlayVideo() {
    this.setData({ showVideoPlayer: true })
  },

  onGoLogin() { wx.navigateTo({ url: '/subpackages/users/wechat_login/index' }) },

  onPreviewImage(e) {
    // 非会员不提供无水印原图预览
    if (!this.data.isMember) {
      wx.showToast({ title: '成为会员后可查看原图', icon: 'none' })
      return
    }
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.previewImage({ current: url, urls: [url] })
    }
  },

  // 确保 URL 使用 HTTPS（微信小程序合法域名要求）
  ensureHttps(url) {
    if (!url) return url
    return url.startsWith('http://') ? url.replace('http://', 'https://') : url
  },

  // 检查是否为 PC 平台（windows/mac），保存到相册 API 仅手机端支持
  isDesktop() {
    try {
      const sys = wx.getSystemInfoSync()
      return sys.platform === 'windows' || sys.platform === 'mac'
    } catch (e) {
      return false
    }
  },

  // 从 URL 中提取文件名
  getFileNameFromUrl(url, defaultName) {
    try {
      const path = url.split('?')[0]
      const parts = path.split('/')
      const name = parts[parts.length - 1]
      if (name && name.indexOf('.') > -1) return name
    } catch (e) {}
    return defaultName || 'download'
  },

  // 检查 URL 是否为有效的视频格式
  isImageExtension(url) {
    if (!url) return false
    const imgExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    const lower = url.toLowerCase().split('?')[0]
    return imgExts.some(ext => lower.endsWith(ext))
  },

  // 保存到相册失败时，检查是否为权限问题并引导设置
  handleAlbumAuthError(err) {
    if (err && err.errMsg && err.errMsg.indexOf('auth deny') > -1) {
      wx.showModal({
        title: '相册权限',
        content: '保存需要您授权相册访问权限，请在设置中开启',
        confirmText: '去设置',
        success: (res) => { if (res.confirm) wx.openSetting() }
      })
      return true
    }
    return false
  },

  onSaveAllImages() {
    if (!this.data.isLogin) {
      return wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
    }
    if (!this.data.isMember) {
      return wx.showToast({ title: '开通会员后可保存图片', icon: 'none' })
    }

    // PC 端不支持保存到相册
    if (this.isDesktop()) {
      wx.showToast({ title: '请在手机上打开小程序保存', icon: 'none' })
      return
    }

    const images = this.data.caseData.images || []
    if (!images.length) return

    wx.showLoading({ title: '保存中...' })
    let saved = 0
    const total = images.length

    images.forEach(url => {
      wx.getImageInfo({
        src: this.ensureHttps(url),
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success: () => {
              saved++
              if (saved === total) { wx.hideLoading(); wx.showToast({ title: '保存成功' }) }
            },
            fail: (err) => {
              saved++
              if (!this.handleAlbumAuthError(err) && saved === total) {
                wx.hideLoading()
                wx.showToast({ title: '保存失败', icon: 'none' })
              } else if (saved === total) {
                wx.hideLoading()
              }
            }
          })
        },
        fail: () => {
          saved++
          if (saved === total) { wx.hideLoading(); wx.showToast({ title: '图片加载失败', icon: 'none' }) }
        }
      })
    })
  },

  onSaveVideo() {
    console.log('[onSaveVideo] ========== 开始保存视频 ==========')
    if (!this.data.isLogin) {
      console.log('[onSaveVideo] 未登录，跳转登录页')
      return wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
    }
    if (!this.data.isMember) {
      console.log('[onSaveVideo] 非会员，拦截')
      return wx.showToast({ title: '开通会员后可保存视频', icon: 'none' })
    }

    const rawUrl = this.data.caseData.media_url
    console.log('[onSaveVideo] rawUrl:', rawUrl)
    const videoUrl = this.ensureHttps(rawUrl)
    console.log('[onSaveVideo] videoUrl:', videoUrl)
    if (!videoUrl) {
      console.log('[onSaveVideo] videoUrl 为空，退出')
      return
    }

    const that = this
    const isDesktop = this.isDesktop()
    console.log('[onSaveVideo] isDesktop:', isDesktop)

    // PC 端：下载后用 FileSystemManager 重命名为正常文件名再打开
    if (isDesktop) {
      console.log('[onSaveVideo] PC端路径，开始下载...')
      wx.showLoading({ title: '下载中...' })
      wx.downloadFile({
        url: videoUrl,
        timeout: 120000,
        success: (res) => {
          console.log('[onSaveVideo] PC downloadFile success, statusCode:', res.statusCode, 'tempFilePath:', res.tempFilePath)
          wx.hideLoading()
          if (res.statusCode !== 200) {
            console.log('[onSaveVideo] PC statusCode !== 200，退出')
            wx.showToast({ title: '下载失败，请重试', icon: 'none' })
            return
          }
          let fileName = that.getFileNameFromUrl(videoUrl, 'video.mp4')
          console.log('[onSaveVideo] PC fileName from url:', fileName)
          if (that.isImageExtension(fileName)) {
            fileName = fileName.replace(/\.(jpe?g|png|gif|bmp|webp)$/i, '.mp4')
            console.log('[onSaveVideo] PC 图片后缀改名为:', fileName)
          }
          const savePath = wx.env.USER_DATA_PATH + '/' + fileName
          console.log('[onSaveVideo] PC savePath:', savePath)
          const fs = wx.getFileSystemManager()
          try {
            fs.copyFileSync(res.tempFilePath, savePath)
            console.log('[onSaveVideo] PC copyFileSync 成功')
            wx.openDocument({
              filePath: savePath,
              fileType: 'video',
              showMenu: true,
              success: () => console.log('[onSaveVideo] PC openDocument success'),
              fail: (err) => {
                console.log('[onSaveVideo] PC openDocument fail:', JSON.stringify(err))
                wx.showToast({ title: '请使用手机端保存', icon: 'none' })
              }
            })
          } catch (e) {
            console.log('[onSaveVideo] PC copyFileSync 失败:', JSON.stringify(e))
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: 'video',
              showMenu: true,
              success: () => console.log('[onSaveVideo] PC openDocument (tempFile) success'),
              fail: (err) => {
                console.log('[onSaveVideo] PC openDocument (tempFile) fail:', JSON.stringify(err))
                wx.showToast({ title: '请使用手机端保存', icon: 'none' })
              }
            })
          }
        },
        fail: (err) => {
          console.log('[onSaveVideo] PC downloadFile fail:', JSON.stringify(err))
          wx.hideLoading()
          wx.showToast({ title: '下载失败，请检查网络', icon: 'none' })
        }
      })
      return
    }

    // 手机端：下载 → 重命名为 .mp4 → openDocument 弹出系统分享/保存
    console.log('[onSaveVideo] 手机端路径，开始下载...')
    wx.showLoading({ title: '下载中...' })
    const downloadTask = wx.downloadFile({
      url: videoUrl,
      timeout: 120000,
      success: (res) => {
        console.log('[onSaveVideo] 手机 downloadFile success, statusCode:', res.statusCode, 'tempFilePath:', res.tempFilePath)
        if (res.statusCode !== 200) {
          console.log('[onSaveVideo] 手机 statusCode !== 200，退出')
          wx.hideLoading()
          wx.showToast({ title: '视频下载失败，请重试', icon: 'none' })
          return
        }

        const fs = wx.getFileSystemManager()
        let fileName = that.getFileNameFromUrl(videoUrl, 'video.mp4')
        console.log('[onSaveVideo] 手机 fileName from url:', fileName)
        if (that.isImageExtension(fileName)) {
          fileName = fileName.replace(/\.(jpe?g|png|gif|bmp|webp)$/i, '.mp4')
          console.log('[onSaveVideo] 手机 图片后缀改名为:', fileName)
        }
        const savePath = wx.env.USER_DATA_PATH + '/' + fileName
        console.log('[onSaveVideo] 手机 savePath:', savePath)

        try {
          fs.copyFileSync(res.tempFilePath, savePath)
          console.log('[onSaveVideo] 手机 copyFileSync 成功')
        } catch (e) {
          console.log('[onSaveVideo] 手机 copyFileSync 失败:', JSON.stringify(e))
          try {
            console.log('[onSaveVideo] 尝试 readFileSync...')
            const data = fs.readFileSync(res.tempFilePath)
            console.log('[onSaveVideo] readFileSync 成功, data size:', data ? (data.length || data.byteLength) : 'unknown')
            fs.writeFileSync(savePath, data, 'binary')
            console.log('[onSaveVideo] writeFileSync 成功')
          } catch (e2) {
            console.log('[onSaveVideo] readFile/writeFile 也失败:', JSON.stringify(e2))
            wx.hideLoading()
            wx.openDocument({ filePath: res.tempFilePath, fileType: 'video', showMenu: true,
              success: () => console.log('[onSaveVideo] fallback openDocument (tempFile) success'),
              fail: (err) => {
                console.log('[onSaveVideo] fallback openDocument (tempFile) fail:', JSON.stringify(err))
                wx.showToast({ title: '保存失败，请重试', icon: 'none' })
              }
            })
            return
          }
        }

        wx.hideLoading()

        // 检查文件大小，确认是否是有效视频
        try {
          const stat = fs.statSync(savePath)
          console.log('[onSaveVideo] 文件大小:', stat.size, 'bytes')
          if (stat.size < 10240) {
            console.log('[onSaveVideo] 文件太小，可能不是有效视频内容')
          }
        } catch (e) {
          console.log('[onSaveVideo] statSync 失败:', JSON.stringify(e))
        }

        // 策略1：先尝试 saveVideoToPhotosAlbum 直接保存到相册
        console.log('[onSaveVideo] 策略1: saveVideoToPhotosAlbum, filePath:', savePath)
        wx.saveVideoToPhotosAlbum({
          filePath: savePath,
          success: () => {
            console.log('[onSaveVideo] saveVideoToPhotosAlbum 成功')
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: (err1) => {
            console.log('[onSaveVideo] saveVideoToPhotosAlbum 失败:', JSON.stringify(err1))
            // 策略2：openDocument + fileType:'video'
            console.log('[onSaveVideo] 策略2: openDocument (fileType=video), filePath:', savePath)
            wx.openDocument({
              filePath: savePath,
              fileType: 'video',
              showMenu: true,
              success: () => {
                console.log('[onSaveVideo] openDocument success')
                wx.showToast({ title: '已打开，请通过右上角菜单保存', icon: 'none', duration: 2000 })
              },
              fail: (err2) => {
                console.log('[onSaveVideo] openDocument 也失败:', JSON.stringify(err2))
                // 策略3：用原始 temp 文件（可能保留原始扩展名被系统识别）
                console.log('[onSaveVideo] 策略3: 回退到原始 tempFile, filePath:', res.tempFilePath)
                wx.openDocument({
                  filePath: res.tempFilePath,
                  fileType: 'video',
                  showMenu: true,
                  success: () => {
                    console.log('[onSaveVideo] 回退 tempFile openDocument success')
                    wx.showToast({ title: '已打开，请通过右上角菜单保存', icon: 'none', duration: 2000 })
                  },
                  fail: (err3) => {
                    console.log('[onSaveVideo] 全部策略失败:', JSON.stringify(err3))
                    wx.showToast({ title: '保存失败', icon: 'none' })
                  }
                })
              }
            })
          }
        })
      },
      fail: (err) => {
        console.log('[onSaveVideo] 手机 downloadFile fail:', JSON.stringify(err))
        wx.hideLoading()
        const errMsg = (err && err.errMsg) || ''
        console.log('[onSaveVideo] errMsg:', errMsg)
        if (errMsg.indexOf('timeout') > -1) {
          console.log('[onSaveVideo] 超时')
          wx.showToast({ title: '视频较大，请检查网络后重试', icon: 'none' })
        } else if (errMsg.indexOf('domain') > -1 || errMsg.indexOf('url') > -1) {
          console.log('[onSaveVideo] 域名白名单问题')
          wx.showModal({
            title: '下载配置提示',
            content: '请在微信小程序后台「开发管理 → 服务器域名 → downloadFile合法域名」中添加：\nhttps://xmj-1450103490.cos.ap-shanghai.myqcloud.com',
            showCancel: false,
            confirmText: '知道了'
          })
        } else {
          console.log('[onSaveVideo] 其他错误')
          wx.showModal({
            title: '下载失败',
            content: errMsg || '未知错误',
            showCancel: false,
            confirmText: '知道了'
          })
        }
      }
    })

    downloadTask.onProgressUpdate((res) => {
      console.log('[onSaveVideo] 下载进度:', res.progress + '%')
      wx.showLoading({ title: '下载中 ' + res.progress + '%' })
    })
  }
})
