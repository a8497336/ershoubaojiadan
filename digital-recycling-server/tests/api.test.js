const request = require('supertest')
const { sequelize } = require('../src/models')

let app
let adminToken
let userToken

beforeAll(async () => {
  await sequelize.authenticate()
  app = require('../src/app')

  const adminLogin = await request(app)
    .post('/api/admin/auth/login')
    .send({ username: 'admin', password: 'admin123456' })
  if (adminLogin.body.data && adminLogin.body.data.token) {
    adminToken = adminLogin.body.data.token
  }

  const userLogin = await request(app)
    .post('/api/auth/phone-login')
    .send({ phone: '13800138001' })
  if (userLogin.body.data && userLogin.body.data.token) {
    userToken = userLogin.body.data.token
  }
})

afterAll(async () => {
  await sequelize.close()
})

describe('公开API', () => {
  test('GET /api/categories 返回分类列表', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('id')
      expect(res.body.data[0]).toHaveProperty('name')
      expect(res.body.data[0]).toHaveProperty('Brands')
    }
  })

  test('GET /api/banners 返回Banner列表', async () => {
    const res = await request(app).get('/api/banners')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('GET /api/stores 返回门店列表', async () => {
    const res = await request(app).get('/api/stores')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  test('GET /api/announcements 返回公告列表', async () => {
    const res = await request(app).get('/api/announcements')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/videos 返回视频列表', async () => {
    const res = await request(app).get('/api/videos')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/prices/today 返回今日报价', async () => {
    const res = await request(app).get('/api/prices/today')
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })
})

describe('用户认证API', () => {
  test('POST /api/auth/phone-login 手机号登录', async () => {
    const res = await request(app)
      .post('/api/auth/phone-login')
      .send({ phone: '13800138001' })
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('token')
  })

  test('POST /api/auth/phone-login 缺少手机号返回错误', async () => {
    const res = await request(app)
      .post('/api/auth/phone-login')
      .send({})
    expect(res.body.code).not.toBe(0)
  })

  test('GET /api/auth/check-token 验证token', async () => {
    if (!userToken) return
    const res = await request(app)
      .get('/api/auth/check-token')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
  })

  test('GET /api/auth/check-token 无token返回401', async () => {
    const res = await request(app)
      .get('/api/auth/check-token')
    expect(res.status).toBe(401)
  })
})

describe('管理后台认证API', () => {
  test('POST /api/admin/auth/login 管理员登录', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'admin123456' })
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('token')
  })

  test('POST /api/admin/auth/login 错误密码返回错误', async () => {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' })
    expect(res.body.code).not.toBe(0)
  })

  test('GET /api/admin/auth/info 获取管理员信息', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/auth/info')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
    expect(res.body.data).toHaveProperty('username')
  })
})

describe('管理后台CRUD API', () => {
  test('GET /api/admin/dashboard/overview 仪表盘概览', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/dashboard/overview')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/users 用户列表', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/orders 订单列表', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/orders/export 订单导出CSV', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/orders/export')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/csv')
  })

  test('GET /api/admin/banners Banner列表', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/banners')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/settings 系统设置', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/permissions 权限列表', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/admin/roles 角色列表', async () => {
    if (!adminToken) return
    const res = await request(app)
      .get('/api/admin/roles')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })
})

describe('用户端认证API', () => {
  test('GET /api/user/profile 需要认证', async () => {
    if (!userToken) return
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })

  test('GET /api/cart 需要认证', async () => {
    if (!userToken) return
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body.code).toBe(0)
  })
})
