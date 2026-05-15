/**
 * @openapi
 * tags:
 *   - name: 小程序-产品
 *     description: 产品(机型)查询相关接口
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [小程序-产品]
 *     summary: 获取产品列表
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema: { type: integer }
 *         description: 品牌ID筛选
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *         description: 分类ID筛选
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: 搜索关键词
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
 * /api/products/{id}:
 *   get:
 *     tags: [小程序-产品]
 *     summary: 获取产品详情(含各等级报价)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { optionalAuth } = require('../../middlewares/auth')
const { success } = require('../../utils/response')
const { Op, fn, col } = require('sequelize')
const db = require('../../models')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { brand_id, category_id, keyword, page = 1, pageSize = 20 } = req.query
    const where = { status: 1 }
    if (brand_id) where.brand_id = brand_id
    if (category_id) where.category_id = category_id
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { model_code: { [Op.like]: `%${keyword}%` } },
        { series_name: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name', 'bg_color'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name', 'code'] }
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      offset,
      limit: parseInt(pageSize)
    })

    const productIds = rows.map(p => p.id)
    const productsWithPrices = await attachPerProductLatestPrices(rows, productIds)

    return success(res, {
      list: productsWithPrices,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize))
      }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id, {
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name', 'bg_color'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name', 'code'] }
      ]
    })
    if (!product) {
      return success(res, null)
    }

    const latestDate = await db.Price.findOne({
      where: { product_id: product.id },
      attributes: [[fn('MAX', col('effective_date')), 'latest_date']],
      group: ['product_id'],
      raw: true
    })

    const prices = latestDate
      ? await db.Price.findAll({
          where: { product_id: product.id, effective_date: latestDate.latest_date },
          include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }]
        })
      : []

    return success(res, { ...product.toJSON(), prices })
  } catch (err) {
    next(err)
  }
})

async function attachPerProductLatestPrices(products, productIds) {
  if (productIds.length === 0) return products.map(p => ({ ...p.toJSON(), Prices: [] }))

  const latestDates = await db.Price.findAll({
    where: { product_id: { [Op.in]: productIds } },
    attributes: ['product_id', [fn('MAX', col('effective_date')), 'latest_date']],
    group: ['product_id'],
    raw: true
  })

  const datePairs = latestDates.map(d => ({
    product_id: d.product_id,
    effective_date: d.latest_date
  }))

  const allPrices = datePairs.length > 0
    ? await db.Price.findAll({
        where: { [Op.or]: datePairs },
        include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
        raw: true,
        nest: true
      })
    : []

  const priceMap = {}
  for (const price of allPrices) {
    const pid = price.product_id
    if (!priceMap[pid]) priceMap[pid] = []
    priceMap[pid].push(price)
  }

  return products.map(p => ({
    ...p.toJSON(),
    Prices: priceMap[p.id] || []
  }))
}

module.exports = router
