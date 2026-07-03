# 微信原生小程序迁移 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 UniApp 小程序前端完全重写为微信原生（WXML+WXSS+JS），17 页面 + 14 组件 + 6 工具模块

**Architecture:** 纯微信原生，零 npm 依赖。getApp().globalData + 事件总线做状态管理，wx.request 封装做网络层，WXML template 做组件复用。首页通过后端 JSON 配置动态渲染。

**Tech Stack:** 微信原生 WXML/WXSS/JS，零第三方依赖

## Global Constraints

- 所有代码使用微信原生语法，不引入任何 npm 包
- 后端 API 地址：`http://localhost:8011/api/v2`（通过 `utils/config.js` 配置）
- 管理后台（Vue2）和后端（PHP）完全不动
- 只实现小程序端功能，不做 H5/APP
- 微信支付使用 V3 JSAPI，签名类型 RSA
- 登录流程严格遵循 docs/wechat_miniprogram_dev_guide.md
- TabBar 5 项：首页/案例/朋友圈/教学/我的
- 用户登录模块放独立分包，从首页预加载
- 所有图片资源从原 UniApp 项目的 static/images/ 复制
- Token 存储 key 为 `token`，Header 名为 `Authori-zation`

---

### Task 1: 项目骨架 — app.js / app.json / app.wxss / config

**Files:**
- Create: `wechat-miniprogram/app.js`
- Create: `wechat-miniprogram/app.json`
- Create: `wechat-miniprogram/app.wxss`
- Create: `wechat-miniprogram/utils/config.js`
- Create: `wechat-miniprogram/utils/util.js`
- Create: `wechat-miniprogram/project.config.json`

**Produces:** 可运行的空小程序框架，TabBar 导航可用

- [ ] **Step 1: 创建 project.config.json**

```json
{
  "miniprogramRoot": "./",
  "projectname": "wash-eyebrow",
  "description": "洗眉机",
  "appid": "wx3bebb7300327492c",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": { "ignore": [], "disablePlugins": [], "outputPath": "" },
    "condition": false
  },
  "compileType": "miniprogram",
  "libVersion": "3.3.4",
  "packOptions": { "ignore": [], "include": [] },
  "editorSetting": { "tabIndent": "insertSpaces", "tabSize": 2 }
}
```

- [ ] **Step 2: 创建 utils/config.js**

```javascript
module.exports = {
  API_BASE_URL: 'http://localhost:8011/api/v2',
  VERSION: '1.0.0'
}
```

- [ ] **Step 3: 创建 utils/util.js**

```javascript
function formatTime(date) {
  const d = new Date(date * 1000)
  const year = d.getFullYear()
  const month = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return `${year}-${month}-${day}`
}

function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function previewImage(urls, current) {
  wx.previewImage({ urls, current: current || urls[0] })
}

module.exports = { formatTime, debounce, previewImage }
```

- [ ] **Step 4: 创建 app.js**

```javascript
const { store } = require('./store/app')

App({
  globalData: {
    token: '',
    userInfo: null,
    isLogin: false,
    isMember: false,
    _events: {}
  },

  onLaunch() {
    store.init()

    const updateManager = wx.getUpdateManager()
    if (wx.canIUse('getUpdateManager')) {
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已下载，是否重启应用？',
              success(res) { if (res.confirm) updateManager.applyUpdate() }
            })
          })
          updateManager.onUpdateFailed(function () {
            wx.showModal({ title: '发现新版本', content: '请删除小程序后重新搜索打开' })
          })
        }
      })
    }

    wx.getSystemInfo({ success: () => {} })
  }
})
```

- [ ] **Step 5: 创建 app.json**

```json
{
  "pages": [
    "pages/home/index",
    "pages/case/index",
    "pages/moment/index",
    "pages/moment/detail",
    "pages/moment/publish",
    "pages/teaching/index",
    "pages/my/index",
    "pages/my/favorites",
    "pages/my/courses",
    "pages/my/bookings",
    "pages/my/comments",
    "pages/my/posts",
    "pages/guide/index"
  ],
  "subPackages": [
    {
      "root": "subpackages/users",
      "name": "users",
      "pages": [
        "wechat_login/index",
        "binding_phone/index",
        "privacy/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/home/index": {
      "network": "all",
      "packages": ["users"]
    }
  },
  "tabBar": {
    "color": "#282828",
    "selectedColor": "#e93323",
    "borderStyle": "white",
    "backgroundColor": "#ffffff",
    "list": [
      { "pagePath": "pages/home/index", "text": "首页", "iconPath": "static/images/1-001.png", "selectedIconPath": "static/images/1-002.png" },
      { "pagePath": "pages/case/index", "text": "案例", "iconPath": "static/images/2-001.png", "selectedIconPath": "static/images/2-002.png" },
      { "pagePath": "pages/moment/index", "text": "朋友圈", "iconPath": "static/images/3-001.png", "selectedIconPath": "static/images/3-002.png" },
      { "pagePath": "pages/teaching/index", "text": "教学", "iconPath": "static/images/4-001.png", "selectedIconPath": "static/images/4-002.png" },
      { "pagePath": "pages/my/index", "text": "我的", "iconPath": "static/images/5-001.png", "selectedIconPath": "static/images/5-002.png" }
    ]
  },
  "window": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "洗眉机",
    "navigationBarBackgroundColor": "#fff",
    "backgroundColor": "#F8F8F8"
  }
}
```

- [ ] **Step 6: 创建 app.wxss**

```css
page {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

view, text, image, swiper, swiper-item, button, input, textarea {
  box-sizing: border-box;
}

::-webkit-scrollbar { width: 0; height: 0; color: transparent; }

.container { padding: 20rpx; }
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.text-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

- [ ] **Step 7: 创建 pages/guide/index 占位页面（防止编译报错）**

Create `pages/guide/index.wxml`: `<view>引导页</view>`
Create `pages/guide/index.js`: `Page({})`
Create `pages/guide/index.wxss`: `/* empty */`
Create `pages/guide/index.json`: `{}`

- [ ] **Step 8: 从原 UniApp 项目复制 TabBar 图标**

```bash
mkdir -p wechat-miniprogram/static/images
cp template/uni-app/src/static/images/1-001.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/1-002.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/2-001.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/2-002.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/3-001.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/3-002.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/4-001.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/4-002.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/5-001.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/5-002.png wechat-miniprogram/static/images/
cp template/uni-app/src/static/images/def_avatar.png wechat-miniprogram/static/images/
```

- [ ] **Step 9: 提交**

```bash
git add wechat-miniprogram/
git commit -m "feat: scaffold native WeChat mini program skeleton"
```

---

### Task 2: 状态管理 — store/app.js

**Files:**
- Create: `wechat-miniprogram/store/app.js`

**Produces:** 全局状态管理模块，token/userInfo/isMember 存取 + 事件总线

- [ ] **Step 1: 创建 store/app.js**

```javascript
const KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo'
}

const EVENTS = {
  LOGIN: 'app:login',
  LOGOUT: 'app:logout',
  USER_UPDATE: 'app:userUpdate',
  MEMBER_CHANGE: 'app:memberChange'
}

const store = {
  KEYS,
  EVENTS,

  init() {
    const app = getApp()
    app.globalData.token = wx.getStorageSync(KEYS.TOKEN) || ''
    app.globalData.userInfo = wx.getStorageSync(KEYS.USER_INFO) || null
    app.globalData.isLogin = !!app.globalData.token
    app.globalData.isMember = !!(app.globalData.userInfo && app.globalData.userInfo.is_teaching_member === 1)
  },

  getToken() { return getApp().globalData.token },
  setToken(token) {
    const app = getApp()
    app.globalData.token = token
    app.globalData.isLogin = true
    wx.setStorageSync(KEYS.TOKEN, token)
  },
  clearToken() {
    const app = getApp()
    app.globalData.token = ''
    app.globalData.isLogin = false
    app.globalData.userInfo = null
    app.globalData.isMember = false
    wx.removeStorageSync(KEYS.TOKEN)
    wx.removeStorageSync(KEYS.USER_INFO)
  },

  getUserInfo() { return getApp().globalData.userInfo },
  setUserInfo(info) {
    const app = getApp()
    app.globalData.userInfo = info
    app.globalData.isMember = !!(info && info.is_teaching_member === 1)
    wx.setStorageSync(KEYS.USER_INFO, info)
  },

  emit(event, data) {
    const app = getApp()
    app.globalData._events = app.globalData._events || {}
    const cbs = app.globalData._events[event] || []
    cbs.forEach(cb => cb(data))
  },
  on(event, cb) {
    const app = getApp()
    app.globalData._events = app.globalData._events || {}
    if (!app.globalData._events[event]) app.globalData._events[event] = []
    app.globalData._events[event].push(cb)
  },
  off(event, cb) {
    const app = getApp()
    const list = app.globalData._events && app.globalData._events[event]
    if (list) {
      const idx = list.indexOf(cb)
      if (idx > -1) list.splice(idx, 1)
    }
  }
}

module.exports = { store }
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/store/app.js
git commit -m "feat: add global state management with event bus"
```

---

### Task 3: HTTP 请求层 — utils/request.js

**Files:**
- Create: `wechat-miniprogram/utils/request.js`

**Interfaces:**
- Consumes: `utils/config.js` (API_BASE_URL), `store/app.js` (store)
- Produces: `api.get(url, data?, opts?)`, `api.post(url, data?, opts?)`, `api.put(url, data?, opts?)`, `api.delete(url, data?, opts?)`

- [ ] **Step 1: 创建 utils/request.js**

```javascript
const { API_BASE_URL } = require('./config')
const { store } = require('../store/app')

function request(url, method, data, opts) {
  const { noAuth, noVerify } = opts || {}
  const app = getApp()

  return new Promise((resolve, reject) => {
    const header = { 'Content-Type': 'application/json' }

    const token = store.getToken()
    if (token) {
      header['Authori-zation'] = 'Bearer ' + token
    }

    if (!noAuth && !token) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return reject({ msg: '未登录' })
    }

    wx.request({
      url: API_BASE_URL + '/' + url,
      method: method || 'GET',
      header: header,
      data: data || {},
      timeout: 15000,
      success(res) {
        if (noVerify) return resolve(res.data)
        if (res.statusCode === 200 && res.data && res.data.status === 200) {
          return resolve(res.data)
        }
        if (res.data && res.data.status === 401) {
          store.clearToken()
          wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
          return reject(res.data)
        }
        reject(res.data || res)
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

const api = {}
;['get', 'post', 'put', 'delete'].forEach(method => {
  api[method] = function (url, data, opts) {
    return request(url, method.toUpperCase(), data, opts)
  }
})

module.exports = api
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/utils/request.js
git commit -m "feat: add wx.request wrapper with auth and error handling"
```

---

### Task 4: API 模块 — utils/api/

**Files:**
- Create: `wechat-miniprogram/utils/api/index.js`
- Create: `wechat-miniprogram/utils/api/home.js`
- Create: `wechat-miniprogram/utils/api/case.js`
- Create: `wechat-miniprogram/utils/api/moment.js`
- Create: `wechat-miniprogram/utils/api/teaching.js`
- Create: `wechat-miniprogram/utils/api/my.js`
- Create: `wechat-miniprogram/utils/api/user.js`
- Create: `wechat-miniprogram/utils/api/public.js`

**Interfaces:**
- Consumes: `utils/request.js` (api.get/post/put/delete)
- Produces: 所有页面的 API 调用函数

- [ ] **Step 1: 创建 utils/api/home.js**

```javascript
const api = require('../request')

function getHomeConfig() {
  return api.get('v2/home/config', {}, { noAuth: true })
}

function getProductInfo() {
  return api.get('v2/product/info', {}, { noAuth: true })
}

module.exports = { getHomeConfig, getProductInfo }
```

- [ ] **Step 2: 创建 utils/api/case.js**

```javascript
const api = require('../request')

function getCaseList(params) {
  return api.get('v2/case/list', params || {}, { noAuth: true })
}

function getCaseComments(caseId) {
  return api.get('v2/case_comment/list', { case_id: caseId }, { noAuth: true })
}

function addCaseComment(data) {
  return api.post('v2/case_comment/add', data)
}

function toggleCaseFavorite(id) {
  return api.post('v2/case/favorite/' + id)
}

function getCaseFavorites(params) {
  return api.get('v2/case/favorites', params)
}

module.exports = { getCaseList, getCaseComments, addCaseComment, toggleCaseFavorite, getCaseFavorites }
```

- [ ] **Step 3: 创建 utils/api/moment.js**

```javascript
const api = require('../request')

function getMomentList(params) {
  return api.get('v2/moment/list', params, { noAuth: true })
}

function getMomentDetail(id) {
  return api.get('v2/moment/detail/' + id, {}, { noAuth: true })
}

function createMoment(data) {
  return api.post('v2/moment/create', data)
}

function deleteMoment(id) {
  return api.post('v2/moment/delete/' + id)
}

function toggleLike(id) {
  return api.post('v2/moment/like/' + id)
}

function toggleFavorite(id) {
  return api.post('v2/moment/favorite/' + id)
}

function getFavorites(params) {
  return api.get('v2/moment/favorites', params)
}

function createComment(data) {
  return api.post('v2/moment/comment', data)
}

function deleteComment(id) {
  return api.post('v2/moment/comment/delete/' + id)
}

function shareMoment(id) {
  return api.post('v2/moment/share/' + id)
}

module.exports = {
  getMomentList, getMomentDetail, createMoment, deleteMoment,
  toggleLike, toggleFavorite, getFavorites,
  createComment, deleteComment, shareMoment
}
```

- [ ] **Step 4: 创建 utils/api/teaching.js**

```javascript
const api = require('../request')

function getCourseList(params) {
  return api.get('v2/course/list', params || {})
}

function getCourseDetail(id) {
  return api.get('v2/course/detail/' + id)
}

function createCourseOrder(courseId) {
  return api.post('v2/course/create_order', { course_id: courseId })
}

function getOfflineClassList(params) {
  return api.get('v2/offline_class/list', params || {}, { noAuth: true })
}

function getOfflineClassDetail(id) {
  return api.get('v2/offline_class/detail/' + id, {}, { noAuth: true })
}

function createOfflineBooking(data) {
  return api.post('v2/offline_class/booking', data)
}

module.exports = { getCourseList, getCourseDetail, createCourseOrder, getOfflineClassList, getOfflineClassDetail, createOfflineBooking }
```

- [ ] **Step 5: 创建 utils/api/my.js**

```javascript
const api = require('../request')

function getUserInfo() {
  return api.get('v2/user/info')
}

function getMyFavorites(params) {
  return api.get('v2/my/favorites', params)
}

function getMyCourses(params) {
  return api.get('v2/my/courses', params)
}

function getMyBookings(params) {
  return api.get('v2/my/bookings', params)
}

function getMyComments(params) {
  return api.get('v2/my/comments', params)
}

function getMyPosts(params) {
  return api.get('v2/my/posts', params)
}

module.exports = { getUserInfo, getMyFavorites, getMyCourses, getMyBookings, getMyComments, getMyPosts }
```

- [ ] **Step 6: 创建 utils/api/public.js（登录相关）**

```javascript
const api = require('../request')

function authType(data) {
  return api.get('v2/routine/auth_type', data, { noAuth: true })
}

function authLogin(data) {
  return api.get('v2/routine/auth_login', data, { noAuth: true })
}

function routineBindingPhone(data) {
  return api.post('v2/routine/auth_binding_phone', data, { noAuth: true })
}

function phoneLogin(data) {
  return api.post('v2/routine/phone_login', data, { noAuth: true })
}

function silenceAuth(data) {
  return api.get('v2/wechat/silence_auth', data, { noAuth: true })
}

function getUserAgreement(type) {
  return api.get('get_agreement/' + type, {}, { noAuth: true })
}

module.exports = { authType, authLogin, routineBindingPhone, phoneLogin, silenceAuth, getUserAgreement }
```

- [ ] **Step 7: 创建 utils/api/user.js（用户相关）**

```javascript
const api = require('../request')

function getUserInfo() {
  return api.get('v2/user/info')
}

module.exports = { getUserInfo }
```

- [ ] **Step 8: 创建 utils/api/index.js（统一导出）**

```javascript
const homeApi = require('./home')
const caseApi = require('./case')
const momentApi = require('./moment')
const teachingApi = require('./teaching')
const myApi = require('./my')
const userApi = require('./user')
const publicApi = require('./public')

module.exports = { homeApi, caseApi, momentApi, teachingApi, myApi, userApi, publicApi }
```

- [ ] **Step 9: 提交**

```bash
git add wechat-miniprogram/utils/api/
git commit -m "feat: add all API modules (home/case/moment/teaching/my/user/public)"
```

---

### Task 5: 支付模块 — utils/payment.js

**Files:**
- Create: `wechat-miniprogram/utils/payment.js`

**Interfaces:**
- Consumes: 无（直接调用 wx.requestPayment）
- Produces: `requestPayment(payParams)` → Promise

- [ ] **Step 1: 创建 utils/payment.js**

```javascript
function requestPayment(payParams) {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'RSA',
      paySign: payParams.paySign,
      success(res) {
        resolve(res)
      },
      fail(err) {
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          reject({ code: 'cancel', msg: '用户取消支付' })
        } else {
          reject({ code: 'fail', msg: '支付失败' })
        }
      }
    })
  })
}

module.exports = { requestPayment }
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/utils/payment.js
git commit -m "feat: add WeChat payment wrapper (V3 JSAPI RSA)"
```

---

### Task 6: 登录管理 — utils/auth.js

**Files:**
- Create: `wechat-miniprogram/utils/auth.js`

**Interfaces:**
- Consumes: `store/app.js` (store), `utils/api/public.js` (authLogin, routineBindingPhone)
- Produces: `wxLogin()`, `bindPhone(code)`, `checkLogin()`

- [ ] **Step 1: 创建 utils/auth.js**

```javascript
const { store } = require('../store/app')
const { authLogin, routineBindingPhone } = require('./api/public')

function wxLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          authLogin({ code: res.code }).then(data => {
            const result = data.data
            if (result.token) {
              store.setToken(result.token)
              if (result.userInfo) {
                store.setUserInfo(result.userInfo)
              }
              resolve({ isBindPhone: result.isBindPhone !== false, token: result.token, userInfo: result.userInfo })
            } else {
              reject({ msg: '登录失败，未获取到token' })
            }
          }).catch(reject)
        } else {
          reject({ msg: 'wx.login 失败' })
        }
      },
      fail: reject
    })
  })
}

function bindPhone(phoneCode) {
  return new Promise((resolve, reject) => {
    routineBindingPhone({ code: phoneCode }).then(data => {
      const result = data.data
      if (result.token) {
        store.setToken(result.token)
      }
      if (result.userInfo) {
        store.setUserInfo(result.userInfo)
      }
      store.emit(store.EVENTS.LOGIN)
      resolve(result)
    }).catch(reject)
  })
}

function checkLogin() {
  return !!store.getToken()
}

function logout() {
  store.clearToken()
  store.emit(store.EVENTS.LOGOUT)
}

module.exports = { wxLogin, bindPhone, checkLogin, logout }
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/utils/auth.js
git commit -m "feat: add auth module (wxLogin/bindPhone/checkLogin/logout)"
```

---

### Task 7: 基础共享组件 — loading / empty / navbar

**Files:**
- Create: `wechat-miniprogram/components/loading/loading.wxml`
- Create: `wechat-miniprogram/components/loading/loading.wxss`
- Create: `wechat-miniprogram/components/loading/loading.js`
- Create: `wechat-miniprogram/components/loading/loading.json`
- Create: `wechat-miniprogram/components/empty/empty.wxml`
- Create: `wechat-miniprogram/components/empty/empty.wxss`
- Create: `wechat-miniprogram/components/empty/empty.js`
- Create: `wechat-miniprogram/components/empty/empty.json`
- Create: `wechat-miniprogram/components/navbar/navbar.wxml`
- Create: `wechat-miniprogram/components/navbar/navbar.wxss`
- Create: `wechat-miniprogram/components/navbar/navbar.js`
- Create: `wechat-miniprogram/components/navbar/navbar.json`

- [ ] **Step 1: 创建 loading 组件**

loading.json:
```json
{ "component": true, "usingComponents": {} }
```

loading.wxml:
```xml
<view class="loading-wrap" wx:if="{{show}}">
  <view class="loading-spinner"></view>
  <text class="loading-text" wx:if="{{text}}">{{text}}</text>
</view>
```

loading.wxss:
```css
.loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60rpx 0; }
.loading-spinner { width: 60rpx; height: 60rpx; border: 4rpx solid #eee; border-top-color: #e93323; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { margin-top: 20rpx; font-size: 26rpx; color: #999; }
```

loading.js:
```javascript
Component({
  properties: {
    show: { type: Boolean, value: true },
    text: { type: String, value: '加载中...' }
  }
})
```

- [ ] **Step 2: 创建 empty 组件**

empty.json: `{ "component": true }`
empty.wxml:
```xml
<view class="empty-wrap" wx:if="{{show}}">
  <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit" wx:if="{{!hideIcon}}"/>
  <text class="empty-text">{{text || '暂无数据'}}</text>
</view>
```
empty.wxss:
```css
.empty-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120rpx 0; }
.empty-icon { width: 200rpx; height: 200rpx; }
.empty-text { margin-top: 30rpx; font-size: 28rpx; color: #999; }
```
empty.js:
```javascript
Component({ properties: { show: { type: Boolean, value: true }, text: { type: String, value: '' }, hideIcon: { type: Boolean, value: false } } })
```

- [ ] **Step 3: 创建 navbar 组件**

navbar.json: `{ "component": true }`
navbar.wxml:
```xml
<view class="navbar" style="padding-top: {{statusBarHeight}}px;">
  <view class="navbar-inner">
    <view class="navbar-back" wx:if="{{showBack}}" bindtap="onBack">
      <image src="/static/images/left.png" mode="aspectFit"/>
    </view>
    <text class="navbar-title">{{title}}</text>
    <view class="navbar-back" wx:if="{{!showBack}}"></view>
  </view>
</view>
```
navbar.wxss:
```css
.navbar { background: #fff; position: fixed; top: 0; left: 0; right: 0; z-index: 99; }
.navbar-inner { height: 88rpx; display: flex; align-items: center; padding: 0 20rpx; }
.navbar-back { width: 80rpx; }
.navbar-back image { width: 40rpx; height: 40rpx; }
.navbar-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
```
navbar.js:
```javascript
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
```

- [ ] **Step 4: 提交**

```bash
git add wechat-miniprogram/components/loading/ wechat-miniprogram/components/empty/ wechat-miniprogram/components/navbar/
git commit -m "feat: add base shared components (loading/empty/navbar)"
```

---

### Task 8: 媒体组件 — image-preview / video-player

**Files:**
- Create: `wechat-miniprogram/components/image-preview/` (4 files)
- Create: `wechat-miniprogram/components/video-player/` (4 files)

- [ ] **Step 1: 创建 image-preview 组件（封装 wx.previewImage）**

image-preview.json: `{ "component": true }`
image-preview.wxml:
```xml
<view class="image-grid" wx:if="{{images && images.length}}">
  <image wx:for="{{images}}" wx:key="index"
    src="{{item}}" mode="aspectFill"
    class="grid-image grid-image-{{column}}"
    bindtap="onPreview" data-index="{{index}}" />
</view>
```
image-preview.wxss:
```css
.image-grid { display: flex; flex-wrap: wrap; }
.grid-image { margin-right: 8rpx; margin-bottom: 8rpx; border-radius: 8rpx; }
.grid-image-3 { width: calc((100% - 16rpx) / 3); height: 210rpx; }
.grid-image-1 { width: 100%; height: 420rpx; }
.grid-image:last-child, .grid-image:nth-child(3n) { margin-right: 0; }
```
image-preview.js:
```javascript
Component({
  properties: { images: { type: Array, value: [] }, column: { type: Number, value: 3 } },
  methods: {
    onPreview(e) {
      const idx = e.currentTarget.dataset.index
      wx.previewImage({ urls: this.data.images, current: this.data.images[idx] })
    }
  }
})
```

- [ ] **Step 2: 创建 video-player 组件**

video-player.json: `{ "component": true }`
video-player.wxml:
```xml
<view class="video-wrap" wx:if="{{src}}">
  <video src="{{src}}" poster="{{poster}}" controls
    object-fit="contain" class="video-player"
    bindplay="onPlay" bindended="onEnded" />
</view>
```
video-player.wxss:
```css
.video-wrap { width: 100%; border-radius: 12rpx; overflow: hidden; background: #000; }
.video-player { width: 100%; height: 420rpx; }
```
video-player.js:
```javascript
Component({
  properties: { src: { type: String, value: '' }, poster: { type: String, value: '' } },
  methods: {
    onPlay() { this.triggerEvent('play') },
    onEnded() { this.triggerEvent('ended') }
  }
})
```

- [ ] **Step 3: 提交**

```bash
git add wechat-miniprogram/components/image-preview/ wechat-miniprogram/components/video-player/
git commit -m "feat: add media components (image-preview/video-player)"
```

---

### Task 9: 卡片组件 — case-card / course-card / offline-card

**Files:**
- Create: `wechat-miniprogram/components/case-card/` (4 files)
- Create: `wechat-miniprogram/components/course-card/` (4 files)
- Create: `wechat-miniprogram/components/offline-card/` (4 files)

- [ ] **Step 1: 创建 case-card 组件**

case-card.json: `{ "component": true }`
case-card.wxml:
```xml
<view class="case-card" bindtap="onTap">
  <image src="{{item.cover}}" mode="aspectFill" class="case-cover"/>
  <view class="case-info">
    <text class="case-title text-ellipsis">{{item.title}}</text>
    <view class="case-type-badge" wx:if="{{item.type === 2}}">
      <text class="type-text">视频</text>
    </view>
  </view>
</view>
```
case-card.wxss:
```css
.case-card { background: #fff; border-radius: 12rpx; overflow: hidden; margin-bottom: 16rpx; }
.case-cover { width: 100%; height: 320rpx; }
.case-info { padding: 16rpx; }
.case-title { font-size: 28rpx; color: #333; }
.case-type-badge { position: absolute; top: 16rpx; right: 16rpx; background: rgba(0,0,0,0.5); border-radius: 6rpx; padding: 4rpx 12rpx; }
.type-text { font-size: 22rpx; color: #fff; }
```
case-card.js:
```javascript
Component({
  properties: { item: { type: Object, value: {} } },
  methods: { onTap() { this.triggerEvent('tap', { item: this.data.item }) } }
})
```

- [ ] **Step 2: 创建 course-card 组件**

course-card.json: `{ "component": true }`
course-card.wxml:
```xml
<view class="course-card" bindtap="onTap">
  <image src="{{item.cover}}" mode="aspectFill" class="course-cover"/>
  <view class="course-info">
    <text class="course-title text-ellipsis">{{item.title}}</text>
    <text class="course-desc text-ellipsis" wx:if="{{item.desc}}">{{item.desc}}</text>
    <view class="course-footer">
      <text class="course-price" wx:if="{{item.is_free_for_member === 1}}">会员免费</text>
      <text class="course-price price-pay" wx:else>¥{{item.price || '9.90'}} 试听</text>
    </view>
  </view>
</view>
```
course-card.wxss:
```css
.course-card { background: #fff; border-radius: 12rpx; overflow: hidden; margin-bottom: 20rpx; display: flex; }
.course-cover { width: 240rpx; height: 180rpx; flex-shrink: 0; }
.course-info { flex: 1; padding: 20rpx; display: flex; flex-direction: column; justify-content: space-between; }
.course-title { font-size: 30rpx; font-weight: 500; }
.course-desc { font-size: 24rpx; color: #999; margin-top: 8rpx; }
.course-footer { display: flex; align-items: center; }
.course-price { color: #e93323; font-size: 28rpx; font-weight: 500; }
.price-pay { color: #ff6b00; }
```
course-card.js:
```javascript
Component({
  properties: { item: { type: Object, value: {} } },
  methods: { onTap() { this.triggerEvent('tap', { item: this.data.item }) } }
})
```

- [ ] **Step 3: 创建 offline-card 组件**

offline-card.json: `{ "component": true }`
offline-card.wxml:
```xml
<view class="offline-card" bindtap="onTap">
  <image src="{{item.cover || '/static/images/def_avatar.png'}}" mode="aspectFill" class="offline-cover" wx:if="{{item.cover}}"/>
  <view class="offline-info">
    <text class="offline-title">{{item.title}}</text>
    <view class="offline-meta">
      <text class="meta-item">🕐 {{item.class_date}} {{item.start_time}}-{{item.end_time}}</text>
      <text class="meta-item">📍 {{item.address}}</text>
      <text class="meta-item" wx:if="{{item.max_people}}">👤 限额 {{item.max_people}} 人</text>
    </view>
  </view>
</view>
```
offline-card.wxss:
```css
.offline-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.offline-cover { width: 100%; height: 300rpx; border-radius: 8rpx; margin-bottom: 16rpx; }
.offline-title { font-size: 32rpx; font-weight: 500; }
.offline-meta { margin-top: 12rpx; }
.meta-item { display: block; font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
```
offline-card.js:
```javascript
Component({
  properties: { item: { type: Object, value: {} } },
  methods: { onTap() { this.triggerEvent('tap', { item: this.data.item }) } }
})
```

- [ ] **Step 4: 提交**

```bash
git add wechat-miniprogram/components/case-card/ wechat-miniprogram/components/course-card/ wechat-miniprogram/components/offline-card/
git commit -m "feat: add card components (case/course/offline)"
```

---

### Task 10: 评论列表组件 — comment-list（递归渲染）

**Files:**
- Create: `wechat-miniprogram/components/comment-list/` (4 files)

- [ ] **Step 1: 创建 comment-list 组件**

comment-list.json: `{ "component": true }`
comment-list.wxml:
```xml
<view class="comment-list">
  <block wx:for="{{comments}}" wx:key="id">
    <view class="comment-item">
      <image class="comment-avatar" src="{{item.user_avatar || '/static/images/def_avatar.png'}}" mode="aspectFill"/>
      <view class="comment-body">
        <view class="comment-header">
          <text class="comment-name">{{item.user_nickname || '用户'}}</text>
          <text class="comment-time">{{item.add_time}}</text>
        </view>
        <text class="comment-content" wx:if="{{item.content}}">{{item.content}}</text>
        <view class="comment-actions">
          <text class="action-btn" bindtap="onReply" data-id="{{item.id}}" data-nickname="{{item.user_nickname}}">回复</text>
          <text class="action-btn action-delete" wx:if="{{item.can_delete}}" bindtap="onDelete" data-id="{{item.id}}">删除</text>
        </view>
        <!-- 递归子评论 -->
        <comment-list wx:if="{{item.children && item.children.length}}" comments="{{item.children}}" bind:reply="onReply" bind:delete="onDelete"/>
      </view>
    </view>
  </block>
</view>
```
comment-list.wxss:
```css
.comment-item { display: flex; padding: 20rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.comment-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; flex-shrink: 0; }
.comment-body { flex: 1; margin-left: 16rpx; }
.comment-header { display: flex; align-items: center; }
.comment-name { font-size: 26rpx; color: #576b95; }
.comment-time { font-size: 22rpx; color: #999; margin-left: 12rpx; }
.comment-content { font-size: 28rpx; color: #333; margin-top: 8rpx; display: block; }
.comment-actions { margin-top: 8rpx; }
.action-btn { font-size: 24rpx; color: #576b95; margin-right: 24rpx; }
.action-delete { color: #999; }
```
comment-list.js:
```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/components/comment-list/
git commit -m "feat: add recursive comment-list component"
```

---

### Task 11: 登录授权弹窗 — auth-modal

**Files:**
- Create: `wechat-miniprogram/components/auth-modal/` (4 files)

- [ ] **Step 1: 创建 auth-modal 组件**

auth-modal.json: `{ "component": true }`
auth-modal.wxml:
```xml
<view class="auth-mask" wx:if="{{visible}}" catchtouchmove="preventScroll">
  <view class="auth-dialog">
    <view class="auth-header">
      <text class="auth-title">需要登录</text>
      <text class="auth-close" bindtap="onClose">×</text>
    </view>
    <view class="auth-body">
      <text class="auth-desc">{{description}}</text>
    </view>
    <view class="auth-footer">
      <button class="auth-btn auth-cancel" bindtap="onClose">暂不登录</button>
      <button class="auth-btn auth-confirm" bindtap="onConfirm">去登录</button>
    </view>
  </view>
</view>
```
auth-modal.wxss:
```css
.auth-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.auth-dialog { width: 560rpx; background: #fff; border-radius: 16rpx; overflow: hidden; }
.auth-header { display: flex; justify-content: space-between; align-items: center; padding: 32rpx; }
.auth-title { font-size: 32rpx; font-weight: 500; }
.auth-close { font-size: 40rpx; color: #999; }
.auth-body { padding: 0 32rpx 32rpx; }
.auth-desc { font-size: 28rpx; color: #666; line-height: 1.6; }
.auth-footer { display: flex; border-top: 1rpx solid #f0f0f0; }
.auth-btn { flex: 1; height: 88rpx; line-height: 88rpx; text-align: center; font-size: 30rpx; border: none; border-radius: 0; }
.auth-cancel { background: #fff; color: #999; }
.auth-confirm { background: #e93323; color: #fff; }
```
auth-modal.js:
```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/components/auth-modal/
git commit -m "feat: add auth-modal component"
```

---

### Task 12: 微信登录页面 — subpackages/users/wechat_login

**Files:**
- Create: `wechat-miniprogram/subpackages/users/wechat_login/index.wxml`
- Create: `wechat-miniprogram/subpackages/users/wechat_login/index.wxss`
- Create: `wechat-miniprogram/subpackages/users/wechat_login/index.js`
- Create: `wechat-miniprogram/subpackages/users/wechat_login/index.json`

**Interfaces:**
- Consumes: `utils/auth.js` (wxLogin), `store/app.js` (store)

- [ ] **Step 1: 创建微信登录页**

index.json: `{ "navigationStyle": "custom" }`
index.wxml:
```xml
<view class="login-page">
  <view class="login-logo">
    <image src="/static/images/1-001.png" mode="aspectFit" class="logo-img"/>
    <text class="logo-text">洗眉机</text>
    <text class="logo-sub">微信一键登录，体验全部功能</text>
  </view>
  <view class="login-bottom">
    <button class="login-btn" bindtap="onWechatLogin" loading="{{loading}}">
      <image src="/static/images/wechat-icon.png" class="wechat-icon" wx:if="{{false}}"/>
      微信一键登录
    </button>
    <text class="login-tips">登录即同意 <text class="link" bindtap="onPrivacy">隐私协议</text></text>
  </view>
</view>
```
index.wxss:
```css
.login-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60rpx; background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); }
.login-logo { text-align: center; margin-bottom: 120rpx; }
.logo-img { width: 160rpx; height: 160rpx; border-radius: 32rpx; }
.logo-text { display: block; font-size: 48rpx; font-weight: bold; margin-top: 24rpx; }
.logo-sub { display: block; font-size: 28rpx; color: #999; margin-top: 12rpx; }
.login-bottom { width: 100%; text-align: center; }
.login-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #07C160; color: #fff; font-size: 32rpx; border-radius: 44rpx; border: none; }
.login-tips { display: block; font-size: 24rpx; color: #999; margin-top: 24rpx; }
.link { color: #576b95; }
```
index.js:
```javascript
const { wxLogin } = require('../../../utils/auth')
const { store } = require('../../../store/app')

Page({
  data: { loading: false },
  onWechatLogin() {
    if (this.data.loading) return
    this.setData({ loading: true })
    wxLogin().then(res => {
      if (res.isBindPhone) {
        store.emit(store.EVENTS.LOGIN)
        wx.navigateBack({ delta: 1 })
      } else {
        wx.redirectTo({ url: '/subpackages/users/binding_phone/index' })
      }
    }).catch(err => {
      wx.showToast({ title: err.msg || '登录失败', icon: 'none' })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },
  onPrivacy() {
    wx.navigateTo({ url: '/subpackages/users/privacy/index' })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/subpackages/users/wechat_login/
git commit -m "feat: add WeChat login page"
```

---

### Task 13: 绑定手机号页面 — subpackages/users/binding_phone

**Files:**
- Create: `wechat-miniprogram/subpackages/users/binding_phone/` (4 files)

**Interfaces:**
- Consumes: `utils/auth.js` (bindPhone), `utils/api/public.js` (phoneLogin)

- [ ] **Step 1: 创建绑定手机号页**

index.json: `{ "navigationStyle": "custom" }`
index.wxml:
```xml
<view class="bind-page">
  <view class="bind-header">
    <text class="bind-title">绑定手机号</text>
    <text class="bind-desc">为保护账号安全，需绑定手机号后方可继续使用</text>
  </view>
  <view class="bind-form">
    <button class="bind-phone-btn" open-type="getPhoneNumber" bindgetphonenumber="onGetPhoneNumber">
      微信授权手机号 一键绑定
    </button>
    <view class="bind-divider"><text>其他方式</text></view>
    <view class="phone-input-row">
      <input class="phone-input" type="number" maxlength="11" placeholder="请输入手机号" value="{{phone}}" bindinput="onPhoneInput"/>
      <button class="code-btn" bindtap="onSendCode" disabled="{{codeDisabled}}">{{codeText}}</button>
    </view>
    <input class="code-input" type="number" maxlength="6" placeholder="请输入验证码" value="{{code}}" bindinput="onCodeInput"/>
    <button class="bind-submit" bindtap="onPhoneLogin" loading="{{loading}}">登录</button>
  </view>
</view>
```
index.wxss:
```css
.bind-page { min-height: 100vh; padding: 80rpx 60rpx; background: #fff; }
.bind-header { text-align: center; margin-bottom: 80rpx; }
.bind-title { font-size: 40rpx; font-weight: bold; display: block; }
.bind-desc { font-size: 28rpx; color: #999; margin-top: 16rpx; display: block; }
.bind-phone-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #07C160; color: #fff; font-size: 30rpx; border-radius: 8rpx; border: none; }
.bind-divider { display: flex; align-items: center; margin: 40rpx 0; }
.bind-divider text { flex: 1; text-align: center; font-size: 26rpx; color: #ccc; }
.bind-divider::before, .bind-divider::after { content: ''; flex: 2; height: 1rpx; background: #eee; }
.phone-input-row { display: flex; margin-bottom: 20rpx; }
.phone-input { flex: 1; height: 88rpx; border: 1rpx solid #ddd; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; }
.code-btn { width: 200rpx; height: 88rpx; line-height: 88rpx; font-size: 24rpx; border-radius: 8rpx; margin-left: 16rpx; }
.code-input { width: 100%; height: 88rpx; border: 1rpx solid #ddd; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; margin-bottom: 40rpx; }
.bind-submit { width: 100%; height: 88rpx; line-height: 88rpx; background: #e93323; color: #fff; font-size: 30rpx; border-radius: 8rpx; border: none; }
```
index.js:
```javascript
const { bindPhone, wxLogin } = require('../../../utils/auth')
const { phoneLogin } = require('../../../utils/api/public')
const { store } = require('../../../store/app')

Page({
  data: { phone: '', code: '', loading: false, codeDisabled: false, codeText: '获取验证码' },
  onGetPhoneNumber(e) {
    if (!e.detail.code) return wx.showToast({ title: '授权失败', icon: 'none' })
    this.setData({ loading: true })
    wxLogin().then(() => {
      return bindPhone(e.detail.code)
    }).then(() => {
      wx.navigateBack({ delta: 2 })
    }).catch(err => {
      wx.showToast({ title: err.msg || '绑定失败', icon: 'none' })
    }).finally(() => this.setData({ loading: false }))
  },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },
  onCodeInput(e) { this.setData({ code: e.detail.value }) },
  onSendCode() {
    const { phone } = this.data
    if (!/^1\d{10}$/.test(phone)) return wx.showToast({ title: '请输入正确手机号', icon: 'none' })
    this.setData({ codeDisabled: true })
    phoneLogin({ phone }).then(() => {
      let s = 60
      const timer = setInterval(() => {
        if (s <= 0) { clearInterval(timer); this.setData({ codeDisabled: false, codeText: '重新获取' }) }
        else { this.setData({ codeText: --s + 's' }) }
      }, 1000)
    }).catch(err => {
      this.setData({ codeDisabled: false })
      wx.showToast({ title: err.msg || '发送失败', icon: 'none' })
    })
  },
  onPhoneLogin() {
    const { phone, code } = this.data
    if (!phone || !code) return wx.showToast({ title: '请填写完整', icon: 'none' })
    wxLogin().then(() => phoneLogin({ phone, code })).then(data => {
      if (data.data && data.data.token) {
        store.setToken(data.data.token)
        if (data.data.userInfo) store.setUserInfo(data.data.userInfo)
        store.emit(store.EVENTS.LOGIN)
        wx.navigateBack({ delta: 2 })
      }
    }).catch(err => wx.showToast({ title: err.msg || '登录失败', icon: 'none' }))
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/subpackages/users/binding_phone/
git commit -m "feat: add phone binding page"
```

---

### Task 14: 隐私协议页面 — subpackages/users/privacy

**Files:**
- Create: `wechat-miniprogram/subpackages/users/privacy/` (4 files)

**Interfaces:**
- Consumes: `utils/api/public.js` (getUserAgreement)

- [ ] **Step 1: 创建隐私协议页**

index.json: `{ "navigationBarTitleText": "隐私协议" }`
index.wxml:
```xml
<view class="privacy-page">
  <rich-text nodes="{{content}}" wx:if="{{content}}"/>
  <loading show="{{!content && !error}}" text="加载中..."/>
  <view class="error" wx:if="{{error}}" bindtap="loadData">加载失败，点击重试</view>
</view>
```
index.wxss:
```css
.privacy-page { padding: 30rpx; }
.error { text-align: center; padding: 100rpx 0; color: #999; }
```
index.js:
```javascript
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
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/subpackages/users/privacy/
git commit -m "feat: add privacy page"
```

---

### Task 15: 首页 — pages/home/index（动态配置渲染）

**Files:**
- Create: `wechat-miniprogram/pages/home/index.wxml`
- Create: `wechat-miniprogram/pages/home/index.wxss`
- Create: `wechat-miniprogram/pages/home/index.js`
- Create: `wechat-miniprogram/pages/home/index.json`

**Interfaces:**
- Consumes: `utils/api/home.js` (getHomeConfig), `store/app.js` (store)

- [ ] **Step 1: 创建首页（先放占位，Task 16 再添加 section 组件）**

index.json:
```json
{
  "navigationBarTitleText": "洗眉机",
  "navigationStyle": "custom",
  "usingComponents": {
    "loading": "/components/loading/loading",
    "empty": "/components/empty/empty"
  }
}
```
index.wxml:
```xml
<navbar title="洗眉机"/>
<view class="home-page" style="padding-top: {{navHeight}}px;">
  <loading show="{{loading}}"/>
  <view wx:elif="{{error}}" class="error-box" bindtap="loadData">加载失败，点击重试</view>
  <block wx:elif="{{sections.length > 0}}">
    <block wx:for="{{sections}}" wx:key="type">
      <template wx:if="{{item.type === 'banner'}}" is="home-banner" data="{{data: item.data}}"/>
      <template wx:elif="{{item.type === 'notice'}}" is="home-notice" data="{{data: item.data}}"/>
      <template wx:elif="{{item.type === 'nav_icons'}}" is="home-nav-icons" data="{{data: item.data}}"/>
      <template wx:elif="{{item.type === 'case_list'}}" is="home-case-list" data="{{data: item.data}}"/>
      <template wx:elif="{{item.type === 'course_list'}}" is="home-course-list" data="{{data: item.data}}"/>
      <template wx:elif="{{item.type === 'rich_text'}}" is="home-rich-text" data="{{data: item.data}}"/>
    </block>
  </block>
  <empty wx:elif="{{!loading && sections.length === 0}}" text="暂无内容"/>
</view>

<!-- 引入各 section 模板 -->
<import src="/components/home/banner/banner.wxml"/>
<import src="/components/home/notice/notice.wxml"/>
<import src="/components/home/nav-icons/nav-icons.wxml"/>
<import src="/components/home/case-list/case-list.wxml"/>
<import src="/components/home/course-list/course-list.wxml"/>
<import src="/components/home/rich-text/rich-text.wxml"/>
```
index.wxss:
```css
.home-page { min-height: 100vh; background: #f8f8f8; }
.error-box { text-align: center; padding: 100rpx 0; color: #999; }
```
index.js:
```javascript
const { homeApi } = require('../../utils/api/index')
const { store } = require('../../store/app')

Page({
  data: { sections: [], loading: true, error: false, navHeight: 0 },
  onLoad() {
    const info = wx.getSystemInfoSync()
    const menuBtn = wx.getMenuButtonBoundingClientRect()
    this.setData({ navHeight: menuBtn.bottom + 8 })
    this.loadData()
  },
  onShow() { if (!this.data.sections.length && !this.data.error) this.loadData() },
  loadData() {
    this.setData({ loading: true, error: false })
    homeApi.getHomeConfig().then(res => {
      const sections = (res.data && res.data.sections) || []
      this.setData({ sections, loading: false })
    }).catch(() => {
      this.setData({ loading: false, error: true })
    })
  },
  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh())
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/home/
git commit -m "feat: add home page with dynamic section rendering"
```

---

### Task 16: 首页动态区块组件（6 个 template）

**Files:**
- Create: `wechat-miniprogram/components/home/banner/` (banner.wxml, banner.wxss)
- Create: `wechat-miniprogram/components/home/notice/` (notice.wxml, notice.wxss)
- Create: `wechat-miniprogram/components/home/nav-icons/` (nav-icons.wxml, nav-icons.wxss)
- Create: `wechat-miniprogram/components/home/case-list/` (case-list.wxml, case-list.wxss)
- Create: `wechat-miniprogram/components/home/course-list/` (course-list.wxml, course-list.wxss)
- Create: `wechat-miniprogram/components/home/rich-text/` (rich-text.wxml, rich-text.wxss)

- [ ] **Step 1: 创建 banner template**

banner.wxml:
```xml
<template name="home-banner">
  <swiper class="banner-swiper" indicator-dots="{{data.items.length > 1}}" autoplay interval="4000" circular>
    <swiper-item wx:for="{{data.items}}" wx:key="index">
      <image src="{{item.image}}" mode="aspectFill" class="banner-img"
        bindtap="onBannerTap" data-link="{{item.link}}"/>
    </swiper-item>
  </swiper>
</template>
```
banner.wxss:
```css
.banner-swiper { width: 100%; height: 360rpx; }
.banner-img { width: 100%; height: 100%; }
```

- [ ] **Step 2: 创建 notice template**

notice.wxml:
```xml
<template name="home-notice">
  <view class="notice-bar" wx:if="{{data.text}}" bindtap="onNoticeTap" data-link="{{data.link}}">
    <image src="/static/images/horn.png" class="notice-icon"/>
    <text class="notice-text text-ellipsis">{{data.text}}</text>
  </view>
</template>
```
notice.wxss:
```css
.notice-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; margin: 12rpx 20rpx; border-radius: 8rpx; }
.notice-icon { width: 32rpx; height: 32rpx; margin-right: 12rpx; }
.notice-text { flex: 1; font-size: 26rpx; color: #666; }
```

- [ ] **Step 3: 创建 nav-icons template**

nav-icons.wxml:
```xml
<template name="home-nav-icons">
  <view class="nav-icons" wx:if="{{data.items && data.items.length}}">
    <view class="nav-icon-item" wx:for="{{data.items}}" wx:key="index" bindtap="onNavTap" data-link="{{item.link}}">
      <image src="{{item.icon}}" mode="aspectFit" class="nav-icon-img"/>
      <text class="nav-icon-text">{{item.text}}</text>
    </view>
  </view>
</template>
```
nav-icons.wxss:
```css
.nav-icons { display: flex; flex-wrap: wrap; background: #fff; padding: 20rpx 0; margin: 12rpx 20rpx; border-radius: 12rpx; }
.nav-icon-item { width: 25%; display: flex; flex-direction: column; align-items: center; padding: 16rpx 0; }
.nav-icon-img { width: 80rpx; height: 80rpx; }
.nav-icon-text { font-size: 24rpx; color: #333; margin-top: 8rpx; }
```

- [ ] **Step 4: 创建 case-list template**

case-list.wxml:
```xml
<template name="home-case-list">
  <view class="section-block" wx:if="{{data.cases && data.cases.length}}">
    <view class="section-header">
      <text class="section-title">{{data.title || '精选案例'}}</text>
      <text class="section-more" bindtap="onGoCase">查看更多 ></text>
    </view>
    <scroll-view scroll-x class="case-scroll">
      <view class="case-scroll-item" wx:for="{{data.cases}}" wx:key="id" bindtap="onCaseTap" data-id="{{item.id}}">
        <image src="{{item.cover}}" mode="aspectFill" class="case-scroll-img"/>
        <text class="case-scroll-title text-ellipsis">{{item.title}}</text>
      </view>
    </scroll-view>
  </view>
</template>
```
case-list.wxss:
```css
.section-block { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: 500; }
.section-more { font-size: 26rpx; color: #999; }
.case-scroll { white-space: nowrap; }
.case-scroll-item { display: inline-block; width: 240rpx; margin-right: 20rpx; }
.case-scroll-item:last-child { margin-right: 0; }
.case-scroll-img { width: 240rpx; height: 180rpx; border-radius: 8rpx; }
.case-scroll-title { font-size: 26rpx; margin-top: 8rpx; }
```

- [ ] **Step 5: 创建 course-list template**

course-list.wxml:
```xml
<template name="home-course-list">
  <view class="section-block" wx:if="{{data.courses && data.courses.length}}">
    <view class="section-header">
      <text class="section-title">{{data.title || '热门课程'}}</text>
      <text class="section-more" bindtap="onGoTeaching">查看更多 ></text>
    </view>
    <view class="course-grid">
      <course-card wx:for="{{data.courses}}" wx:key="id" item="{{item}}" bind:tap="onCourseTap"/>
    </view>
  </view>
</template>
```
course-list.wxss:
```css
/* 复用 section-block 样式 */
```

- [ ] **Step 6: 创建 rich-text template**

rich-text.wxml:
```xml
<template name="home-rich-text">
  <view class="rich-text-block" wx:if="{{data.html}}">
    <rich-text nodes="{{data.html}}"/>
  </view>
</template>
```
rich-text.wxss:
```css
.rich-text-block { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
```

- [ ] **Step 7: 在首页 JS 中添加事件处理函数**

更新 `pages/home/index.js`，在 `Page({})` 中添加：
```javascript
methods: {
  onBannerTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNoticeTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.navigateTo({ url: link }) },
  onNavTap(e) { const link = e.currentTarget.dataset.link; if (link) wx.switchTab({ url: link }) },
  onGoCase() { wx.switchTab({ url: '/pages/case/index' }) },
  onCaseTap(e) { wx.switchTab({ url: '/pages/case/index' }) },
  onGoTeaching() { wx.switchTab({ url: '/pages/teaching/index' }) },
  onCourseTap(e) { wx.switchTab({ url: '/pages/teaching/index' }) }
}
```

- [ ] **Step 8: 提交**

```bash
git add wechat-miniprogram/components/home/
git commit -m "feat: add home section components (banner/notice/nav-icons/case-list/course-list/rich-text)"
```

---

### Task 17: 案例列表页 — pages/case/index

**Files:**
- Create: `wechat-miniprogram/pages/case/index.wxml`
- Create: `wechat-miniprogram/pages/case/index.wxss`
- Create: `wechat-miniprogram/pages/case/index.js`
- Create: `wechat-miniprogram/pages/case/index.json`

**Interfaces:**
- Consumes: `utils/api/case.js` (getCaseList, toggleCaseFavorite)

- [ ] **Step 1: 创建案例列表页**

index.json:
```json
{
  "navigationBarTitleText": "案例",
  "usingComponents": {
    "case-card": "/components/case-card/case-card",
    "loading": "/components/loading/loading",
    "empty": "/components/empty/empty"
  }
}
```
index.wxml:
```xml
<view class="case-page">
  <view class="case-tabs">
    <text class="tab-item {{activeType === 0 ? 'active' : ''}}" bindtap="onTabChange" data-type="0">全部</text>
    <text class="tab-item {{activeType === 1 ? 'active' : ''}}" bindtap="onTabChange" data-type="1">图片</text>
    <text class="tab-item {{activeType === 2 ? 'active' : ''}}" bindtap="onTabChange" data-type="2">视频</text>
  </view>
  <loading show="{{loading}}"/>
  <view wx:elif="{{error}}" class="error-box" bindtap="loadData">加载失败，点击重试</view>
  <view wx:elif="{{list.length}}" class="case-grid">
    <view class="case-grid-item" wx:for="{{list}}" wx:key="id" bindtap="onCaseTap" data-id="{{item.id}}">
      <image src="{{item.cover}}" mode="aspectFill" class="case-grid-img"/>
      <view class="case-grid-info">
        <text class="case-grid-title text-ellipsis">{{item.title}}</text>
      </view>
    </view>
  </view>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无案例"/>
  <view class="load-more" wx:if="{{hasMore && list.length}}">
    <text bindtap="loadMore">加载更多</text>
  </view>
</view>
```
index.wxss:
```css
.case-tabs { display: flex; background: #fff; padding: 0 20rpx; position: sticky; top: 0; z-index: 10; }
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; }
.tab-item.active { color: #e93323; font-weight: 500; border-bottom: 4rpx solid #e93323; }
.case-grid { display: flex; flex-wrap: wrap; padding: 12rpx; }
.case-grid-item { width: calc(50% - 12rpx); margin: 6rpx; background: #fff; border-radius: 8rpx; overflow: hidden; }
.case-grid-img { width: 100%; height: 360rpx; }
.case-grid-info { padding: 12rpx; }
.case-grid-title { font-size: 26rpx; }
.load-more { text-align: center; padding: 30rpx; color: #999; font-size: 26rpx; }
.error-box { text-align: center; padding: 100rpx; color: #999; }
```
index.js:
```javascript
const { caseApi } = require('../../utils/api/index')

Page({
  data: { activeType: 0, list: [], page: 1, limit: 10, hasMore: true, loading: true, error: false },
  onLoad() { this.loadData() },
  onPullDownRefresh() { this.setData({ page: 1, list: [], hasMore: true }); this.loadData().finally(() => wx.stopPullDownRefresh()) },
  loadData() {
    this.setData({ loading: true, error: false })
    const { activeType, page, limit } = this.data
    return caseApi.getCaseList({ type: activeType, page, limit }).then(res => {
      const newList = (res.data && res.data.list) || []
      this.setData({
        list: page === 1 ? newList : [...this.data.list, ...newList],
        hasMore: newList.length >= limit,
        loading: false
      })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onTabChange(e) {
    const type = parseInt(e.currentTarget.dataset.type)
    if (type === this.data.activeType) return
    this.setData({ activeType: type, page: 1, list: [], hasMore: true })
    this.loadData()
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },
  onCaseTap(e) {
    const id = e.currentTarget.dataset.id
    // 待实现案例详情页
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/case/
git commit -m "feat: add case list page with type filter and waterfall grid"
```

---

### Task 18: 教学页 — pages/teaching/index

**Files:**
- Create: `wechat-miniprogram/pages/teaching/index.wxml`
- Create: `wechat-miniprogram/pages/teaching/index.wxss`
- Create: `wechat-miniprogram/pages/teaching/index.js`
- Create: `wechat-miniprogram/pages/teaching/index.json`

**Interfaces:**
- Consumes: `utils/api/teaching.js` (getCourseList, getOfflineClassList, createCourseOrder), `utils/payment.js` (requestPayment), `store/app.js` (store)

- [ ] **Step 1: 创建教学页**

index.json:
```json
{
  "navigationBarTitleText": "教学",
  "usingComponents": {
    "course-card": "/components/course-card/course-card",
    "offline-card": "/components/offline-card/offline-card",
    "loading": "/components/loading/loading",
    "empty": "/components/empty/empty"
  }
}
```
index.wxml:
```xml
<view class="teaching-page">
  <view class="teaching-tabs">
    <text class="tab-item {{activeTab === 'course' ? 'active' : ''}}" bindtap="onTabChange" data-tab="course">线上课程</text>
    <text class="tab-item {{activeTab === 'offline' ? 'active' : ''}}" bindtap="onTabChange" data-tab="offline">线下课</text>
  </view>

  <!-- 线上课程 -->
  <view wx:if="{{activeTab === 'course'}}">
    <view class="member-banner" wx:if="{{!isMember}}">
      <text class="member-text">开通会员，全部课程免费看</text>
      <text class="member-btn" bindtap="onOpenMember">开通会员</text>
    </view>
    <loading show="{{loading}}"/>
    <view wx:elif="{{error}}" class="error-box" bindtap="loadData">加载失败，点击重试</view>
    <empty wx:elif="{{!loading && courseList.length === 0}}" text="暂无课程"/>
    <view wx:else class="course-list">
      <course-card wx:for="{{courseList}}" wx:key="id" item="{{item}}" bind:tap="onCourseTap"/>
    </view>
  </view>

  <!-- 线下课 -->
  <view wx:if="{{activeTab === 'offline'}}">
    <view class="member-banner" wx:if="{{!isMember}}">
      <text class="member-text">开通会员，参加线下培训</text>
    </view>
    <loading show="{{loading}}"/>
    <view wx:elif="{{error}}" class="error-box" bindtap="loadData">加载失败，点击重试</view>
    <empty wx:elif="{{!loading && offlineList.length === 0}}" text="暂无排期"/>
    <view wx:else class="offline-list">
      <offline-card wx:for="{{offlineList}}" wx:key="id" item="{{item}}" bind:tap="onOfflineTap"/>
    </view>
  </view>
</view>
```
index.wxss:
```css
.teaching-tabs { display: flex; background: #fff; position: sticky; top: 0; z-index: 10; }
.teaching-tabs .tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: #666; }
.teaching-tabs .tab-item.active { color: #e93323; font-weight: 500; border-bottom: 4rpx solid #e93323; }
.member-banner { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; background: linear-gradient(135deg, #fff5f5, #ffe8e8); margin: 16rpx 20rpx; border-radius: 12rpx; }
.member-text { font-size: 26rpx; color: #e93323; }
.member-btn { font-size: 24rpx; color: #fff; background: #e93323; padding: 8rpx 24rpx; border-radius: 24rpx; }
.course-list { padding: 16rpx 20rpx; }
.offline-list { padding: 16rpx 20rpx; }
.error-box { text-align: center; padding: 100rpx; color: #999; }
```
index.js:
```javascript
const { teachingApi } = require('../../utils/api/index')
const { requestPayment } = require('../../utils/payment')
const { store } = require('../../store/app')

Page({
  data: {
    activeTab: 'course', courseList: [], offlineList: [],
    page: 1, limit: 10, loading: true, error: false, isMember: false
  },
  onLoad() { this.loadData() },
  onShow() {
    this.setData({ isMember: getApp().globalData.isMember })
    store.on(store.EVENTS.MEMBER_CHANGE, this.onMemberChange)
  },
  onHide() { store.off(store.EVENTS.MEMBER_CHANGE, this.onMemberChange) },
  onMemberChange() { this.setData({ isMember: getApp().globalData.isMember }); this.loadData() },
  loadData() {
    this.setData({ loading: true, error: false })
    const fetcher = this.data.activeTab === 'course' ? teachingApi.getCourseList : teachingApi.getOfflineClassList
    fetcher({ page: this.data.page, limit: this.data.limit }).then(res => {
      const list = (res.data && res.data.list) || []
      const key = this.data.activeTab === 'course' ? 'courseList' : 'offlineList'
      this.setData({ [key]: list, loading: false })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab, page: 1 })
    this.loadData()
  },
  onCourseTap(e) {
    const item = e.detail.item
    const app = getApp()
    if (app.globalData.isMember || item.is_free_for_member === 1) {
      // 会员直接播放
    } else {
      wx.showModal({
        title: '试听课程',
        content: '支付 ¥' + (item.price || '9.90') + ' 试听本课程',
        success: res => {
          if (res.confirm) {
            teachingApi.createCourseOrder(item.id).then(orderRes => {
              const payParams = orderRes.data.pay_params
              return requestPayment(payParams)
            }).then(() => {
              wx.showToast({ title: '支付成功', icon: 'success' })
            }).catch(err => {
              if (err.code !== 'cancel') wx.showToast({ title: err.msg || '支付失败', icon: 'none' })
            })
          }
        }
      })
    }
  },
  onOfflineTap(e) {
    const item = e.detail.item
    wx.showModal({
      title: item.title,
      content: '日期：' + item.class_date + '\n时间：' + item.start_time + '-' + item.end_time + '\n地点：' + (item.address || '待定'),
      confirmText: '我要预约',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/teaching/booking?id=' + item.id })
        }
      }
    })
  },
  onOpenMember() {
    wx.showToast({ title: '敬请期待', icon: 'none' })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/teaching/
git commit -m "feat: add teaching page with course/offline tabs and payment"
```

---

### Task 19: 我的页面 — pages/my/index

**Files:**
- Create: `wechat-miniprogram/pages/my/index.wxml`
- Create: `wechat-miniprogram/pages/my/index.wxss`
- Create: `wechat-miniprogram/pages/my/index.js`
- Create: `wechat-miniprogram/pages/my/index.json`

**Interfaces:**
- Consumes: `utils/api/my.js` (getUserInfo), `store/app.js` (store), `utils/auth.js` (logout)

- [ ] **Step 1: 创建我的页面**

index.json: `{ "navigationBarTitleText": "我的", "usingComponents": { "loading": "/components/loading/loading" } }`
index.wxml:
```xml
<view class="my-page">
  <view class="my-header">
    <image src="{{userInfo.avatar || '/static/images/def_avatar.png'}}" class="my-avatar"/>
    <view class="my-user-info">
      <text class="my-nickname">{{userInfo.nickname || '未登录'}}</text>
      <text class="my-member-badge" wx:if="{{isMember}}">教学会员</text>
      <text class="my-member-badge not-member" wx:elif="{{isLogin && !isMember}}">非会员</text>
    </view>
  </view>

  <view class="my-menus">
    <view class="menu-item" bindtap="onNav" data-url="/pages/my/favorites">
      <text>我的收藏</text><text class="menu-arrow">></text>
    </view>
    <view class="menu-item" bindtap="onNav" data-url="/pages/my/courses">
      <text>已购课程</text><text class="menu-arrow">></text>
    </view>
    <view class="menu-item" bindtap="onNav" data-url="/pages/my/bookings">
      <text>线下课预约</text><text class="menu-arrow">></text>
    </view>
    <view class="menu-item" bindtap="onNav" data-url="/pages/my/comments">
      <text>我的评论</text><text class="menu-arrow">></text>
    </view>
    <view class="menu-item" bindtap="onNav" data-url="/pages/my/posts">
      <text>我的发帖</text><text class="menu-arrow">></text>
    </view>
  </view>

  <view class="my-footer" wx:if="{{isLogin}}">
    <button class="logout-btn" bindtap="onLogout">退出登录</button>
  </view>
</view>
```
index.wxss:
```css
.my-header { display: flex; align-items: center; padding: 40rpx 30rpx; background: linear-gradient(135deg, #e93323, #ff6b6b); }
.my-avatar { width: 120rpx; height: 120rpx; border-radius: 50%; border: 4rpx solid rgba(255,255,255,0.3); }
.my-user-info { margin-left: 24rpx; }
.my-nickname { font-size: 36rpx; color: #fff; font-weight: 500; display: block; }
.my-member-badge { display: inline-block; margin-top: 8rpx; padding: 4rpx 16rpx; background: rgba(255,255,255,0.3); border-radius: 4rpx; font-size: 22rpx; color: #fff; }
.my-member-badge.not-member { background: rgba(0,0,0,0.2); }
.my-menus { background: #fff; margin: 20rpx; border-radius: 12rpx; }
.menu-item { display: flex; justify-content: space-between; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; font-size: 30rpx; }
.menu-item:last-child { border-bottom: none; }
.menu-arrow { color: #ccc; }
.my-footer { padding: 40rpx 20rpx; }
.logout-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #fff; border: 1rpx solid #ddd; border-radius: 8rpx; font-size: 30rpx; color: #666; }
```
index.js:
```javascript
const { myApi } = require('../../utils/api/index')
const { store } = require('../../store/app')
const { logout } = require('../../utils/auth')

Page({
  data: { userInfo: null, isLogin: false, isMember: false, loading: true },
  onShow() {
    const app = getApp()
    this.setData({
      isLogin: app.globalData.isLogin,
      isMember: app.globalData.isMember,
      userInfo: app.globalData.userInfo || {}
    })
    if (app.globalData.isLogin && !app.globalData.userInfo) {
      myApi.getUserInfo().then(res => {
        const info = res.data
        if (info) {
          store.setUserInfo(info)
          this.setData({ userInfo: info, isMember: info.is_teaching_member === 1 })
        }
      }).finally(() => this.setData({ loading: false }))
    } else {
      this.setData({ loading: false })
    }
    store.on(store.EVENTS.LOGIN, this.refresh)
  },
  onHide() { store.off(store.EVENTS.LOGIN, this.refresh) },
  refresh() {
    const app = getApp()
    this.setData({ isLogin: true, isMember: app.globalData.isMember, userInfo: app.globalData.userInfo })
  },
  onNav(e) {
    const url = e.currentTarget.dataset.url
    if (!getApp().globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url })
  },
  onLogout() {
    wx.showModal({
      title: '提示', content: '确定退出登录？',
      success: res => {
        if (res.confirm) {
          logout()
          this.setData({ isLogin: false, isMember: false, userInfo: null })
        }
      }
    })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/
git commit -m "feat: add my page with user info, menus, and logout"
```

---

### Task 20: 引导页 — pages/guide/index

**Files:**
- Modify: `wechat-miniprogram/pages/guide/index.wxml`
- Modify: `wechat-miniprogram/pages/guide/index.js`
- Modify: `wechat-miniprogram/pages/guide/index.wxss`

- [ ] **Step 1: 完善引导页**

index.json: `{ "navigationStyle": "custom" }`
index.wxml:
```xml
<view class="guide-page">
  <swiper class="guide-swiper" indicator-dots>
    <swiper-item>
      <image src="/static/images/1-001.png" mode="aspectFit" class="guide-img"/>
      <text class="guide-text">洗眉机产品展示</text>
    </swiper-item>
    <swiper-item>
      <image src="/static/images/2-001.png" mode="aspectFit" class="guide-img"/>
      <text class="guide-text">丰富案例供你参考</text>
    </swiper-item>
    <swiper-item>
      <view class="guide-last">
        <image src="/static/images/3-001.png" mode="aspectFit" class="guide-img"/>
        <text class="guide-text">开启你的学习之旅</text>
        <button class="guide-start" bindtap="onStart">立即体验</button>
      </view>
    </swiper-item>
  </swiper>
</view>
```
index.wxss:
```css
.guide-page { width: 100vw; height: 100vh; }
.guide-swiper { width: 100%; height: 100%; }
.guide-img { width: 100%; height: 70%; margin-top: 100rpx; }
.guide-text { display: block; text-align: center; font-size: 36rpx; color: #333; margin-top: 40rpx; }
.guide-start { width: 400rpx; height: 88rpx; line-height: 88rpx; background: #e93323; color: #fff; font-size: 32rpx; border-radius: 44rpx; border: none; margin-top: 60rpx; }
```
index.js:
```javascript
Page({
  onStart() {
    wx.setStorageSync('has_guided', true)
    wx.switchTab({ url: '/pages/home/index' })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/guide/
git commit -m "feat: add guide/swipe intro page"
```

---

### Task 21: 朋友圈列表 — pages/moment/index

**Files:**
- Create: `wechat-miniprogram/pages/moment/index.wxml`
- Create: `wechat-miniprogram/pages/moment/index.wxss`
- Create: `wechat-miniprogram/pages/moment/index.js`
- Create: `wechat-miniprogram/pages/moment/index.json`

**Interfaces:**
- Consumes: `utils/api/moment.js` (getMomentList, toggleLike, toggleFavorite), `utils/api/public.js` (upload)

- [ ] **Step 1: 创建朋友圈列表页**

index.json:
```json
{
  "navigationBarTitleText": "朋友圈",
  "enablePullDownRefresh": true,
  "usingComponents": {
    "image-preview": "/components/image-preview/image-preview",
    "loading": "/components/loading/loading",
    "empty": "/components/empty/empty"
  }
}
```
index.wxml:
```xml
<view class="moment-page">
  <!-- 浮动发布按钮（仅会员） -->
  <view class="publish-fab" wx:if="{{isMember}}" bindtap="onPublish">
    <text class="fab-text">+</text>
  </view>

  <loading show="{{loading && page === 1}}"/>
  <view wx:elif="{{error && page === 1}}" class="error-box" bindtap="loadData">加载失败，点击重试</view>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无动态，成为会员即可发布"/>

  <block wx:for="{{list}}" wx:key="id">
    <view class="moment-item">
      <view class="moment-header">
        <image src="{{item.user_avatar || '/static/images/def_avatar.png'}}" class="moment-avatar"/>
        <view class="moment-user">
          <text class="moment-nickname">{{item.user_nickname || '用户'}}</text>
          <text class="moment-time">{{item.add_time}}</text>
        </view>
      </view>
      <view class="moment-body">
        <text class="moment-content">{{item.content}}</text>
        <image-preview images="{{item.images}}" wx:if="{{item.images && item.images.length}}"/>
        <video src="{{item.video_url}}" wx:if="{{item.video_url}}" class="moment-video" controls/>
      </view>
      <view class="moment-actions">
        <view class="action-item" bindtap="onLike" data-index="{{index}}" data-id="{{item.id}}">
          <text class="{{item.is_liked ? 'action-active' : ''}}">{{item.is_liked ? '❤' : '🤍'}} {{item.like_count || 0}}</text>
        </view>
        <view class="action-item" bindtap="onComment" data-id="{{item.id}}">
          <text>💬 {{item.comment_count || 0}}</text>
        </view>
        <view class="action-item" bindtap="onFavorite" data-index="{{index}}" data-id="{{item.id}}">
          <text class="{{item.is_favorited ? 'action-active' : ''}}">{{item.is_favorited ? '⭐' : '☆'}}</text>
        </view>
        <view class="action-item" bindtap="onShare" data-id="{{item.id}}">
          <text>↗</text>
        </view>
      </view>
    </view>
  </block>

  <view class="load-more" wx:if="{{hasMore && list.length}}">
    <text bindtap="loadMore">加载更多</text>
  </view>
</view>
```
index.wxss:
```css
.moment-item { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
.moment-header { display: flex; align-items: center; }
.moment-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.moment-user { margin-left: 16rpx; flex: 1; }
.moment-nickname { font-size: 28rpx; color: #576b95; display: block; }
.moment-time { font-size: 22rpx; color: #999; }
.moment-body { margin-top: 16rpx; }
.moment-content { font-size: 30rpx; line-height: 1.6; word-break: break-all; }
.moment-video { width: 100%; height: 360rpx; margin-top: 12rpx; border-radius: 8rpx; }
.moment-actions { display: flex; justify-content: space-around; padding-top: 20rpx; margin-top: 16rpx; border-top: 1rpx solid #f5f5f5; }
.action-item { font-size: 26rpx; color: #666; }
.action-active { color: #e93323; }
.publish-fab { position: fixed; right: 40rpx; bottom: 120rpx; width: 96rpx; height: 96rpx; background: #e93323; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 100; box-shadow: 0 4rpx 16rpx rgba(233,51,35,0.4); }
.fab-text { font-size: 48rpx; color: #fff; }
.error-box { text-align: center; padding: 100rpx; color: #999; }
.load-more { text-align: center; padding: 30rpx; color: #999; }
```
index.js:
```javascript
const { momentApi } = require('../../utils/api/index')
const { store } = require('../../store/app')

Page({
  data: { list: [], page: 1, limit: 10, hasMore: true, loading: false, error: false, isMember: false },
  onLoad() { this.setData({ isMember: getApp().globalData.isMember }) },
  onShow() {
    if (this.data.list.length === 0) this.loadData()
    this.setData({ isMember: getApp().globalData.isMember })
  },
  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true })
    this.loadData().finally(() => wx.stopPullDownRefresh())
  },
  loadData() {
    this.setData({ loading: true, error: false })
    return momentApi.getMomentList({ page: this.data.page, limit: this.data.limit }).then(res => {
      const newList = (res.data && res.data.list) || []
      this.setData({
        list: this.data.page === 1 ? newList : [...this.data.list, ...newList],
        hasMore: newList.length >= this.data.limit,
        loading: false
      })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },
  onLike(e) {
    const { id, index } = e.currentTarget.dataset
    momentApi.toggleLike(id).then(res => {
      const action = res.data && res.data.action
      const list = this.data.list
      list[index].is_liked = action === 'liked'
      list[index].like_count += action === 'liked' ? 1 : -1
      this.setData({ list })
    })
  },
  onFavorite(e) {
    const { id, index } = e.currentTarget.dataset
    momentApi.toggleFavorite(id).then(res => {
      const action = res.data && res.data.action
      const list = this.data.list
      list[index].is_favorited = action === 'favorited'
      this.setData({ list })
    })
  },
  onComment(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
  },
  onShare(e) {
    const { id } = e.currentTarget.dataset
    momentApi.shareMoment(id).then(() => wx.showToast({ title: '已分享', icon: 'success' }))
  },
  onPublish() {
    if (!getApp().globalData.isLogin) {
      wx.navigateTo({ url: '/subpackages/users/wechat_login/index' })
      return
    }
    wx.navigateTo({ url: '/pages/moment/publish' })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/moment/index/
git commit -m "feat: add moment list page with like/favorite/comment/share"
```

---

### Task 22: 帖子详情页 — pages/moment/detail

**Files:**
- Create: `wechat-miniprogram/pages/moment/detail/` (4 files)

**Interfaces:**
- Consumes: `utils/api/moment.js` (getMomentDetail, toggleLike, toggleFavorite, createComment, deleteComment, shareMoment)

- [ ] **Step 1: 创建帖子详情页**

index.json:
```json
{
  "navigationBarTitleText": "帖子详情",
  "usingComponents": {
    "image-preview": "/components/image-preview/image-preview",
    "comment-list": "/components/comment-list/comment-list",
    "loading": "/components/loading/loading"
  }
}
```
index.wxml:
```xml
<loading show="{{loading}}"/>
<view wx:if="{{!loading && moment}}" class="detail-page">
  <view class="moment-header">
    <image src="{{moment.user_avatar || '/static/images/def_avatar.png'}}" class="moment-avatar"/>
    <view class="moment-user">
      <text class="moment-nickname">{{moment.user_nickname || '用户'}}</text>
      <text class="moment-time">{{moment.add_time}}</text>
    </view>
  </view>
  <view class="moment-body">
    <text class="moment-content">{{moment.content}}</text>
    <image-preview images="{{moment.images}}" wx:if="{{moment.images && moment.images.length}}"/>
    <video src="{{moment.video_url}}" wx:if="{{moment.video_url}}" class="moment-video" controls/>
  </view>
  <view class="moment-actions">
    <view class="action-item" bindtap="onLike">
      <text class="{{moment.is_liked ? 'action-active' : ''}}">{{moment.is_liked ? '❤' : '🤍'}} {{moment.like_count || 0}}</text>
    </view>
    <view class="action-item" bindtap="onFavorite">
      <text class="{{moment.is_favorited ? 'action-active' : ''}}">{{moment.is_favorited ? '⭐' : '☆'}}</text>
    </view>
    <view class="action-item" bindtap="onShare"><text>↗ 分享</text></view>
  </view>

  <view class="comment-section">
    <text class="section-title">评论 ({{moment.comment_count || 0}})</text>
    <comment-list comments="{{moment.comments}}" bind:reply="onReply" bind:delete="onDeleteComment"/>
  </view>

  <view class="comment-input-bar">
    <input class="comment-input" placeholder="写评论..." value="{{commentText}}" bindinput="onCommentInput"
      confirm-type="send" bindconfirm="onSendComment"/>
    <text class="send-btn" bindtap="onSendComment">发送</text>
  </view>
</view>
<view class="error-box" wx:if="{{error}}" bindtap="loadData">加载失败，点击重试</view>
```
index.wxss:
```css
.detail-page { padding-bottom: 100rpx; }
.moment-header { display: flex; align-items: center; padding: 24rpx; background: #fff; }
.moment-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.moment-user { margin-left: 16rpx; flex: 1; }
.moment-nickname { font-size: 28rpx; color: #576b95; }
.moment-time { font-size: 22rpx; color: #999; display: block; }
.moment-body { padding: 0 24rpx 16rpx; background: #fff; }
.moment-content { font-size: 30rpx; line-height: 1.6; }
.moment-video { width: 100%; height: 400rpx; margin-top: 12rpx; }
.moment-actions { display: flex; justify-content: space-around; padding: 20rpx; background: #fff; border-top: 1rpx solid #f5f5f5; }
.action-item { font-size: 28rpx; }
.action-active { color: #e93323; }
.comment-section { background: #fff; margin-top: 16rpx; padding: 24rpx; }
.section-title { font-size: 30rpx; font-weight: 500; margin-bottom: 16rpx; display: block; }
.comment-input-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; align-items: center; padding: 12rpx 20rpx; background: #fff; border-top: 1rpx solid #eee; }
.comment-input { flex: 1; height: 64rpx; background: #f5f5f5; border-radius: 32rpx; padding: 0 24rpx; font-size: 26rpx; }
.send-btn { width: 88rpx; text-align: center; font-size: 28rpx; color: #e93323; }
.error-box { text-align: center; padding: 100rpx; color: #999; }
```
index.js:
```javascript
const { momentApi } = require('../../utils/api/index')

Page({
  data: { moment: null, commentText: '', replyTo: null, loading: true, error: false },
  onLoad(options) {
    if (options.id) this.loadData(options.id)
  },
  loadData(id) {
    this.setData({ loading: true, error: false })
    momentApi.getMomentDetail(id).then(res => {
      this.setData({ moment: res.data, loading: false })
    }).catch(() => this.setData({ loading: false, error: true }))
  },
  onLike() {
    const { moment } = this.data
    momentApi.toggleLike(moment.id).then(res => {
      const action = res.data && res.data.action
      moment.is_liked = action === 'liked'
      moment.like_count += action === 'liked' ? 1 : -1
      this.setData({ moment })
    })
  },
  onFavorite() {
    const { moment } = this.data
    momentApi.toggleFavorite(moment.id).then(res => {
      moment.is_favorited = (res.data && res.data.action) === 'favorited'
      this.setData({ moment })
    })
  },
  onShare() {
    momentApi.shareMoment(this.data.moment.id).then(() => wx.showToast({ title: '分享成功', icon: 'success' }))
  },
  onReply(e) {
    this.setData({ replyTo: { parentId: e.detail.parentId }, commentText: '@' + (e.detail.nickname || '') + ' ' })
  },
  onDeleteComment(e) {
    wx.showModal({
      title: '删除评论', content: '确定删除？',
      success: res => {
        if (res.confirm) {
          momentApi.deleteComment(e.detail.id).then(() => this.loadData(this.data.moment.id))
        }
      }
    })
  },
  onCommentInput(e) { this.setData({ commentText: e.detail.value }) },
  onSendComment() {
    const { moment, commentText, replyTo } = this.data
    if (!commentText.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    const data = { moment_id: moment.id, content: commentText.trim() }
    if (replyTo) data.parent_id = replyTo.parentId
    momentApi.createComment(data).then(() => {
      this.setData({ commentText: '', replyTo: null })
      this.loadData(moment.id)
    }).catch(err => wx.showToast({ title: err.msg || '评论失败', icon: 'none' }))
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/moment/detail/
git commit -m "feat: add moment detail page with recursive comments"
```

---

### Task 23: 发布帖子页 — pages/moment/publish

**Files:**
- Create: `wechat-miniprogram/pages/moment/publish/` (4 files)

**Interfaces:**
- Consumes: `utils/api/moment.js` (createMoment)

- [ ] **Step 1: 创建发布页**

index.json: `{ "navigationBarTitleText": "发布" }`
index.wxml:
```xml
<view class="publish-page">
  <textarea class="publish-textarea" placeholder="分享你的想法..." value="{{content}}"
    bindinput="onContentInput" maxlength="2000" auto-height/>
  <view class="publish-media">
    <view class="media-item" wx:for="{{images}}" wx:key="index">
      <image src="{{item}}" mode="aspectFill" class="media-img"/>
      <text class="media-delete" bindtap="onDelImage" data-index="{{index}}">×</text>
    </view>
    <view class="media-add" wx:if="{{images.length < 9 && !videoPath}}" bindtap="onChooseImage">
      <text class="add-icon">+</text><text class="add-text">图片</text>
    </view>
    <view class="media-add" wx:if="{{!videoPath && images.length === 0}}" bindtap="onChooseVideo">
      <text class="add-icon">▶</text><text class="add-text">视频</text>
    </view>
    <video src="{{videoPath}}" wx:if="{{videoPath}}" class="publish-video" controls/>
    <text class="media-delete" wx:if="{{videoPath}}" bindtap="onDelVideo" style="position:absolute;">×</text>
  </view>
  <view class="publish-footer">
    <button class="publish-btn" bindtap="onSubmit" loading="{{submitting}}">发布</button>
  </view>
</view>
```
index.wxss:
```css
.publish-page { padding: 20rpx; }
.publish-textarea { width: 100%; min-height: 300rpx; font-size: 30rpx; padding: 20rpx; background: #fff; border-radius: 8rpx; }
.publish-media { display: flex; flex-wrap: wrap; margin-top: 20rpx; }
.media-item, .media-add { width: 200rpx; height: 200rpx; margin: 0 12rpx 12rpx 0; border-radius: 8rpx; position: relative; }
.media-item { background: #eee; }
.media-img { width: 100%; height: 100%; border-radius: 8rpx; }
.media-delete { position: absolute; top: -8rpx; right: -8rpx; width: 40rpx; height: 40rpx; background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; text-align: center; line-height: 40rpx; font-size: 28rpx; }
.media-add { border: 2rpx dashed #ccc; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; font-size: 26rpx; }
.add-icon { font-size: 48rpx; }
.publish-video { width: 100%; height: 360rpx; border-radius: 8rpx; }
.publish-footer { margin-top: 40rpx; }
.publish-btn { width: 100%; height: 88rpx; line-height: 88rpx; background: #e93323; color: #fff; font-size: 32rpx; border-radius: 8rpx; border: none; }
```
index.js:
```javascript
const { momentApi } = require('../../utils/api/index')

Page({
  data: { content: '', images: [], videoPath: '', submitting: false },
  onContentInput(e) { this.setData({ content: e.detail.value }) },
  onChooseImage() {
    const remain = 9 - this.data.images.length
    wx.chooseImage({ count: remain, sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ images: [...this.data.images, ...res.tempFilePaths] })
      }
    })
  },
  onDelImage(e) {
    const idx = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== idx)
    this.setData({ images })
  },
  onChooseVideo() {
    wx.chooseVideo({ sourceType: ['album', 'camera'], maxDuration: 60,
      success: res => this.setData({ videoPath: res.tempFilePath })
    })
  },
  onDelVideo() { this.setData({ videoPath: '' }) },
  onSubmit() {
    const { content, images, videoPath } = this.data
    if (!content.trim() && images.length === 0 && !videoPath) {
      return wx.showToast({ title: '请输入内容或上传图片/视频', icon: 'none' })
    }
    this.setData({ submitting: true })
    // 先上传图片，再调用 createMoment。简化：直接传本地路径，由后端处理上传
    momentApi.createMoment({
      content: content.trim(),
      images: images.length > 0 ? JSON.stringify(images) : undefined,
      video_url: videoPath || undefined
    }).then(() => {
      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(err => {
      wx.showToast({ title: err.msg || '发布失败', icon: 'none' })
    }).finally(() => this.setData({ submitting: false }))
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/moment/publish/
git commit -m "feat: add moment publish page with image/video upload"
```

---

### Task 24: 我的收藏 — pages/my/favorites

**Files:**
- Create: `wechat-miniprogram/pages/my/favorites/` (4 files)

**Interfaces:**
- Consumes: `utils/api/my.js` (getMyFavorites)

- [ ] **Step 1: 创建收藏页**

index.json:
```json
{ "navigationBarTitleText": "我的收藏", "usingComponents": { "loading": "/components/loading/loading", "empty": "/components/empty/empty" } }
```
index.wxml:
```xml
<view class="fav-page">
  <view class="fav-tabs">
    <text class="tab-item {{activeTab === 'moment' ? 'active' : ''}}" bindtap="onTabChange" data-tab="moment">帖子</text>
    <text class="tab-item {{activeTab === 'case' ? 'active' : ''}}" bindtap="onTabChange" data-tab="case">案例</text>
  </view>
  <loading show="{{loading}}"/>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无收藏"/>
  <view wx:else class="fav-list">
    <view class="fav-item" wx:for="{{list}}" wx:key="id" bindtap="onTap" data-id="{{item.id}}" data-type="{{activeTab}}">
      <image src="{{item.cover || item.user_avatar || '/static/images/def_avatar.png'}}" class="fav-thumb" mode="aspectFill"/>
      <view class="fav-info">
        <text class="fav-title text-ellipsis">{{item.title || item.content || '无标题'}}</text>
        <text class="fav-time">{{item.add_time}}</text>
      </view>
    </view>
  </view>
</view>
```
index.wxss:
```css
.fav-tabs { display: flex; background: #fff; position: sticky; top: 0; }
.fav-tabs .tab-item { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #666; }
.fav-tabs .tab-item.active { color: #e93323; border-bottom: 4rpx solid #e93323; }
.fav-item { display: flex; align-items: center; padding: 20rpx; background: #fff; border-bottom: 1rpx solid #f5f5f5; }
.fav-thumb { width: 100rpx; height: 100rpx; border-radius: 8rpx; margin-right: 16rpx; }
.fav-info { flex: 1; }
.fav-title { font-size: 28rpx; display: block; }
.fav-time { font-size: 24rpx; color: #999; margin-top: 8rpx; }
```
index.js:
```javascript
const { myApi } = require('../../../utils/api/index')

Page({
  data: { activeTab: 'moment', list: [], loading: true },
  onLoad() { this.loadData() },
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.activeTab) return
    this.setData({ activeTab: tab })
    this.loadData()
  },
  loadData() {
    this.setData({ loading: true })
    myApi.getMyFavorites({ type: this.data.activeTab }).then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) {
    const { id, type } = e.currentTarget.dataset
    if (type === 'moment') wx.navigateTo({ url: '/pages/moment/detail?id=' + id })
    else wx.switchTab({ url: '/pages/case/index' })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/favorites/
git commit -m "feat: add my favorites page (moment & case tabs)"
```

---

### Task 25: 已购课程 — pages/my/courses

**Files:**
- Create: `wechat-miniprogram/pages/my/courses/` (4 files)

**Interfaces:**
- Consumes: `utils/api/my.js` (getMyCourses)

- [ ] **Step 1: 创建已购课程页**

index.json: `{ "navigationBarTitleText": "已购课程", "usingComponents": { "loading": "/components/loading/loading", "empty": "/components/empty/empty" } }`
index.wxml:
```xml
<view class="courses-page">
  <loading show="{{loading}}"/>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无已购课程"/>
  <view wx:else class="course-list">
    <course-card wx:for="{{list}}" wx:key="id" item="{{item}}" bind:tap="onTap"/>
  </view>
</view>
```
index.wxss:
```css
.course-list { padding: 16rpx 20rpx; }
```
index.js:
```javascript
const { myApi } = require('../../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyCourses().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) { /* 跳转课程播放页 */ }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/courses/
git commit -m "feat: add my courses page"
```

---

### Task 26: 线下课预约记录 — pages/my/bookings

**Files:**
- Create: `wechat-miniprogram/pages/my/bookings/` (4 files)

**Interfaces:**
- Consumes: `utils/api/my.js` (getMyBookings)

- [ ] **Step 1: 创建预约记录页**

index.json: `{ "navigationBarTitleText": "线下课预约", "usingComponents": { "loading": "/components/loading/loading", "empty": "/components/empty/empty" } }`
index.wxml:
```xml
<view class="bookings-page">
  <loading show="{{loading}}"/>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无预约记录"/>
  <view wx:else class="booking-list">
    <view class="booking-item" wx:for="{{list}}" wx:key="id">
      <text class="booking-title">{{item.title || '线下课'}}</text>
      <view class="booking-meta">
        <text>📅 {{item.class_date}} {{item.start_time}}-{{item.end_time}}</text>
        <text>📍 {{item.address}}</text>
        <text class="booking-status {{item.status === 1 ? 'cancelled' : ''}}">{{item.status === 1 ? '已取消' : '已预约'}}</text>
      </view>
    </view>
  </view>
</view>
```
index.wxss:
```css
.booking-item { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
.booking-title { font-size: 30rpx; font-weight: 500; }
.booking-meta { margin-top: 12rpx; }
.booking-meta text { display: block; font-size: 26rpx; color: #666; margin-bottom: 6rpx; }
.booking-status { color: #07C160; }
.booking-status.cancelled { color: #999; }
```
index.js:
```javascript
const { myApi } = require('../../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyBookings().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/bookings/
git commit -m "feat: add my bookings page"
```

---

### Task 27: 我的评论 — pages/my/comments

**Files:**
- Create: `wechat-miniprogram/pages/my/comments/` (4 files)

**Interfaces:**
- Consumes: `utils/api/my.js` (getMyComments)

- [ ] **Step 1: 创建我的评论页**

index.json: `{ "navigationBarTitleText": "我的评论", "usingComponents": { "loading": "/components/loading/loading", "empty": "/components/empty/empty" } }`
index.wxml:
```xml
<view class="comments-page">
  <loading show="{{loading}}"/>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无评论"/>
  <view wx:else class="comment-list">
    <view class="comment-item" wx:for="{{list}}" wx:key="id">
      <text class="comment-content">{{item.content}}</text>
      <view class="comment-meta">
        <text class="comment-target">{{item.target_type === 'moment' ? '帖子' : '案例'}}评论</text>
        <text class="comment-time">{{item.add_time}}</text>
      </view>
    </view>
  </view>
</view>
```
index.wxss:
```css
.comment-item { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
.comment-content { font-size: 28rpx; line-height: 1.5; }
.comment-meta { display: flex; justify-content: space-between; margin-top: 12rpx; }
.comment-target { font-size: 24rpx; color: #576b95; }
.comment-time { font-size: 24rpx; color: #999; }
```
index.js:
```javascript
const { myApi } = require('../../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyComments().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/comments/
git commit -m "feat: add my comments page"
```

---

### Task 28: 我的发帖 — pages/my/posts

**Files:**
- Create: `wechat-miniprogram/pages/my/posts/` (4 files)

**Interfaces:**
- Consumes: `utils/api/my.js` (getMyPosts), `utils/api/moment.js` (deleteMoment)

- [ ] **Step 1: 创建我的发帖页**

index.json: `{ "navigationBarTitleText": "我的发帖", "usingComponents": { "loading": "/components/loading/loading", "empty": "/components/empty/empty" } }`
index.wxml:
```xml
<view class="posts-page">
  <loading show="{{loading}}"/>
  <empty wx:elif="{{!loading && list.length === 0}}" text="暂无发帖"/>
  <view wx:else class="post-list">
    <view class="post-item" wx:for="{{list}}" wx:key="id" bindtap="onTap" data-id="{{item.id}}">
      <view class="post-header">
        <text class="post-content">{{item.content || '无文字'}}</text>
        <text class="post-delete" bindtap="onDelete" data-id="{{item.id}}" catchtap="onDelete">删除</text>
      </view>
      <image-preview images="{{item.images}}" wx:if="{{item.images && item.images.length}}"/>
      <text class="post-time">{{item.add_time}}</text>
    </view>
  </view>
</view>
```
index.wxss:
```css
.post-item { background: #fff; margin: 12rpx 20rpx; border-radius: 12rpx; padding: 24rpx; }
.post-header { display: flex; justify-content: space-between; align-items: flex-start; }
.post-content { flex: 1; font-size: 28rpx; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.post-delete { font-size: 24rpx; color: #e93323; flex-shrink: 0; margin-left: 16rpx; }
.post-time { font-size: 24rpx; color: #999; margin-top: 12rpx; display: block; }
```
index.js:
```javascript
const { myApi, momentApi } = require('../../../utils/api/index')

Page({
  data: { list: [], loading: true },
  onLoad() { this.loadData() },
  loadData() {
    myApi.getMyPosts().then(res => {
      this.setData({ list: (res.data && res.data.list) || [], loading: false })
    }).catch(() => this.setData({ loading: false }))
  },
  onTap(e) {
    wx.navigateTo({ url: '/pages/moment/detail?id=' + e.currentTarget.dataset.id })
  },
  onDelete(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除帖子', content: '确定删除？',
      success: res => {
        if (res.confirm) {
          momentApi.deleteMoment(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadData()
          })
        }
      }
    })
  }
})
```

- [ ] **Step 2: 提交**

```bash
git add wechat-miniprogram/pages/my/posts/
git commit -m "feat: add my posts page with delete"
```

---

## 实施顺序总结

```
Phase 1 (基础): Task 1 → 2 → 3 → 4 → 5 → 6
Phase 2 (组件): Task 7 → 8 → 9 → 10 → 11
Phase 3 (登录): Task 12 → 13 → 14
Phase 4 (主页): Task 15 → 16 → 17 → 18 → 19 → 20
Phase 5 (社区): Task 21 → 22 → 23
Phase 6 (子页): Task 24 → 25 → 26 → 27 → 28
```

共 28 个任务，覆盖全部 17 页面 + 14 组件 + 6 工具模块。每 1-3 个任务提交一次。
