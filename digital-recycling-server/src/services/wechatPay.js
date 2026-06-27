/**
 * 微信支付 V2 服务(JSAPI 支付)
 *
 * 官方文档:
 * - 统一下单: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_1
 * - 查询订单: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=9_2
 * - 签名算法: https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3
 *
 * 依赖: Node 内置 https / crypto + ../utils/xml + ../config/wechat
 * 不引入 axios / xml2js 等第三方依赖
 */
const https = require('https')
const crypto = require('crypto')
const { parseXml, buildXml } = require('../utils/xml')
const wechat = require('../config/wechat')
const logger = require('../utils/logger')

/**
 * 微信支付 V2 签名
 * 算法:字段名按 ASCII 升序 → 过滤空值和 sign 字段 → k1=v1&k2=v2...&key=API_KEY → MD5 或 HMAC-SHA256 → 大写
 * @param {Object} params 待签名参数
 * @param {String} key    商户 API 密钥(APIv2)
 * @param {String} [signType='MD5'] 签名类型: 'MD5' 或 'HMAC-SHA256'
 * @returns {String} 签名值(大写)
 */
function signV2(params, key, signType = 'MD5') {
  const sortedKeys = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '' && k !== 'sign')
    .sort()
  const stringA = sortedKeys.map(k => `${k}=${params[k]}`).join('&')
  const stringSignTemp = `${stringA}&key=${key}`

  if (signType === 'HMAC-SHA256') {
    return crypto.createHmac('sha256', key).update(stringSignTemp).digest('hex').toUpperCase()
  }
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

/**
 * 生成 32 位随机字符串(nonce_str)
 * @returns {String} 32 位 hex 字符串
 */
function generateNonceStr() {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * 通过 https 模块 POST XML 请求体到指定 URL
 * @param {String} url       目标地址
 * @param {String} xmlBody   XML 请求体
 * @param {Number} timeoutMs 超时时间(毫秒)
 * @returns {Promise<String>} 响应字符串(XML)
 */
function postXml(url, xmlBody, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Content-Length': Buffer.byteLength(xmlBody)
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(data))
    })
    req.on('error', (err) => reject(err))
    // 5 秒超时
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`微信支付请求超时(${timeoutMs}ms)`))
    })
    req.write(xmlBody)
    req.end()
  })
}

/**
 * 统一下单(JSAPI)
 * @param {Object} args
 * @param {String} args.orderNo         业务订单号(out_trade_no)
 * @param {Number|String} args.amount   金额(元),内部换算为分整数 total_fee
 * @param {String} args.openid          用户 openid
 * @param {String} args.body            商品描述
 * @param {String} [args.attach]        附加数据(原样回传)
 * @param {String} [args.spbillCreateIp='127.0.0.1'] 终端 IP
 * @returns {Promise<Object>} { prepay_id, return_code, result_code, ... }
 */
async function unifiedOrder({ orderNo, amount, openid, body, attach, spbillCreateIp = '127.0.0.1' }) {
  const params = {
    appid: wechat.wxAppId,
    mch_id: wechat.mchId,
    nonce_str: generateNonceStr(),
    body,
    out_trade_no: orderNo,
    // 金额:元 → 分(整数)
    total_fee: Math.round(parseFloat(amount) * 100),
    spbill_create_ip: spbillCreateIp,
    notify_url: wechat.payNotifyUrl,
    trade_type: 'JSAPI',
    openid
  }
  if (attach) params.attach = attach

  params.sign = signV2(params, wechat.apiKey, 'MD5')
  const xmlBody = buildXml(params)

  logger.info('[wechatPay/unifiedOrder] 请求', {
    url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    out_trade_no: orderNo,
    total_fee: params.total_fee,
    openid
  })

  const responseXml = await postXml('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlBody, 5000)
  logger.info('[wechatPay/unifiedOrder] 响应', responseXml)

  const result = parseXml(responseXml)
  if (result.return_code !== 'SUCCESS') {
    throw new Error(`微信下单失败(return_code): ${result.return_msg || 'unknown'}`)
  }
  if (result.result_code !== 'SUCCESS') {
    throw new Error(`微信下单失败(result_code): ${result.err_code_des || result.err_code || 'unknown'}`)
  }
  return result
}

/**
 * 验证支付回调签名
 * @param {String} xmlString 微信回调 XML 字符串
 * @returns {Boolean} 验签是否通过
 */
function verifyNotify(xmlString) {
  const params = parseXml(xmlString)
  if (!params.sign) return false

  const signType = params.sign_type || 'MD5'
  const expectedSign = signV2(params, wechat.apiKey, signType)
  const receivedSign = params.sign

  // 长度不一致直接返回 false(crypto.timingSafeEqual 要求等长)
  if (expectedSign.length !== receivedSign.length) return false

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSign), Buffer.from(receivedSign))
  } catch (e) {
    return false
  }
}

/**
 * 查询订单状态
 * @param {String} orderNo 业务订单号(out_trade_no)
 * @returns {Promise<Object>} { trade_state, transaction_id, ... }
 */
async function orderquery(orderNo) {
  const params = {
    appid: wechat.wxAppId,
    mch_id: wechat.mchId,
    out_trade_no: orderNo,
    nonce_str: generateNonceStr()
  }
  params.sign = signV2(params, wechat.apiKey, 'MD5')
  const xmlBody = buildXml(params)

  logger.info('[wechatPay/orderquery] 请求', { out_trade_no: orderNo })

  const responseXml = await postXml('https://api.mch.weixin.qq.com/pay/orderquery', xmlBody, 5000)
  logger.info('[wechatPay/orderquery] 响应', responseXml)

  const result = parseXml(responseXml)
  if (result.return_code !== 'SUCCESS') {
    throw new Error(`微信查单失败(return_code): ${result.return_msg || 'unknown'}`)
  }
  return result
}

module.exports = {
  signV2,
  unifiedOrder,
  verifyNotify,
  orderquery
}
