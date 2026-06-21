const { Op, fn, col } = require('sequelize')
const db = require('../models')

/**
 * 获取产品价格趋势数据（共享函数，供 API 和管理端路由使用）
 * @param {number} productId 产品 ID
 * @param {number} days 查询天数，默认 15
 * @returns {{ product, currentPrices, trendData, summary }}
 */
async function getPriceTrendData(productId, days = 15) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
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

  // 先从 prices 表构建趋势数据（每次导入的价格快照）
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

  // 合并 price_histories（手动修改记录，同日期同 condition 时覆盖 prices 数据）
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

  // 按日期排序每个 condition 的数据
  for (const key of Object.keys(trendData)) {
    trendData[key].data.sort((a, b) => a.date.localeCompare(b.date))
  }

  // 补齐当日缺失的数据点：若最新数据日期不是今天，复制最后一条数据到今天
  const today = new Date().toISOString().split('T')[0]
  for (const key of Object.keys(trendData)) {
    const data = trendData[key].data
    if (data.length > 0) {
      const lastPoint = data[data.length - 1]
      if (lastPoint.date !== today) {
        data.push({ date: today, price: lastPoint.price })
      }
    }
  }

  const currentPrices = allPrices.filter(p => !p.effective_date || p.effective_date >= startDateStr)

  let maxPrice = 0, minPrice = 0, latestPrice = 0
  const latestDate = currentPrices.length > 0
    ? currentPrices.reduce((max, p) => (p.effective_date > max ? p.effective_date : max), '')
    : ''
  const latestPrices = currentPrices.filter(p => p.effective_date === latestDate)
  
  if (latestPrices.length > 0) {
    minPrice = Infinity
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
  }

  // 修复"较昨日"计算：从 Price 表查询今天和昨天各自最新 effective_date 的最高价
  let priceChange = 0
  let priceChangePercent = 0

  // 获取今天最新的 effective_date
  const todayMaxDateResult = await db.Price.findOne({
    where: { product_id: productId },
    attributes: [[fn('MAX', col('effective_date')), 'latest_date']],
    raw: true
  })
  const todayMaxDate = todayMaxDateResult?.latest_date

  if (todayMaxDate) {
    // 获取今天最新日期下的所有价格，取最高价
    const todayPrices = await db.Price.findAll({
      where: { product_id: productId, effective_date: todayMaxDate },
      attributes: ['price'],
      raw: true
    })
    const todayMax = todayPrices.reduce((max, p) => {
      const val = parseFloat(p.price) || 0
      return val > max ? val : max
    }, 0)

    // 获取昨天最新的 effective_date（早于今天的）
    const yesterdayMaxDateResult = await db.Price.findOne({
      where: {
        product_id: productId,
        effective_date: { [Op.lt]: todayMaxDate }
      },
      attributes: [[fn('MAX', col('effective_date')), 'latest_date']],
      raw: true
    })
    const yesterdayMaxDate = yesterdayMaxDateResult?.latest_date

    if (yesterdayMaxDate) {
      // 获取昨天最新日期下的所有价格，取最高价
      const yesterdayPrices = await db.Price.findAll({
        where: { product_id: productId, effective_date: yesterdayMaxDate },
        attributes: ['price'],
        raw: true
      })
      const yesterdayMax = yesterdayPrices.reduce((max, p) => {
        const val = parseFloat(p.price) || 0
        return val > max ? val : max
      }, 0)

      priceChange = todayMax - yesterdayMax
      priceChangePercent = yesterdayMax > 0 ? parseFloat(((priceChange / yesterdayMax) * 100).toFixed(2)) : 0
    }
  }

  return {
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
  }
}

module.exports = { getPriceTrendData }