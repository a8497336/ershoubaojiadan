require('dotenv').config()

module.exports = {
  wxAppId: process.env.WX_APPID || '',
  wxSecret: process.env.WX_SECRET || ''
}
