const axios = require('axios')
const wechatConfig = require('../config/wechat')

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

const getAccessToken = async () => {
  const url = 'https://api.weixin.qq.com/cgi-bin/token'
  const params = {
    grant_type: 'client_credential',
    appid: wechatConfig.wxAppId,
    secret: wechatConfig.wxSecret
  }
  const res = await axios.get(url, { params })
  return res.data.access_token
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

module.exports = {
  code2Session,
  getAccessToken,
  getPhoneNumber,
  decryptPhone
}
