const app = getApp()
const authApi = require('../../utils/api-modules').authApi

const TAB_BAR_PAGES = [
  '/pages/index/index',
  '/pages/brand-list/brand-list',
  '/pages/scan-price/scan-price',
  '/pages/shopping/shopping',
  '/pages/profile/profile'
]

Page({
  data: {
    isAgreed: false,
    redirectUrl: '',
    loggingIn: false,
    avatarUrl: ''
  },

  onLoad(options) {
    if (options && options.redirect) {
      this.setData({ redirectUrl: decodeURIComponent(options.redirect) })
    }
  },

  onAgreementChange() {
    this.setData({ isAgreed: !this.data.isAgreed })
  },

  onChooseAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl })
  },

  handleLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }

    if (this.data.loggingIn) return
    this.setData({ loggingIn: true })

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          this.setData({ loggingIn: false })
          return
        }

        authApi.wxLogin(loginRes.code, {
          avatarUrl: this.data.avatarUrl || '/images/icons/avatar.svg',
          nickName: '微信用户'
        })
          .then((res) => {
            const token = res.data.token
            const userInfoData = res.data.userInfo || {}
            wx.setStorageSync('token', token)
            app.globalData.token = token
            app.globalData.userInfo = userInfoData
            wx.showToast({ title: '登录成功', icon: 'success' })
            this.setData({ loggingIn: false })
            this.navigateToHome()
          })
          .catch((err) => {
            wx.showToast({ title: err.message || '登录失败', icon: 'none' })
            this.setData({ loggingIn: false })
          })
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败，请重试', icon: 'none' })
        this.setData({ loggingIn: false })
      }
    })
  },

  navigateToHome() {
    const redirectUrl = this.data.redirectUrl
    if (redirectUrl) {
      const isTabBar = TAB_BAR_PAGES.some(p => redirectUrl.startsWith(p))
      if (isTabBar) {
        wx.switchTab({ url: redirectUrl }).catch(() => {
          wx.switchTab({ url: '/pages/index/index' })
        })
      } else {
        wx.redirectTo({ url: redirectUrl }).catch(() => {
          wx.switchTab({ url: '/pages/index/index' })
        })
      }
    } else {
      wx.switchTab({ url: '/pages/index/index' }).catch(() => {
        wx.navigateBack()
      })
    }
  }
})