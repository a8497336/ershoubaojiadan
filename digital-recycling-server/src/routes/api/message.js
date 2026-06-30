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

/**
 * 获取当前用户已读的广播消息 ID 列表
 */
async function getReadBroadcastIds(userId) {
  const rows = await db.UserMessageRead.findAll({
    where: { user_id: userId },
    attributes: ['message_id'],
    raw: true
  })
  return rows.map(r => r.message_id)
}

/**
 * 将广播消息的 is_read 修正为当前用户的真实已读状态
 */
function applyBroadcastReadStatus(messages, readBroadcastIds) {
  return messages.map(msg => {
    const plain = msg.toJSON ? msg.toJSON() : msg
    if (plain.is_broadcast && readBroadcastIds.includes(plain.id)) {
      plain.is_read = 1
    }
    return plain
  })
}

router.get('/', auth, async (req, res, next) => {
  try {
    const { type, page = 1, pageSize = 20 } = req.query
    const where = {
      [Op.or]: [
        { user_id: req.userId },
        { is_broadcast: 1 }
      ]
    }

    if (type && type !== 'all' && type !== 'unread') {
      where.type = type
    }

    const readBroadcastIds = await getReadBroadcastIds(req.userId)

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Message.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    let list = applyBroadcastReadStatus(rows, readBroadcastIds)

    // 筛选未读消息：个人消息 is_read=0 或 广播消息未读
    if (type === 'unread') {
      list = list.filter(msg => {
        if (msg.is_broadcast) {
          return !readBroadcastIds.includes(msg.id)
        }
        return msg.is_read === 0
      })
    }

    return success(res, {
      list,
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
    if (!message) {
      return success(res, null, '消息不存在')
    }

    if (message.is_broadcast) {
      // 广播消息：写入 user_message_reads 表，不修改全局 is_read
      await db.UserMessageRead.findOrCreate({
        where: { user_id: req.userId, message_id: message.id }
      })
    } else if (!message.is_read) {
      // 个人消息：直接标记 is_read
      await message.update({ is_read: 1 })
    }

    return success(res, null, '已标记为已读')
  } catch (err) {
    next(err)
  }
})

router.put('/read-all', auth, async (req, res, next) => {
  try {
    // 1. 标记所有个人消息为已读
    await db.Message.update(
      { is_read: 1 },
      { where: { user_id: req.userId, is_read: 0 } }
    )

    // 2. 标记所有广播消息为已读（写入 user_message_reads）
    const broadcastMessages = await db.Message.findAll({
      where: { is_broadcast: 1 },
      attributes: ['id'],
      raw: true
    })
    const readBroadcastIds = await getReadBroadcastIds(req.userId)
    const newReads = broadcastMessages
      .filter(m => !readBroadcastIds.includes(m.id))
      .map(m => ({ user_id: req.userId, message_id: m.id }))

    if (newReads.length > 0) {
      await db.UserMessageRead.bulkCreate(newReads, { ignoreDuplicates: true })
    }

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
    // 1. 个人未读消息
    const personalUnread = await db.Message.count({
      where: { user_id: req.userId, is_read: 0 }
    })

    // 2. 广播消息中当前用户未读的数量
    const readBroadcastIds = await getReadBroadcastIds(req.userId)
    const broadcastWhere = { is_broadcast: 1 }
    if (readBroadcastIds.length > 0) {
      broadcastWhere.id = { [Op.notIn]: readBroadcastIds }
    }
    const broadcastUnread = await db.Message.count({ where: broadcastWhere })

    return success(res, { count: personalUnread + broadcastUnread })
  } catch (err) {
    next(err)
  }
})

module.exports = router