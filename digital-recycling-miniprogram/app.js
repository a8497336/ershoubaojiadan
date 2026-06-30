const { authApi, userApi, cartApi } = require('./utils/api-modules')
const { checkApiHealth } = require('./utils/api')

const originalPage = Page
Page = function (options) {
  if (!options.onShareAppMessage) {
    options.onShareAppMessage = function () {
      const appInstance = getApp()
      const userInfo = appInstance && appInstance.globalData ? appInstance.globalData.userInfo : {}
      const inviteCode = userInfo ? (userInfo.userNo || userInfo.userId) : ''
      return {
        title: '联赢电子回收网 - 专业数码产品回收平台',
        path: inviteCode ? `/pages/index/index?invite_code=${inviteCode}` : '/pages/index/index'
      }
    }
  }
  originalPage(options)
}

App({
  onLaunch() {
    this.globalData.statusBarHeight = wx.getSystemInfoSync().statusBarHeight
    this.initNetworkListener()
    this.checkApiStatus()
    this.checkLoginStatus()
    // 注意：故意不在此处监听 wx.onNeedPrivacyAuthorization
    // 原因：注册后 wx.requirePrivacyAuthorize 不再弹原生弹窗
    //      保留原生行为，让 requirePrivacyAuthorize 自然弹出原生弹窗（与 dom 一致）
  },

  initNetworkListener() {
    wx.onNetworkStatusChange((res) => {
      this.globalData.isConnected = res.isConnected
      if (res.isConnected) {
        console.log('网络已连接')
        this.checkApiStatus()
      } else {
        console.warn('网络已断开')
        wx.showToast({
          title: '网络已断开，请检查网络',
          icon: 'none'
        })
      }
    })
    
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType
        this.globalData.isConnected = res.networkType !== 'none'
      }
    })
  },

  async checkApiStatus() {
    try {
      const isHealthy = await checkApiHealth()
      this.globalData.apiStatus = isHealthy ? 'online' : 'offline'
      console.log('API服务状态:', isHealthy ? '在线' : '离线')
    } catch (err) {
      console.error('API健康检查失败:', err)
      this.globalData.apiStatus = 'offline'
    }
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (!token) {
      return
    }
    authApi.checkToken().then(() => {
      this.globalData.token = token
      this.loadUserInfo()
      this.loadCartData()
    }).catch((err) => {
      // 仅在明确的鉴权失败（401 / 403）时才清空 token；
      // 网络错误或 5xx 等服务端异常保留 token，避免误登出（M-3 修复）
      const status = err && (err.statusCode || err.status)
      if (status === 401 || status === 403) {
        console.warn('Token失效，清除并提示重新登录:', err.message || err)
        wx.removeStorageSync('token')
        wx.removeStorageSync('userInfo')
        this.globalData.token = null
        this.globalData.userInfo = null
      } else {
        console.warn('Token校验暂不可用，保留本地 token:', err.message || err)
      }
    })
  },

  /**
   * 401 / 403 处理器（C-1 修复）
   * 业务层 401 触发入口，清除本地登录态并跳转登录页
   */
  ensureLogin() {
    try {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      this.globalData.token = null
      this.globalData.userInfo = null
    } catch (e) {
      console.error('ensureLogin 清理本地态失败:', e)
    }
    if (typeof wx.showToast === 'function') {
      wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
    }
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/index/index'),
        fail: () => {
          wx.switchTab({ url: '/pages/index/index' })
        }
      })
    }, 300)
  },

  loadUserInfo() {
    userApi.getProfile().then((data) => {
      this.globalData.userInfo = data.data
    }).catch((err) => {
      console.error('加载用户信息失败:', err)
    })
  },

  loadCartData() {
    cartApi.getCart().then((data) => {
      const cart = data.data
      this.globalData.cartCount = cart.totalItems || 0
      this.globalData.cartItems = cart.list || []
    }).catch((err) => {
      console.error('加载购物车数据失败:', err)
      const cartCount = wx.getStorageSync('cartCount') || 0
      this.globalData.cartCount = cartCount
    })
  },

  updateCartCount(delta) {
    const newCount = Math.max(0, (this.globalData.cartCount || 0) + delta)
    this.globalData.cartCount = newCount
    wx.setStorageSync('cartCount', newCount)
    return newCount
  },

  refreshCart() {
    this.loadCartData()
  },

  getNetworkStatus() {
    return this.globalData.isConnected
  },

  isOnline() {
    return this.globalData.isConnected && this.globalData.apiStatus === 'online'
  },

  globalData: {
    userInfo: null,
    token: null,
    cartCount: 0,
    cartItems: [],
    isConnected: true,
    networkType: 'wifi',
    apiStatus: 'unknown',
    statusBarHeight: 0,
    latitude: null,
    longitude: null
  }
})
