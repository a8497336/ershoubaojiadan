/**
 * @openapi
 * tags:
 *   - name: 管理端-品牌管理
 *     description: 品牌CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/brands:
 *   get:
 *     tags: [管理端-品牌管理]
 *     summary: 获取品牌列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-品牌管理]
 *     summary: 创建品牌
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category_id: { type: integer }
 *               logo: { type: string }
 *               bg_color: { type: string }
 *               sort_order: { type: integer }
 *               status: { type: integer }
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/brands/{id}:
 *   put:
 *     tags: [管理端-品牌管理]
 *     summary: 更新品牌
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
 *     tags: [管理端-品牌管理]
 *     summary: 删除品牌
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
const { Op } = require('sequelize')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { category_id, keyword, page = 1, pageSize = 20 } = req.query
    const where = {}
    if (category_id) where.category_id = category_id
    if (keyword) where.name = { [Op.like]: `%${keyword}%` }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Brand.findAndCountAll({
      where,
      include: [{ model: db.Category, as: 'Category', attributes: ['id', 'name'] }],
      order: [['sort_order', 'ASC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const brand = await db.Brand.create(req.body)
    return success(res, brand, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const brand = await db.Brand.findByPk(req.params.id)
    if (!brand) return notFound(res, '品牌不存在')
    await brand.update(req.body)
    return success(res, brand, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const brand = await db.Brand.findByPk(req.params.id)
    if (!brand) return notFound(res, '品牌不存在')
    await brand.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
