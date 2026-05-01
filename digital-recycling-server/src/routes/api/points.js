/**
 * @openapi
 * tags:
 *   - name: 小程序-积分
 *     description: 积分余额与签到相关接口
 */

/**
 * @openapi
 * /api/points/balance:
 *   get:
 *     tags: [小程序-积分]
 *     summary: 获取积分余额
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/points/logs:
 *   get:
 *     tags: [小程序-积分]
 *     summary: 获取积分流水
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
 * /api/points/sign:
 *   post:
 *     tags: [小程序-积分]
 *     summary: 每日签到
 *     description: 每日签到获取积分，每日只能签到一次
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 签到成功
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const db = require('../../models')

router.get('/balance', auth, async (req, res, next) => {
  try {
    return success(res, { points: req.user.points })
  } catch (err) {
    next(err)
  }
})

router.get('/logs', auth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const { count, rows } = await db.PointsLog.findAndCountAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(pageSize)
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

router.post('/sign', auth, async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const existing = await db.PointsLog.findOne({
      where: {
        user_id: req.userId,
        source: 'sign',
        created_at: { [db.Sequelize.Op.gte]: today }
      }
    })
    if (existing) {
      return error(res, '今日已签到', 10005, 400)
    }

    const signPoints = 5
    await db.sequelize.transaction(async (t) => {
      await req.user.increment('points', { by: signPoints, transaction: t })
      await req.user.reload({ transaction: t })

      await db.PointsLog.create({
        user_id: req.userId,
        type: 1,
        points: signPoints,
        balance_after: req.user.points,
        source: 'sign',
        remark: '每日签到'
      }, { transaction: t })
    })

    return success(res, { points: req.user.points, earned: signPoints }, '签到成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
