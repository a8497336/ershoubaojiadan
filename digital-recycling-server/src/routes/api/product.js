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
const { Op } = require('sequelize')
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
        { model: db.Category, as: 'Category', attributes: ['id', 'name', 'code'] },
        {
          model: db.Price,
          as: 'Prices',
          attributes: ['price', 'condition_id'],
          include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
          where: { effective_date: new Date().toISOString().split('T')[0] },
          required: false
        }
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      offset,
      limit: parseInt(pageSize)
    })

    return success(res, {
      list: rows,
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

    const today = new Date().toISOString().split('T')[0]
    const prices = await db.Price.findAll({
      where: { product_id: product.id, effective_date: today },
      include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }]
    })

    return success(res, { ...product.toJSON(), prices })
  } catch (err) {
    next(err)
  }
})

module.exports = router
