require('dotenv').config()

module.exports = {
  wxAppId: process.env.WX_APPID || '',
  wxSecret: process.env.WX_SECRET || '',
  // 微信支付 V2(JSAPI)配置
  mchId: process.env.WX_MCH_ID || '',
  apiKey: process.env.WX_API_KEY || '',
  payNotifyUrl: process.env.WX_PAY_NOTIFY_URL || ''
}
