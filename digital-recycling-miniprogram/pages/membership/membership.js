const { membershipApi, userApi } = require('../../utils/api-modules')

Page({
  data: {
    redirectUrl: '',
    plans: [],
    userInfo: null,
    loading: true
  },

  onLoad(options) {
    if (options && options.redirect) {
      this.setData({ redirectUrl: decodeURIComponent(options.redirect) })
    }
    this.loadPlans()
    this.loadUserInfo()
  },

  loadPlans() {
    membershipApi.getPlans().then((res) => {
      this.setData({ plans: res.data || [], loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  loadUserInfo() {
    userApi.getProfile().then((res) => {
      this.setData({ userInfo: res.data || res })
    }).catch(() => {})
  },

  goToLogin() {
    const url = this.data.redirectUrl
      ? '/pages/login/login?redirect=' + encodeURIComponent(this.data.redirectUrl)
      : '/pages/login/login'
    wx.navigateTo({ url })
  },

  navigateBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  },

  onShareAppMessage() {
    return { title: '联赢电子回收网 - 会员中心', path: '/pages/membership/membership' }
  }
})
