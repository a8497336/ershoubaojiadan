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
      const data = res.data || res
      const plans = Array.isArray(data) ? data : (data.list || [])
      this.setData({ plans, loading: false })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  loadUserInfo() {
    userApi.getProfile().then((res) => {
      const data = res.data || res
      this.setData({ userInfo: data })
    }).catch(() => {})
  },

  onPurchase(e) {
    const planId = e.currentTarget.dataset.planId
    if (!this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/membership/membership')
      })
      return
    }

    wx.showModal({
      title: '确认开通',
      content: '确认购买此会员套餐？',
      success: (res) => {
        if (res.confirm) {
          this.doPurchase(planId)
        }
      }
    })
  },

  doPurchase(planId) {
    wx.showLoading({ title: '创建订单...' })
    membershipApi.purchase(planId).then((res) => {
      wx.hideLoading()
      const data = res.data || res
      const orderNo = data.orderNo
      wx.showModal({
        title: '订单已创建',
        content: '订单号：' + orderNo + '\n金额：¥' + data.amount,
        confirmText: '模拟支付',
        cancelText: '稍后支付',
        success: (modalRes) => {
          if (modalRes.confirm) {
            membershipApi.payCallback(orderNo).then(() => {
              wx.showToast({ title: '支付成功', icon: 'success' })
              this.loadUserInfo()
            }).catch(() => {
              wx.showToast({ title: '支付失败', icon: 'none' })
            })
          }
        }
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({ title: '创建订单失败', icon: 'none' })
    })
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