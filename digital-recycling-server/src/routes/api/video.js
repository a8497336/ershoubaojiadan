/**
 * @openapi
 * /api/videos:
 *   get:
 *     tags: [小程序-内容]
 *     summary: 获取视频教程列表
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: 视频分类筛选
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query
    const where = { status: 1 }
    if (category) where.category = category

    const videos = await db.Video.findAll({
      where,
      order: [['sort_order', 'ASC']]
    })
    return success(res, videos)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const video = await db.Video.findByPk(req.params.id)
    if (!video) {
      return res.status(404).json({ code: 1, message: '视频不存在' })
    }
    return success(res, video)
  } catch (err) {
    next(err)
  }
})

module.exports = router
