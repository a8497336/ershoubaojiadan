const { membershipApi, userApi } = require('../../utils/api-modules')

// 虚拟支付错误码 → 友好提示(参考 dom 项目)
const ERR_CODE_MAP = {
  1001:    '参数错误',
  '-1':    '支付失败(系统错误)',
  '-2':    '支付取消',
  '-4':    '风控拦截',
  '-5':    '开通签约结果未知',
  '-15001': '参数错误(详见 err_msg,若提示"尚未开启iOS支付"请到MP后台「虚拟支付→基础配置」配置小程序简称)',
  '-15002': 'outTradeNo 重复使用,请换新单号重试',
  '-15003': '系统错误',
  '-15004': 'currencyType 错误(只能填 CNY)',
  '-15005': '用户态签名 signature 错误',
  '-15006': '支付签名 paySig 错误',
  '-15007': 'session_key 过期,请重试',
  '-15008': '二级商户进件未完成',
  '-15009': '代币未发布',
  '-15010': '道具 productId 未发布',
  '-15011': '现网版本的 env 只能是 0,不能填 1(沙箱)',
  '-15012': '调用米大师失败导致关单,请换新单号重试',
  '-15013': 'goodsPrice 道具价格错误',
  '-15014': '道具/代币发布未生效,约 10 分钟后生效',
  '-15016': 'signData 格式有问题',
  '-15017': '商家收款功能被限制',
  '-15018': '道具 productId 审核不通过',
  '-15019': '商户受限',
  '-15020': '操作过快,请稍候再试',
  '-15021': '小程序被限频交易'
}

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

    // 1. 基础库检测(虚拟支付需 ≥ 2.19.2)
    const systemInfo = wx.getSystemInfoSync()
    const SDKVersion = systemInfo.SDKVersion
    if (!wx.canIUse('requestVirtualPayment') && this.compareVersion(SDKVersion, '2.19.2') < 0) {
      wx.showToast({ title: '微信版本过低,请升级', icon: 'none' })
      return
    }

    // 2. iOS 检测(iOS 需 iOS 15+ / 微信 8.0.68+,且不支持沙箱、最低 1 元)
    if (systemInfo.platform === 'ios') {
      // 2.1 微信版本检测
      if (this.compareVersion(systemInfo.version, '8.0.68') < 0) {
        wx.showModal({
          title: '提示',
          content: 'iOS 需微信客户端 8.0.68 以上才能使用虚拟支付,请升级微信后重试',
          showCancel: false
        })
        return
      }
      // 2.2 iOS 系统版本检测(需 iOS 15+)
      const iOSVersion = (systemInfo.system || '').replace(/[^0-9.]/g, '')
      if (iOSVersion && this.compareVersion(iOSVersion, '15.0.0') < 0) {
        wx.showModal({
          title: '提示',
          content: 'iOS 需升级至 iOS 15 以上才能使用虚拟支付',
          showCancel: false
        })
        return
      }
      // 2.3 金额检测(iOS 最低 1 元,由套餐价格判断)
      const plan = this.data.plans.find(p => p.id === planId)
      if (plan && Number(plan.price) < 1) {
        wx.showModal({
          title: '提示',
          content: 'iOS 端虚拟支付最低金额为 1 元,当前套餐价格不满足要求',
          showCancel: false
        })
        return
      }
      // 2.4 官方预检 API:wx.checkIsSupportMidasPayment(iOS 不支持时返回 701001)
      if (wx.checkIsSupportMidasPayment) {
        wx.checkIsSupportMidasPayment({
          success: (res) => {
            console.log('[membership] checkIsSupportMidasPayment:', res)
            if (res && res.data && res.data.allow_pay) {
              this.startVirtualPay(planId)
            } else {
              wx.showModal({
                title: '暂不支持',
                content: '当前环境不支持虚拟支付,请升级微信至最新版本后重试',
                showCancel: false
              })
            }
          },
          fail: (err) => {
            console.error('[membership] checkIsSupportMidasPayment 失败:', err)
            // 预检失败不阻断,继续走支付流程(可能仍能支付)
            this.startVirtualPay(planId)
          }
        })
        return
      }
      // 无预检 API(旧版微信),直接走支付流程
    }

    this.startVirtualPay(planId)
  },

  // 启动虚拟支付流程(wx.login → 请求签名 → 唤起)
  startVirtualPay(planId) {
    wx.showLoading({ title: '准备支付...' })
    wx.login({
      success: (loginRes) => {
        console.log('[membership] wx.login 成功, code=', loginRes.code.slice(0, 10) + '...')
        this.requestVirtualPaySign(planId, loginRes.code)
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('[membership] wx.login 失败:', err)
        wx.showToast({ title: '微信登录失败,请重试', icon: 'none' })
      }
    })
  },

  // 请求后端签名 + 唤起虚拟支付
  requestVirtualPaySign(planId, code) {
    membershipApi.virtualPaySign(planId, code).then((res) => {
      const data = res.data || res
      console.log('[membership] virtual-pay-sign 返回:', JSON.stringify({ ...data, paySig: data.paySig?.slice(0, 16) + '...', signature: data.signature?.slice(0, 16) + '...' }))

      if (!data.paySig || !data.signature || !data.signData) {
        console.error('[membership] 签名数据异常', data)
        wx.hideLoading()
        wx.showToast({ title: '签名数据异常,稍后重试', icon: 'none' })
        return
      }

      const orderNo = data.orderNo
      console.log('[membership] 调起 wx.requestVirtualPayment, orderNo=', orderNo)
      wx.hideLoading()

      // 唤起虚拟支付(按官方参数)
      wx.requestVirtualPayment({
        signData: data.signData,
        mode: data.mode,
        paySig: data.paySig,
        signature: data.signature,
        success: (payRes) => {
          console.log('[membership] wx.requestVirtualPayment success:', JSON.stringify(payRes))
          // 支付成功后主动调用补单接口入账(应对微信推送延迟/丢失)
          wx.showLoading({ title: '入账中...' })
          membershipApi.virtualPayConfirm(orderNo).then((confirmRes) => {
            wx.hideLoading()
            const cdata = confirmRes.data || confirmRes
            if (cdata && cdata.status === 'paid') {
              wx.showToast({ title: '支付成功', icon: 'success' })
            } else {
              wx.showToast({ title: '入账中,请稍后查看', icon: 'none' })
            }
            this.loadUserInfo()
          }).catch((cerr) => {
            wx.hideLoading()
            console.error('[membership] virtual-pay-confirm 失败:', JSON.stringify(cerr))
            wx.showToast({ title: '支付成功,入账中', icon: 'none' })
            // 兜底:主动查单
            this.queryPaymentStatus(orderNo)
            this.loadUserInfo()
          })
        },
        fail: (payErr) => {
          console.warn('[membership] wx.requestVirtualPayment fail:', JSON.stringify(payErr))
          this.handleVirtualPayError(payErr, orderNo)
        },
        complete: () => {
          // 最终兜底:无论成功失败都重新加载用户信息
          this.loadUserInfo()
        }
      })
    }).catch((err) => {
      wx.hideLoading()
      console.error('[membership] virtual-pay-sign 接口失败:', JSON.stringify(err))
      const msg = (err && err.message) || '创建订单失败'
      wx.showToast({ title: msg, icon: 'none' })
    })
  },

  // 虚拟支付错误处理(区分错误码)
  handleVirtualPayError(payErr, orderNo) {
    const errMsg = (payErr && payErr.errMsg) || '未知错误'
    const errCode = payErr && payErr.errCode

    // iOS 支付未开启(-15001 + errMsg 含 "iOS支付"):商户未在 MP 后台配置小程序简称
    if (errCode === -15001 && errMsg.includes('iOS支付')) {
      console.warn('[membership] iOS 支付未开启,需到 MP 后台配置小程序简称')
      wx.showModal({
        title: 'iOS 暂不可支付',
        content: '商户尚未开启 iOS 支付。请联系管理员到微信公众平台「虚拟支付 → 基础配置」配置小程序简称后开启 iOS 支付能力。',
        showCancel: false,
        confirmText: '我知道了'
      })
      this.queryPaymentStatus(orderNo)
      return
    }

    // 用户取消
    if (errCode === -2 || errMsg.includes('cancel')) {
      wx.showToast({ title: '已取消', icon: 'none' })
    } else if (errCode && ERR_CODE_MAP[errCode]) {
      // 已知错误码
      const hint = ERR_CODE_MAP[errCode]
      console.warn(`[membership] 支付失败 [${errCode}] ${hint}`)
      wx.showToast({ title: hint, icon: 'none', duration: 3000 })
      // session_key 过期需重新 login
      if (errCode === -15007) {
        console.warn('[membership] session_key 过期,下次支付会重新 wx.login')
      }
    } else {
      // 未知错误
      wx.showToast({ title: '支付失败:' + errMsg, icon: 'none' })
    }

    // 兜底:主动查单(用户可能实际已支付但前端回调失败)
    this.queryPaymentStatus(orderNo)
  },

  // 版本号比较(官方示例)
  compareVersion(_v1, _v2) {
    if (typeof _v1 !== 'string' || typeof _v2 !== 'string') return 0
    const v1 = _v1.split('.')
    const v2 = _v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) v1.push('0')
    while (v2.length < len) v2.push('0')
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i], 10)
      const num2 = parseInt(v2[i], 10)
      if (num1 > num2) return 1
      if (num1 < num2) return -1
    }
    return 0
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