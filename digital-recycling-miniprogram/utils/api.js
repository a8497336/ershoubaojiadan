const { CURRENT_CONFIG } = require('./config')
const BASE_URL = CURRENT_CONFIG.apiBase

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    const header = {
      'Content-Type': 'application/json',
      ...(options.header || {})
    }
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }

    const timeout = options.timeout || 10000

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data && res.data.code === 0) {
            resolve(res.data)
          } else if (res.data && res.data.code === 401) {
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            getApp().ensureLogin()
            reject(res.data)
          } else {
            reject(res.data || { message: '请求失败' })
          }
        } else if (res.statusCode === 404) {
          reject({ message: '请求的资源不存在' })
        } else if (res.statusCode >= 500) {
          reject({ message: '服务器错误，请稍后重试' })
        } else {
          reject({ message: `请求错误(${res.statusCode})` })
        }
      },
      fail: (err) => {
        let errorMessage = '网络连接失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络'
          } else if (err.errMsg.includes('request:fail')) {
            errorMessage = '无法连接到服务器'
          }
        }
        reject({ message: errorMessage, originalError: err })
      }
    })
  })
}

const checkApiHealth = () => {
  return new Promise((resolve) => {
    wx.request({
      url: BASE_URL.replace('/api', ''),
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

const uploadFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.uploadFile({
      url: BASE_URL + '/upload',
      filePath,
      name: 'file',
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data)
        } else {
          wx.showToast({ title: data.message || '上传失败', icon: 'none' })
          reject(data)
        }
      },
      fail: (err) => {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = {
  request,
  uploadFile,
  checkApiHealth,
  BASE_URL
}
