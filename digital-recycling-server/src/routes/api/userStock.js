const router = require('express').Router()
const { optionalAuth, auth } = require('../../middlewares/auth')
const { success } = require('../../utils/response')
const { UserStock, Product, Brand, ProductCondition, Price } = require('../../models')
const { Op } = require('sequelize')

router.get('/', auth, async (req, res, next) => {
  try {
    const { is_sold, page = 1, page_size = 20 } = req.query
    const userId = req.user.id

    const where = { userId }
    if (is_sold !== undefined) {
      where.isSold = is_sold === 'true'
    }

    const offset = (page - 1) * page_size
    const { count, rows } = await UserStock.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'Product',
          include: [
            { model: Brand, as: 'Brand' },
            { model: Price, as: 'Prices' }
          ]
        },
        {
          model: ProductCondition,
          as: 'Condition'
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(page_size),
      offset
    })

    const list = await Promise.all(
      rows.map(async (stock) => {
        const stockJson = stock.toJSON()
        
        let currentPrice = 0
        if (stockJson.Product?.Prices?.length > 0) {
          currentPrice = Math.max(...stockJson.Product.Prices.map(p => parseFloat(p.price) || 0))
        }
        
        let priceChange = 0
        if (stockJson.purchasePrice && currentPrice) {
          priceChange = currentPrice - parseFloat(stockJson.purchasePrice)
        }

        return {
          ...stockJson,
          currentPrice,
          priceChange
        }
      })
    )

    return success(res, {
      list,
      total: count,
      page: parseInt(page),
      page_size: parseInt(page_size)
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { product_id, quantity = 1, purchase_price, condition_id, note } = req.body
    const userId = req.user.id

    if (!product_id) {
      return res.status(400).json({ code: 400, message: '产品ID不能为空' })
    }

    const stock = await UserStock.create({
      userId,
      productId: product_id,
      quantity,
      purchasePrice: purchase_price,
      conditionId: condition_id,
      note
    })

    return success(res, stock, '添加成功')
  } catch (err) {
    next(err)
  }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const { quantity, purchase_price, condition_id, note } = req.body
    const userId = req.user.id

    const stock = await UserStock.findOne({ where: { id, userId } })
    if (!stock) {
      return res.status(404).json({ code: 404, message: '记录不存在' })
    }

    const updateData = {}
    if (quantity !== undefined) updateData.quantity = quantity
    if (purchase_price !== undefined) updateData.purchasePrice = purchase_price
    if (condition_id !== undefined) updateData.conditionId = condition_id
    if (note !== undefined) updateData.note = note

    await stock.update(updateData)
    return success(res, stock, '更新成功')
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const stock = await UserStock.findOne({ where: { id, userId } })
    if (!stock) {
      return res.status(404).json({ code: 404, message: '记录不存在' })
    }

    await stock.destroy()
    return success(res, null, '删除成功')
  } catch (err) {
    next(err)
  }
})

router.post('/:id/sell', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const { sold_price } = req.body
    const userId = req.user.id

    const stock = await UserStock.findOne({ where: { id, userId } })
    if (!stock) {
      return res.status(404).json({ code: 404, message: '记录不存在' })
    }

    await stock.update({
      isSold: true,
      soldPrice: sold_price,
      soldAt: new Date()
    })

    return success(res, stock, '卖出成功')
  } catch (err) {
    next(err)
  }
})

router.get('/stats', auth, async (req, res, next) => {
  try {
    const userId = req.user.id
    const stocks = await UserStock.findAll({ where: { userId } })
    
    const total_quantity = stocks.reduce((sum, s) => sum + s.quantity, 0)
    const active_count = stocks.filter(s => !s.isSold).length

    return success(res, {
      total_quantity,
      active_count,
      total_count: stocks.length
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
