/**
 * @openapi
 * tags:
 *   - name: 管理端-会员管理
 *     description: 会员套餐与会员管理接口
 */

/**
 * @openapi
 * /api/admin/members/plans:
 *   get:
 *     tags: [管理端-会员管理]
 *     summary: 获取会员套餐列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/members/plans/{id}:
 *   put:
 *     tags: [管理端-会员管理]
 *     summary: 更新会员套餐
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 */

/**
 * @openapi
 * /api/admin/members/members:
 *   get:
 *     tags: [管理端-会员管理]
 *     summary: 获取会员列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 * /api/admin/members/orders:
 *   get:
 *     tags: [管理端-会员管理]
 *     summary: 获取会员订单列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
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

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound, paginate } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/plans', adminAuth, async (req, res, next) => {
  try {
    const plans = await db.MembershipPlan.findAll({ order: [['sort_order', 'ASC']] })
    return success(res, plans)
  } catch (err) { next(err) }
})

router.post('/plans', adminAuth, async (req, res, next) => {
  try {
    const plan = await db.MembershipPlan.create(req.body)
    return success(res, plan, '创建成功')
  } catch (err) { next(err) }
})

router.put('/plans/:id', adminAuth, async (req, res, next) => {
  try {
    const plan = await db.MembershipPlan.findByPk(req.params.id)
    if (!plan) return notFound(res, '套餐不存在')
    await plan.update(req.body)
    return success(res, plan, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/plans/:id', adminAuth, async (req, res, next) => {
  try {
    const plan = await db.MembershipPlan.findByPk(req.params.id)
    if (!plan) return notFound(res, '套餐不存在')
    await plan.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

router.get('/members', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const where = { membership_expire: { [Op.gt]: new Date() } }
    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['openid', 'union_id'] },
      order: [['membership_expire', 'DESC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.put('/members/:id/status', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '会员不存在')
    await user.update({ membership_expire: req.body.membership_expire, membership_id: req.body.membership_id })
    return success(res, null, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/members/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '会员不存在')
    await user.update({ membership_id: null, membership_expire: null })
    return success(res, null, '已取消会员')
  } catch (err) { next(err) }
})

router.get('/orders', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.MembershipOrder.findAndCountAll({
      include: [
        { model: db.User, as: 'User', attributes: ['id', 'nickname', 'phone'] },
        { model: db.MembershipPlan, as: 'Plan', attributes: ['id', 'name'] }
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

module.exports = router
