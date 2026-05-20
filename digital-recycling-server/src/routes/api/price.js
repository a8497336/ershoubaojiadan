/**
 * @openapi
 * tags:
 *   - name: 小程序-报价
 *     description: 回收报价查询相关接口
 */

const { optionalAuth } = require('../../middlewares/auth')

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
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const { Op, literal, fn, col } = require('sequelize')
const db = require('../../models')

router.get('/today', auth, async (req, res, next) => {
  try {
    const { brand_id, category_id, product_id } = req.query
    const user = req.user
    const isVip = user.membership_expire && new Date(user.membership_expire) > new Date()
    const today = new Date().toISOString().split('T')[0]

    let dailyMax = 10
    if (!isVip) {
      const dailySetting = await db.Setting.findOne({ where: { key: 'daily_quote_count' } })
      dailyMax = parseInt(dailySetting?.value || '10')

      let quoteRemaining = parseInt(user.quote_remaining) || 0

      if (quoteRemaining > 0) {
        quoteRemaining -= 1
        await user.update({
          quote_remaining: quoteRemaining,
          quote_daily_count: (parseInt(user.quote_daily_count) || 0) + 1,
          quote_daily_date: today
        })
      } else {
        let dailyCount = parseInt(user.quote_daily_count) || 0
        const dailyDate = user.quote_daily_date

        if (dailyDate !== today) {
          dailyCount = 1
          await user.update({
            quote_daily_count: 1,
            quote_daily_date: today
          })
        } else if (dailyCount < dailyMax) {
          dailyCount += 1
          await user.update({ quote_daily_count: dailyCount })
        } else {
          return error(res, '今日查看次数已用完，开通会员可无限查看报价', 10007, 403)
        }
      }
    }

    const productWhere = { status: 1 }
    if (brand_id) productWhere.brand_id = brand_id
    if (category_id) productWhere.category_id = category_id
    if (product_id) productWhere.id = product_id

    const products = await db.Product.findAll({
      where: productWhere,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] }
      ],
      order: [['sort_order', 'ASC']]
    })

    const productIds = products.map(p => p.id)
    if (productIds.length === 0) {
      const quotaRes = isVip
        ? { quoteRemaining: 9999, quoteDailyRemaining: 9999 }
        : {
            quoteRemaining: parseInt(user.quote_remaining) || 0,
            quoteDailyRemaining: (() => {
              const dailyDate = user.quote_daily_date
              if (dailyDate !== today) return dailyMax
              return Math.max(0, dailyMax - (parseInt(user.quote_daily_count) || 0))
            })()
          }
      return success(res, {
        date: today,
        effectiveDate: null,
        updateTime: new Date().toISOString(),
        viewCount: 0,
        list: [],
        ...quotaRes
      })
    }

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

    const productList = products.map(p => ({
      ...p.toJSON(),
      Prices: priceMap[p.id] || []
    }))

    const todayView = await db.PriceView.findOne({ where: { view_date: today } })
    if (todayView) {
      await todayView.increment('view_count')
    } else {
      await db.PriceView.create({ view_date: today, view_count: 1 })
    }

    const viewCount = await db.PriceView.sum('view_count', {
      where: { view_date: today }
    })

    const firstDate = datePairs.length > 0 ? datePairs[0].effective_date : null

    await user.reload()

    const quotaRes = isVip
      ? { quoteRemaining: 9999, quoteDailyRemaining: 9999 }
      : {
          quoteRemaining: parseInt(user.quote_remaining) || 0,
          quoteDailyRemaining: (() => {
            const dailyDate = user.quote_daily_date
            if (dailyDate !== today) return dailyMax
            return Math.max(0, dailyMax - (parseInt(user.quote_daily_count) || 0))
          })()
        }

    return success(res, {
      date: firstDate || today,
      effectiveDate: firstDate,
      updateTime: new Date().toISOString(),
      viewCount: viewCount || 0,
      list: productList,
      ...quotaRes
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
    const startDateStr = startDate.toISOString().split('T')[0]

    const product = await db.Product.findByPk(productId, {
      include: [
        { model: db.Brand, as: 'Brand' },
        { model: db.Category, as: 'Category' }
      ]
    })

    const priceHistories = await db.PriceHistory.findAll({
      where: {
        product_id: productId,
        change_date: { [Op.gte]: startDateStr }
      },
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
      order: [['change_date', 'ASC']]
    })

    const allPrices = await db.Price.findAll({
      where: {
        product_id: productId,
        effective_date: { [Op.gte]: startDateStr }
      },
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
      order: [['effective_date', 'ASC']]
    })

    const trendData = {}

    // 先從 prices 表構建趨勢數據（每次導入的價格快照）
    for (const p of allPrices) {
      const conditionId = p.condition_id
      if (!trendData[conditionId]) {
        trendData[conditionId] = {
          name: p.Condition?.name || '未知',
          code: p.Condition?.code || `condition_${conditionId}`,
          data: []
        }
      }
      trendData[conditionId].data.push({
        date: p.effective_date,
        price: parseFloat(p.price) || 0
      })
    }

    // 合併 price_histories（手動修改記錄，同日期同 condition 時覆蓋 prices 數據）
    for (const h of priceHistories) {
      const conditionId = h.condition_id
      if (!trendData[conditionId]) {
        trendData[conditionId] = {
          name: h.Condition?.name || '未知',
          code: h.Condition?.code || `condition_${conditionId}`,
          data: []
        }
      }
      const existingIdx = trendData[conditionId].data.findIndex(d => d.date === h.change_date)
      if (existingIdx >= 0) {
        trendData[conditionId].data[existingIdx].price = parseFloat(h.new_price) || 0
      } else {
        trendData[conditionId].data.push({
          date: h.change_date,
          price: parseFloat(h.new_price) || 0
        })
      }
    }

    // 按日期排序每個 condition 的數據
    for (const key of Object.keys(trendData)) {
      trendData[key].data.sort((a, b) => a.date.localeCompare(b.date))
    }

    const currentPrices = allPrices.filter(p => !p.effective_date || p.effective_date >= startDateStr)

    let maxPrice = 0, minPrice = Infinity, latestPrice = 0
    const latestDate = currentPrices.length > 0
      ? currentPrices.reduce((max, p) => (p.effective_date > max ? p.effective_date : max), '')
      : ''
    const latestPrices = currentPrices.filter(p => p.effective_date === latestDate)
    latestPrices.forEach(p => {
      const price = parseFloat(p.price) || 0
      if (price > maxPrice) maxPrice = price
      if (price < minPrice) minPrice = price
      if (price > latestPrice) latestPrice = price
    })
    currentPrices.forEach(p => {
      const price = parseFloat(p.price) || 0
      if (price > maxPrice) maxPrice = price
      if (price < minPrice) minPrice = price
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
      currentPrices: latestPrices.length > 0 ? latestPrices : currentPrices,
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
