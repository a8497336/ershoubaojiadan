/**
 * @openapi
 * /api/stores:
 *   get:
 *     tags: [小程序-内容]
 *     summary: 获取门店列表
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', async (req, res, next) => {
  try {
    const stores = await db.Store.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    })
    return success(res, stores)
  } catch (err) {
    next(err)
  }
})

module.exports = router
