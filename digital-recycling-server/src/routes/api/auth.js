const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const jwtConfig = require('../../config/jwt')
const { auth } = require('../../middlewares/auth')
const validate = require('../../middlewares/validator')
const { success, error, unauthorized } = require('../../utils/response')
const db = require('../../models')
const wechatUtil = require('../../utils/wechat')
const { generateUserNo } = require('../../utils/helpers')

router.post('/wx-login',
  [
    body('code').notEmpty().withMessage('微信登录code不能为空')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { code } = req.body
      let wxData
      try {
        wxData = await wechatUtil.code2Session(code)
      } catch (e) {
        console.error('微信登录失败:', e.message)
        return error(res, '微信登录失败: ' + e.message, 10001, 400)
      }

      let user = await db.User.findOne({ where: { openid: wxData.openid } })

      if (!user) {
        user = await db.User.create({
          openid: wxData.openid,
          union_id: wxData.unionid,
          user_no: generateUserNo(),
          nickname: '微信用户',
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
          membershipExpire: user.membership_expire
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
          membershipExpire: user.membership_expire
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

router.get('/check-token', auth, async (req, res, next) => {
  try {
    return success(res, { valid: true, userId: req.userId })
  } catch (err) {
    next(err)
  }
})

module.exports = router
