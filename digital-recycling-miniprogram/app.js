const { authApi, userApi, cartApi } = require('./utils/api-modules')
const { checkApiHealth } = require('./utils/api')

App({
  onLaunch() {
    this.initNetworkListener()
    this.checkApiStatus()
    this.ensureLogin()
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

  ensureLogin() {
    const token = wx.getStorageSync('token')
    if (token) {
      authApi.checkToken().then(() => {
        this.globalData.token = token
        this.loadUserInfo()
        this.loadCartData()
      }).catch((err) => {
        console.error('Token验证失败:', err)
        this.doLogin()
      })
    } else {
      this.doLogin()
    }
  },

  doLogin(retryCount) {
    var count = retryCount || 0
    if (count >= 3) {
      console.error('登录失败，已重试3次')
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none'
      })
      return
    }
    wx.login({
      success: (res) => {
        if (res.code) {
          authApi.wxLogin(res.code).then((data) => {
            wx.setStorageSync('token', data.data.token)
            this.globalData.token = data.data.token
            this.globalData.userInfo = data.data.userInfo
            this.loadCartData()
          }).catch((err) => {
            console.error('微信登录失败:', err)
            setTimeout(() => {
              this.doLogin(count + 1)
            }, 2000)
          })
        }
      },
      fail: () => {
        setTimeout(() => {
          this.doLogin(count + 1)
        }, 2000)
      }
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

  globalData: {
    userInfo: null,
    token: null,
    cartCount: 0,
    cartItems: [],
    isConnected: true,
    networkType: 'wifi',
    apiStatus: 'unknown'
  }
})
