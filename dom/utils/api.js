/**
 * dom 项目请求封装(最小化版,无需 token)
 * 虚拟支付采用免登模式,后端用 wx.login code 换 openid 识别用户
 */
const { getConfig } = require('./config')
const BASE_URL = getConfig().apiBase

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(options.header || {})
      },
      timeout: options.timeout || 10000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          resolve(res.data)
        } else {
          reject(res.data || { message: '请求失败(' + res.statusCode + ')' })
        }
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || ''
        if (errMsg.includes('timeout')) {
          reject({ message: '请求超时,请检查网络' })
        } else if (errMsg.includes('fail')) {
          reject({ message: '网络连接失败,请检查网络设置' })
        } else {
          reject({ message: '网络异常,请稍后重试' })
        }
      }
    })
  })
}

module.exports = { request, BASE_URL }
