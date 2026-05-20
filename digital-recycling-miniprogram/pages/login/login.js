const app = getApp()
const authApi = require('../../utils/api-modules').authApi

Page({
  data: {
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    isAgreed: false,
    redirectUrl: '',
    loggingIn: false
  },

  onLoad(options) {
    if (options && options.redirect) {
      this.setData({ redirectUrl: decodeURIComponent(options.redirect) })
    }
  },

  onAgreementChange() {
    this.setData({ isAgreed: !this.data.isAgreed })
  },

  handleWechatLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }
    if (this.data.loggingIn) return
    this.setData({ loggingIn: true })

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (profileRes) => {
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              authApi.wxLogin(loginRes.code, profileRes.userInfo)
                .then((res) => {
                  const token = res.data.token
                  const userInfo = res.data.userInfo
                  wx.setStorageSync('token', token)
                  app.globalData.token = token
                  app.globalData.userInfo = userInfo
                  this.navigateToHome()
                })
                .catch((err) => {
                  wx.showToast({ title: err.message || '登录失败', icon: 'none' })
                  this.setData({ loggingIn: false })
                })
            } else {
              wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
              this.setData({ loggingIn: false })
            }
          },
          fail: () => {
            wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
            this.setData({ loggingIn: false })
          }
        })
      },
      fail: () => {
        this.setData({ loggingIn: false })
      }
    })
  },

  handleSmsLogin() {
    wx.showToast({ title: '验证码登录开发中', icon: 'none' })
  },

  navigateToHome() {
    if (this.data.redirectUrl) {
      wx.redirectTo({ url: this.data.redirectUrl }).catch(() => {
        wx.switchTab({ url: '/pages/index/index' })
      })
    } else {
      wx.switchTab({ url: '/pages/index/index' }).catch(() => {
        wx.navigateBack()
      })
    }
  }
})
