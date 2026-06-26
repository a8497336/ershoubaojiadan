/**
 * @openapi
 * tags:
 *   - name: 管理端-报价图片
 *     description: 热门老年机/智能机电容屏 报价单图片管理
 */

/**
 * @openapi
 * /api/admin/feature-phone-images:
 *   get:
 *     tags: [管理端-报价图片]
 *     summary: 获取报价图片列表
 *     description: 返回 oldMan 与 dianrong 两种类型的报价图片，缺失类型用空 image 兜底
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/admin/feature-phone-images/{type}:
 *   put:
 *     tags: [管理端-报价图片]
 *     summary: 更新报价图片 URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [oldMan, dianrong]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image: { type: string, description: '图片 URL(≤500字符)' }
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 参数错误
 *       422:
 *         description: 校验失败
 *   delete:
 *     tags: [管理端-报价图片]
 *     summary: 清空报价图片
 *     description: 将对应 type 的 image 置空(不删除行)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [oldMan, dianrong]
 *     responses:
 *       200:
 *         description: 已清空图片
 */

const router = require('express').Router()
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, error, validateError } = require('../../utils/response')
const db = require('../../models')

const VALID_TYPES = ['oldMan', 'dianrong']

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const rows = await db.FeaturePhoneImage.findAll()
    const map = {}
    for (const r of rows) {
      map[r.type] = r
    }

    const list = VALID_TYPES.map((t) => {
      const r = map[t]
      if (r) {
        return { type: r.type, image: r.image || '', updatedAt: r.updated_at }
      }
      return { type: t, image: '', updatedAt: null }
    })

    return success(res, { list })
  } catch (err) {
    next(err)
  }
})

router.put('/:type', adminAuth, async (req, res, next) => {
  try {
    const { type } = req.params
    if (!VALID_TYPES.includes(type)) {
      return error(res, '无效的报价类型', 400, 400)
    }

    const { image } = req.body || {}
    if (typeof image !== 'string' || image.trim() === '') {
      return validateError(res, '图片 URL 不能为空')
    }
    if (image.length > 500) {
      return validateError(res, '图片 URL 长度不能超过 500 个字符')
    }

    await db.FeaturePhoneImage.upsert({ type, image })
    const row = await db.FeaturePhoneImage.findOne({ where: { type } })
    return success(res, { type: row.type, image: row.image, updatedAt: row.updated_at }, '更新成功')
  } catch (err) {
    next(err)
  }
})

router.delete('/:type', adminAuth, async (req, res, next) => {
  try {
    const { type } = req.params
    if (!VALID_TYPES.includes(type)) {
      return error(res, '无效的报价类型', 400, 400)
    }

    const row = await db.FeaturePhoneImage.findOne({ where: { type } })
    if (row) {
      await row.update({ image: '' })
    }

    return success(res, null, '已清空图片')
  } catch (err) {
    next(err)
  }
})

module.exports = router
