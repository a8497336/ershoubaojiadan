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
 * /api/membership/pay-callback:
 *   post:
 *     tags: [小程序-会员]
 *     summary: 支付回调
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_no]
 *             properties:
 *               order_no: { type: string, description: 订单编号 }
 *     responses:
 *       200:
 *         description: 支付成功
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const { generateOrderNo } = require('../../utils/helpers')
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
    const isVip = user.membership_expire && new Date(user.membership_expire) > new Date()
    return success(res, {
      isVip,
      membershipExpire: user.membership_expire,
      planId: user.membership_id
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
      pay_method: 'wechat',
      pay_status: 0
    })

    return success(res, {
      orderNo: order.order_no,
      amount: plan.price,
      planName: plan.name
    }, '订单创建成功，请完成支付')
  } catch (err) {
    next(err)
  }
})

router.post('/pay-callback', async (req, res, next) => {
  try {
    const { order_no } = req.body
    const order = await db.MembershipOrder.findOne({ where: { order_no } })
    if (!order) return error(res, '订单不存在', 10004, 400)
    if (order.pay_status === 1) return success(res, null, '已支付')

    const plan = await db.MembershipPlan.findByPk(order.plan_id)
    const now = new Date()
    const user = await db.User.findByPk(order.user_id)
    let startDate = now
    if (user.membership_expire && new Date(user.membership_expire) > now) {
      startDate = new Date(user.membership_expire)
    }
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.duration_days)

    await db.sequelize.transaction(async (t) => {
      await order.update({
        pay_status: 1,
        pay_time: now,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      }, { transaction: t })

      await user.update({
        membership_id: plan.id,
        membership_expire: endDate,
        scan_remaining: 9999
      }, { transaction: t })

      await plan.increment('subscriber_count', { transaction: t })
    })

    return success(res, null, '支付成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
