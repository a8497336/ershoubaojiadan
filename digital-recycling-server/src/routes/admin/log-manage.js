/**
 * @openapi
 * tags:
 *   - name: 管理端-日志管理
 *     description: 操作日志查询接口
 */

/**
 * @openapi
 * /api/admin/logs:
 *   get:
 *     tags: [管理端-日志管理]
 *     summary: 获取操作日志列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema: { type: string }
 *         description: 模块筛选
 *       - in: query
 *         name: action
 *         schema: { type: string }
 *         description: 操作类型筛选
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
const { success, paginate } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, module, action } = req.query
    const where = {}
    if (module) where.module = module
    if (action) where.action = action

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.AdminLog.findAndCountAll({
      where,
      include: [{ model: db.Admin, as: 'Admin', attributes: ['id', 'username', 'real_name'] }],
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
