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
const multer = require('multer')
const path = require('path')
const { auth } = require('../../middlewares/auth')
const { success, error, notFound, paginateResponse, paginate } = require('../../utils/response')
const { getVipStatus } = require('../../utils/helpers')
const db = require('../../models')
const wechatUtil = require('../../utils/wechat')
const uploadConfig = require('../../config/upload')
const { Sequelize } = require('sequelize')

// 头像上传 multer 配置（复用 upload.js 的 diskStorage 模式）
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadConfig.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`)
  }
})
const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (uploadConfig.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的图片类型'))
    }
  }
})

// 上传头像
router.post('/avatar', auth, avatarUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, '请选择头像文件', 422, 422)
    }
    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`
    const url = `${baseUrl}/uploads/${req.file.filename}`
    await req.user.update({ avatar: url })
    // 重新查询确认数据库已更新
    await req.user.reload()
    console.log('[avatar] 头像更新成功, userId=%s, avatar=%s', req.user.id, req.user.avatar)
    return success(res, { url: req.user.avatar }, '头像上传成功')
  } catch (err) {
    next(err)
  }
})

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = req.user
    const vipStatus = await getVipStatus(user)
    if (!vipStatus.isVip && user.membership_expire !== null) {
      const freeScanSetting = await db.Setting.findOne({ where: { key: 'free_scan_count' } })
      const freeScanCount = parseInt(freeScanSetting?.value || '10')
      await user.update({
        scan_remaining: 10,
        quote_remaining: freeScanCount,
        quote_daily_count: 0
      })
      await user.reload()
    }
    return success(res, {
      userId: user.user_no,
      phone: user.phone || '',
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      scanRemaining: user.scan_remaining,
      membershipExpire: user.membership_expire,
      membershipId: user.membership_id,
      isVip: vipStatus.isVip,
      planName: vipStatus.planName,
      quoteRemaining: user.quote_remaining,
      quoteDailyRemaining: (() => {
        const today = new Date().toISOString().split('T')[0]
        const dailyDate = user.quote_daily_date
        if (dailyDate !== today) return 10
        return Math.max(0, 10 - (parseInt(user.quote_daily_count) || 0))
      })()
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

// 邀请奖励次数配置（与 auth.js 保持一致）
const INVITE_REWARD_TIMES_KEY = 'invite_reward_times'
const DEFAULT_INVITE_REWARD_TIMES = 10
const getInviteRewardTimes = async () => {
  const setting = await db.Setting.findOne({ where: { key: INVITE_REWARD_TIMES_KEY } })
  return parseInt(setting?.value) || DEFAULT_INVITE_REWARD_TIMES
}

// 绑定邀请码（双方各得报价次数奖励）
router.post('/bind-invite-code', auth, async (req, res, next) => {
  try {
    const { inviteCode } = req.body
    if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.trim()) {
      return error(res, '请输入邀请码')
    }

    const code = inviteCode.trim()
    const me = req.user

    // 防自邀
    if (code === me.user_no) {
      return error(res, '不能绑定自己的邀请码')
    }

    // 防重复绑定
    if (me.referrer) {
      return error(res, '您已绑定过邀请码，无法重复绑定')
    }

    // 查找邀请人
    const inviter = await db.User.findOne({ where: { user_no: code } })
    if (!inviter) {
      return error(res, '邀请码无效，请检查后重试')
    }

    // 防重复邀请记录
    const existing = await db.Invitation.findOne({ where: { invitee_id: me.id } })
    if (existing) {
      return error(res, '您已绑定过邀请码，无法重复绑定')
    }

    const rewardTimes = await getInviteRewardTimes()

    const result = await db.sequelize.transaction(async (t) => {
      await db.Invitation.create({
        inviter_id: inviter.id,
        invitee_id: me.id,
        invite_code: code,
        status: 1,
        reward_times: rewardTimes,
        granted_times: rewardTimes
      }, { transaction: t })

      // 邀请人奖励
      await inviter.increment('quote_remaining', { by: rewardTimes, transaction: t })
      // 被邀请人奖励
      await me.increment('quote_remaining', { by: rewardTimes, transaction: t })
      await me.update({ referrer: code }, { transaction: t })

      return { rewardTimes }
    })

    // reload 获取事务后的最新值
    await me.reload()

    return success(res, {
      rewardTimes: result.rewardTimes,
      quoteRemaining: me.quote_remaining
    }, '绑定成功，奖励已发放')
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

// 邀请二维码缓存：memory cache，5 分钟
const qrCodeCache = new Map()
const QR_CACHE_TTL = 5 * 60 * 1000

router.get('/invite-qr-code', auth, async (req, res, next) => {
  try {
    const user = req.user
    const cacheKey = user.user_no
    const cached = qrCodeCache.get(cacheKey)
    if (cached && Date.now() - cached.time < QR_CACHE_TTL) {
      return success(res, { qrCodeUrl: cached.url })
    }

    // 不传 page 参数，让微信默认跳主页（首页 index.js 已实现 scene 解析）
    // 传 page 会触发微信路径校验导致 40066 错误
    const qrPath = await wechatUtil.getWxaCodeUnlimited(user.user_no, {
      width: 280
    })

    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`
    const qrCodeUrl = `${baseUrl}${qrPath}`
    qrCodeCache.set(cacheKey, { url: qrCodeUrl, time: Date.now() })
    return success(res, { qrCodeUrl })
  } catch (err) {
    console.error('生成邀请二维码失败:', err.message)
    return error(res, '生成二维码失败: ' + err.message, 10030, 500)
  }
})

router.get('/invite-stats', auth, async (req, res, next) => {
  try {
    const where = { inviter_id: req.userId }

    const [inviteCount, rewardedCount, totalRewardTimes, grantedRewardTimes] = await Promise.all([
      db.Invitation.count({ where }),
      db.Invitation.count({ where: { ...where, granted_times: { [Sequelize.Op.gt]: 0 } } }),
      db.Invitation.sum('reward_times', { where }),
      db.Invitation.sum('granted_times', { where })
    ])

    const pendingRewardTimes = Math.max(0, (parseInt(totalRewardTimes) || 0) - (parseInt(grantedRewardTimes) || 0))

    return success(res, {
      inviteCount: parseInt(inviteCount) || 0,
      rewardedCount: parseInt(rewardedCount) || 0,
      totalRewardTimes: parseInt(totalRewardTimes) || 0,
      pendingRewardTimes: parseInt(pendingRewardTimes) || 0,
      grantedRewardTimes: parseInt(grantedRewardTimes) || 0
    })
  } catch (err) {
    next(err)
  }
})

router.get('/invite-records', auth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const { offset, limit } = paginate(page, pageSize)

    const { count, rows } = await db.Invitation.findAndCountAll({
      where: { inviter_id: req.userId },
      include: [
        { model: db.User, as: 'Invitee', attributes: ['id', 'nickname', 'avatar', 'created_at'] }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    const list = rows.map(item => ({
      id: item.id,
      inviteCode: item.invite_code,
      rewardTimes: item.reward_times,
      grantedTimes: item.granted_times,
      status: item.status,
      createdAt: item.created_at,
      invitee: item.Invitee ? {
        id: item.Invitee.id,
        nickname: item.Invitee.nickname,
        avatar: item.Invitee.avatar,
        createdAt: item.Invitee.created_at
      } : null
    }))

    return paginateResponse(res, list, count, page, pageSize)
  } catch (err) {
    next(err)
  }
})

// ===== 收藏报价单 =====

// 获取收藏列表
router.get('/favorites', auth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query
    const { offset, limit } = paginate(page, pageSize)

    const { count, rows } = await db.Favorite.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        {
          model: db.Brand,
          as: 'Brand',
          attributes: ['id', 'name', 'bg_color', 'icon_text', 'icon_style', 'category_id'],
          include: [{
            model: db.Category,
            as: 'Category',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    const list = rows.map(fav => ({
      id: fav.id,
      brand_id: fav.Brand ? fav.Brand.id : null,
      brand_name: fav.Brand ? fav.Brand.name : '',
      category_name: fav.Brand && fav.Brand.Category ? fav.Brand.Category.name : '',
      bg_color: fav.Brand ? fav.Brand.bg_color : '',
      icon_text: fav.Brand ? fav.Brand.icon_text : '',
      icon_style: fav.Brand ? fav.Brand.icon_style : '',
      created_at: fav.created_at
    }))

    return paginateResponse(res, list, count, page, pageSize)
  } catch (err) {
    next(err)
  }
})

// 添加收藏
router.post('/favorites', auth, async (req, res, next) => {
  try {
    const { brand_id } = req.body
    if (!brand_id) return error(res, '参数错误：缺少 brand_id')

    // 检查品牌是否存在
    const brand = await db.Brand.findByPk(brand_id)
    if (!brand) return notFound(res, '品牌不存在')

    // 检查是否已收藏
    const existing = await db.Favorite.findOne({
      where: { user_id: req.userId, brand_id }
    })
    if (existing) {
      return success(res, { id: existing.id, isFavorited: true }, '已收藏')
    }

    const favorite = await db.Favorite.create({
      user_id: req.userId,
      brand_id
    })

    return success(res, { id: favorite.id, isFavorited: true }, '收藏成功')
  } catch (err) {
    next(err)
  }
})

// 取消收藏
router.delete('/favorites/:id', auth, async (req, res, next) => {
  try {
    const favorite = await db.Favorite.findOne({
      where: { id: req.params.id, user_id: req.userId }
    })
    if (!favorite) return notFound(res, '收藏记录不存在')

    await favorite.destroy()
    return success(res, null, '已取消收藏')
  } catch (err) {
    next(err)
  }
})

// 根据 brand_id 取消收藏
router.delete('/favorites/brand/:brandId', auth, async (req, res, next) => {
  try {
    const favorite = await db.Favorite.findOne({
      where: { user_id: req.userId, brand_id: req.params.brandId }
    })
    if (!favorite) return notFound(res, '收藏记录不存在')

    await favorite.destroy()
    return success(res, null, '已取消收藏')
  } catch (err) {
    next(err)
  }
})

// 检查是否已收藏
router.get('/favorites/check/:brandId', auth, async (req, res, next) => {
  try {
    const favorite = await db.Favorite.findOne({
      where: { user_id: req.userId, brand_id: req.params.brandId }
    })
    return success(res, {
      isFavorited: !!favorite,
      id: favorite ? favorite.id : null
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
