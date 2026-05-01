/**
 * @openapi
 * tags:
 *   - name: 管理端-权限管理
 *     description: 权限树查询接口
 */

/**
 * @openapi
 * /api/admin/permissions:
 *   get:
 *     tags: [管理端-权限管理]
 *     summary: 获取权限树
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const permissions = await db.Permission.findAll({
      order: [['sort_order', 'ASC']]
    })
    const tree = buildTree(permissions, 0)
    return success(res, tree)
  } catch (err) { next(err) }
})

function buildTree(list, parentId) {
  return list
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item.toJSON(),
      children: buildTree(list, item.id)
    }))
}

module.exports = router
