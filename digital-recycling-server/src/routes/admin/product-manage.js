/**
 * @openapi
 * tags:
 *   - name: 管理端-产品管理
 *     description: 产品(机型)CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags: [管理端-产品管理]
 *     summary: 获取产品列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema: { type: integer }
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
 *     tags: [管理端-产品管理]
 *     summary: 创建产品
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [管理端-产品管理]
 *     summary: 更新产品
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
 *     tags: [管理端-产品管理]
 *     summary: 删除产品(软删除)
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
    const { brand_id, category_id, keyword, page = 1, pageSize = 20 } = req.query
    const where = { status: 1 }
    if (brand_id) where.brand_id = brand_id
    if (category_id) where.category_id = category_id
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { model_code: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] }
      ],
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
    const product = await db.Product.create(req.body)
    return success(res, product, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id)
    if (!product) return notFound(res, '产品不存在')
    await product.update(req.body)
    return success(res, product, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id)
    if (!product) return notFound(res, '产品不存在')
    await product.update({ status: 0 })
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
