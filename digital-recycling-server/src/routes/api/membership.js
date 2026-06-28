/**
 * @openapi
 * tags:
 *   - name: 小程序-会员
 *     description: 会员套餐与购买相关接口
 */

/**
 * @openapi
 * /api/membership/plans:
 *   get:
 *     tags: [小程序-会员]
 *     summary: 获取会员套餐列表
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/membership/status:
 *   get:
 *     tags: [小程序-会员]
 *     summary: 获取会员状态
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/membership/purchase:
 *   post:
 *     tags: [小程序-会员]
 *     summary: 购买会员
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id]
 *             properties:
 *               plan_id: { type: integer, description: 会员套餐ID }
 *     responses:
 *       200:
 *         description: |
 *           订单创建成功,返回 JSAPI 支付所需参数(timeStamp/nonceStr/package/signType/paySign)。
 *           错误码: 10010=微信支付未配置, 10011=请先微信登录, 10003=套餐不存在
 */

/**
 * @openapi
 * /api/membership/virtual-pay-notify:
 *   post:
 *     tags: [小程序-会员]
 *     summary: 微信小程序虚拟支付回调
 *     description: |
 *       微信支付成功后的回调接口,验签 + 开通会员。
 *       注意:不需要 JWT 鉴权,通过 signature 验证身份。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_no: { type: string, description: 业务订单号 }
 *               transaction_id: { type: string, description: 微信支付订单号 }
 *               signature: { type: string, description: 微信签名(用于验签) }
 *     responses:
 *       200:
 *         description: |
 *           返回 { code: 0, message: 'success' } 表示成功,微信会停止重试;
 *           其他 code 表示失败,微信会重试 2-3 次。
 */

/**
 * @openapi
 * /api/membership/pay-notify:
 *   post:
 *     tags: [小程序-会员]
 *     summary: 微信支付 V2(JSAPI)支付回调
 *     description: |
 *       微信支付成功后的异步回调接口,XML 格式,验签后开通会员。
 *       注意:不需要 JWT 鉴权,通过签名校验身份;返回 XML 给微信。
 *     requestBody:
 *       required: true
 *       content:
 *         text/xml:
 *           schema:
 *             type: string
 *             description: 微信支付回调 XML
 *     responses:
 *       200:
 *         description: |
 *           返回 XML: return_code=SUCCESS 表示处理成功,微信停止重试;
 *           return_code=FAIL 表示失败,微信会重试。
 */

/**
 * @openapi
 * /api/membership/payment-status/{orderNo}:
 *   get:
 *     tags: [小程序-会员]
 *     summary: 查询订单支付状态
 *     description: |
 *       若订单已支付直接返回 paid;未支付则主动向微信查单,命中 SUCCESS 时补单入账。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 返回 { status: 'paid' | 'pending' }
 */

const crypto = require('crypto')
const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error, notFound } = require('../../utils/response')
const { generateOrderNo } = require('../../utils/helpers')
const { buildSignData, generatePaymentSign, verifyNotifySignature } = require('../../services/virtualPay')
const getVirtualPayConfig = require('../../config/virtualPay')
const wechatConfig = require('../../config/wechat')
const wechatPay = require('../../services/wechatPay')
const wechatUtil = require('../../utils/wechat')
const { parseXml } = require('../../utils/xml')
const logger = require('../../utils/logger')
const db = require('../../models')

router.get('/plans', async (req, res, next) => {
  try {
    const plans = await db.MembershipPlan.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    })
    return success(res, plans)
  } catch (err) {
    next(err)
  }
})

router.get('/status', auth, async (req, res, next) => {
  try {
    const user = req.user
    const now = new Date()
    const isVip = user.membership_expire && new Date(user.membership_expire) > now

    if (user.membership_expire && new Date(user.membership_expire) <= now) {
      const freeScanSetting = await db.Setting.findOne({ where: { key: 'free_scan_count' } })
      const freeScanCount = parseInt(freeScanSetting?.value || '10')
      user.scan_remaining = 10
      user.quote_remaining = freeScanCount
      user.quote_daily_count = 0
      await user.save()
    }

    let planName = null
    if (user.membership_id) {
      const plan = await db.MembershipPlan.findByPk(user.membership_id)
      planName = plan ? plan.name : null
    }

    return success(res, {
      isVip,
      membershipExpire: user.membership_expire,
      planId: user.membership_id,
      planName
    })
  } catch (err) {
    next(err)
  }
})

router.post('/purchase', auth, async (req, res, next) => {
  try {
    const { plan_id } = req.body
    logger.info('[membership/purchase] 入参', { plan_id, userId: req.userId })

    if (!plan_id) return error(res, '请选择会员套餐', 422, 422)

    const plan = await db.MembershipPlan.findByPk(plan_id)
    if (!plan || plan.status !== 1) return error(res, '套餐不存在', 10003, 400)

    logger.info('[membership/purchase] 套餐', { id: plan.id, name: plan.name, price: plan.price, duration_days: plan.duration_days })

    // 1. 校验微信支付配置(mchId / apiKey / payNotifyUrl 任一缺失即视为未配置)
    if (!wechatConfig.mchId || !wechatConfig.apiKey || !wechatConfig.payNotifyUrl) {
      logger.error('[membership/purchase] 微信支付未配置', {
        mchId: !!wechatConfig.mchId,
        apiKey: !!wechatConfig.apiKey,
        payNotifyUrl: !!wechatConfig.payNotifyUrl,
        mchIdValue: wechatConfig.mchId,
        payNotifyUrlValue: wechatConfig.payNotifyUrl
      })
      return error(res, '微信支付未配置,请联系管理员', 10010, 500)
    }
    logger.info('[membership/purchase] 微信支付配置', {
      appId: wechatConfig.wxAppId,
      mchId: wechatConfig.mchId,
      payNotifyUrl: wechatConfig.payNotifyUrl
    })

    // 2. 校验用户 openid(auth 中间件查询时排除了 openid,这里重新查询以获取 openid)
    const user = await db.User.findByPk(req.userId)
    if (!user || !user.openid) {
      logger.error('[membership/purchase] 用户无 openid', { userId: req.userId, hasUser: !!user, hasOpenid: !!(user && user.openid) })
      return error(res, '请先微信登录', 10011, 400)
    }
    logger.info('[membership/purchase] 用户 openid', { userId: req.userId, openid: user.openid })

    // 3. 创建订单
    const order = await db.MembershipOrder.create({
      user_id: req.userId,
      plan_id: plan.id,
      order_no: generateOrderNo('VIP'),
      amount: plan.price,
      pay_method: 'wxpay',
      pay_status: 0
    })
    logger.info('[membership/purchase] 订单创建成功', { orderNo: order.order_no, amount: order.amount })

    // 4. 调用微信统一下单(JSAPI)
    const result = await wechatPay.unifiedOrder({
      orderNo: order.order_no,
      amount: plan.price,
      openid: user.openid,
      body: '会员套餐-' + plan.name,
      attach: order.order_no
    })
    logger.info('[membership/purchase] unifiedOrder 响应', {
      orderNo: order.order_no,
      return_code: result.return_code,
      result_code: result.result_code,
      prepay_id: result.prepay_id,
      return_msg: result.return_msg,
      err_code: result.err_code,
      err_code_des: result.err_code_des
    })

    // 5. 保存 prepay_id(用于后续查单)
    order.prepay_id = result.prepay_id
    await order.save()

    // 6. 生成 JSAPI 二次签名(供前端 wx.requestPayment 调用)
    const timeStamp = String(Math.floor(Date.now() / 1000))
    const nonceStr = crypto.randomBytes(16).toString('hex')
    const packageStr = 'prepay_id=' + result.prepay_id
    const signType = 'MD5'
    const paySign = wechatPay.signV2(
      { appId: wechatConfig.wxAppId, timeStamp, nonceStr, package: packageStr, signType },
      wechatConfig.apiKey,
      'MD5'
    )

    logger.info('[membership/purchase] JSAPI 二次签名', {
      orderNo: order.order_no,
      appId: wechatConfig.wxAppId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
      paySign
    })

    return success(res, {
      orderNo: order.order_no,
      amount: plan.price,
      planName: plan.name,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
      paySign
    }, '订单创建成功，请完成支付')
  } catch (err) {
    logger.error('[membership/purchase] 异常:', err.stack || err)
    next(err)
  }
})

/**
 * @openapi
 * /api/membership/virtual-pay-sign:
 *   post:
 *     tags: [小程序-会员]
 *     summary: 生成虚拟支付签名(会员开通)
 *     description: |
 *       JWT 鉴权。主小程序会员开通专用虚拟支付下单接口。
 *       JWT 用于识别用户(req.userId → 查 User 取 openid),code 用于即时换 session_key(signature 签名必需)。
 *       返回 wx.requestVirtualPayment 所需参数(signData/mode/paySig/signature)。
 *       回调复用 /api/dom/virtual-pay/notify(同 appid,MP 后台已统一配置)。
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan_id, code]
 *             properties:
 *               plan_id: { type: integer, description: 会员套餐ID }
 *               code: { type: string, description: wx.login 返回的 code(用于换 session_key) }
 *     responses:
 *       200:
 *         description: 返回 orderNo/signData/mode/paySig/signature/env
 */
router.post('/virtual-pay-sign', auth, async (req, res, next) => {
  try {
    const { plan_id, code } = req.body
    if (!plan_id || !code) return error(res, 'plan_id 和 code 必填', 422, 422)

    // 1. JWT 识别用户(不用 code 换 openid,直接查 User)
    const user = await db.User.findByPk(req.userId)
    if (!user || !user.openid) {
      logger.error('[membership/virtual-pay-sign] 用户未登录或缺少 openid', { userId: req.userId, hasOpenid: !!user?.openid })
      return error(res, '用户未登录或缺少 openid,请重新登录', 10011, 400)
    }

    // 2. 校验虚拟支付配置(env 决定用哪个 AppKey)
    const vpConfig = getVirtualPayConfig()
    const env = vpConfig.env
    const appKey = env === 1 ? vpConfig.sandboxKey : vpConfig.payKey
    if (!appKey || !vpConfig.offerId) {
      logger.error('[membership/virtual-pay-sign] 虚拟支付未配置', { env, hasAppKey: !!appKey, hasOfferId: !!vpConfig.offerId })
      const missing = env === 1 ? 'WX_VIRTUAL_PAY_SANDBOX_KEY' : 'WX_VIRTUAL_PAY_KEY'
      return error(res, `虚拟支付未配置(${missing} / WX_VIRTUAL_PAY_OFFER_ID)`, 10020, 500)
    }

    // 3. 查套餐(必须有 product_id)
    const plan = await db.MembershipPlan.findByPk(plan_id)
    if (!plan || plan.status !== 1 || !plan.product_id) {
      return error(res, '套餐不可用或未配置虚拟支付商品ID', 10021, 400)
    }

    // 4. code 换 session_key(用于 signature 签名,session_key 敏感不长期存)
    let wxData
    try {
      wxData = await wechatUtil.code2Session(code)
    } catch (e) {
      logger.error('[membership/virtual-pay-sign] code2Session 失败:', e.message)
      return error(res, '微信登录失败: ' + e.message, 10001, 400)
    }
    if (!wxData.sessionKey) {
      logger.error('[membership/virtual-pay-sign] sessionKey 缺失', { openid: wxData.openid })
      return error(res, 'session_key 获取失败,无法生成签名', 10001, 400)
    }

    // 5. 创建订单(pay_method='virtual' 区分虚拟支付)
    const order = await db.MembershipOrder.create({
      user_id: user.id,
      plan_id: plan.id,
      order_no: generateOrderNo('VIP'),
      amount: plan.price,
      pay_method: 'virtual',
      pay_status: 0
    })
    logger.info('[membership/virtual-pay-sign] 订单创建', { orderNo: order.order_no, userId: user.id, planId: plan.id, env })

    // 6. 构建 signData(道具直购模式 short_series_goods)
    const goodsPrice = Math.round(plan.price * 100)  // 元转分
    const signData = buildSignData({
      offerId: vpConfig.offerId,
      productId: plan.product_id,
      buyQuantity: 1,
      env: env,
      currencyType: 'CNY',
      goodsPrice: goodsPrice,
      outTradeNo: order.order_no,
      attach: `plan_${plan.id}`
    })

    // 7. 生成签名(paySig 用 appKey,signature 用 session_key)
    const { paySig, signature } = generatePaymentSign({
      signData,
      sessionKey: wxData.sessionKey,
      env: env
    })
    logger.info('[membership/virtual-pay-sign] 签名生成', { orderNo: order.order_no, productId: plan.product_id, env, goodsPrice })

    // 8. 返回 wx.requestVirtualPayment 所需参数
    return success(res, {
      orderNo: order.order_no,
      planName: plan.name,
      amount: plan.price,
      signData,
      mode: 'short_series_goods',
      paySig,
      signature,
      env
    }, '签名生成成功')
  } catch (err) {
    logger.error('[membership/virtual-pay-sign] 异常:', err.stack || err)
    next(err)
  }
})

router.post('/virtual-pay-notify', async (req, res, next) => {
  try {
    logger.info('[membership/virtual-pay-notify] 收到微信回调:', req.body)

    // 1. 验签
    if (!verifyNotifySignature(req.body)) {
      logger.warn('[membership/virtual-pay-notify] 签名验证失败:', req.body)
      // 返回失败码,微信会重试(2-3 次)
      return res.status(200).json({ code: 10005, message: 'verify signature fail' })
    }

    // 2. 解析回调参数(微信文档:order_no / transaction_id / ...)
    const { order_no, transaction_id } = req.body
    if (!order_no) {
      return res.status(200).json({ code: 10006, message: 'order_no required' })
    }

    // 3. 查询订单
    const order = await db.MembershipOrder.findOne({ where: { order_no } })
    if (!order) {
      logger.warn('[membership/virtual-pay-notify] 订单不存在:', { order_no })
      return res.status(200).json({ code: 10004, message: 'order not found' })
    }
    if (order.pay_status === 1) {
      logger.info('[membership/virtual-pay-notify] 订单已支付,幂等返回成功:', { order_no })
      return res.status(200).json({ code: 0, message: 'success' })
    }

    // 4. 开通会员(沿用原 pay-callback 的逻辑)
    const plan = await db.MembershipPlan.findByPk(order.plan_id)
    const now = new Date()
    const user = await db.User.findByPk(order.user_id)
    let startDate = now
    if (user.membership_expire) {
      const expireDate = new Date(user.membership_expire)
      if (expireDate > now) {
        startDate = expireDate
      }
    }
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.duration_days)

    await db.sequelize.transaction(async (t) => {
      await order.update({
        pay_status: 1,
        pay_time: now,
        transaction_id: transaction_id || order.transaction_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }, { transaction: t })

      await user.update({
        membership_id: plan.id,
        membership_expire: endDate,
        scan_remaining: 9999,
        quote_remaining: 9999
      }, { transaction: t })

      await plan.increment('subscriber_count', { transaction: t })
    })

    logger.info('[membership/virtual-pay-notify] 会员开通成功:', { order_no, userId: order.user_id, planId: order.plan_id })
    return res.status(200).json({ code: 0, message: 'success' })
  } catch (err) {
    logger.error('[membership/virtual-pay-notify] 异常:', err)
    next(err)
  }
})

/**
 * 开通会员(事务内:更新订单 + 用户权益 + 套餐订阅数)
 * /pay-notify 与 /payment-status 补单共用此逻辑
 * @param {Object} order MembershipOrder 实例(未支付)
 * @param {Object} extra { transaction_id, prepay_id } 微信侧返回的交易号与预支付 ID
 * @returns {Promise<{startDate:Date,endDate:Date}>}
 */
async function activateMembership(order, { transaction_id, prepay_id }) {
  const plan = await db.MembershipPlan.findByPk(order.plan_id)
  const now = new Date()
  const user = await db.User.findByPk(order.user_id)

  // 会员起始时间:若当前会员未过期则从原到期日续期,否则从现在开始
  let startDate = now
  if (user.membership_expire) {
    const expireDate = new Date(user.membership_expire)
    if (expireDate > now) {
      startDate = expireDate
    }
  }
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + plan.duration_days)

  await db.sequelize.transaction(async (t) => {
    await order.update({
      pay_status: 1,
      pay_time: now,
      transaction_id: transaction_id || order.transaction_id,
      prepay_id: prepay_id || order.prepay_id,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    }, { transaction: t })

    await user.update({
      membership_id: plan.id,
      membership_expire: endDate,
      scan_remaining: 9999,
      quote_remaining: 9999
    }, { transaction: t })

    await plan.increment('subscriber_count', { transaction: t })
  })

  return { startDate, endDate }
}

/**
 * 构造微信支付回调 XML 响应
 * @param {String} returnCode SUCCESS 或 FAIL
 * @param {String} returnMsg 描述
 * @returns {String} XML 字符串
 */
function buildNotifyXml(returnCode, returnMsg) {
  return `<xml><return_code><![CDATA[${returnCode}]]></return_code><return_msg><![CDATA[${returnMsg}]]></return_msg></xml>`
}

// 微信支付 V2(JSAPI)异步回调:不走 auth,以 XML 响应
router.post('/pay-notify', async (req, res, next) => {
  // 微信以 text/xml POST,经 express.text 中间件解析为字符串
  const xmlString = typeof req.body === 'string' ? req.body : ''
  logger.info('[membership/pay-notify] 收到微信支付回调', { body: xmlString })

  try {
    // 1. 验签
    if (!wechatPay.verifyNotify(xmlString)) {
      logger.warn('[membership/pay-notify] 验签失败')
      return res.set('Content-Type', 'text/xml').send(buildNotifyXml('FAIL', '签名失败'))
    }
    logger.info('[membership/pay-notify] 验签通过')

    // 2. 解析回调参数
    const params = parseXml(xmlString)
    const { return_code, out_trade_no, transaction_id, total_fee } = params

    // 3. 校验业务结果
    if (return_code !== 'SUCCESS') {
      logger.warn('[membership/pay-notify] return_code 非 SUCCESS', { return_code })
      return res.set('Content-Type', 'text/xml').send(buildNotifyXml('FAIL', '支付失败'))
    }

    // 4. 查询订单
    const order = await db.MembershipOrder.findOne({ where: { order_no: out_trade_no } })
    if (!order) {
      logger.warn('[membership/pay-notify] 订单不存在', { out_trade_no })
      return res.set('Content-Type', 'text/xml').send(buildNotifyXml('FAIL', '订单不存在'))
    }

    // 5. 幂等:已支付直接返回成功
    if (order.pay_status === 1) {
      logger.info('[membership/pay-notify] 订单已支付,幂等返回 SUCCESS', { out_trade_no })
      return res.set('Content-Type', 'text/xml').send(buildNotifyXml('SUCCESS', 'OK'))
    }
    logger.info('[membership/pay-notify] 订单状态', { out_trade_no, pay_status: order.pay_status })

    // 6. 校验金额(元 → 分)
    const expectedFee = Math.round(parseFloat(order.amount) * 100)
    if (parseInt(total_fee) !== expectedFee) {
      logger.warn('[membership/pay-notify] 金额不匹配', { out_trade_no, total_fee, orderAmount: order.amount })
      return res.set('Content-Type', 'text/xml').send(buildNotifyXml('FAIL', '金额不匹配'))
    }

    // 7. 开通会员(事务)
    await activateMembership(order, { transaction_id, prepay_id: params.prepay_id })

    logger.info('[membership/pay-notify] 入账成功', { out_trade_no, userId: order.user_id, planId: order.plan_id })
    return res.set('Content-Type', 'text/xml').send(buildNotifyXml('SUCCESS', 'OK'))
  } catch (err) {
    // 异常时返回 FAIL,微信会重试;不抛 next(errorHandler)以免返回 JSON
    logger.error('[membership/pay-notify] 异常:', err.stack || err)
    return res.set('Content-Type', 'text/xml').send(buildNotifyXml('FAIL', '系统异常'))
  }
})

// 查询订单支付状态(走 auth,用于前端轮询确认支付结果)
router.get('/payment-status/:orderNo', auth, async (req, res, next) => {
  try {
    const { orderNo } = req.params
    const order = await db.MembershipOrder.findOne({ where: { order_no: orderNo } })
    if (!order) return notFound(res, '订单不存在')

    // 1. 已支付直接返回
    if (order.pay_status === 1) {
      return success(res, { orderNo, status: 'paid', paidAt: order.pay_time })
    }

    // 2. 虚拟支付订单:不走 JSAPI orderquery(通道不同查不到),直接返回 pending,
    //    入账依赖 /api/dom/virtual-pay/notify 推送
    if (order.pay_method === 'virtual') {
      logger.info('[membership/payment-status] 虚拟支付订单等待推送入账', { orderNo })
      return success(res, { orderNo, status: 'pending' })
    }

    // 3. JSAPI 订单:主动向微信查单,命中 SUCCESS 则补单入账
    const queryResult = await wechatPay.orderquery(orderNo)
    logger.info('[membership/payment-status] 查单结果', { orderNo, trade_state: queryResult.trade_state })

    if (queryResult.trade_state === 'SUCCESS') {
      await activateMembership(order, {
        transaction_id: queryResult.transaction_id,
        prepay_id: queryResult.prepay_id
      })
      return success(res, { orderNo, status: 'paid', paidAt: order.pay_time })
    }

    return success(res, { orderNo, status: 'pending' })
  } catch (err) {
    logger.error('[membership/payment-status] 异常:', err.stack || err)
    next(err)
  }
})

/**
 * 虚拟支付前端补单接口(应对推送延迟或丢失)
 * 前端 wx.requestVirtualPayment success 回调触发,主动入账
 * 注:wx.requestVirtualPayment success 由微信原生 API 触发,用户确已支付成功(微信已扣款),可作为入账依据
 */
router.post('/virtual-pay-confirm', auth, async (req, res, next) => {
  try {
    const { orderNo } = req.body
    if (!orderNo) return error(res, 'orderNo 必填', 422, 422)

    const order = await db.MembershipOrder.findOne({ where: { order_no: orderNo } })
    if (!order) return notFound(res, '订单不存在')

    // 1. 校验订单归属(只能补单自己的订单)
    if (order.user_id !== req.userId) {
      return error(res, '无权操作此订单', 403, 403)
    }

    // 2. 校验订单类型(仅虚拟支付订单可补单)
    if (order.pay_method !== 'virtual') {
      return error(res, '非虚拟支付订单,不可补单', 400, 400)
    }

    // 3. 幂等:已支付直接返回
    if (order.pay_status === 1) {
      return success(res, { orderNo, status: 'paid', paidAt: order.pay_time }, '订单已支付')
    }

    // 4. 主动入账(复用 activateMembership)
    await activateMembership(order, { transaction_id: '', prepay_id: '' })
    logger.info('[membership/virtual-pay-confirm] 前端补单入账成功', { orderNo, userId: order.user_id, planId: order.plan_id })

    return success(res, { orderNo, status: 'paid', paidAt: order.pay_time }, '入账成功')
  } catch (err) {
    logger.error('[membership/virtual-pay-confirm] 异常:', err.stack || err)
    next(err)
  }
})

module.exports = router
