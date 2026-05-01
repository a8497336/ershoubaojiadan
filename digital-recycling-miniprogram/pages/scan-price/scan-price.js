const { userApi, pointsApi, uploadFile } = require('../../utils/api-modules')

Page({
  data: {
    remainingTimes: 0,
    points: 0,
    isVip: false,
    scanResult: null,
    loading: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  loadUserInfo() {
    userApi.getProfile().then((res) => {
      const user = res.data || {}
      this.setData({
        remainingTimes: user.scanRemaining || user.scan_remaining || 0,
        isVip: !!(user.membershipExpire || user.membership_expire)
      })
    }).catch(() => {})

    pointsApi.getBalance().then((res) => {
      this.setData({ points: res.data || 0 })
    }).catch(() => {})
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

    this.setData({ loading: true })
    uploadFile(filePath).then((res) => {
      this.setData({
        loading: false,
        scanResult: { image: res.data.url, message: '图片已上传，识别功能开发中' },
        remainingTimes: Math.max(0, this.data.remainingTimes - 1)
      })
      wx.showToast({ title: '图片上传成功', icon: 'success' })
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({ title: '上传失败，请重试', icon: 'none' })
    })
  },

  goToMembership() {
    wx.navigateTo({ url: '/pages/membership/membership' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 拍照查价', path: '/pages/scan-price/scan-price' }
  }
})
