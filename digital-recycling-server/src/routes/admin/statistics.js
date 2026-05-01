/**
 * @openapi
 * tags:
 *   - name: 管理端-数据统计
 *     description: 数据统计与分析接口
 */

/**
 * @openapi
 * /api/admin/statistics/overview:
 *   get:
 *     tags: [管理端-数据统计]
 *     summary: 获取统计概览
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/statistics/user-trend:
 *   get:
 *     tags: [管理端-数据统计]
 *     summary: 获取用户增长趋势
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/statistics/order-trend:
 *   get:
 *     tags: [管理端-数据统计]
 *     summary: 获取订单趋势
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/statistics/category-distribution:
 *   get:
 *     tags: [管理端-数据统计]
 *     summary: 获取分类分布
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/statistics/brand-ranking:
 *   get:
 *     tags: [管理端-数据统计]
 *     summary: 获取品牌排名
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/overview', adminAuth, async (req, res, next) => {
  try {
    const totalUsers = await db.User.count()
    const totalOrders = await db.Order.count()
    const totalRevenue = await db.Order.sum('total_amount', { where: { status: 'completed' } }) || 0
    const totalMembers = await db.User.count({ where: { membership_expire: { [Op.gt]: new Date() } } })
    return success(res, { totalUsers, totalOrders, totalRevenue, totalMembers })
  } catch (err) { next(err) }
})

router.get('/user-trend', adminAuth, async (req, res, next) => {
  try {
    const { days = 30 } = req.query
    const result = []
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      const count = await db.User.count({ where: { created_at: { [Op.between]: [start, end] } } })
      result.push({ date: start.toISOString().split('T')[0], count })
    }
    return success(res, result)
  } catch (err) { next(err) }
})

router.get('/order-trend', adminAuth, async (req, res, next) => {
  try {
    const { days = 30 } = req.query
    const result = []
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const start = new Date(date.setHours(0, 0, 0, 0))
      const end = new Date(date.setHours(23, 59, 59, 999))
      const count = await db.Order.count({ where: { created_at: { [Op.between]: [start, end] } } })
      const revenue = await db.Order.sum('total_amount', { where: { status: 'completed', completed_at: { [Op.between]: [start, end] } } }) || 0
      result.push({ date: start.toISOString().split('T')[0], count, revenue })
    }
    return success(res, result)
  } catch (err) { next(err) }
})

router.get('/category-distribution', adminAuth, async (req, res, next) => {
  try {
    const categories = await db.Category.findAll({
      attributes: ['id', 'name'],
      include: [{ model: db.Product, as: 'Products', attributes: ['id'] }]
    })
    const result = categories.map(c => ({ name: c.name, value: c.Products ? c.Products.length : 0 }))
    return success(res, result)
  } catch (err) { next(err) }
})

router.get('/brand-ranking', adminAuth, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query
    const brands = await db.Brand.findAll({
      attributes: ['id', 'name', 'sort_order'],
      include: [{ 
        model: db.Product, 
        as: 'Products', 
        attributes: ['id']
      }],
      order: [['sort_order', 'DESC']],
      limit: parseInt(limit)
    })
    const result = brands.map(b => ({ 
      name: b.name, 
      value: b.Products ? b.Products.length : 0 
    }))
    return success(res, result)
  } catch (err) { next(err) }
})

module.exports = router
