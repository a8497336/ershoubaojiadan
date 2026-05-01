/**
 * @openapi
 * tags:
 *   - name: 管理端-分类管理
 *     description: 商品分类CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/categories:
 *   get:
 *     tags: [管理端-分类管理]
 *     summary: 获取分类列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-分类管理]
 *     summary: 创建分类
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: 分类名称 }
 *               code: { type: string, description: 分类编码 }
 *               icon: { type: string, description: 图标 }
 *               sort_order: { type: integer, description: 排序 }
 *               status: { type: integer, description: 状态 }
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [管理端-分类管理]
 *     summary: 更新分类
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               icon: { type: string }
 *               sort_order: { type: integer }
 *               status: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [管理端-分类管理]
 *     summary: 删除分类
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
const { success, notFound, paginate } = require('../../utils/response')
const db = require('../../models')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const categories = await db.Category.findAll({
      order: [['sort_order', 'ASC']],
      include: [{ model: db.Brand, as: 'Brands', attributes: ['id', 'name'] }]
    })
    return success(res, categories)
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { name, code, icon, sort_order, status } = req.body
    const category = await db.Category.create({ name, code, icon, sort_order: sort_order || 0, status: status !== undefined ? status : 1 })
    return success(res, category, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id)
    if (!category) return notFound(res, '分类不存在')
    const { name, code, icon, sort_order, status } = req.body
    await category.update({ name, code, icon, sort_order, status })
    return success(res, category, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id)
    if (!category) return notFound(res, '分类不存在')
    await category.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
