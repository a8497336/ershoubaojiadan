/**
 * @openapi
 * tags:
 *   - name: 管理端-仪表盘
 *     description: 仪表盘统计数据相关接口
 */

/**
 * @openapi
 * /api/admin/dashboard/overview:
 *   get:
 *     tags: [管理端-仪表盘]
 *     summary: 获取概览统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/dashboard/trend:
 *   get:
 *     tags: [管理端-仪表盘]
 *     summary: 获取趋势数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 7 }
 *         description: 查询天数
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
    const todayUsers = await db.User.count({
      where: { created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } }
    })
    const todayOrders = await db.Order.count({
      where: { created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } }
    })
    const todayRevenue = await db.Order.sum('total_amount', {
      where: {
        status: 'completed',
        completed_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }) || 0
    const pendingOrders = await db.Order.count({ where: { status: 'shipping' } })
    const totalMembers = await db.User.count({
      where: { membership_expire: { [Op.gt]: new Date() } }
    })

    return success(res, {
      totalUsers,
      totalOrders,
      totalRevenue,
      todayUsers,
      todayOrders,
      todayRevenue,
      pendingOrders,
      totalMembers
    })
  } catch (err) {
    next(err)
  }
})

router.get('/trend', adminAuth, async (req, res, next) => {
  try {
    const { days = 7 } = req.query
    const result = []
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const orderCount = await db.Order.count({
        where: { created_at: { [Op.between]: [startOfDay, endOfDay] } }
      })
      const revenue = await db.Order.sum('total_amount', {
        where: { status: 'completed', completed_at: { [Op.between]: [startOfDay, endOfDay] } }
      }) || 0
      const userCount = await db.User.count({
        where: { created_at: { [Op.between]: [startOfDay, endOfDay] } }
      })

      result.push({ date: dateStr, orderCount, revenue, userCount })
    }
    return success(res, result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
