const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({ title, icon, duration })
}

const showModal = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm)
    })
  })
}

const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

const hideLoading = () => {
  wx.hideLoading()
}

const navigateTo = (url) => {
  wx.navigateTo({
    url,
    fail: () => {
      wx.switchTab({ url })
    }
  })
}

const redirectTo = (url) => {
  wx.redirectTo({ url })
}

const makePhoneCall = (phoneNumber) => {
  wx.makePhoneCall({ phoneNumber })
}

const copyToClipboard = (data, successMsg = '已复制') => {
  wx.setClipboardData({
    data,
    success: () => {
      wx.showToast({ title: successMsg, icon: 'success' })
    }
  })
}

const formatDate = (date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return '-'
  const num = parseFloat(price)
  if (isNaN(num)) return price
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('Storage set error:', e)
    return false
  }
}

const getStorage = (key, defaultValue = null) => {
  try {
    return wx.getStorageSync(key) || defaultValue
  } catch (e) {
    console.error('Storage get error:', e)
    return defaultValue
  }
}

const removeStorage = (key) => {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('Storage remove error:', e)
    return false
  }
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

const getSystemInfo = () => {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: resolve,
      fail: () => resolve({})
    })
  })
}

const logger = {
  debug: (...args) => {
    console.debug('[DEBUG]', new Date().toISOString(), ...args)
  },
  info: (...args) => {
    console.log('[INFO]', new Date().toISOString(), ...args)
  },
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args)
  },
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args)
  }
}

const getDebugInfo = () => {
  const app = getApp()
  return {
    version: '1.0.0',
    time: new Date().toISOString(),
    networkStatus: app.globalData.isConnected ? 'connected' : 'disconnected',
    networkType: app.globalData.networkType,
    apiStatus: app.globalData.apiStatus,
    token: wx.getStorageSync('token') ? 'exists' : 'not exists',
    userInfo: app.globalData.userInfo ? 'loaded' : 'not loaded',
    cartCount: app.globalData.cartCount
  }
}

const clearAllData = () => {
  return new Promise((resolve) => {
    wx.clearStorage({
      success: () => {
        logger.info('All local data cleared')
        resolve()
      },
      fail: (err) => {
        logger.error('Failed to clear local data', err)
        resolve()
      }
    })
  })
}

module.exports = {
  showToast,
  showModal,
  showLoading,
  hideLoading,
  navigateTo,
  redirectTo,
  makePhoneCall,
  copyToClipboard,
  formatDate,
  formatPrice,
  debounce,
  throttle,
  setStorage,
  getStorage,
  removeStorage,
  request,
  getSystemInfo,
  logger,
  getDebugInfo,
  clearAllData
}
