const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const jwtConfig = require('../../config/jwt')
const { auth } = require('../../middlewares/auth')
const validate = require('../../middlewares/validator')
const { success, error, unauthorized } = require('../../utils/response')
const db = require('../../models')
const wechatUtil = require('../../utils/wechat')
const { generateUserNo, getVipStatus } = require('../../utils/helpers')

router.post('/wx-login',
  [
    body('code').notEmpty().withMessage('微信登录code不能为空')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { code, userInfo, location, encryptedData, iv } = req.body
      let wxData
      try {
        wxData = await wechatUtil.code2Session(code)
      } catch (e) {
        console.error('微信登录失败:', e.message)
        return error(res, '微信登录失败: ' + e.message, 10001, 400)
      }

      let phone = userInfo && (userInfo.phone || req.body.phone)

      if (encryptedData && iv && wxData.sessionKey) {
        const decrypted = wechatUtil.decryptPhone(encryptedData, iv, wxData.sessionKey)
        if (decrypted && decrypted.phoneNumber) {
          phone = decrypted.phoneNumber
        }
      }

      let user = await db.User.findOne({ where: { openid: wxData.openid } })

      if (!user) {
        const userData = {
          openid: wxData.openid,
          union_id: wxData.unionid,
          user_no: generateUserNo(),
          nickname: (userInfo && (userInfo.nickName || userInfo.nickname)) || '微信用户',
          avatar: (userInfo && (userInfo.avatarUrl || userInfo.avatar)) || '/images/icons/avatar.svg',
          phone: phone || null,
          scan_remaining: 10,
          status: 1
        }
        user = await db.User.create(userData)
        await db.Wallet.create({
          user_id: user.id,
          balance: 0,
          frozen: 0,
          total_income: 0,
          total_withdraw: 0
        })
      } else {
        const updateData = { last_login_at: new Date() }
        if (userInfo) {
          const nick = userInfo.nickName || userInfo.nickname
          const ava = userInfo.avatarUrl || userInfo.avatar
          if (nick) updateData.nickname = nick
          if (ava) updateData.avatar = ava
        }
        if (phone) updateData.phone = phone
        await user.update(updateData)
      }

      const vipStatus = await getVipStatus(user)

      const token = jwt.sign(
        { id: user.id, type: 'user' },
        jwtConfig.jwtSecret,
        { expiresIn: jwtConfig.jwtExpiresIn }
      )

      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        jwtConfig.jwtRefreshSecret,
        { expiresIn: jwtConfig.jwtRefreshExpiresIn }
      )

      return success(res, {
        token,
        refreshToken,
        userInfo: {
          id: user.id,
          userNo: user.user_no,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          points: user.points,
          scanRemaining: user.scan_remaining,
          membershipExpire: user.membership_expire,
          isVip: vipStatus.isVip,
          planName: vipStatus.planName,
          membershipId: user.membership_id
        }
      })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/phone-login',
  [
    body('phone').notEmpty().withMessage('手机号不能为空').isMobilePhone('zh-CN').withMessage('手机号格式不正确')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { phone } = req.body

      let user = await db.User.findOne({ where: { phone } })

      if (!user) {
        user = await db.User.create({
          phone,
          user_no: generateUserNo(),
          nickname: `用户${phone.slice(-4)}`,
          avatar: '/images/icons/avatar.svg',
          scan_remaining: 10,
          status: 1
        })
        await db.Wallet.create({
          user_id: user.id,
          balance: 0,
          frozen: 0,
          total_income: 0,
          total_withdraw: 0
        })
      } else {
        await user.update({ last_login_at: new Date() })
      }

      const vipStatus = await getVipStatus(user)

      if (user.status !== 1) {
        return error(res, '账号已被禁用', 10006, 403)
      }

      const token = jwt.sign(
        { id: user.id, type: 'user' },
        jwtConfig.jwtSecret,
        { expiresIn: jwtConfig.jwtExpiresIn }
      )

      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        jwtConfig.jwtRefreshSecret,
        { expiresIn: jwtConfig.jwtRefreshExpiresIn }
      )

      return success(res, {
        token,
        refreshToken,
        userInfo: {
          id: user.id,
          userNo: user.user_no,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          points: user.points,
          scanRemaining: user.scan_remaining,
          membershipExpire: user.membership_expire,
          isVip: vipStatus.isVip,
          planName: vipStatus.planName,
          membershipId: user.membership_id
        }
      })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/phone-bind',
  auth,
  [
    body('code').notEmpty().withMessage('手机号授权code不能为空')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { code } = req.body
      let phone
      try {
        phone = await wechatUtil.getPhoneNumber(code)
      } catch (e) {
        return error(res, '获取手机号失败: ' + e.message, 10002, 400)
      }

      await req.user.update({ phone })
      return success(res, { phone })
    } catch (err) {
      next(err)
    }
  }
)

router.post('/phone-bind-nologin',
  [
    body('code').notEmpty().withMessage('手机号授权code不能为空')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { code } = req.body
      let phone
      try {
        phone = await wechatUtil.getPhoneNumber(code)
      } catch (e) {
        return error(res, '获取手机号失败: ' + e.message, 10002, 400)
      }

      return success(res, { phone })
    } catch (err) {
      next(err)
    }
  }
)

router.get('/check-token', auth, async (req, res, next) => {
  try {
    return success(res, { valid: true, userId: req.userId })
  } catch (err) {
    next(err)
  }
})

module.exports = router
