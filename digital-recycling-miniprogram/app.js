const { authApi, userApi, cartApi } = require('./utils/api-modules')
const { checkApiHealth } = require('./utils/api')

const originalPage = Page
Page = function (options) {
  if (!options.onShareAppMessage) {
    options.onShareAppMessage = function () {
      return {
        title: '联赢电子回收网 - 专业数码产品回收平台',
        path: '/pages/index/index'
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
    this.initPrivacyAuthorization()
  },

  initPrivacyAuthorization() {
    if (typeof wx.onNeedPrivacyAuthorization === 'function') {
      wx.onNeedPrivacyAuthorization((resolve, eventInfo) => {
        this.resolvePrivacyAuthorization(resolve, eventInfo)
      })
    }
  },

  resolvePrivacyAuthorization(resolve, eventInfo) {
    wx.getPrivacySetting({
      success: (res) => {
        if (!res.needAuthorization) {
          resolve({ button: 'agree', event: eventInfo.event })
          return
        }
        wx.showModal({
          title: '隐私授权',
          content: res.privacyContractName
            ? `在使用服务前，请你仔细阅读并同意《${res.privacyContractName}》，以便我们为你提供相关服务。`
            : '在使用服务前，请你仔细阅读并同意《用户服务协议》和《隐私政策》，以便我们为你提供相关服务。',
          showCancel: true,
          cancelText: '拒绝',
          confirmText: '同意',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.setStorageSync('privacy_agreed', true)
              resolve({ button: 'agree', event: eventInfo.event })
            } else {
              resolve({ button: 'disagree', event: eventInfo.event })
            }
          },
          fail: () => {
            resolve({ button: 'disagree', event: eventInfo.event })
          }
        })
      },
      fail: () => {
        resolve({ button: 'agree', event: eventInfo.event })
      }
    })
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
      console.error('Token验证失败:', err)
    })
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
    statusBarHeight: 0
  }
})
