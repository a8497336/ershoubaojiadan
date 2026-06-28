require('dotenv').config()
const wechat = require('./wechat')
const logger = require('../utils/logger')

/**
 * 微信小程序虚拟支付配置
 * 必填环境变量:
 *   WX_VIRTUAL_PAY_KEY:          现网 AppKey(MP 后台虚拟支付 → 基础配置 → 现网 AppKey)
 *   WX_VIRTUAL_PAY_OFFER_ID:     商户号 OfferID(MP 后台 → 虚拟支付 → 基础配置)
 * 可选环境变量:
 *   WX_VIRTUAL_PAY_SANDBOX_KEY:  沙箱 AppKey(测试用,MP 后台 → 虚拟支付 → 沙箱管理)
 *   WX_VIRTUAL_PAY_ENV:          环境 0=现网 1=沙箱(默认 1=沙箱,避免误扣真钱)
 *   WX_VIRTUAL_PAY_NOTIFY_URL:   发货推送 URL(MP 后台基础配置中填,此处仅记录)
 */
const config = {
  payKey: process.env.WX_VIRTUAL_PAY_KEY || '',                    // 现网 AppKey
  sandboxKey: process.env.WX_VIRTUAL_PAY_SANDBOX_KEY || '',        // 沙箱 AppKey
  offerId: process.env.WX_VIRTUAL_PAY_OFFER_ID || '',
  env: process.env.WX_VIRTUAL_PAY_ENV != null && process.env.WX_VIRTUAL_PAY_ENV !== '' ? parseInt(process.env.WX_VIRTUAL_PAY_ENV, 10) : 1,  // 默认沙箱(1);现网填 0
  notifyUrl: process.env.WX_VIRTUAL_PAY_NOTIFY_URL || '',
  wxAppId: wechat.wxAppId
}

// 启动时校验
;(function validate() {
  const missing = []
  const env = config.env
  // 根据 env 校验对应的 AppKey
  if (env === 1 && !config.sandboxKey) missing.push('WX_VIRTUAL_PAY_SANDBOX_KEY')
  if (env === 0 && !config.payKey) missing.push('WX_VIRTUAL_PAY_KEY')
  if (!config.offerId) missing.push('WX_VIRTUAL_PAY_OFFER_ID')

  if (missing.length > 0) {
    logger.warn(`[virtualPay] 缺少环境变量: ${missing.join(', ')} — 虚拟支付功能将不可用`)
  } else {
    logger.info(`[virtualPay] 配置加载完成: env=${env === 1 ? '沙箱' : '现网'}, offerId=${config.offerId}, appid=${config.wxAppId}`)
  }
})()

/**
 * 统一访问入口
 */
function getVirtualPayConfig() {
  return config
}

module.exports = getVirtualPayConfig
module.exports.getVirtualPayConfig = getVirtualPayConfig
module.exports.default = getVirtualPayConfig
