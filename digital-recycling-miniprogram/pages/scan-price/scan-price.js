const { userApi, pointsApi, uploadFile, searchApi } = require('../../utils/api-modules')

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
      this.getTabBar().setData({ selected: 2 })
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
      this.setData({ scanHistory: history.slice(0, 5) })
    } catch (e) {}
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
      const res = await searchApi.search('', { image: imageUrl })
      const products = res.data?.list || res.data || res || []
      if (products.length > 0) {
        this.setData({
          matchedProducts: products.slice(0, 5),
          showResult: true,
          loading: false
        })
        this.saveScanHistory(products[0])
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
        name: product.model || product.name,
        brand: product.Brand?.name || '',
        price: product.Prices?.[0]?.price || '',
        time: new Date().toISOString()
      })
      history = history.slice(0, 20)
      wx.setStorageSync('scanHistory', history)
      this.setData({ scanHistory: history.slice(0, 5) })
    } catch (e) {}
  },

  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset
    if (id) {
      wx.navigateTo({ url: `/pages/brand-list/brand-list?productId=${id}` })
    }
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
