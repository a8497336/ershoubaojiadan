/**
 * @openapi
 * tags:
 *   - name: 小程序-搜索
 *     description: 全局搜索相关接口
 */

/**
 * @openapi
 * /api/search:
 *   get:
 *     tags: [小程序-搜索]
 *     summary: 全局搜索
 *     parameters:
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
 * /api/search/hot:
 *   get:
 *     tags: [小程序-搜索]
 *     summary: 热门搜索词
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
    const { keyword, page = 1, pageSize = 20 } = req.query
    if (!keyword) {
      return success(res, { list: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } })
    }

    const productWhere = {
      status: 1,
      [Op.or]: [
        { name: { [Op.like]: `%${keyword}%` } },
        { model_code: { [Op.like]: `%${keyword}%` } },
        { series_name: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize)
    const { count, rows } = await db.Product.findAndCountAll({
      where: productWhere,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] }
      ],
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

router.get('/hot', async (req, res, next) => {
  try {
    return success(res, ['华为', '苹果', 'OPPO', 'VIVO', '小米', '三星'])
  } catch (err) {
    next(err)
  }
})

module.exports = router
