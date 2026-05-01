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

module.exports = {
  code2Session,
  getAccessToken,
  getPhoneNumber
}
