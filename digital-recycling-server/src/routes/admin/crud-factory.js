/**
 * @openapi
 * tags:
 *   - name: 管理端-内容管理
 *     description: Banner/公告/门店/视频CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/banners:
 *   get:
 *     tags: [管理端-内容管理]
 *     summary: 获取Banner列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-内容管理]
 *     summary: 创建Banner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/banners/{id}:
 *   put:
 *     tags: [管理端-内容管理]
 *     summary: 更新Banner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [管理端-内容管理]
 *     summary: 删除Banner
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

/**
 * @openapi
 * /api/admin/announcements:
 *   get:
 *     tags: [管理端-内容管理]
 *     summary: 获取公告列表
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [管理端-内容管理]
 *     summary: 创建公告
 *     security:
 *       - bearerAuth: []
 */

/**
 * @openapi
 * /api/admin/announcements/{id}:
 *   put:
 *     tags: [管理端-内容管理]
 *     summary: 更新公告
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [管理端-内容管理]
 *     summary: 删除公告
 *     security:
 *       - bearerAuth: []
 */

/**
 * @openapi
 * /api/admin/stores:
 *   get:
 *     tags: [管理端-内容管理]
 *     summary: 获取门店列表
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [管理端-内容管理]
 *     summary: 创建门店
 *     security:
 *       - bearerAuth: []
 */

/**
 * @openapi
 * /api/admin/stores/{id}:
 *   put:
 *     tags: [管理端-内容管理]
 *     summary: 更新门店
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [管理端-内容管理]
 *     summary: 删除门店
 *     security:
 *       - bearerAuth: []
 */

/**
 * @openapi
 * /api/admin/videos:
 *   get:
 *     tags: [管理端-内容管理]
 *     summary: 获取视频列表
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags: [管理端-内容管理]
 *     summary: 创建视频
 *     security:
 *       - bearerAuth: []
 */

/**
 * @openapi
 * /api/admin/videos/{id}:
 *   put:
 *     tags: [管理端-内容管理]
 *     summary: 更新视频
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [管理端-内容管理]
 *     summary: 删除视频
 *     security:
 *       - bearerAuth: []
 */

const createCrudRouter = (model, name) => {
  const router = require('express').Router()
  const { adminAuth } = require('../../middlewares/adminAuth')
  const { success, notFound, paginate } = require('../../utils/response')
  const { Op } = require('sequelize')
  const db = require('../../models')

  router.get('/', adminAuth, async (req, res, next) => {
    try {
      const { page = 1, pageSize = 20, status } = req.query
      const where = {}
      if (status !== undefined && status !== '') where.status = status
      const { offset, limit } = paginate(page, pageSize)
      const { count, rows } = await model.findAndCountAll({
        where,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        offset, limit
      })
      return success(res, {
        list: rows,
        pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
      })
    } catch (err) { next(err) }
  })

  router.post('/', adminAuth, async (req, res, next) => {
    try {
      const item = await model.create(req.body)
      return success(res, item, '创建成功')
    } catch (err) { next(err) }
  })

  router.put('/:id', adminAuth, async (req, res, next) => {
    try {
      const item = await model.findByPk(req.params.id)
      if (!item) return notFound(res, `${name}不存在`)
      await item.update(req.body)
      return success(res, item, '更新成功')
    } catch (err) { next(err) }
  })

  router.delete('/:id', adminAuth, async (req, res, next) => {
    try {
      const item = await model.findByPk(req.params.id)
      if (!item) return notFound(res, `${name}不存在`)
      await item.destroy()
      return success(res, null, '删除成功')
    } catch (err) { next(err) }
  })

  return router
}

const db = require('../../models')
module.exports = {
  bannerManage: createCrudRouter(db.Banner, 'Banner'),
  announcementManage: createCrudRouter(db.Announcement, '公告'),
  storeManage: createCrudRouter(db.Store, '门店'),
  videoManage: createCrudRouter(db.Video, '视频')
}
