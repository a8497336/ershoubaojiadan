/**
 * @openapi
 * tags:
 *   - name: 小程序-购物车
 *     description: 回收车(购物车)管理相关接口
 */

/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [小程序-购物车]
 *     summary: 获取购物车列表
 *     security:
 *       - bearerAuth: []
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
 *                     list: { type: array, items: { type: object } }
 *                     totalItems: { type: integer }
 *                     totalDevices: { type: integer }
 *                     selectedCount: { type: integer }
 *                     totalPrice: { type: string }
 *                     isAllSelected: { type: boolean }
 *   post:
 *     tags: [小程序-购物车]
 *     summary: 添加到购物车
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, condition_id]
 *             properties:
 *               product_id: { type: integer, description: 产品ID }
 *               condition_id: { type: integer, description: 成色等级ID }
 *               quantity: { type: integer, default: 1, description: 数量 }
 *     responses:
 *       200:
 *         description: 添加成功
 */

/**
 * @openapi
 * /api/cart/{id}:
 *   put:
 *     tags: [小程序-购物车]
 *     summary: 更新购物车项
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer, description: 数量 }
 *               is_selected: { type: boolean, description: 是否选中 }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [小程序-购物车]
 *     summary: 删除购物车项
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

/**
 * @openapi
 * /api/cart/select-all:
 *   put:
 *     tags: [小程序-购物车]
 *     summary: 全选/取消全选
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_selected: { type: boolean, description: 是否全选 }
 *     responses:
 *       200:
 *         description: 操作成功
 */

/**
 * @openapi
 * /api/cart/clear:
 *   delete:
 *     tags: [小程序-购物车]
 *     summary: 清空购物车
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 购物车已清空
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error, notFound } = require('../../utils/response')
const db = require('../../models')

router.get('/', auth, async (req, res, next) => {
  try {
    const carts = await db.Cart.findAll({
      where: { user_id: req.userId },
      include: [
        { model: db.Product, as: 'Product', attributes: ['id', 'name', 'image'] },
        { model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    })
    const totalItems = carts.length
    const totalDevices = carts.reduce((sum, c) => sum + c.quantity, 0)
    const selectedItems = carts.filter(c => c.is_selected)
    const selectedCount = selectedItems.reduce((sum, c) => sum + c.quantity, 0)
    const totalPrice = selectedItems.reduce((sum, c) => sum + (c.unit_price || 0) * c.quantity, 0)

    return success(res, {
      list: carts,
      totalItems,
      totalDevices,
      selectedCount,
      totalPrice: totalPrice.toFixed(2),
      isAllSelected: carts.length > 0 && carts.every(c => c.is_selected)
    })
  } catch (err) {
    next(err)
  }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const { product_id, condition_id, quantity = 1 } = req.body
    if (!product_id || !condition_id) {
      return error(res, '产品ID和等级ID不能为空', 422, 422)
    }

    const today = new Date().toISOString().split('T')[0]
    const priceRecord = await db.Price.findOne({
      where: { product_id, condition_id, effective_date: today, is_available: 1 }
    })
    const unitPrice = priceRecord ? priceRecord.price : 0

    const [cart, created] = await db.Cart.findOrCreate({
      where: { user_id: req.userId, product_id, condition_id },
      defaults: { quantity, unit_price: unitPrice, is_selected: 1 }
    })

    if (!created) {
      await cart.update({ quantity: cart.quantity + quantity, unit_price: unitPrice })
    }

    return success(res, cart, created ? '添加成功' : '数量已更新')
  } catch (err) {
    next(err)
  }
})

router.put('/select-all', auth, async (req, res, next) => {
  try {
    const { is_selected } = req.body
    await db.Cart.update(
      { is_selected: is_selected ? 1 : 0 },
      { where: { user_id: req.userId } }
    )
    return success(res, null, '操作成功')
  } catch (err) {
    next(err)
  }
})

router.delete('/clear', auth, async (req, res, next) => {
  try {
    await db.Cart.destroy({ where: { user_id: req.userId } })
    return success(res, null, '购物车已清空')
  } catch (err) {
    next(err)
  }
})

router.put('/:id', auth, async (req, res, next) => {
  try {
    const cart = await db.Cart.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!cart) return notFound(res, '购物车项不存在')

    const { quantity, is_selected } = req.body
    const updateData = {}
    if (quantity !== undefined) updateData.quantity = Math.max(1, quantity)
    if (is_selected !== undefined) updateData.is_selected = is_selected ? 1 : 0

    await cart.update(updateData)
    return success(res, cart, '更新成功')
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const cart = await db.Cart.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!cart) return notFound(res, '购物车项不存在')
    await cart.destroy()
    return success(res, null, '删除成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
