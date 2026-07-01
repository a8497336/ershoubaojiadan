const axios = require('axios')
const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode')
const wechatConfig = require('../config/wechat')
const uploadConfig = require('../config/upload')

const code2Session = async (code) => {
  const url = 'https://api.weixin.qq.com/sns/jscode2session'
  const params = {
    appid: wechatConfig.wxAppId,
    secret: wechatConfig.wxSecret,
    js_code: code,
    grant_type: 'authorization_code'
  }
  const res = await axios.get(url, { params })
  if (res.data.errcode) {
    throw new Error(`WeChat API Error: ${res.data.errcode} - ${res.data.errmsg}`)
  }
  return {
    openid: res.data.openid,
    sessionKey: res.data.session_key,
    unionid: res.data.unionid || null
  }
}

// access_token 内存缓存（有效期 2 小时，提前 5 分钟刷新）
let _cachedAccessToken = null
let _tokenExpireAt = 0

const getAccessToken = async () => {
  // 命中缓存
  if (_cachedAccessToken && Date.now() < _tokenExpireAt) {
    return _cachedAccessToken
  }

  const url = 'https://api.weixin.qq.com/cgi-bin/token'
  const params = {
    grant_type: 'client_credential',
    appid: wechatConfig.wxAppId,
    secret: wechatConfig.wxSecret
  }
  const res = await axios.get(url, { params })
  if (res.data.errcode) {
    throw new Error(`获取 access_token 失败: ${res.data.errcode} - ${res.data.errmsg}`)
  }
  _cachedAccessToken = res.data.access_token
  // expires_in 通常为 7200 秒，提前 5 分钟过期
  _tokenExpireAt = Date.now() + (res.data.expires_in - 300) * 1000
  return _cachedAccessToken
}

const getPhoneNumber = async (code) => {
  const accessToken = await getAccessToken()
  const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`
  const res = await axios.post(url, { code })
  if (res.data.errcode !== 0) {
    throw new Error(`WeChat Phone API Error: ${res.data.errmsg}`)
  }
  return res.data.phone_info.phoneNumber
}

const decryptPhone = (encryptedData, iv, sessionKey) => {
  try {
    const crypto = require('crypto')
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64')
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64')
    const ivBuffer = Buffer.from(iv, 'base64')
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer)
    decipher.setAutoPadding(true)
    let decoded = decipher.update(encryptedDataBuffer, 'binary', 'utf8')
    decoded += decipher.final('utf8')
    return JSON.parse(decoded)
  } catch (err) {
    console.error('decryptPhone error:', err.message)
    return null
  }
}

/**
 * 调用微信 generateUrlLink API 生成 URL Link（可在微信中打开直达小程序）
 * @param {string} path - 小程序页面路径
 * @param {string} query - 查询参数
 * @returns {string} URL Link（如 https://wxaurl.cn/xxx）
 */
const generateUrlLink = async (path, query) => {
  const accessToken = await getAccessToken()
  const url = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${accessToken}`
  const body = {
    path: path || 'pages/index/index',
    query: query || '',
    env_version: wechatConfig.wxaEnvVersion || 'develop',
    is_expire: false,
    expire_type: 0
  }
  const res = await axios.post(url, body)
  if (res.data.errcode && res.data.errcode !== 0) {
    throw new Error(`generateUrlLink 失败: ${res.data.errcode} - ${res.data.errmsg}`)
  }
  return res.data.url_link
}

/**
 * 生成小程序码（三级降级策略）
 * 1. 优先微信原生小程序码 wxacode.get（该小程序不支持 getUnlimited，始终返回 40066）
 * 2. 失败则用 generateUrlLink 生成 URL Link + qrcode 转二维码（扫码可进入小程序）
 * 3. 全部失败则返回纯文本二维码兜底
 */
const getWxaCodeUnlimited = async (scene, options = {}) => {
  const width = options.width || 280
  const pagePath = options.page || 'pages/index/index'

  // 策略1：微信原生小程序码 wxacode.get
  // 该小程序不支持 getUnlimited API（始终返回 40066），改用 get API
  // invite_code 通过 path 查询参数传递，数量限制 10 万个
  try {
    console.log(`[wxacode] 开始获取 access_token...`)
    const accessToken = await getAccessToken()
    const wxaUrl = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${accessToken}`
    const pathWithQuery = `${pagePath}?invite_code=${encodeURIComponent(scene)}`
    const requestBody = {
      path: pathWithQuery,
      width,
      auto_color: options.auto_color || false,
      line_color: options.line_color || { r: 0, g: 0, b: 0 },
      is_hyaline: options.is_hyaline || false
    }
    console.log(`[wxacode] 策略1: wxacode.get, path=${pathWithQuery}`)
    const res = await axios.post(wxaUrl, requestBody, { responseType: 'arraybuffer' })

    const contentType = res.headers['content-type'] || ''
    // wxacode.get 成功返回 image/jpeg 或 image/png
    if (contentType && contentType.includes('application/json')) {
      const err = JSON.parse(Buffer.from(res.data, 'binary').toString('utf8'))
      console.warn(`[wxacode] 策略1 失败: errcode=${err.errcode}, errmsg=${err.errmsg || '(无)'}`)
    } else if (res.data && res.data.length > 100) {
      const filename = `invite-qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`
      const filePath = path.join(uploadConfig.uploadDir, filename)
      fs.writeFileSync(filePath, Buffer.from(res.data, 'binary'))
      console.log(`[wxacode] 策略1 成功: 小程序码已生成, 文件: ${filename}, 大小: ${res.data.length} bytes`)
      return `/uploads/${filename}`
    } else {
      console.warn(`[wxacode] 策略1 失败: 返回数据异常, dataLength=${res.data ? res.data.length : 0}`)
    }
  } catch (err) {
    console.warn(`[wxacode] 策略1 异常: ${err.message}`)
    if (err.response) {
      console.warn(`[wxacode] HTTP ${err.response.status}: ${JSON.stringify(err.response.data || {}).substring(0, 500)}`)
    }
  }

  console.warn('[wxacode] 策略1 失败，降级策略：尝试 URL Link + QR Code')

  // 策略2：generateUrlLink → qrcode 转二维码
  try {
    const query = `invite_code=${encodeURIComponent(scene)}`
    console.log(`[wxacode] 策略2: 尝试生成 URL Link, pagePath=${pagePath}, query=${query}`)
    const urlLink = await generateUrlLink(pagePath, query)
    console.log(`[wxacode] URL Link 生成成功: ${urlLink}`)

    const filename = `invite-qr-link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`
    const filePath = path.join(uploadConfig.uploadDir, filename)
    if (!fs.existsSync(uploadConfig.uploadDir)) {
      fs.mkdirSync(uploadConfig.uploadDir, { recursive: true })
    }
    await QRCode.toFile(filePath, urlLink, {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
    console.log(`[wxacode] 策略2 成功: QR Code 已生成, 文件: ${filename}`)
    return `/uploads/${filename}`
  } catch (err) {
    console.warn(`[wxacode] 策略2 失败: URL Link 生成异常: ${err.message}`)
  }

  // 策略3：纯文本二维码兜底
  console.warn(`[wxacode] 策略3: 使用纯文本 QR Code 兜底, scene=${scene}`)
  return await generateFallbackQRCode(scene)
}

/**
 * 服务端生成纯文本二维码（最终兜底方案）
 */
const generateFallbackQRCode = async (scene) => {
  console.log(`[wxacode] 策略3: 生成纯文本 QR Code, scene=${scene}`)
  if (!fs.existsSync(uploadConfig.uploadDir)) {
    fs.mkdirSync(uploadConfig.uploadDir, { recursive: true })
  }
  const filename = `invite-qr-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`
  const filePath = path.join(uploadConfig.uploadDir, filename)

  await QRCode.toFile(filePath, scene, {
    width: 280,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  })
  console.log(`[wxacode] 策略3 成功: 纯文本 QR Code 已生成, 文件: ${filename}`)
  return `/uploads/${filename}`
}

module.exports = {
  code2Session,
  getAccessToken,
  getPhoneNumber,
  decryptPhone,
  getWxaCodeUnlimited,
  generateUrlLink
}
