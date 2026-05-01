/**
 * @openapi
 * tags:
 *   - name: 管理端-用户管理
 *     description: 用户管理相关接口
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: 搜索关键词(昵称/手机号/编号)
 *       - in: query
 *         name: status
 *         schema: { type: integer }
 *         description: 状态筛选
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
 * /api/admin/users/{id}:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户详情
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
 *   put:
 *     tags: [管理端-用户管理]
 *     summary: 更新用户信息
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
 *               nickname: { type: string }
 *               phone: { type: string }
 *               points: { type: integer }
 *               scan_remaining: { type: integer }
 *               status: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 */

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   put:
 *     tags: [管理端-用户管理]
 *     summary: 更新用户状态
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
 *               status: { type: integer, description: 状态(0禁用/1启用) }
 *     responses:
 *       200:
 *         description: 状态更新成功
 */

/**
 * @openapi
 * /api/admin/users/{id}/orders:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户订单列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
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

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, error, notFound, paginate } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { keyword, status, page = 1, pageSize = 20 } = req.query
    const where = {}
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { user_no: { [Op.like]: `%${keyword}%` } }
      ]
    }
    if (status !== undefined && status !== '') where.status = status

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['openid', 'union_id'] },
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['openid', 'union_id'] },
      include: [{ model: db.Wallet, as: 'Wallet' }]
    })
    if (!user) return notFound(res, '用户不存在')
    return success(res, user)
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { nickname, phone, user_no, points, scan_remaining, status } = req.body
    const user = await db.User.create({
      nickname: nickname || '新用户',
      phone,
      user_no: user_no || `USR${Date.now()}`,
      points: points || 0,
      scan_remaining: scan_remaining || 10,
      status: status !== undefined ? status : 1,
      avatar: '/images/icons/avatar.svg'
    })
    await db.Wallet.create({ user_id: user.id, balance: 0, frozen: 0, total_income: 0, total_withdraw: 0 })
    return success(res, { ...user.toJSON(), openid: undefined, union_id: undefined }, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')
    const { nickname, phone, points, scan_remaining, status } = req.body
    await user.update({ nickname, phone, points, scan_remaining, status })
    return success(res, user, '更新成功')
  } catch (err) { next(err) }
})

router.put('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')
    await user.update({ status: req.body.status })
    return success(res, null, '状态更新成功')
  } catch (err) { next(err) }
})

router.get('/:id/orders', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Order.findAndCountAll({
      where: { user_id: req.params.id },
      include: [{ model: db.OrderItem, as: 'Items' }],
      order: [['created_at', 'DESC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')
    await db.Wallet.destroy({ where: { user_id: user.id } })
    await db.WalletLog.destroy({ where: { user_id: user.id } })
    await db.PointsLog.destroy({ where: { user_id: user.id } })
    await db.Message.destroy({ where: { user_id: user.id } })
    await db.Cart.destroy({ where: { user_id: user.id } })
    await user.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
