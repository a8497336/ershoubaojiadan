/**
 * @openapi
 * tags:
 *   - name: 小程序-报价
 *     description: 回收报价相关接口
 */

/**
 * @openapi
 * /api/feature-phone-image:
 *   get:
 *     tags: [小程序-报价]
 *     summary: 获取报价单图片
 *     description: 获取指定类型的报价单图片 URL，取值 oldMan(热门老年机) 或 dianrong(智能机电容屏)
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [oldMan, dianrong]
 *         description: 报价类型
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
 *                     type: { type: string, example: oldMan }
 *                     image: { type: string, description: '图片 URL，未配置时为空字符串' }
 *                     updatedAt: { type: string, nullable: true, description: '最近更新时间' }
 *                     found: { type: boolean, description: '是否已配置过图片' }
 *       400:
 *         description: 参数错误
 */

const router = require('express').Router()
const { success, error } = require('../../utils/response')
const db = require('../../models')

const VALID_TYPES = ['oldMan', 'dianrong']

router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query
    if (!type || !VALID_TYPES.includes(type)) {
      return error(res, '无效的报价类型，仅支持 oldMan/dianrong', 400, 400)
    }

    const row = await db.FeaturePhoneImage.findOne({ where: { type } })

    if (!row || !row.image) {
      return success(res, { type, image: '', updatedAt: null, found: false })
    }

    return success(res, {
      type: row.type,
      image: row.image,
      updatedAt: row.updated_at,
      found: true
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
