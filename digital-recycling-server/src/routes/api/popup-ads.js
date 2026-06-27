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
    const where = {
      status: 1,
      // 至少有一张图片配置（JSON 数组非空）
      images: { [Op.ne]: null }
    }

    // 独立判断每个时间字段，支持只设置开始或只设置结束
    const timeConds = []
    timeConds.push({ start_time: { [Op.or]: { [Op.lte]: now, [Op.eq]: null } } })
    timeConds.push({ end_time: { [Op.or]: { [Op.gte]: now, [Op.eq]: null } } })

    const ad = await db.PopupAd.findOne({
      where: { ...where, [Op.and]: timeConds },
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    })

    // 二次过滤：确保 images 是非空数组
    let result = ad
    if (ad) {
      const imgs = ad.images
      if (!Array.isArray(imgs) || imgs.length === 0 || !imgs.some(i => i && i.url)) {
        result = null
      }
    }

    return success(res, result || null)
  } catch (err) {
    next(err)
  }
})

module.exports = router
