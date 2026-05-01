/**
 * @openapi
 * tags:
 *   - name: 小程序-消息
 *     description: 消息通知相关接口
 */

/**
 * @openapi
 * /api/messages:
 *   get:
 *     tags: [小程序-消息]
 *     summary: 获取消息列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *         description: 消息类型筛选(all/unread/order/price/system/activity)
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
 * /api/messages/{id}/read:
 *   put:
 *     tags: [小程序-消息]
 *     summary: 标记已读
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 已标记为已读
 */

/**
 * @openapi
 * /api/messages/read-all:
 *   put:
 *     tags: [小程序-消息]
 *     summary: 全部标记已读
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 已全部标记为已读
 */

/**
 * @openapi
 * /api/messages/unread-count:
 *   get:
 *     tags: [小程序-消息]
 *     summary: 获取未读数量
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, paginate } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/', auth, async (req, res, next) => {
  try {
    const { type, page = 1, pageSize = 20 } = req.query
    const where = {
      [Op.or]: [
        { user_id: req.userId },
        { is_broadcast: 1 }
      ]
    }
    if (type && type !== 'all') {
      if (type === 'unread') {
        where.is_read = 0
      } else {
        where.type = type
      }
    }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Message.findAndCountAll({
      where,
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

router.put('/:id/read', auth, async (req, res, next) => {
  try {
    const message = await db.Message.findOne({
      where: { id: req.params.id, [Op.or]: [{ user_id: req.userId }, { is_broadcast: 1 }] }
    })
    if (message && !message.is_read) {
      await message.update({ is_read: 1 })
    }
    return success(res, null, '已标记为已读')
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', auth, async (req, res, next) => {
  try {
    await db.Message.update(
      { is_read: 1 },
      { where: { user_id: req.userId, is_read: 0 } }
    )
    return success(res, null, '已全部标记为已读')
  } catch (err) {
    next(err)
  }
})

router.post('/feedback', auth, async (req, res, next) => {
  try {
    const { type, content, contact } = req.body
    if (!type || !content) {
      return res.status(400).json({ code: 40001, message: '类型和内容不能为空' })
    }
    await db.Message.create({
      user_id: req.userId,
      type: 'feedback',
      title: `用户反馈-${type}`,
      content: contact ? `${content}\n联系方式: ${contact}` : content,
      is_read: 0,
      is_broadcast: 0
    })
    return success(res, null, '反馈提交成功')
  } catch (err) {
    next(err)
  }
})

router.get('/unread-count', auth, async (req, res, next) => {
  try {
    const count = await db.Message.count({
      where: {
        [Op.or]: [{ user_id: req.userId }, { is_broadcast: 1 }],
        is_read: 0
      }
    })
    return success(res, { count })
  } catch (err) {
    next(err)
  }
})

module.exports = router
