/**
 * 微信小程序虚拟支付服务
 * 官方文档:
 * - https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html
 * - https://developers.weixin.qq.com/community/minihome/doc/00002cf077cd4810fee42f4b865c01
 *
 * 签名算法:MD5 + 字段按字母升序 + 末尾追加 &key=<支付密钥>
 */
const crypto = require('crypto')
const { getVirtualPayConfig } = require('../config/virtualPay')
const logger = require('../utils/logger')

/**
 * 生成虚拟支付签名
 * @param {Object} params
 * @param {String} params.orderNo 业务订单号(MembershipOrder.order_no)
 * @param {String} params.openid 用户 openid
 * @param {String} [params.appid] 小程序 appid(默认从 config.wechat 取)
 * @param {String} params.productId 微信商品 ID(MembershipPlan.product_id)
 * @param {String} [params.offerId] 商户号(MP 后台配置,默认从 config 取)
 * @param {Number} [params.quantity=1] 购买数量
 * @param {String} [params.attach] 附加数据(可选)
 * @returns {Object} { signData, mode, timeStamp, nonceStr, sign }
 */
function signVirtualPayParams({ orderNo, openid, appid, productId, offerId, quantity = 1, attach }) {
  const config = getVirtualPayConfig()
  const timeStamp = Math.floor(Date.now() / 1000)
  const nonceStr = crypto.randomBytes(16).toString('hex')

  // 参与签名的字段(按字母升序)
  const signFields = {
    appid: appid || config.wxAppId,
    nonceStr,
    offer_id: offerId || config.offerId,
    openid,
    product_id: productId,
    product_identity: orderNo,
    quantity,
    sign_method: 'md5',  // 微信虚拟支付使用 MD5
    timeStamp
  }
  if (attach) signFields.attach = attach

  // 按字母升序拼接成 key1=value1&key2=value2... 形式
  const sortedKeys = Object.keys(signFields).sort()
  const sortedString = sortedKeys.map(k => `${k}=${signFields[k]}`).join('&')

  // 末尾追加 &key=<支付密钥>
  const stringToSign = `${sortedString}&key=${config.payKey}`

  // MD5 后转大写
  const sign = crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase()

  // signData 中只保留 wx.requestVirtualPayment 需要的字段(去掉 sign_method)
  const signDataPayload = { ...signFields }
  signDataPayload.sign = sign
  delete signDataPayload.sign_method

  logger.info('[virtualPay] 生成签名:', { signData: signDataPayload, mode: 'long_series_goods' })

  return {
    signData: JSON.stringify(signDataPayload),
    mode: 'long_series_goods',
    timeStamp,
    nonceStr,
    sign
  }
}

/**
 * 验证微信支付回调签名
 * @param {Object} notifyParams 微信回调参数(含 signature 字段)
 * @returns {Boolean} 验签是否通过
 */
function verifyNotifySignature(notifyParams) {
  const config = getVirtualPayConfig()
  if (!notifyParams || !notifyParams.signature) return false

  const { signature, ...params } = notifyParams

  // 按字母升序拼接
  const sortedKeys = Object.keys(params).filter(k => params[k] !== undefined && params[k] !== null).sort()
  const sortedString = sortedKeys.map(k => `${k}=${params[k]}`).join('&')
  const stringToSign = `${sortedString}&key=${config.payKey}`

  const expectedSign = crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase()

  return expectedSign === signature
}

module.exports = {
  signVirtualPayParams,
  verifyNotifySignature
}
