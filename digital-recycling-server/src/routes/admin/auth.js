/**
 * @openapi
 * tags:
 *   - name: 管理端-认证
 *     description: 管理员登录认证相关接口
 */

/**
 * @openapi
 * /api/admin/auth/login:
 *   post:
 *     tags: [管理端-认证]
 *     summary: 管理员登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, description: 用户名 }
 *               password: { type: string, description: 密码 }
 *     responses:
 *       200:
 *         description: 登录成功
 */

/**
 * @openapi
 * /api/admin/auth/info:
 *   get:
 *     tags: [管理端-认证]
 *     summary: 获取当前管理员信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/auth/password:
 *   put:
 *     tags: [管理端-认证]
 *     summary: 修改密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string, description: 旧密码 }
 *               newPassword: { type: string, description: 新密码 }
 *     responses:
 *       200:
 *         description: 密码修改成功
 */

const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const jwtConfig = require('../../config/jwt')
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, error, unauthorized } = require('../../utils/response')
const db = require('../../models')

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 422, 422)
    }

    const admin = await db.Admin.findOne({
      where: { username },
      include: [{ model: db.Role, as: 'Role' }]
    })

    if (!admin || !admin.validatePassword(password)) {
      return unauthorized(res, '用户名或密码错误')
    }

    if (admin.status !== 1) {
      return unauthorized(res, '账号已被禁用')
    }

    await admin.update({ last_login_at: new Date() })

    const token = jwt.sign(
      { id: admin.id, type: 'admin' },
      jwtConfig.jwtSecret,
      { expiresIn: '24h' }
    )

    return success(res, {
      token,
      adminInfo: {
        id: admin.id,
        username: admin.username,
        realName: admin.real_name,
        avatar: admin.avatar,
        role: admin.Role ? { id: admin.Role.id, name: admin.Role.name, code: admin.Role.code } : null
      }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/info', adminAuth, async (req, res, next) => {
  try {
    const admin = req.admin
    let permissions = []
    if (admin.Role && admin.Role.code === 'super_admin') {
      permissions = await db.Permission.findAll()
    } else if (admin.Role) {
      permissions = await admin.Role.getPermissions()
    }

    return success(res, {
      id: admin.id,
      username: admin.username,
      realName: admin.real_name,
      avatar: admin.avatar,
      role: admin.Role ? { id: admin.Role.id, name: admin.Role.name, code: admin.Role.code } : null,
      permissions: permissions.map(p => p.code)
    })
  } catch (err) {
    next(err)
  }
})

router.put('/password', adminAuth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return error(res, '旧密码和新密码不能为空', 422, 422)
    }
    const admin = req.admin
    if (!admin.validatePassword(oldPassword)) {
      return error(res, '旧密码错误', 401, 400)
    }
    await admin.update({ password: newPassword })
    return success(res, null, '密码修改成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
