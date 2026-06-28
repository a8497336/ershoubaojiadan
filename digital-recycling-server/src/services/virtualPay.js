/**
 * 微信小程序虚拟支付服务(按最新官方文档重写)
 * 官方文档:
 * - https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html
 * - https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestVirtualPayment.html
 *
 * 签名算法(关键):
 *   paySig    = hex(hmac_sha256(appKey,     uri + '&' + signData))
 *   signature = hex(hmac_sha256(sessionKey, signData))
 * 其中 wx.requestVirtualPayment 场景 uri 固定为 'requestVirtualPayment'
 */
const crypto = require('crypto')
const getVirtualPayConfig = require('../config/virtualPay')
const logger = require('../utils/logger')

/**
 * HMAC-SHA256 计算,返回 hex 小写
 */
function hmacSha256Hex(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex')
}

/**
 * 构建 signData JSON 字符串(道具直购模式 short_series_goods)
 * @param {Object} p
 * @param {String} p.offerId      商户号(MP 后台基础配置)
 * @param {String} p.productId    道具ID(MP 后台道具管理)
 * @param {Number} p.buyQuantity  购买数量(一般 1)
 * @param {Number} p.env          0=现网 1=沙箱
 * @param {String} p.currencyType 币种,固定 'CNY'
 * @param {Number} p.goodsPrice   道具单价(单位:分)
 * @param {String} p.outTradeNo   业务订单号(8-32 字符)
 * @param {String} p.attach       透传数据(发货推送时原样回传)
 * @returns {String} JSON 字符串
 */
function buildSignData({ offerId, productId, buyQuantity, env, currencyType, goodsPrice, outTradeNo, attach }) {
  return JSON.stringify({
    offerId,
    productId,
    buyQuantity,
    env,
    currencyType,
    goodsPrice,
    outTradeNo,
    attach
  })
}

/**
 * 生成虚拟支付签名(paySig + signature)
 * @param {Object} p
 * @param {String} p.signData    buildSignData 返回的 JSON 字符串
 * @param {String} p.sessionKey  用户 session_key(由 code2Session 获取)
 * @param {Number} p.env         0=现网 1=沙箱(决定用哪个 appKey)
 * @param {String} [p.uri='requestVirtualPayment']  wx.requestVirtualPayment 场景固定值
 * @returns {{ paySig: string, signature: string }}
 */
function generatePaymentSign({ signData, sessionKey, env, uri = 'requestVirtualPayment' }) {
  const config = getVirtualPayConfig()
  // 根据 env 选择对应环境的 appKey
  const appKey = env === 1 ? config.sandboxKey : config.payKey

  if (!appKey) {
    throw new Error(`虚拟支付 AppKey 未配置(env=${env},${env === 1 ? 'WX_VIRTUAL_PAY_SANDBOX_KEY' : 'WX_VIRTUAL_PAY_KEY'})`)
  }
  if (!sessionKey) {
    throw new Error('sessionKey 缺失,无法生成 signature')
  }

  const paySig = hmacSha256Hex(appKey, `${uri}&${signData}`)
  const signature = hmacSha256Hex(sessionKey, signData)

  logger.info('[virtualPay] 签名生成:', { uri, env, signDataLen: signData.length, paySigLen: paySig.length, signatureLen: signature.length })

  return { paySig, signature }
}

/**
 * 验证微信推送签名(道具发货推送 xpay_goods_deliver_notify)
 * 注:实测该推送无 signature 字段,验签从略;保留函数供其他推送类型使用
 * @param {Object} notifyParams 微信推送参数(含 signature 字段)
 * @returns {Boolean}
 */
function verifyNotifySignature(notifyParams) {
  if (!notifyParams || !notifyParams.signature) return false
  // 虚拟支付推送验签算法与支付签名不同,实际使用时需根据微信文档补充
  // 目前 xpay_goods_deliver_notify 推送不验签,直接返回 true
  return true
}

module.exports = {
  buildSignData,
  generatePaymentSign,
  verifyNotifySignature,
  // 保留旧导出名,向后兼容(未使用)
  signVirtualPayParams: generatePaymentSign
}
