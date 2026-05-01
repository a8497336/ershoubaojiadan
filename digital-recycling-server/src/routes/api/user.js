/**
 * @openapi
 * tags:
 *   - name: 小程序-用户
 *     description: 用户信息、地址管理相关接口
 */

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags: [小程序-用户]
 *     summary: 获取用户信息
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
 *                     userId: { type: string, description: 用户编号 }
 *                     phone: { type: string, description: 手机号 }
 *                     nickname: { type: string, description: 昵称 }
 *                     avatar: { type: string, description: 头像 }
 *                     points: { type: integer, description: 积分 }
 *                     scanRemaining: { type: integer, description: 拍照查价剩余次数 }
 *                     membershipExpire: { type: string, description: 会员到期时间 }
 *   put:
 *     tags: [小程序-用户]
 *     summary: 更新用户信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname: { type: string, description: 昵称 }
 *               avatar: { type: string, description: 头像URL }
 *     responses:
 *       200:
 *         description: 更新成功
 */

/**
 * @openapi
 * /api/user/stats:
 *   get:
 *     tags: [小程序-用户]
 *     summary: 获取回收统计数据
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
 *                     totalRecycled: { type: integer, description: 累计回收台数 }
 *                     totalAmount: { type: number, description: 累计收益 }
 *                     co2Saved: { type: number, description: 减碳量kg }
 *                     treeEquivalent: { type: integer, description: 相当于种树棵数 }
 */

/**
 * @openapi
 * /api/user/addresses:
 *   get:
 *     tags: [小程序-用户]
 *     summary: 获取地址列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [小程序-用户]
 *     summary: 新增地址
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, province, city, district, detail]
 *             properties:
 *               name: { type: string, description: 收件人 }
 *               phone: { type: string, description: 联系电话 }
 *               province: { type: string, description: 省 }
 *               city: { type: string, description: 市 }
 *               district: { type: string, description: 区 }
 *               detail: { type: string, description: 详细地址 }
 *               isDefault: { type: boolean, description: 是否默认 }
 *     responses:
 *       200:
 *         description: 添加成功
 */

/**
 * @openapi
 * /api/user/addresses/{id}:
 *   put:
 *     tags: [小程序-用户]
 *     summary: 更新地址
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
 *               name: { type: string }
 *               phone: { type: string }
 *               province: { type: string }
 *               city: { type: string }
 *               district: { type: string }
 *               detail: { type: string }
 *               isDefault: { type: boolean }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [小程序-用户]
 *     summary: 删除地址
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

const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, notFound } = require('../../utils/response')
const db = require('../../models')

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user
    return success(res, {
      userId: user.user_no,
      phone: user.phone || '',
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      scanRemaining: user.scan_remaining,
      membershipExpire: user.membership_expire,
      membershipId: user.membership_id
    })
  } catch (err) {
    next(err)
  }
})

router.put('/profile', auth, async (req, res, next) => {
  try {
    const { nickname, avatar } = req.body
    const updateData = {}
    if (nickname) updateData.nickname = nickname
    if (avatar) updateData.avatar = avatar
    await req.user.update(updateData)
    return success(res, null, '更新成功')
  } catch (err) {
    next(err)
  }
})

router.get('/stats', auth, async (req, res, next) => {
  try {
    const user = req.user
    return success(res, {
      totalRecycled: user.total_recycled,
      totalAmount: user.total_amount,
      co2Saved: user.co2_saved,
      treeEquivalent: Math.floor(user.co2_saved / 2.5)
    })
  } catch (err) {
    next(err)
  }
})

router.get('/addresses', auth, async (req, res, next) => {
  try {
    const addresses = await db.Address.findAll({
      where: { user_id: req.userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    })
    return success(res, addresses)
  } catch (err) {
    next(err)
  }
})

router.post('/addresses', auth, async (req, res, next) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body
    if (isDefault) {
      await db.Address.update({ is_default: 0 }, { where: { user_id: req.userId } })
    }
    const address = await db.Address.create({
      user_id: req.userId,
      name,
      phone,
      province,
      city,
      district,
      detail,
      is_default: isDefault ? 1 : 0
    })
    return success(res, address, '添加成功')
  } catch (err) {
    next(err)
  }
})

router.put('/addresses/:id', auth, async (req, res, next) => {
  try {
    const address = await db.Address.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!address) return notFound(res, '地址不存在')
    const { name, phone, province, city, district, detail, isDefault } = req.body
    if (isDefault) {
      await db.Address.update({ is_default: 0 }, { where: { user_id: req.userId } })
    }
    await address.update({
      name: name || address.name,
      phone: phone || address.phone,
      province: province || address.province,
      city: city || address.city,
      district: district || address.district,
      detail: detail || address.detail,
      is_default: isDefault !== undefined ? (isDefault ? 1 : 0) : address.is_default
    })
    return success(res, address, '更新成功')
  } catch (err) {
    next(err)
  }
})

router.delete('/addresses/:id', auth, async (req, res, next) => {
  try {
    const address = await db.Address.findOne({ where: { id: req.params.id, user_id: req.userId } })
    if (!address) return notFound(res, '地址不存在')
    await address.destroy()
    return success(res, null, '删除成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
