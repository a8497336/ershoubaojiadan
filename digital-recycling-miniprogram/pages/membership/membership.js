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
    if (typeof wx.requestVirtualPayment !== 'function') {
      wx.showModal({
        title: '请升级微信',
        content: '当前微信版本不支持虚拟支付,请升级到最新版本后再试',
        showCancel: false
      })
      return
    }

    wx.showLoading({ title: '创建订单...' })
    membershipApi.purchase(planId).then((res) => {
      wx.hideLoading()
      const data = res.data || res
      if (!data.signData) {
        wx.showToast({ title: '订单数据异常,稍后重试', icon: 'none' })
        return
      }
      // 后端返回 { mode, signData, orderNo, amount, planName, productId }
      wx.requestVirtualPayment({
        signData: data.signData,
        mode: data.mode || 'long_series_goods',
        success: (payRes) => {
          // payRes.errMsg === 'requestVirtualPayment:ok'
          wx.showToast({ title: '支付成功', icon: 'success' })
          this.loadUserInfo()
        },
        fail: (payErr) => {
          // payErr.errMsg: 'requestVirtualPayment:fail cancel' / 'fail ...'
          const errMsg = (payErr && payErr.errMsg) || '未知错误'
          if (errMsg.includes('cancel')) {
            // 用户主动取消,不弹错误
            return
          }
          wx.showToast({ title: '支付失败：' + errMsg, icon: 'none' })
        },
        complete: () => {
          // 无论成功失败都重新加载用户信息(后端回调可能延迟到达)
          this.loadUserInfo()
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