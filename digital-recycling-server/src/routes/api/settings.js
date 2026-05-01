/**
 * @openapi
 * tags:
 *   - name: 小程序-系统设置
 *     description: 系统配置查询接口（公开）
 */

/**
 * @openapi
 * /api/settings/quote:
 *   get:
 *     tags: [小程序-系统设置]
 *     summary: 获取报价页面配置
 *     description: 获取报价页面的标题、收货信息、回收规则等配置
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { success } = require('../../utils/response')
const db = require('../../models')

const QUOTE_SETTING_KEYS = [
  'quote_page_title',
  'quote_view_count',
  'quote_receiver_name',
  'quote_receiver_phone',
  'quote_receiver_address',
  'quote_rules',
  'quote_footer_notes'
]

router.get('/quote', async (req, res, next) => {
  try {
    const settings = await db.Setting.findAll({
      where: { key: QUOTE_SETTING_KEYS }
    })

    const result = {
      page_title: '今日手机回收报价',
      view_count: '61954098',
      receiver_name: '陈约',
      receiver_phone: '15361862828',
      receiver_address: '广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B',
      rules: '开机进系统/屏好/屏坏/不开机/废板 等机况定义说明...\n具体以实际检测为准，价格仅供参考',
      footer_notes: [
        '以上报价为当日回收参考价，实际价格以到货检测为准',
        '绿色价格为高价回收，蓝色为中价，紫色为低价',
        '"/" 表示该机型此状态暂不回收或无报价',
        '废板整机指主板损坏无法开机的完整机器',
        '价格随市场行情波动，请以实际交易为准'
      ]
    }

    settings.forEach(s => {
      const key = s.key.replace('quote_', '')
      if (key === 'rules' || key === 'footer_notes') {
        try {
          result[key] = JSON.parse(s.value)
        } catch {
          result[key] = s.value
        }
      } else {
        result[key] = s.value
      }
    })

    return success(res, result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
