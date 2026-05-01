const { authApi } = require('../../utils/api-modules')

Page({
  data: {
    isAgreed: false,
    loading: false,
    redirectUrl: ''
  },

  onLoad(options) {
    if (options.redirect) {
      this.setData({ redirectUrl: decodeURIComponent(options.redirect) })
    }
  },

  toggleAgreement() {
    this.setData({ isAgreed: !this.data.isAgreed })
  },

  handleWechatLogin() {
    if (!this.data.isAgreed) {
      wx.showModal({
        title: '提示',
        content: '请先阅读并同意《用户服务协议》和《隐私政策》',
        showCancel: false,
        confirmText: '我已知晓'
      })
      return
    }

    this.setData({ loading: true })

    Promise.all([
      this.wxLogin(),
      this.getUserProfile()
    ]).then(([loginRes, profileRes]) => {
      return authApi.wxLogin(loginRes.code, profileRes.userInfo).then(res => {
        return {
          ...res,
          userInfo: profileRes.userInfo
        }
      })
    }).then(res => {
      wx.setStorageSync('token', res.data.token)
      wx.setStorageSync('userInfo', res.data.userInfo)
      
      const app = getApp()
      app.globalData.token = res.data.token
      app.globalData.userInfo = res.data.userInfo
      
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        if (this.data.redirectUrl) {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            wx.navigateBack({ delta: pages.length })
          } else {
            wx.switchTab({ url: '/pages/index/index' })
          }
        } else {
          wx.switchTab({ url: '/pages/index/index' })
        }
      }, 1500)
    }).catch(err => {
      console.error('登录失败:', err)
      wx.showModal({
        title: '登录失败',
        content: err.message || '网络错误，请重试',
        showCancel: false,
        confirmText: '知道了'
      })
    }).finally(() => {
      this.setData({ loading: false })
    })
  },

  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  },

  openAgreement() {
    wx.showModal({
      title: '用户服务协议',
      content: '这里是用户服务协议的内容...\n1. 服务说明\n2. 用户注册\n3. 交易规则\n4. 隐私保护\n5. 免责声明',
      showCancel: false,
      confirmText: '关闭'
    })
  },

  openPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策的内容...\n1. 信息收集\n2. 信息使用\n3. 信息保护\n4. 信息共享\n5. 联系我们',
      showCancel: false,
      confirmText: '关闭'
    })
  }
})
