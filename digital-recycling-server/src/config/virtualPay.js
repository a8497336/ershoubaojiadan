require('dotenv').config()
const wechat = require('./wechat')
const logger = require('../utils/logger')

/**
 * 微信小程序虚拟支付配置
 * 必填环境变量:
 *   WX_VIRTUAL_PAY_KEY: 支付密钥(从 MP 后台虚拟支付 → 沙盒管理 / 正式环境获取)
 *   WX_VIRTUAL_PAY_NOTIFY_URL: 回调地址(必须 HTTPS,微信服务端可访问)
 * 可选环境变量:
 *   WX_VIRTUAL_PAY_OFFER_ID: 商户号(MP 后台 → 虚拟支付 → 商户信息)
 */
const config = {
  payKey: process.env.WX_VIRTUAL_PAY_KEY || '',
  notifyUrl: process.env.WX_VIRTUAL_PAY_NOTIFY_URL || '',
  offerId: process.env.WX_VIRTUAL_PAY_OFFER_ID || '',
  wxAppId: wechat.wxAppId
}

// 启动时校验
;(function validate() {
  const missing = []
  if (!config.payKey) missing.push('WX_VIRTUAL_PAY_KEY')
  if (!config.notifyUrl) missing.push('WX_VIRTUAL_PAY_NOTIFY_URL')

  if (missing.length > 0) {
    logger.warn(`[virtualPay] 缺少环境变量: ${missing.join(', ')} — 虚拟支付功能将不可用,Mock 模式可继续运行`)
  } else {
    logger.info(`[virtualPay] 配置加载完成: offerId=${config.offerId || '(未配置)'}, appid=${config.wxAppId || '(未配置)'}`)
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
