/**
 * @openapi
 * tags:
 *   - name: 管理端-消息管理
 *     description: 消息推送管理接口
 */

/**
 * @openapi
 * /api/admin/messages/broadcast:
 *   post:
 *     tags: [管理端-消息管理]
 *     summary: 发送广播消息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string, description: 消息标题 }
 *               content: { type: string, description: 消息内容 }
 *               type: { type: string, default: system, description: 消息类型 }
 *               icon: { type: string, description: 图标 }
 *     responses:
 *       200:
 *         description: 广播消息发送成功
 */

/**
 * @openapi
 * /api/admin/messages/send:
 *   post:
 *     tags: [管理端-消息管理]
 *     summary: 发送个人消息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, title, content]
 *             properties:
 *               user_id: { type: integer, description: 用户ID }
 *               title: { type: string, description: 消息标题 }
 *               content: { type: string, description: 消息内容 }
 *               type: { type: string, default: system, description: 消息类型 }
 *               icon: { type: string, description: 图标 }
 *     responses:
 *       200:
 *         description: 消息发送成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success } = require('../../utils/response')
const db = require('../../models')

router.post('/broadcast', adminAuth, async (req, res, next) => {
  try {
    const { title, content, type = 'system', icon } = req.body
    const message = await db.Message.create({
      title,
      content,
      type,
      icon,
      is_broadcast: 1,
      is_read: 0
    })
    return success(res, message, '广播消息发送成功')
  } catch (err) { next(err) }
})

router.post('/send', adminAuth, async (req, res, next) => {
  try {
    const { user_id, title, content, type = 'system', icon } = req.body
    const message = await db.Message.create({
      user_id,
      title,
      content,
      type,
      icon,
      is_broadcast: 0,
      is_read: 0
    })
    return success(res, message, '消息发送成功')
  } catch (err) { next(err) }
})

module.exports = router
