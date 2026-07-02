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

const INVITE_REWARD_TIMES_KEY = 'invite_reward_times'
const DEFAULT_INVITE_REWARD_TIMES = 10

const getInviteRewardTimes = async () => {
  const setting = await db.Setting.findOne({ where: { key: INVITE_REWARD_TIMES_KEY } })
  return parseInt(setting?.value) || DEFAULT_INVITE_REWARD_TIMES
}

const processInvitation = async (invitee, inviteCode, transaction) => {
  if (!inviteCode || !invitee || invitee.referrer) return

  const inviter = await db.User.findOne({
    where: { user_no: inviteCode },
    transaction
  })
  if (!inviter || inviter.id === invitee.id) return

  const existing = await db.Invitation.findOne({
    where: { invitee_id: invitee.id },
    transaction
  })
  if (existing) return

  const rewardTimes = await getInviteRewardTimes()

  await db.Invitation.create({
    inviter_id: inviter.id,
    invitee_id: invitee.id,
    invite_code: inviteCode,
    status: 1,
    reward_times: rewardTimes,
    granted_times: rewardTimes
  }, { transaction })

  // 双方各得报价次数奖励
  await inviter.increment('quote_remaining', { by: rewardTimes, transaction })
  await invitee.increment('quote_remaining', { by: rewardTimes, transaction })
  await invitee.update({ referrer: inviteCode }, { transaction })
}

router.post('/wx-login',
  [
    body('code').notEmpty().withMessage('微信登录code不能为空')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { code, userInfo, extra, encryptedData, iv } = req.body
      const inviteCode = extra && extra.inviteCode ? extra.inviteCode : null
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
      let isNewUser = false

      if (!user) {
        isNewUser = true
        const result = await db.sequelize.transaction(async (t) => {
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
          const newUser = await db.User.create(userData, { transaction: t })
          await db.Wallet.create({
            user_id: newUser.id,
            balance: 0,
            frozen: 0,
            total_income: 0,
            total_withdraw: 0
          }, { transaction: t })

          // 新用户赠送免费会员
          const freeDaysSetting = await db.Setting.findOne({
            where: { key: 'new_user_free_membership_days' },
            transaction: t
          })
          const freeDays = parseInt(freeDaysSetting?.value || '7')
          if (freeDays > 0) {
            const expireDate = new Date()
            expireDate.setDate(expireDate.getDate() + freeDays)
            await newUser.update({
              membership_expire: expireDate,
              scan_remaining: 9999,
              quote_remaining: 9999
            }, { transaction: t })
          }

          // 仅新用户处理邀请关系并发放奖励
          await processInvitation(newUser, inviteCode, t)

          return newUser
        })
        user = result
      } else {
        const updateData = { last_login_at: new Date() }
        if (userInfo) {
          const nick = userInfo.nickName || userInfo.nickname
          const ava = userInfo.avatarUrl || userInfo.avatar
          if (nick) updateData.nickname = nick
          // 仅当 avatar 是有效网络地址时才更新，避免微信临时路径(wxfile://)或本地资源(/images/)覆盖已上传的头像
          if (ava && /^https?:\/\//.test(ava)) {
            updateData.avatar = ava
          }
        }
        if (phone) updateData.phone = phone
        await user.update(updateData)
        // 老用户登录忽略 inviteCode
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
