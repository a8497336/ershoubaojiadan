/**
 * @openapi
 * tags:
 *   - name: 管理端-报价管理
 *     description: 回收报价管理与历史查询接口
 */

/**
 * @openapi
 * /api/admin/prices:
 *   get:
 *     tags: [管理端-报价管理]
 *     summary: 获取报价列表
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
 *         name: effective_date
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/prices/batch:
 *   put:
 *     tags: [管理端-报价管理]
 *     summary: 批量更新报价
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               effective_date: { type: string }
 *               prices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: integer }
 *                     condition_id: { type: integer }
 *                     price: { type: number }
 *                     is_available: { type: integer }
 *     responses:
 *       200:
 *         description: 报价更新成功
 */

/**
 * @openapi
 * /api/admin/prices/{id}:
 *   put:
 *     tags: [管理端-报价管理]
 *     summary: 更新单条报价
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
 */

/**
 * @openapi
 * /api/admin/prices/history:
 *   get:
 *     tags: [管理端-报价管理]
 *     summary: 获取价格历史
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema: { type: integer }
 *       - in: query
 *         name: condition_id
 *         schema: { type: integer }
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
 * /api/admin/prices/conditions:
 *   get:
 *     tags: [管理端-报价管理]
 *     summary: 获取成色等级列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound, paginate, error } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { brand_id, category_id, effective_date, page = 1, pageSize = 50 } = req.query
    const date = effective_date || new Date().toISOString().split('T')[0]
    const productWhere = { status: 1 }
    if (brand_id) productWhere.brand_id = brand_id
    if (category_id) productWhere.category_id = category_id

    const count = await db.Product.count({ where: productWhere })
    const { offset, limit } = paginate(page, pageSize)
    const idRows = await db.Product.findAll({
      where: productWhere,
      attributes: ['id'],
      offset, limit,
      order: [['id', 'ASC']]
    })
    const ids = idRows.map(r => r.id)
    const rows = ids.length > 0 ? await db.Product.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        {
          model: db.Price,
          as: 'Prices',
          where: { effective_date: date },
          required: false,
          include: [{ model: db.ProductCondition, as: 'Condition' }]
        }
      ],
      order: [['id', 'ASC']]
    }) : []
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { product_id, condition_id, price, is_available, effective_date } = req.body
    if (!product_id || !condition_id || price === undefined) {
      return error(res, '产品、条件和价格不能为空', 422, 422)
    }
    const date = effective_date || new Date().toISOString().split('T')[0]
    const existing = await db.Price.findOne({
      where: { product_id, condition_id, effective_date: date }
    })
    if (existing) {
      if (existing.price !== price) {
        await db.PriceHistory.create({
          product_id,
          condition_id,
          old_price: existing.price,
          new_price: price,
          change_date: date
        })
      }
      await existing.update({ price, is_available: is_available !== undefined ? is_available : 1 })
      return success(res, existing, '报价已存在，已更新')
    }
    const newPrice = await db.Price.create({
      product_id,
      condition_id,
      price,
      is_available: is_available !== undefined ? is_available : 1,
      effective_date: date
    })
    return success(res, newPrice, '创建成功')
  } catch (err) { next(err) }
})

router.put('/batch', adminAuth, async (req, res, next) => {
  try {
    const { prices, effective_date } = req.body
    const date = effective_date || new Date().toISOString().split('T')[0]

    for (const item of prices) {
      const existing = await db.Price.findOne({
        where: { product_id: item.product_id, condition_id: item.condition_id, effective_date: date }
      })
      if (existing) {
        if (existing.price !== item.price) {
          await db.PriceHistory.create({
            product_id: item.product_id,
            condition_id: item.condition_id,
            old_price: existing.price,
            new_price: item.price,
            change_date: date
          })
          await existing.update({ price: item.price, is_available: item.is_available !== undefined ? item.is_available : 1 })
        }
      } else {
        await db.Price.create({
          product_id: item.product_id,
          condition_id: item.condition_id,
          price: item.price,
          is_available: item.is_available !== undefined ? item.is_available : 1,
          effective_date: date
        })
      }
    }
    return success(res, null, '报价更新成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const price = await db.Price.findByPk(req.params.id)
    if (!price) return notFound(res, '报价不存在')
    const { price: newPrice, is_available } = req.body
    if (price.price !== newPrice) {
      await db.PriceHistory.create({
        product_id: price.product_id,
        condition_id: price.condition_id,
        old_price: price.price,
        new_price: newPrice,
        change_date: price.effective_date
      })
    }
    await price.update({ price: newPrice, is_available })
    return success(res, price, '更新成功')
  } catch (err) { next(err) }
})

router.get('/history', adminAuth, async (req, res, next) => {
  try {
    const { product_id, condition_id, days = 30, page = 1, pageSize = 20 } = req.query
    const where = {}
    if (product_id) where.product_id = product_id
    if (condition_id) where.condition_id = condition_id

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.PriceHistory.findAndCountAll({
      where,
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name'] }],
      order: [['change_date', 'DESC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.get('/conditions', adminAuth, async (req, res, next) => {
  try {
    const conditions = await db.ProductCondition.findAll({ order: [['sort_order', 'ASC']] })
    return success(res, conditions)
  } catch (err) { next(err) }
})

router.post('/conditions', adminAuth, async (req, res, next) => {
  try {
    const condition = await db.ProductCondition.create(req.body)
    return success(res, condition, '创建成功')
  } catch (err) { next(err) }
})

router.put('/conditions/:id', adminAuth, async (req, res, next) => {
  try {
    const condition = await db.ProductCondition.findByPk(req.params.id)
    if (!condition) return notFound(res, '成色等级不存在')
    await condition.update(req.body)
    return success(res, condition, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/conditions/:id', adminAuth, async (req, res, next) => {
  try {
    const condition = await db.ProductCondition.findByPk(req.params.id)
    if (!condition) return notFound(res, '成色等级不存在')
    await condition.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const price = await db.Price.findByPk(req.params.id)
    if (!price) return notFound(res, '报价不存在')
    await price.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
