/**
 * @openapi
 * tags:
 *   - name: 小程序-钱包
 *     description: 钱包余额与提现相关接口
 */

/**
 * @openapi
 * /api/wallet/info:
 *   get:
 *     tags: [小程序-钱包]
 *     summary: 获取钱包信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/wallet/logs:
 *   get:
 *     tags: [小程序-钱包]
 *     summary: 获取钱包流水
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: type
 *         schema: { type: integer }
 *         description: 流水类型筛选
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/wallet/withdraw:
 *   post:
 *     tags: [小程序-钱包]
 *     summary: 申请提现
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number, description: 提现金额 }
 *     responses:
 *       200:
 *         description: 提现申请已提交
 */

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, paginate, error } = require('../../utils/response')
const db = require('../../models')

router.get('/info', auth, async (req, res, next) => {
  try {
    let wallet = await db.Wallet.findOne({ where: { user_id: req.userId } })
    if (!wallet) {
      wallet = await db.Wallet.create({ user_id: req.userId })
    }
    return success(res, wallet)
  } catch (err) {
    next(err)
  }
})

router.get('/logs', auth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, type } = req.query
    const where = { user_id: req.userId }
    if (type) where.type = type

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.WalletLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
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

router.post('/withdraw', auth, async (req, res, next) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) {
      return error(res, '提现金额无效', 40001, 400)
    }
    const wallet = await db.Wallet.findOne({ where: { user_id: req.userId } })
    if (!wallet || wallet.balance < amount) {
      return error(res, '余额不足', 40002, 400)
    }
    await wallet.update({
      balance: wallet.balance - amount,
      frozen: wallet.frozen + amount,
      total_withdraw: wallet.total_withdraw + amount
    })
    await db.WalletLog.create({
      user_id: req.userId,
      type: 3,
      amount,
      balance_after: wallet.balance,
      source: 'withdraw',
      remark: '提现申请'
    })
    return success(res, null, '提现申请已提交')
  } catch (err) {
    next(err)
  }
})

module.exports = router
