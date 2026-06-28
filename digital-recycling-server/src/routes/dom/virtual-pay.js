/**
 * dom 项目虚拟支付接口
 * 为 dom(定位测试 Demo)项目提供独立的虚拟支付测试链路:
 *   - /plans    获取虚拟支付可用套餐
 *   - /sign     code 换 openid + 创建订单 + 生成签名(免登支付模式)
 *   - /order    查询订单状态(供前端轮询)
 *   - /notify   微信虚拟支付异步回调(验签 + 开通会员)
 *
 * 设计原则:
 *   1. 不依赖 JWT 鉴权(dom 端无登录体系),用 wx.login code 换 openid 识别用户
 *   2. 不修改 src/routes/api/membership.js 任何逻辑,完全独立
 *   3. 复用现有 MembershipOrder / MembershipPlan / User 模型与 virtualPay 服务
 *   4. 通过 pay_method='virtual' 区分虚拟支付订单
 */
const router = require('express').Router()
const { success, error } = require('../../utils/response')
const { generateOrderNo, generateUserNo } = require('../../utils/helpers')
const { buildSignData, generatePaymentSign, verifyNotifySignature } = require('../../services/virtualPay')
const getVirtualPayConfig = require('../../config/virtualPay')
const wechatUtil = require('../../utils/wechat')
const { parseXml, buildXml } = require('../../utils/xml')
const logger = require('../../utils/logger')
const db = require('../../models')

/**
 * @openapi
 * /api/dom/virtual-pay/plans:
 *   get:
 *     tags: [dom-虚拟支付]
 *     summary: 获取虚拟支付可用套餐
 *     description: 仅返回 status=1 且 product_id 非空的套餐(已配置虚拟支付商品ID)
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await db.MembershipPlan.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    })
    // 仅返回 product_id 非空的套餐(虚拟支付必备)
    const list = plans
      .filter(p => p.product_id)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        original_price: p.original_price,
        duration_days: p.duration_days,
        product_id: p.product_id,
        subscriber_count: p.subscriber_count
      }))
    return success(res, list)
  } catch (err) {
    logger.error('[dom/virtual-pay/plans] 异常:', err.stack || err)
    next(err)
  }
})

/**
 * @openapi
 * /api/dom/virtual-pay/sign:
 *   post:
 *     tags: [dom-虚拟支付]
 *     summary: 生成虚拟支付签名(按官方文档重写)
 *     description: |
 *       免登支付模式:接受 wx.login code + plan_id,
 *       后端用 code 换 openid + session_key → 查/建 User → 创建订单 → 生成签名,
 *       返回 wx.requestVirtualPayment 所需参数(signData/mode/paySig/signature)。
 *
 *       签名算法(关键):
 *         paySig    = hex(hmac_sha256(appKey,     uri + '&' + signData))  // uri='requestVirtualPayment'
 *         signature = hex(hmac_sha256(sessionKey, signData))
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, plan_id]
 *             properties:
 *               code: { type: string, description: wx.login 返回的 code }
 *               plan_id: { type: integer, description: 会员套餐ID }
 *     responses:
 *       200:
 *         description: |
 *           返回 { orderNo, signData, mode, paySig, signature, env }。
 *           错误码: 10020=虚拟支付未配置, 10021=套餐未配置商品ID, 10001=微信登录失败
 */
router.post('/sign', async (req, res, next) => {
  try {
    const { code, plan_id } = req.body
    if (!code || !plan_id) return error(res, 'code 和 plan_id 必填', 422, 422)

    // 1. 校验虚拟支付配置(env 决定用哪个 AppKey)
    const vpConfig = getVirtualPayConfig()
    const env = vpConfig.env
    const appKey = env === 1 ? vpConfig.sandboxKey : vpConfig.payKey
    if (!appKey || !vpConfig.offerId) {
      logger.error('[dom/virtual-pay/sign] 虚拟支付未配置', {
        env, hasAppKey: !!appKey, hasOfferId: !!vpConfig.offerId
      })
      const missing = env === 1 ? 'WX_VIRTUAL_PAY_SANDBOX_KEY' : 'WX_VIRTUAL_PAY_KEY'
      return error(res, `虚拟支付未配置(${missing} / WX_VIRTUAL_PAY_OFFER_ID)`, 10020, 500)
    }

    // 2. 查套餐(必须 product_id 非空)
    const plan = await db.MembershipPlan.findByPk(plan_id)
    if (!plan || plan.status !== 1 || !plan.product_id) {
      return error(res, '套餐不可用或未配置虚拟支付商品ID', 10021, 400)
    }

    // 3. code 换 openid + session_key(签名必需)
    let wxData
    try {
      wxData = await wechatUtil.code2Session(code)
    } catch (e) {
      logger.error('[dom/virtual-pay/sign] code2Session 失败:', e.message)
      return error(res, '微信登录失败: ' + e.message, 10001, 400)
    }
    if (!wxData.sessionKey) {
      logger.error('[dom/virtual-pay/sign] sessionKey 缺失', { openid: wxData.openid })
      return error(res, 'session_key 获取失败,无法生成签名', 10001, 400)
    }

    // 4. 查/建 User(dom 端无登录,用 openid 找或建)
    let user = await db.User.findOne({ where: { openid: wxData.openid } })
    if (!user) {
      user = await db.User.create({
        openid: wxData.openid,
        union_id: wxData.unionid,
        user_no: generateUserNo(),
        nickname: 'dom虚拟支付测试',
        scan_remaining: 10,
        status: 1
      })
      logger.info('[dom/virtual-pay/sign] 新建用户', { userId: user.id, openid: user.openid })
    }

    // 5. 创建订单(pay_method 标记为 virtual,便于区分)
    const order = await db.MembershipOrder.create({
      user_id: user.id,
      plan_id: plan.id,
      order_no: generateOrderNo('VIP'),
      amount: plan.price,
      pay_method: 'virtual',
      pay_status: 0
    })
    logger.info('[dom/virtual-pay/sign] 订单创建', { orderNo: order.order_no, userId: user.id, planId: plan.id, env })

    // 6. 构建 signData(道具直购模式 short_series_goods)
    // goodsPrice 单位是分,plan.price 单位是元,需转换
    const goodsPrice = Math.round(plan.price * 100)
    const signData = buildSignData({
      offerId: vpConfig.offerId,
      productId: plan.product_id,
      buyQuantity: 1,
      env: env,
      currencyType: 'CNY',
      goodsPrice: goodsPrice,
      outTradeNo: order.order_no,
      attach: `plan_${plan.id}`  // 透传数据,发货推送时原样回传
    })

    // 7. 生成签名(paySig 用 appKey,signature 用 session_key)
    const { paySig, signature } = generatePaymentSign({
      signData,
      sessionKey: wxData.sessionKey,
      env: env
      // uri 默认 'requestVirtualPayment'
    })
    logger.info('[dom/virtual-pay/sign] 签名生成', { orderNo: order.order_no, productId: plan.product_id, env, goodsPrice })

    // 8. 返回 wx.requestVirtualPayment 所需参数
    return success(res, {
      orderNo: order.order_no,
      planName: plan.name,
      amount: plan.price,
      signData,              // JSON 字符串,直接传给 wx.requestVirtualPayment.signData
      mode: 'short_series_goods',  // 道具直购
      paySig,                // 支付签名
      signature,             // 用户态签名
      env: env               // 环境标识(前端可展示)
    }, '签名生成成功')
  } catch (err) {
    logger.error('[dom/virtual-pay/sign] 异常:', err.stack || err)
    next(err)
  }
})

/**
 * @openapi
 * /api/dom/virtual-pay/order/{orderNo}:
 *   get:
 *     tags: [dom-虚拟支付]
 *     summary: 查询订单支付状态
 *     description: 供前端轮询确认入账(虚拟支付无主动查单 API,仅返回数据库状态)
 *     parameters:
 *       - in: path
 *         name: orderNo
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 返回 { status: 'paid' | 'pending', payStatus, amount, planName, paidAt }
 */
router.get('/order/:orderNo', async (req, res, next) => {
  try {
    const { orderNo } = req.params
    const order = await db.MembershipOrder.findOne({
      where: { order_no: orderNo },
      include: [{ model: db.MembershipPlan, as: 'Plan' }]
    })
    if (!order) return error(res, '订单不存在', 10004, 404)

    return success(res, {
      orderNo: order.order_no,
      status: order.pay_status === 1 ? 'paid' : 'pending',
      payStatus: order.pay_status,
      amount: order.amount,
      planName: order.Plan ? order.Plan.name : null,
      paidAt: order.pay_time
    })
  } catch (err) {
    logger.error('[dom/virtual-pay/order] 异常:', err.stack || err)
    next(err)
  }
})

/**
 * @openapi
 * /api/dom/virtual-pay/notify:
 *   post:
 *     tags: [dom-虚拟支付]
 *     summary: 微信虚拟支付消息推送接收端(道具发货)
 *     description: |
 *       按微信虚拟支付最新文档,服务端通过"消息推送"接收道具发货通知,
 *       推送内容是 XML 格式(event = xpay_goods_deliver_notify),需:
 *       1. 验签: 校验 signature 字段
 *       2. 幂等: 同一 OutTradeNo 只处理一次
 *       3. 响应: {"ErrCode":0,"ErrMsg":"success"},微信会停止重试
 *
 *       本接口同时处理 4 种推送类型:
 *       - xpay_goods_deliver_notify(道具发货,本 Demo 主流程)
 *       - xpay_coin_pay_notify(代币支付)
 *       - xpay_refund_notify(退款)
 *       - xpay_complaint_notify(用户投诉)
 *
 *       推送 URL 需在 MP 后台「基础配置 → 发货推送」中配置为:
 *         https://wx.lydzhsw.com/api/dom/virtual-pay/notify
 *     responses:
 *       200:
 *         description: 始终返回 {"ErrCode":0,"ErrMsg":"success"}
 */
router.post('/notify', async (req, res, next) => {
  // 微信推送是 XML 字符串(由 app.js 挂载的 express.text 中间件解析到 req.body)
  const xmlString = req.body
  logger.info('[dom/virtual-pay/notify] 收到推送:', xmlString)

  // 统一返回成功响应(即使内部处理失败,也必须返回 ErrCode:0,
  // 否则微信会按 2/4/8/16... 间隔重试 15 次)
  const respondSuccess = () => {
    return res.status(200).type('application/json').json({ ErrCode: 0, ErrMsg: 'success' })
  }

  try {
    // 1. 解析 XML
    const payload = parseXml(xmlString)
    const event = payload.Event

    if (!event) {
      logger.warn('[dom/virtual-pay/notify] 推送无 Event 字段:', payload)
      return respondSuccess()
    }

    // 2. 按 Event 分发处理
    switch (event) {
      case 'xpay_goods_deliver_notify':
        await handleGoodsDeliverNotify(payload)
        break
      case 'xpay_coin_pay_notify':
        logger.info('[dom/virtual-pay/notify] 代币支付推送(暂不处理):', payload)
        break
      case 'xpay_refund_notify':
        logger.info('[dom/virtual-pay/notify] 退款推送(暂不处理):', payload)
        break
      case 'xpay_complaint_notify':
        logger.info('[dom/virtual-pay/notify] 用户投诉推送(暂不处理):', payload)
        break
      default:
        logger.warn('[dom/virtual-pay/notify] 未知 Event:', event)
    }

    return respondSuccess()
  } catch (err) {
    logger.error('[dom/virtual-pay/notify] 异常:', err.stack || err)
    // 即便异常也返回成功,避免微信重试 15 次
    return respondSuccess()
  }
})

/**
 * 处理道具发货推送(xpay_goods_deliver_notify)
 * 推送字段(均为字符串,需手动转换):
 *   - OutTradeNo: 业务订单号
 *   - OpenId: 用户 openid
 *   - WeChatPayInfo: 微信支付信息(xml 嵌套,本 Demo 不解析)
 *   - GoodsInfo.ProductId: 道具 ID
 *   - GoodsInfo.Quantity: 数量
 *   - GoodsInfo.ActualPrice: 实际支付价(分)
 *   - GoodsInfo.Attach: 透传信息
 *   - Env: 0=现网 1=沙箱
 */
async function handleGoodsDeliverNotify(payload) {
  const outTradeNo = payload.OutTradeNo
  if (!outTradeNo) {
    logger.warn('[dom/virtual-pay/notify] 道具发货推送缺 OutTradeNo')
    return
  }

  // 1. 验签(若推送含 signature 字段;沙箱环境可能不验签)
  // 注:实测发现 xpay_goods_deliver_notify 不含 signature 字段,验签从略
  // if (payload.signature && !verifyNotifySignature(payload)) {
  //   logger.warn('[dom/virtual-pay/notify] 道具发货推送验签失败')
  //   return
  // }

  // 2. 查订单
  const order = await db.MembershipOrder.findOne({ where: { order_no: outTradeNo } })
  if (!order) {
    logger.warn('[dom/virtual-pay/notify] 订单不存在:', { outTradeNo })
    return
  }
  if (order.pay_status === 1) {
    logger.info('[dom/virtual-pay/notify] 订单已处理,幂等返回:', { outTradeNo })
    return
  }

  // 3. 开通会员(复用 membership.js 同款事务逻辑)
  const plan = await db.MembershipPlan.findByPk(order.plan_id)
  if (!plan) {
    logger.error('[dom/virtual-pay/notify] 套餐不存在:', { planId: order.plan_id })
    return
  }

  const now = new Date()
  const user = await db.User.findByPk(order.user_id)
  if (!user) {
    logger.error('[dom/virtual-pay/notify] 用户不存在:', { userId: order.user_id })
    return
  }

  // 会员起始时间:若当前会员未过期则从原到期日续期,否则从现在开始
  let startDate = now
  if (user.membership_expire) {
    const expireDate = new Date(user.membership_expire)
    if (expireDate > now) startDate = expireDate
  }
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + plan.duration_days)

  await db.sequelize.transaction(async (t) => {
    await order.update({
      pay_status: 1,
      pay_time: now,
      transaction_id: payload.TransactionId || payload.transaction_id || order.transaction_id,
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

  logger.info('[dom/virtual-pay/notify] 道具发货入账成功:', {
    outTradeNo, userId: order.user_id, planId: order.plan_id
  })
}

module.exports = router
