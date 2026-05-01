/**
 * @openapi
 * tags:
 *   - name: 小程序-订单
 *     description: 订单管理相关接口
 */

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [小程序-订单]
 *     summary: 创建订单
 *     description: 将购物车中选中的商品创建为回收订单
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark: { type: string, description: 订单备注 }
 *     responses:
 *       200:
 *         description: 订单创建成功
 *   get:
 *     tags: [小程序-订单]
 *     summary: 获取订单列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *         description: 订单状态筛选(all/shipping/transit/completed/cancelled)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [小程序-订单]
 *     summary: 获取订单详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   put:
 *     tags: [小程序-订单]
 *     summary: 取消订单
 *     description: 只能取消待发货状态的订单
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, description: 取消原因 }
 *     responses:
 *       200:
 *         description: 订单已取消
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error, notFound } = require('../../utils/response')
const { generateOrderNo, paginate } = require('../../utils/helpers')
const db = require('../../models')
const { Op } = require('sequelize')

router.post('/', auth, async (req, res, next) => {
  try {
    const carts = await db.Cart.findAll({
      where: { user_id: req.userId, is_selected: 1 },
      include: [
        { model: db.Product, as: 'Product' },
        { model: db.ProductCondition, as: 'Condition' }
      ]
    })

    if (carts.length === 0) {
      return error(res, '请选择要回收的商品', 20001, 400)
    }

    const totalAmount = carts.reduce((sum, c) => sum + (c.unit_price || 0) * c.quantity, 0)

    const order = await db.sequelize.transaction(async (t) => {
      const newOrder = await db.Order.create({
        order_no: generateOrderNo('ORD'),
        user_id: req.userId,
        status: 'shipping',
        total_amount: totalAmount,
        remark: req.body?.remark || ''
      }, { transaction: t })

      const orderItems = carts.map(c => ({
        order_id: newOrder.id,
        product_id: c.product_id,
        product_name: c.Product ? c.Product.name : '',
        condition_name: c.Condition ? c.Condition.name : '',
        quantity: c.quantity,
        unit_price: c.unit_price || 0,
        subtotal: (c.unit_price || 0) * c.quantity
      }))
      await db.OrderItem.bulkCreate(orderItems, { transaction: t })

      await db.Cart.destroy({ where: { user_id: req.userId, is_selected: 1 }, transaction: t })

      return newOrder
    })

    return success(res, { orderNo: order.order_no, orderId: order.id }, '订单创建成功')
  } catch (err) {
    next(err)
  }
})

router.get('/', auth, async (req, res, next) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query
    const where = { user_id: req.userId }
    if (status && status !== 'all') {
      if (status === 'transit') {
        where.status = { [Op.in]: ['shipping', 'transit'] }
      } else {
        where.status = status
      }
    }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Order.findAndCountAll({
      where,
      include: [{ model: db.OrderItem, as: 'Items' }],
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    return success(res, {
      list: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize))
      }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    const order = await db.Order.findOne({
      where: { id: req.params.id, user_id: req.userId },
      include: [
        { model: db.OrderItem, as: 'Items' },
        { model: db.LogisticsTimeline, as: 'Timelines', order: [['happened_at', 'DESC']] }
      ]
    })
    if (!order) return notFound(res, '订单不存在')
    return success(res, order)
  } catch (err) {
    next(err)
  }
})

router.put('/:id/cancel', auth, async (req, res, next) => {
  try {
    const order = await db.Order.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!order) return notFound(res, '订单不存在')
    if (order.status !== 'shipping') {
      return error(res, '只能取消待发货的订单', 20002, 400)
    }
    await order.update({
      status: 'cancelled',
      cancel_reason: req.body.reason || '用户主动取消',
      cancelled_at: new Date()
    })
    return success(res, null, '订单已取消')
  } catch (err) {
    next(err)
  }
})

module.exports = router
