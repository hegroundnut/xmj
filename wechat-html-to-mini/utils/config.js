const API_BASE_URL = 'http://124.221.194.43:8011/api/v2'
const VERSION = '1.0.0'

// 上传资源基础URL（去除 /api/v2 拼接上传路径）
function getUploadBaseUrl() {
  return API_BASE_URL.replace(/\/api\/v2\/?$/, '')
}

// 登录页轮播图
const LOGIN_SLIDES = [
  getUploadBaseUrl() + '/uploads/attach/2026/07/20260708/c28a9ccd15ef06817caf6dac346c0d88.jpg',
  getUploadBaseUrl() + '/uploads/attach/2026/07/20260708/1566c20d16972cd149da5c945803e15d.jpg',
  getUploadBaseUrl() + '/uploads/attach/2026/07/20260708/85c9eec15d000a2e6c8d82d1547e5e5d.jpg'
]

// 启动页背景图
const SPLASH_BG = getUploadBaseUrl() + '/uploads/attach/2026/07/20260709/54d53b6f80b3230d8437d5c7a9cd0c8d.jpg'

module.exports = {
  API_BASE_URL,
  VERSION,
  getUploadBaseUrl,
  LOGIN_SLIDES,
  SPLASH_BG
}
