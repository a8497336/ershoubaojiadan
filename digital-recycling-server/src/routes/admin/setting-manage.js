/**
 * @openapi
 * tags:
 *   - name: 管理端-系统设置
 *     description: 系统配置管理接口
 */

/**
 * @openapi
 * /api/admin/settings:
 *   get:
 *     tags: [管理端-系统设置]
 *     summary: 获取系统设置
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *   put:
 *     tags: [管理端-系统设置]
 *     summary: 更新系统设置
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 键值对形式的设置项
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: 设置更新成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const settings = await db.Setting.findAll()
    const result = {}
    settings.forEach(s => { result[s.key] = s.value })
    return success(res, result)
  } catch (err) { next(err) }
})

router.put('/', adminAuth, async (req, res, next) => {
  try {
    const settings = req.body
    for (const [key, value] of Object.entries(settings)) {
      await db.Setting.upsert({ key, value }, { returning: true })
    }
    return success(res, null, '设置更新成功')
  } catch (err) { next(err) }
})

module.exports = router
