/**
 * @openapi
 * tags:
 *   - name: 管理端-角色管理
 *     description: 角色与权限管理接口
 */

/**
 * @openapi
 * /api/admin/roles:
 *   get:
 *     tags: [管理端-角色管理]
 *     summary: 获取角色列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-角色管理]
 *     summary: 创建角色
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               description: { type: string }
 *               permission_ids: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/roles/{id}:
 *   put:
 *     tags: [管理端-角色管理]
 *     summary: 更新角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [管理端-角色管理]
 *     summary: 删除角色
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 删除成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const roles = await db.Role.findAll({
      include: [{ model: db.Permission, as: 'Permissions', through: { attributes: [] } }]
    })
    return success(res, roles)
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { name, code, description, permission_ids } = req.body
    const role = await db.Role.create({ name, code, description })
    if (permission_ids && permission_ids.length > 0) {
      const permissions = await db.Permission.findAll({ where: { id: permission_ids } })
      await role.setPermissions(permissions)
    }
    return success(res, role, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const role = await db.Role.findByPk(req.params.id)
    if (!role) return notFound(res, '角色不存在')
    const { name, code, description, permission_ids } = req.body
    await role.update({ name, code, description })
    if (permission_ids) {
      const permissions = await db.Permission.findAll({ where: { id: permission_ids } })
      await role.setPermissions(permissions)
    }
    return success(res, role, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const role = await db.Role.findByPk(req.params.id)
    if (!role) return notFound(res, '角色不存在')
    if (role.code === 'super_admin') return success(res, null, '不能删除超级管理员角色')
    await role.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
