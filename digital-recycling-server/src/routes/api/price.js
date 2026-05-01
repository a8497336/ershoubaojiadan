/**
 * @openapi
 * tags:
 *   - name: 小程序-报价
 *     description: 回收报价查询相关接口
 */

/**
 * @openapi
 * /api/prices/today:
 *   get:
 *     tags: [小程序-报价]
 *     summary: 获取今日报价表
 *     description: 获取今日所有产品的回收报价，支持按品牌/分类筛选
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema: { type: integer }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code: { type: integer, example: 0 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     date: { type: string, description: 报价日期 }
 *                     updateTime: { type: string, description: 更新时间 }
 *                     viewCount: { type: integer, description: 浏览量 }
 *                     list: { type: array, items: { type: object } }
 */

/**
 * @openapi
 * /api/prices/conditions:
 *   get:
 *     tags: [小程序-报价]
 *     summary: 获取产品成色等级定义
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/prices/history/{productId}:
 *   get:
 *     tags: [小程序-报价]
 *     summary: 获取产品历史价格
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: condition_id
 *         schema: { type: integer }
 *       - in: query
 *         name: days
 *         schema: { type: integer, default: 30 }
 *         description: 查询天数
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { optionalAuth } = require('../../middlewares/auth')
const { success } = require('../../utils/response')
const { Op } = require('sequelize')
const db = require('../../models')

router.get('/today', optionalAuth, async (req, res, next) => {
  try {
    const { brand_id, category_id } = req.query
    const today = new Date().toISOString().split('T')[0]

    const productWhere = { status: 1 }
    if (brand_id) productWhere.brand_id = brand_id
    if (category_id) productWhere.category_id = category_id

    const products = await db.Product.findAll({
      where: productWhere,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
        {
          model: db.Price,
          as: 'Prices',
          where: { effective_date: today },
          required: false,
          include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }]
        }
      ],
      order: [['sort_order', 'ASC']]
    })

    const viewCount = await db.PriceView.sum('view_count', {
      where: { view_date: today }
    })

    return success(res, {
      date: today,
      updateTime: new Date().toISOString(),
      viewCount: viewCount || 0,
      list: products
    })
  } catch (err) {
    next(err)
  }
})

router.get('/conditions', optionalAuth, async (req, res, next) => {
  try {
    const conditions = await db.ProductCondition.findAll({
      order: [['sort_order', 'ASC']]
    })
    return success(res, conditions)
  } catch (err) {
    next(err)
  }
})

router.get('/history/:productId', optionalAuth, async (req, res, next) => {
  try {
    const { condition_id, days = 30 } = req.query
    const where = { product_id: req.params.productId }
    if (condition_id) where.condition_id = condition_id

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    where.change_date = { [Op.gte]: startDate.toISOString().split('T')[0] }

    const histories = await db.PriceHistory.findAll({
      where,
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
      order: [['change_date', 'DESC']]
    })
    return success(res, histories)
  } catch (err) {
    next(err)
  }
})

router.get('/trend/:productId', optionalAuth, async (req, res, next) => {
  try {
    const { days = 15 } = req.query
    const productId = req.params.productId

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const product = await db.Product.findByPk(productId, {
      include: [
        { model: db.Brand, as: 'Brand' },
        { model: db.Category, as: 'Category' }
      ]
    })

    const priceHistories = await db.PriceHistory.findAll({
      where: {
        product_id: productId,
        change_date: { [Op.gte]: startDate.toISOString().split('T')[0] }
      },
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
      order: [['change_date', 'ASC']]
    })

    const currentPrices = await db.Price.findAll({
      where: { product_id: productId },
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }]
    })

    const trendData = {}
    priceHistories.forEach(h => {
      const conditionCode = h.Condition?.code || `condition_${h.condition_id}`
      if (!trendData[conditionCode]) {
        trendData[conditionCode] = {
          name: h.Condition?.name || '未知',
          code: conditionCode,
          data: []
        }
      }
      trendData[conditionCode].data.push({
        date: h.change_date,
        price: h.new_price
      })
    })

    let maxPrice = 0, minPrice = Infinity, latestPrice = 0
    currentPrices.forEach(p => {
      const price = parseFloat(p.price) || 0
      if (price > maxPrice) maxPrice = price
      if (price < minPrice) minPrice = price
      if (price > latestPrice) latestPrice = price
    })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const yesterdayPriceHist = priceHistories.find(h => h.change_date === yesterdayStr)
    const yesterdayPrice = yesterdayPriceHist ? parseFloat(yesterdayPriceHist.new_price) : latestPrice

    const priceChange = latestPrice - yesterdayPrice
    const priceChangePercent = yesterdayPrice > 0 ? ((priceChange / yesterdayPrice) * 100).toFixed(2) : 0

    return success(res, {
      product,
      currentPrices,
      trendData: Object.values(trendData),
      summary: {
        maxPrice,
        minPrice,
        latestPrice,
        priceChange,
        priceChangePercent
      }
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
