/**
 * @openapi
 * tags:
 *   - name: 管理端-用户管理
 *     description: 用户管理相关接口
 */

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *         description: 搜索关键词(昵称/手机号/编号)
 *       - in: query
 *         name: phone
 *         schema: { type: string }
 *         description: 手机号筛选
 *       - in: query
 *         name: referrer
 *         schema: { type: string }
 *         description: 推荐人筛选
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *         description: 注册开始日期
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *         description: 注册结束日期
 *       - in: query
 *         name: status
 *         schema: { type: integer }
 *         description: 状态筛选
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
 * /api/admin/users/export:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 导出用户列表Excel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: phone
 *         schema: { type: string }
 *       - in: query
 *         name: referrer
 *         schema: { type: string }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: status
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Excel文件流
 */

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户详情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 *   put:
 *     tags: [管理端-用户管理]
 *     summary: 更新用户信息
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
 *               nickname: { type: string }
 *               phone: { type: string }
 *               points: { type: integer }
 *               scan_remaining: { type: integer }
 *               status: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 */

/**
 * @openapi
 * /api/admin/users/{id}/status:
 *   put:
 *     tags: [管理端-用户管理]
 *     summary: 更新用户状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: integer, description: 状态(0禁用/1启用) }
 *     responses:
 *       200:
 *         description: 状态更新成功
 */

/**
 * @openapi
 * /api/admin/users/{id}/orders:
 *   get:
 *     tags: [管理端-用户管理]
 *     summary: 获取用户订单列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const XLSX = require('xlsx')
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, error, notFound, paginate } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

// 计算当日剩余查价次数（与小程序端 user.js 保持一致）
const computeQuoteDailyRemaining = (user) => {
  const today = new Date().toISOString().split('T')[0]
  if (user.quote_daily_date !== today) return 10
  return Math.max(0, 10 - (parseInt(user.quote_daily_count) || 0))
}

// 构建用户查询条件（列表和导出接口共享）
const buildUserWhere = (query) => {
  const { keyword, status, phone, date_from, date_to, referrer } = query
  const where = {}

  if (keyword) {
    where[Op.or] = [
      { nickname: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
      { user_no: { [Op.like]: `%${keyword}%` } }
    ]
  }
  if (status !== undefined && status !== '') where.status = status
  if (phone) where.phone = { [Op.like]: `%${phone}%` }
  if (referrer) where.referrer = { [Op.like]: `%${referrer}%` }
  if (date_from || date_to) {
    where.created_at = {}
    if (date_from) where.created_at[Op.gte] = new Date(date_from + 'T00:00:00')
    if (date_to) where.created_at[Op.lte] = new Date(date_to + 'T23:59:59')
  }

  return where
}

// 格式化用户列表数据
const formatUserList = (rows) => {
  return rows.map(user => {
    const json = user.toJSON()
    json.plan_name = json.MembershipPlan ? json.MembershipPlan.name : null
    delete json.MembershipPlan
    json.quoteDailyRemaining = computeQuoteDailyRemaining(user)
    return json
  })
}

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const where = buildUserWhere(req.query)
    const { offset, limit } = paginate(page, pageSize)

    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: {
        exclude: ['openid', 'union_id'],
        include: [[db.sequelize.literal('(SELECT COUNT(*) FROM invitations WHERE invitations.inviter_id = User.id)'), 'referral_count']]
      },
      include: [{ model: db.MembershipPlan, as: 'MembershipPlan', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    return success(res, {
      list: formatUserList(rows),
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

// 导出接口必须在 /:id 之前，避免 "export" 被当作 id
router.get('/export', adminAuth, async (req, res, next) => {
  try {
    const where = buildUserWhere(req.query)
    const rows = await db.User.findAll({
      where,
      attributes: { exclude: ['openid', 'union_id'] },
      include: [{ model: db.MembershipPlan, as: 'MembershipPlan', attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    })

    const list = formatUserList(rows)

    const excelData = list.map(u => ({
      '用户编号': u.user_no || '',
      '昵称': u.nickname || '',
      '手机号': u.phone || '',
      '推荐人': u.referrer || '',
      '积分': u.points || 0,
      '回收台数': u.total_recycled || 0,
      '累计收益': Number(u.total_amount || 0).toFixed(2),
      '会员类型': u.plan_name || '',
      '会员到期': u.membership_expire || '',
      '状态': u.status === 1 ? '正常' : '禁用',
      '注册时间': u.created_at || ''
    }))

    const ws = XLSX.utils.json_to_sheet(excelData)
    // 设置列宽
    ws['!cols'] = [
      { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 8 }, { wch: 20 }
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '用户列表')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.xlsx')
    return res.send(buf)
  } catch (err) { next(err) }
})

router.get('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['openid', 'union_id'] },
      include: [{ model: db.Wallet, as: 'Wallet' }]
    })
    if (!user) return notFound(res, '用户不存在')
    const data = user.toJSON()
    data.quoteDailyRemaining = computeQuoteDailyRemaining(user)
    return success(res, data)
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const { nickname, phone, user_no, points, scan_remaining, status } = req.body
    const user = await db.User.create({
      nickname: nickname || '新用户',
      phone,
      user_no: user_no || `USR${Date.now()}`,
      points: points || 0,
      scan_remaining: scan_remaining || 10,
      status: status !== undefined ? status : 1,
      avatar: '/images/icons/avatar.svg'
    })
    await db.Wallet.create({ user_id: user.id, balance: 0, frozen: 0, total_income: 0, total_withdraw: 0 })
    return success(res, { ...user.toJSON(), openid: undefined, union_id: undefined }, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')
    const { nickname, phone, points, scan_remaining, status, referrer, membership_id, membership_expire, quote_remaining } = req.body
    const updateData = { nickname, phone, points, scan_remaining, status, quote_remaining }
    if (referrer !== undefined) updateData.referrer = referrer
    if (membership_id) {
      updateData.membership_id = membership_id
      updateData.membership_expire = membership_expire
    } else if (membership_id === null || membership_id === '' || membership_id === undefined) {
      const freeScanSetting = await db.Setting.findOne({ where: { key: 'free_scan_count' } })
      const freeScanCount = parseInt(freeScanSetting?.value || '10')
      updateData.membership_id = null
      updateData.membership_expire = null
      updateData.quote_remaining = freeScanCount
      updateData.quote_daily_count = 0
    }
    await user.update(updateData)
    return success(res, user, '更新成功')
  } catch (err) { next(err) }
})

router.put('/:id/status', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')
    await user.update({ status: req.body.status })
    return success(res, null, '状态更新成功')
  } catch (err) { next(err) }
})

router.get('/:id/orders', adminAuth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Order.findAndCountAll({
      where: { user_id: req.params.id },
      include: [{ model: db.OrderItem, as: 'Items' }],
      order: [['created_at', 'DESC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.get('/:id/referrals', adminAuth, async (req, res, next) => {
  try {
    const invitations = await db.Invitation.findAll({
      where: { inviter_id: req.params.id },
      include: [{
        model: db.User,
        as: 'Invitee',
        attributes: ['user_no', 'nickname', 'phone', 'created_at'],
        include: [{ model: db.MembershipPlan, as: 'MembershipPlan', attributes: ['name'] }]
      }],
      order: [['created_at', 'DESC']]
    })

    const list = invitations.map(inv => {
      const invitee = inv.Invitee
      if (!invitee) return null
      return {
        user_no: invitee.user_no,
        nickname: invitee.nickname,
        phone: invitee.phone,
        plan_name: invitee.MembershipPlan?.name || null,
        created_at: invitee.created_at
      }
    }).filter(Boolean)

    return success(res, list)
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.params.id)
    if (!user) return notFound(res, '用户不存在')

    const userId = user.id

    // 按外键依赖顺序清理关联数据，避免 user.destroy() 报外键约束错误
    await db.Invitation.destroy({ where: { inviter_id: userId } })
    await db.Invitation.destroy({ where: { invitee_id: userId } })
    await db.Address.destroy({ where: { user_id: userId } })
    await db.Cart.destroy({ where: { user_id: userId } })
    await db.Favorite.destroy({ where: { user_id: userId } })
    await db.UserMessageRead.destroy({ where: { user_id: userId } })
    await db.Message.destroy({ where: { user_id: userId } })
    await db.WalletLog.destroy({ where: { user_id: userId } })
    await db.PointsLog.destroy({ where: { user_id: userId } })
    await db.Order.destroy({ where: { user_id: userId } })
    await db.MembershipOrder.destroy({ where: { user_id: userId } })
    await db.UserStock.destroy({ where: { user_id: userId } })
    await db.Wallet.destroy({ where: { user_id: userId } })

    await user.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

module.exports = router
