const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')
const { User } = require('../models')
const { unauthorized, error } = require('../utils/response')

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return unauthorized(res, '请先登录')
    }
    const decoded = jwt.verify(token, jwtConfig.jwtSecret)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['openid', 'union_id'] }
    })
    if (!user || user.status !== 1) {
      return unauthorized(res, '用户不存在或已被禁用')
    }
    req.user = user
    req.userId = user.id
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token已过期，请重新登录')
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Token无效')
    }
    return error(res, '认证失败', 401, 401)
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token) {
      const decoded = jwt.verify(token, jwtConfig.jwtSecret)
      const user = await User.findByPk(decoded.id)
      if (user && user.status === 1) {
        req.user = user
        req.userId = user.id
      }
    }
  } catch (e) {
    // ignore
  }
  next()
}

module.exports = { auth, optionalAuth }
