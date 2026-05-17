const { userApi, pointsApi, uploadFile, scanApi } = require('../../utils/api-modules')

Page({
  data: {
    remainingTimes: 0,
    points: 0,
    isVip: false,
    scanResult: null,
    loading: false,
    scanHistory: [],
    showResult: false,
    matchedProducts: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadScanHistory()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'scanPrice' })
    }
  },

  loadUserInfo() {
    userApi.getProfile().then((res) => {
      const user = res.data || res || {}
      this.setData({
        remainingTimes: user.scanRemaining || user.scan_remaining || 0,
        isVip: !!(user.membershipExpire || user.membership_expire)
      })
    }).catch(() => {})

    pointsApi.getPoints().then((res) => {
      this.setData({ points: res.data?.points || res.data || 0 })
    }).catch(() => {})
  },

  loadScanHistory() {
    try {
      const history = wx.getStorageSync('scanHistory') || []
      const formatted = history.slice(0, 5).map(item => ({
        ...item,
        displayTime: this.formatTime(item.time)
      }))
      this.setData({ scanHistory: formatted })
    } catch (e) {}
  },

  formatTime(isoTime) {
    const now = new Date()
    const date = new Date(isoTime)
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return '刚刚'
    if (hours < 1) return `${minutes}分钟前`

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today - 86400000)
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const pad = n => String(n).padStart(2, '0')
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`

    if (dateDay.getTime() === today.getTime()) return `今天 ${time}`
    if (dateDay.getTime() === yesterday.getTime()) return `昨天 ${time}`
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`
    }
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  },

  handleTakePhoto() {
    wx.showActionSheet({
      itemList: ['拍照识别', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.takePhoto()
        } else if (res.tapIndex === 1) {
          this.chooseFromAlbum()
        }
      }
    })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.recognizeProduct(tempFilePath)
      }
    })
  },

  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.recognizeProduct(tempFilePath)
      }
    })
  },

  recognizeProduct(filePath) {
    if (this.data.remainingTimes <= 0 && !this.data.isVip) {
      wx.showModal({
        title: '次数不足',
        content: '拍照次数已用完，是否开通会员获取无限次？',
        confirmText: '开通会员',
        success: (res) => {
          if (res.confirm) this.goToMembership()
        }
      })
      return
    }

    this.setData({ loading: true, showResult: false })
    uploadFile(filePath).then((res) => {
      const imageUrl = res.data?.url || res.data
      this.setData({
        loading: false,
        scanResult: { image: imageUrl, filePath },
        remainingTimes: Math.max(0, this.data.remainingTimes - 1)
      })
      this.searchByImage(imageUrl)
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    })
  },

  async searchByImage(imageUrl) {
    this.setData({ loading: true })
    try {
      const res = await scanApi.recognize({ imageUrl })
      const products = res.data?.products || []
      const recognized = res.data?.recognized
      const message = res.data?.message || ''
      if (products.length > 0 && recognized) {
        this.setData({
          matchedProducts: products.slice(0, 5),
          showResult: true,
          loading: false
        })
        this.saveScanHistory(products[0])
        wx.showToast({ title: '识别成功，下滑查看结果！', icon: 'none' })
      } else if (products.length > 0) {
        this.setData({
          matchedProducts: products.slice(0, 5),
          showResult: true,
          loading: false
        })
        wx.showToast({ title: message || '未识别到匹配产品，为您推荐热门机型', icon: 'none' })
      } else {
        this.setData({
          showResult: true,
          matchedProducts: [],
          loading: false
        })
        wx.showToast({ title: '未识别到匹配产品，请手动搜索', icon: 'none' })
      }
    } catch (err) {
      console.error('图片识别失败:', err)
      this.setData({
        showResult: true,
        matchedProducts: [],
        loading: false
      })
      wx.showToast({ title: '识别失败，请手动搜索', icon: 'none' })
    }
  },

  saveScanHistory(product) {
    try {
      let history = wx.getStorageSync('scanHistory') || []
      history.unshift({
        id: product.id,
        name: product.model_code || product.name,
        brand: product.Brand?.name || '',
        price: product.Prices?.[0]?.price || '',
        image: this.data.scanResult?.filePath || '',
        time: new Date().toISOString()
      })
      history = history.slice(0, 50)
      wx.setStorageSync('scanHistory', history)
      const formatted = history.slice(0, 5).map(item => ({
        ...item,
        displayTime: this.formatTime(item.time)
      }))
      this.setData({ scanHistory: formatted })
    } catch (e) {}
  },

  goToProductDetail(e) {
    const { id, brandId, brand, category } = e.currentTarget.dataset
    if (!id) return
    const params = [`productId=${id}`]
    if (brandId) params.push(`brandId=${brandId}`)
    if (brand) params.push(`brand=${encodeURIComponent(brand)}`)
    if (category) params.push(`category=${encodeURIComponent(category)}`)
    wx.navigateTo({ url: `/pages/price-quote/price-quote?${params.join('&')}` })
  },

  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有扫描历史吗？',
      confirmColor: '#ff2b3b',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('scanHistory')
          this.setData({ scanHistory: [] })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  deleteHistoryItem(e) {
    const { index } = e.currentTarget.dataset
    try {
      let history = wx.getStorageSync('scanHistory') || []
      history.splice(index, 1)
      wx.setStorageSync('scanHistory', history)
      const formatted = history.slice(0, 5).map(item => ({
        ...item,
        displayTime: this.formatTime(item.time)
      }))
      this.setData({ scanHistory: formatted })
      wx.showToast({ title: '已删除', icon: 'success' })
    } catch (err) {}
  },

  viewAllHistory() {
    wx.navigateTo({ url: '/pages/brand-list/brand-list' })
  },

  retakePhoto() {
    this.handleTakePhoto()
  },

  goToFaq() {
    wx.navigateTo({ url: '/pages/faq/faq' })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/brand-list/brand-list' })
  },

  closeResult() {
    this.setData({ showResult: false, scanResult: null, matchedProducts: [] })
  },

  goToMembership() {
    wx.navigateTo({ url: '/pages/membership/membership' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 拍照查价', path: '/pages/scan-price/scan-price' }
  }
})
