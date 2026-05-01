/**
 * @openapi
 * /api/announcements:
 *   get:
 *     tags: [小程序-内容]
 *     summary: 获取公告列表
 *     parameters:
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
const { success, paginate } = require('../../utils/response')
const db = require('../../models')

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const { count, rows } = await db.Announcement.findAndCountAll({
      where: { status: 1 },
      order: [['is_top', 'DESC'], ['publish_at', 'DESC']],
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

module.exports = router
