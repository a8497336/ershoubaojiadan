const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const jwtConfig = require('../config/jwt')
const { Admin } = require('../models')
const { unauthorized, forbidden, error } = require('../utils/response')

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return unauthorized(res, '请先登录后台')
    }
    const decoded = jwt.verify(token, jwtConfig.jwtSecret)
    const admin = await Admin.findByPk(decoded.id, {
      include: ['Role']
    })
    if (!admin || admin.status !== 1) {
      return unauthorized(res, '管理员不存在或已被禁用')
    }
    req.admin = admin
    req.adminId = admin.id
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token已过期，请重新登录')
    }
    return error(res, '认证失败', 401, 401)
  }
}

const checkPermission = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin
      if (!admin || !admin.Role) {
        return forbidden(res, '无权限访问')
      }
      if (admin.Role.code === 'super_admin') {
        return next()
      }
      const permissions = admin.Role.Permissions || []
      const hasPermission = permissions.some(p => p.code === permissionCode)
      if (!hasPermission) {
        return forbidden(res, '无权限执行此操作')
      }
      next()
    } catch (err) {
      return error(res, '权限校验失败')
    }
  }
}

module.exports = { adminAuth, checkPermission }
