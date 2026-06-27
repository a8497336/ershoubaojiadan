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
      data.membershipExpired = !!(data.membershipId && !data.isVip)
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
    console.log('[membership] doPurchase 开始, planId=', planId)
    wx.showLoading({ title: '创建订单...' })
    membershipApi.purchase(planId).then((res) => {
      wx.hideLoading()
      const data = res.data || res
      console.log('[membership] purchase 返回完整数据:', JSON.stringify(data))
      // 后端返回 { orderNo, amount, planName, timeStamp, nonceStr, package, signType, paySign }
      if (!data.paySign || !data.package) {
        console.error('[membership] 订单数据异常,缺少 paySign/package', data)
        wx.showToast({ title: '订单数据异常,稍后重试', icon: 'none' })
        return
      }
      const orderNo = data.orderNo
      console.log('[membership] 调起 wx.requestPayment, orderNo=', orderNo)
      console.log('[membership] wx.requestPayment 参数:', JSON.stringify({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType || 'MD5',
        paySign: data.paySign
      }))
      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType || 'MD5',
        paySign: data.paySign,
        success: (payRes) => {
          console.log('[membership] wx.requestPayment success:', JSON.stringify(payRes))
          wx.showToast({ title: '支付成功', icon: 'success' })
          this.loadUserInfo()
          // 兜底：主动查单确保后端入账
          this.queryPaymentStatus(orderNo)
        },
        fail: (payErr) => {
          console.warn('[membership] wx.requestPayment fail:', JSON.stringify(payErr))
          const errMsg = (payErr && payErr.errMsg) || '未知错误'
          console.log(errMsg)
          if (errMsg.includes('cancel')) {
            wx.showToast({ title: '已取消', icon: 'none' })
          } else {
            wx.showToast({ title: '支付失败：' + errMsg, icon: 'none' })
          }
          // 兜底：主动查单（用户可能实际已支付但前端回调失败）
          this.queryPaymentStatus(orderNo)
        },
        complete: (payComplete) => {
          console.log('[membership] wx.requestPayment complete:', JSON.stringify(payComplete))
          // 最终兜底：无论成功失败都重新加载用户信息
          this.loadUserInfo()
        }
      })
    }).catch((err) => {
      console.error('[membership] purchase 接口失败:', JSON.stringify(err))
      wx.hideLoading()
      wx.showToast({ title: '创建订单失败', icon: 'none' })
    })
  },

  // 主动查单（应对微信回调延迟或丢失）
  queryPaymentStatus(orderNo) {
    if (!orderNo) return
    membershipApi.queryPaymentStatus(orderNo).then((res) => {
      const data = res.data || res
      if (data && data.status === 'paid') {
        this.loadUserInfo()
      }
    }).catch(() => {
      // 静默失败，不打扰用户
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