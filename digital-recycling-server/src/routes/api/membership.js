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
 *         description: 订单创建成功
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

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const { generateOrderNo } = require('../../utils/helpers')
const { signVirtualPayParams, verifyNotifySignature } = require('../../services/virtualPay')
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
    if (!plan_id) return error(res, '请选择会员套餐', 422, 422)

    const plan = await db.MembershipPlan.findByPk(plan_id)
    if (!plan || plan.status !== 1) return error(res, '套餐不存在', 10003, 400)

    const order = await db.MembershipOrder.create({
      user_id: req.userId,
      plan_id: plan.id,
      order_no: generateOrderNo('VIP'),
      amount: plan.price,
      pay_method: 'wx_virtual',
      pay_status: 0
    })

    // 生成虚拟支付签名参数
    let signData = null
    let mode = 'long_series_goods'
    if (plan.product_id) {
      const user = await db.User.findByPk(req.userId)
      if (user && user.openid) {
        const signResult = signVirtualPayParams({
          orderNo: order.order_no,
          openid: user.openid,
          productId: plan.product_id,
          quantity: 1
        })
        signData = signResult.signData
        mode = signResult.mode
      } else {
        logger.warn('[membership/purchase] 用户 openid 为空,无法生成虚拟支付签名', { userId: req.userId })
      }
    } else {
      logger.warn('[membership/purchase] 套餐 product_id 为空,无法生成虚拟支付签名', { planId: plan.id })
    }

    return success(res, {
      orderNo: order.order_no,
      amount: plan.price,
      planName: plan.name,
      productId: plan.product_id,
      mode,
      signData
    }, '订单创建成功，请完成支付')
  } catch (err) {
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

module.exports = router
