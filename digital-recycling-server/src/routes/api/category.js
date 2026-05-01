/**
 * @openapi
 * tags:
 *   - name: 小程序-分类
 *     description: 商品分类相关接口
 */

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [小程序-分类]
 *     summary: 获取分类列表
 *     description: 获取所有启用的分类及其下属品牌
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       code: { type: string }
 *                       icon: { type: string }
 *                       Brands: { type: array, items: { type: object } }
 */

/**
 * @openapi
 * /api/categories/{id}/brands:
 *   get:
 *     tags: [小程序-分类]
 *     summary: 获取分类下品牌列表
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: 分类ID
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { optionalAuth } = require('../../middlewares/auth')
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const categories = await db.Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']],
      include: [{
        model: db.Brand,
        as: 'Brands',
        where: { status: 1 },
        required: false,
        order: [['sort_order', 'ASC']]
      }]
    })
    return success(res, categories)
  } catch (err) {
    next(err)
  }
})

router.get('/:id/brands', optionalAuth, async (req, res, next) => {
  try {
    const category = await db.Category.findByPk(req.params.id)
    if (!category) {
      return success(res, [])
    }
    const brands = await db.Brand.findAll({
      where: { category_id: req.params.id, status: 1 },
      order: [['sort_order', 'ASC']]
    })
    return success(res, brands)
  } catch (err) {
    next(err)
  }
})

module.exports = router
