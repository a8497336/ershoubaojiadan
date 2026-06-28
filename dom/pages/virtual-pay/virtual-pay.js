/**
 * 虚拟支付测试页(dom 项目)
 * 验证 wx.requestVirtualPayment 完整调用链路:
 *   wx.login → /sign 获取 signData/paySig/signature → wx.requestVirtualPayment 唤起 → 轮询 /order 确认入账
 * 采用免登支付模式,无需 JWT,后端用 code 换 openid + session_key 识别用户并生成签名
 *
 * wx.requestVirtualPayment 官方参数(基础库 ≥ 2.19.2):
 *   signData:  JSON 字符串(含 offerId/buyQuantity/env/currencyType/productId/goodsPrice/outTradeNo/attach)
 *   mode:      'short_series_goods'(道具直购) / 'short_series_coin'(代币充值)
 *   paySig:    支付签名 = hex(hmac_sha256(appKey, uri + '&' + signData))  // uri='requestVirtualPayment'
 *   signature: 用户态签名 = hex(hmac_sha256(sessionKey, signData))
 */
const { request } = require('../../utils/api')

// 虚拟支付错误码 → 友好提示
const ERR_CODE_MAP = {
  1001:    '参数错误',
  '-1':    '支付失败(系统错误)',
  '-2':    '支付取消',
  '-4':    '风控拦截',
  '-5':    '开通签约结果未知',
  '-15001': '参数错误(详见 err_msg)',
  '-15002': 'outTradeNo 重复使用,请换新单号重试',
  '-15003': '系统错误',
  '-15004': 'currencyType 错误(只能填 CNY)',
  '-15005': '用户态签名 signature 错误',
  '-15006': '支付签名 paySig 错误',
  '-15007': 'session_key 过期',
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
    plans: [],
    loading: false,
    paying: false,
    consoleLogs: [],
    orderNo: '',
    payResult: '',
    env: 1  // 0=现网 1=沙箱(默认沙箱,从后端响应更新)
  },

  onLoad() {
    this.log('虚拟支付测试页加载')
    this.log('提示:基础库需 ≥ 2.19.2;真机测试需在 MP 后台配置 OfferID/AppKey/道具')
    this.loadPlans()
  },

  // 日志工具(写入 data.consoleLogs,最多 20 条)
  log(msg, level = 'info') {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const line = `[${time}] [${level.toUpperCase()}] ${msg}`
    console.log(line)
    this.setData({ consoleLogs: [line, ...this.data.consoleLogs].slice(0, 20) })
  },

  // 加载虚拟支付可用套餐
  async loadPlans() {
    this.setData({ loading: true })
    try {
      const res = await request({ url: '/virtual-pay/plans' })
      const plans = res.data || []
      this.setData({ plans })
      this.log(`加载套餐成功,共 ${plans.length} 个`)
      if (plans.length === 0) {
        this.log('暂无可用套餐,需在后台为 MembershipPlan 配置 product_id', 'warn')
      }
    } catch (err) {
      this.log('加载套餐失败: ' + (err.message || JSON.stringify(err)), 'error')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 点击套餐 → 唤起虚拟支付
  async onPay(e) {
    if (this.data.paying) return
    const planId = e.currentTarget.dataset.id
    const plan = this.data.plans.find(p => p.id === planId)
    if (!plan) return

    this.log(`开始支付套餐: ${plan.name}(ID=${planId}, productId=${plan.product_id})`)
    this.setData({ paying: true, payResult: '' })

    try {
      // 1. wx.login 拿 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })
      this.log('wx.login 成功,code=' + loginRes.code.slice(0, 10) + '...')

      // 2. 调签名接口(后端用 code 换 openid + session_key → 创建订单 → 生成签名)
      const signRes = await request({
        url: '/virtual-pay/sign',
        method: 'POST',
        data: { code: loginRes.code, plan_id: planId }
      })
      const { orderNo, signData, mode, paySig, signature, env } = signRes.data
      this.setData({ orderNo, env })
      this.log(`签名获取成功 orderNo=${orderNo} env=${env === 1 ? '沙箱' : '现网'} mode=${mode}`)
      this.log(`paySig=${paySig.slice(0, 16)}... signature=${signature.slice(0, 16)}...`)

      // 3. 校验 API 可用性(基础库 ≥ 2.19.2 或 canIUse)
      const SDKVersion = wx.getSystemInfoSync().SDKVersion
      const canUse = this.compareVersion(SDKVersion, '2.19.2') >= 0 || wx.canIUse('requestVirtualPayment')
      if (!canUse) {
        throw new Error(`当前基础库 ${SDKVersion} 不支持 wx.requestVirtualPayment(需 ≥2.19.2)`)
      }
      this.log(`基础库 ${SDKVersion} 支持,调用 wx.requestVirtualPayment...`)

      // 4. 唤起虚拟支付(按官方参数)
      await new Promise((resolve, reject) => {
        wx.requestVirtualPayment({
          signData,        // JSON 字符串(后端已 stringify)
          mode,            // 'short_series_goods'
          paySig,          // 支付签名
          signature,       // 用户态签名
          success: resolve,
          fail: reject
        })
      })

      this.log('✓ 虚拟支付成功')
      this.setData({ payResult: '✓ 支付成功,正在确认入账...' })

      // 5. 轮询订单状态(三层校验之"主动轮询"层)
      this.queryOrderStatus(orderNo)
    } catch (err) {
      this.handlePayError(err)
    } finally {
      this.setData({ paying: false })
    }
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

  // 支付错误处理(区分错误码)
  handlePayError(err) {
    const errMsg = err.errMsg || err.message || JSON.stringify(err)
    const errCode = err.errCode

    // 用户取消
    if (errCode === -2 || errMsg.includes('cancel')) {
      this.log('用户取消支付', 'warn')
      this.setData({ payResult: '已取消支付' })
      return
    }

    // 已知错误码
    if (errCode && ERR_CODE_MAP[errCode]) {
      const hint = ERR_CODE_MAP[errCode]
      this.log(`支付失败 [${errCode}] ${hint}: ${errMsg}`, 'error')
      this.setData({ payResult: `✗ 支付失败 [${errCode}] ${hint}` })
      // session_key 过期需重新 login
      if (errCode === -15007) {
        this.log('session_key 过期,建议重新 wx.login 后再试', 'warn')
      }
      // 单号重复需换新单号
      if (errCode === -15002 || errCode === -15012) {
        this.log('单号问题,下次支付会自动生成新单号', 'warn')
      }
    } else {
      // 未知错误
      this.log('支付失败: ' + errMsg + (errCode ? ` (errCode=${errCode})` : ''), 'error')
      this.setData({ payResult: '✗ 支付失败: ' + errMsg })
    }

    // 失败也查一次单(防止已支付但回调未到达的边缘情况)
    if (this.data.orderNo) this.queryOrderStatus(this.data.orderNo)
  },

  // 轮询订单状态(最多 5 次,每次间隔 1.5s)
  async queryOrderStatus(orderNo, retry = 0) {
    try {
      const res = await request({ url: '/virtual-pay/order/' + orderNo })
      this.log(`查单[${retry + 1}/5] status=${res.data.status}`)
      if (res.data.status === 'paid') {
        this.log('✓ 已入账,会员开通成功')
        this.setData({ payResult: '✓ 支付成功且已入账' })
        return
      }
      if (retry < 4) {
        setTimeout(() => this.queryOrderStatus(orderNo, retry + 1), 1500)
      } else {
        this.log('查单超时,请稍后查看订单列表', 'warn')
        this.setData({ payResult: '支付已提交,入账确认超时(回调可能延迟)' })
      }
    } catch (err) {
      this.log('查单失败: ' + (err.message || ''), 'error')
    }
  },

  // 复制订单号
  onCopyOrderNo() {
    if (!this.data.orderNo) return
    wx.setClipboardData({
      data: this.data.orderNo,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
        this.log('已复制订单号到剪贴板')
      }
    })
  },

  // 重新加载套餐
  onReload() {
    this.log('重新加载套餐')
    this.loadPlans()
  }
})
