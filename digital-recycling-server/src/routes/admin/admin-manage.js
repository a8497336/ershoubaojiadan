/**
 * @openapi
 * tags:
 *   - name: 管理端-管理员管理
 *     description: 管理员CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/admins:
 *   get:
 *     tags: [管理端-管理员管理]
 *     summary: 获取管理员列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-管理员管理]
 *     summary: 创建管理员
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *               real_name: { type: string }
 *               phone: { type: string }
 *               role_id: { type: integer }
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/admins/{id}:
 *   put:
 *     tags: [管理端-管理员管理]
 *     summary: 更新管理员
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
 *     tags: [管理端-管理员管理]
 *     summary: 删除管理员
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
const { success, notFound, error } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const admins = await db.Admin.findAll({
      include: [{ model: db.Role, as: 'Role', attributes: ['id', 'name', 'code'] }],
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    })
    return success(res, admins)
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { username, password, real_name, phone, role_id } = req.body
    if (!username || !password) return error(res, '用户名和密码不能为空', 422, 422)
    const admin = await db.Admin.create({ username, password, real_name, phone, role_id })
    return success(res, { ...admin.toJSON(), password: undefined }, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id)
    if (!admin) return notFound(res, '管理员不存在')
    const { real_name, phone, role_id, status } = req.body
    await admin.update({ real_name, phone, role_id, status })
    return success(res, { ...admin.toJSON(), password: undefined }, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const admin = await db.Admin.findByPk(req.params.id)
    if (!admin) return notFound(res, '管理员不存在')
    if (admin.username === 'admin') return error(res, '不能删除超级管理员', 403, 403)
    await admin.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
