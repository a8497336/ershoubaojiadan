const router = require('express').Router()
const db = require('../../models')
const { Op } = require('sequelize')
const { success } = require('../../utils/response')

/**
 * 获取当前生效的弹窗广告
 * 条件:
 *   1. status=1
 *   2. images 不为空（至少有一张有效图片）
 *   3. 当前时间在 start_time ~ end_time 范围内（未设置的时间字段不参与判断）
 *   4. 按 sort_order 升序、created_at 倒序取第一条
 */
router.get('/current', async (req, res, next) => {
  try {
    const now = new Date()

    // 查询所有启用的弹窗广告，在内存中过滤时间条件（避免复杂 Op 嵌套的兼容性问题）
    const ads = await db.PopupAd.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    })

    // 二次过滤：时间范围 + images 非空
    const validAds = ads.filter(ad => {
      // 时间校验
      if (ad.start_time && new Date(ad.start_time).getTime() > now.getTime()) return false
      if (ad.end_time && new Date(ad.end_time).getTime() < now.getTime()) return false
      // images 校验
      const imgs = ad.images
      if (!Array.isArray(imgs) || imgs.length === 0 || !imgs.some(i => i && i.url)) return false
      return true
    })

    const result = validAds.length > 0 ? validAds[0] : null
    return success(res, result || null)
  } catch (err) {
    next(err)
  }
})

module.exports = router
