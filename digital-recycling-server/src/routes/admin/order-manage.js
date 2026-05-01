/**
 * @openapi
 * tags:
 *   - name: 管理端-订单管理
 *     description: 订单管理与状态流转接口
 */

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [管理端-订单管理]
 *     summary: 获取订单列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     tags: [管理端-订单管理]
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
 * /api/admin/orders/{id}/status:
 *   put:
 *     tags: [管理端-订单管理]
 *     summary: 更新订单状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, description: 新状态 }
 *     responses:
 *       200:
 *         description: 状态更新成功
 */

/**
 * @openapi
 * /api/admin/orders/{id}/logistics:
 *   put:
 *     tags: [管理端-订单管理]
 *     summary: 录入物流信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [logistics_company, tracking_no]
 *             properties:
 *               logistics_company: { type: string, description: 物流公司 }
 *               tracking_no: { type: string, description: 运单号 }
 *               logistics_status: { type: string, description: 物流状态 }
 *     responses:
 *       200:
 *         description: 物流信息更新成功
 */

/**
 * @openapi
 * /api/admin/orders/{id}/inspect:
 *   put:
 *     tags: [管理端-订单管理]
 *     summary: 质检录入
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
 *               actual_amount: { type: number, description: 实际打款金额 }
 *               remark: { type: string, description: 质检备注 }
 *     responses:
 *       200:
 *         description: 质检信息更新成功
 */

/**
 * @openapi
 * /api/admin/orders/{id}/pay:
 *   put:
 *     tags: [管理端-订单管理]
 *     summary: 确认打款
 *     description: 确认打款并完成订单，同时更新用户钱包余额
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 打款成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound, error, paginate } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { status, keyword, page = 1, pageSize = 20 } = req.query
    const where = {}
    if (status) where.status = status
    if (keyword) {
      where[Op.or] = [
        { order_no: { [Op.like]: `%${keyword}%` } },
        { receiver_name: { [Op.like]: `%${keyword}%` } },
        { tracking_no: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Order.findAndCountAll({
      where,
      include: [
        { model: db.User, as: 'User', attributes: ['id', 'nickname', 'phone', 'user_no'] },
        { model: db.OrderItem, as: 'Items' }
      ],
      order: [['created_at', 'DESC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { user_id, remark } = req.body
    const user = await db.User.findByPk(user_id)
    if (!user) return error(res, '用户不存在', 40001, 400)

    const address = await db.Address.findOne({ where: { user_id, is_default: 1 } })
    const orderNo = `ORD${Date.now()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    const order = await db.Order.create({
      order_no: orderNo,
      user_id,
      status: 'shipping',
      total_amount: 0,
      receiver_name: address ? address.name : user.nickname,
      receiver_phone: address ? address.phone : user.phone,
      receiver_address: address ? `${address.province}${address.city}${address.district}${address.detail}` : '',
      remark: remark || ''
    })
    return success(res, order, '订单创建成功')
  } catch (err) { next(err) }
})

router.get('/export', adminAuth, async (req, res, next) => {
  try {
    const { status, keyword, ids } = req.query
    const where = {}
    if (status) where.status = status
    if (ids) {
      where.id = { [Op.in]: ids.split(',').map(Number) }
    }
    if (keyword) {
      where[Op.or] = [
        { order_no: { [Op.like]: `%${keyword}%` } },
        { receiver_name: { [Op.like]: `%${keyword}%` } },
        { tracking_no: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const orders = await db.Order.findAll({
      where,
      include: [
        { model: db.User, as: 'User', attributes: ['id', 'nickname', 'phone', 'user_no'] },
        { model: db.OrderItem, as: 'Items' }
      ],
      order: [['created_at', 'DESC']],
      limit: 5000
    })

    const statusLabels = { shipping: '待发货', transit: '运输中', inspecting: '质检中', completed: '已完成', cancelled: '已取消' }
    const header = '订单号,用户,状态,总金额,实际金额,收件人,联系电话,收货地址,物流公司,运单号,备注,创建时间\n'
    const rows = orders.map(o => {
      const items = o.Items ? o.Items.map(i => `${i.product_name}x${i.quantity}`).join('; ') : ''
      return [
        o.order_no,
        o.User ? (o.User.nickname || o.User.user_no) : '',
        statusLabels[o.status] || o.status,
        o.total_amount || 0,
        o.actual_amount || '',
        o.receiver_name || '',
        o.receiver_phone || '',
        `"${(o.receiver_address || '').replace(/"/g, '""')}"`,
        o.logistics_company || '',
        o.tracking_no || '',
        `"${(o.remark || '').replace(/"/g, '""')}"`,
        o.created_at ? new Date(o.created_at).toLocaleString('zh-CN') : ''
      ].join(',')
    }).join('\n')

    const bom = '\uFEFF'
    const csv = bom + header + rows

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().slice(0, 10)}.csv`)
    return res.send(csv)
  } catch (err) { next(err) }
})

router.put('/batch/status', adminAuth, async (req, res, next) => {
  try {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return error(res, '请选择订单', 40002, 400)
    }
    if (!status) {
      return error(res, '请指定状态', 40003, 400)
    }

    const updateData = { status }
    if (status === 'completed') updateData.completed_at = new Date()
    if (status === 'cancelled') updateData.cancelled_at = new Date()

    const [count] = await db.Order.update(updateData, {
      where: { id: { [Op.in]: ids } }
    })
    return success(res, { updated: count }, `成功更新${count}个订单`)
  } catch (err) { next(err) }
})

router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'User', attributes: ['id', 'nickname', 'phone', 'user_no'] },
        { model: db.OrderItem, as: 'Items' },
        { model: db.LogisticsTimeline, as: 'Timelines', order: [['happened_at', 'DESC']] }
      ]
    })
    if (!order) return notFound(res, '订单不存在')
    return success(res, order)
  } catch (err) { next(err) }
})

router.put('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id)
    if (!order) return notFound(res, '订单不存在')
    const { status } = req.body
    const updateData = { status }
    if (status === 'completed') updateData.completed_at = new Date()
    if (status === 'cancelled') updateData.cancelled_at = new Date()
    await order.update(updateData)
    return success(res, order, '状态更新成功')
  } catch (err) { next(err) }
})

router.put('/:id/logistics', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id)
    if (!order) return notFound(res, '订单不存在')
    const { logistics_company, tracking_no, logistics_status } = req.body
    await order.update({
      logistics_company,
      tracking_no,
      logistics_status: logistics_status || '已发货',
      status: 'transit'
    })
    await db.LogisticsTimeline.create({
      order_id: order.id,
      description: `${logistics_company}已揽件，运单号：${tracking_no}`,
      happened_at: new Date()
    })
    return success(res, order, '物流信息更新成功')
  } catch (err) { next(err) }
})

router.put('/:id/inspect', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id)
    if (!order) return notFound(res, '订单不存在')
    const { actual_amount, remark } = req.body
    await order.update({
      status: 'inspecting',
      actual_amount: actual_amount || order.total_amount,
      remark: remark || order.remark
    })
    return success(res, order, '质检信息更新成功')
  } catch (err) { next(err) }
})

router.put('/:id/pay', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id, { include: [{ model: db.User, as: 'User' }] })
    if (!order) return notFound(res, '订单不存在')

    await db.sequelize.transaction(async (t) => {
      const payAmount = order.actual_amount || order.total_amount
      await order.update({
        status: 'completed',
        actual_amount: payAmount,
        paid_at: new Date(),
        completed_at: new Date()
      }, { transaction: t })

      if (order.User) {
        await order.User.increment({
          total_recycled: order.Items ? order.Items.reduce((s, i) => s + i.quantity, 0) : 1,
          total_amount: payAmount,
          co2_saved: payAmount * 0.003
        }, { transaction: t })

        let wallet = await db.Wallet.findOne({ where: { user_id: order.user_id }, transaction: t })
        if (wallet) {
          await wallet.update({
            balance: wallet.balance + payAmount,
            total_income: wallet.total_income + payAmount
          }, { transaction: t })
          await db.WalletLog.create({
            user_id: order.user_id,
            type: 1,
            amount: payAmount,
            balance_after: wallet.balance,
            source: 'order',
            source_id: order.order_no,
            remark: '订单打款'
          }, { transaction: t })
        }
      }
    })
    return success(res, null, '打款成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const order = await db.Order.findByPk(req.params.id)
    if (!order) return notFound(res, '订单不存在')
    if (order.status !== 'cancelled') {
      return error(res, '只能删除已取消的订单', 40004, 400)
    }
    await db.OrderItem.destroy({ where: { order_id: order.id } })
    await db.LogisticsTimeline.destroy({ where: { order_id: order.id } })
    await order.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
