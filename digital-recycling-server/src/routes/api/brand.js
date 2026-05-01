/**
 * @openapi
 * tags:
 *   - name: 小程序-品牌
 *     description: 品牌查询相关接口
 */

/**
 * @openapi
 * /api/brands:
 *   get:
 *     tags: [小程序-品牌]
 *     summary: 获取品牌列表
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *         description: 按分类ID筛选
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/brands/{id}:
 *   get:
 *     tags: [小程序-品牌]
 *     summary: 获取品牌详情
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { optionalAuth } = require('../../middlewares/auth')
const { success } = require('../../utils/response')
const db = require('../../models')

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category_id } = req.query
    const where = { status: 1 }
    if (category_id) where.category_id = category_id

    const brands = await db.Brand.findAll({
      where,
      order: [['sort_order', 'ASC']],
      include: [{
        model: db.Category,
        as: 'Category',
        attributes: ['id', 'name', 'code']
      }]
    })
    return success(res, brands)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const brand = await db.Brand.findByPk(req.params.id, {
      include: [{
        model: db.Category,
        as: 'Category',
        attributes: ['id', 'name', 'code']
      }]
    })
    if (!brand) {
      return success(res, null)
    }

    const data = brand.toJSON()
    const quoteConfig = {
      page_title: data.quote_title || `今日${data.name}回收报价`,
      view_count: data.quote_view_count || '61954098',
      receiver_name: data.quote_receiver_name || '陈约',
      receiver_phone: data.quote_receiver_phone || '15361862828',
      receiver_address: data.quote_receiver_address || '广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B',
      rules: ['开机进系统/屏好/屏坏/不开机/废板 等机况定义说明...', '具体以实际检测为准，价格仅供参考'],
      footer_notes: [
        '以上报价为当日回收参考价，实际价格以到货检测为准',
        '绿色价格为高价回收，蓝色为中价，紫色为低价',
        '"/" 表示该机型此状态暂不回收或无报价',
        '废板整机指主板损坏无法开机的完整机器',
        '价格随市场行情波动，请以实际交易为准'
      ]
    }

    if (data.quote_rules) {
      try { quoteConfig.rules = JSON.parse(data.quote_rules) } catch { quoteConfig.rules = [data.quote_rules] }
    }
    if (data.quote_footer_notes) {
      try { quoteConfig.footer_notes = JSON.parse(data.quote_footer_notes) } catch { quoteConfig.footer_notes = [data.quote_footer_notes] }
    }

    data.quote_config = quoteConfig
    return success(res, data)
  } catch (err) {
    next(err)
  }
})

module.exports = router
