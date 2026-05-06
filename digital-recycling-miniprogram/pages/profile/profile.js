const app = getApp()
const userApi = require('../../utils/api-modules').userApi
const messageApi = require('../../utils/api-modules').messageApi
const { CONTACT } = require('../../utils/constants')

Page({
  data: {
    userInfo: {},
    walletInfo: { balance: '0.00' },
    pointsInfo: { points: 0 },
    statusBarHeight: 0,

    quickEntries: [
      { icon: '💰', label: '我的钱包', badge: 0 },
      { icon: '🎫', label: '我的卡券', badge: 0 },
      { icon: '🧧', label: '我的红包', badge: 0 },
      { icon: '📢', label: '公告中心', badge: 0 }
    ],

    pointActivities: [
      { icon: '⭐', label: '我的积分' },
      { icon: '🎁', label: '积分抽奖' },
      { icon: '🛒', label: '积分商城' },
      { icon: '👥', label: '邀请好友' }
    ],

    commonFuncs: [
      { icon: '🔄', label: '回收流程' },
      { icon: '🛒', label: '我要采购' },
      { icon: '📍', label: '邮寄地址' },
      { icon: '💬', label: '问题反馈' },
      { icon: '❓', label: '常见问题' },
      { icon: '📋', label: '反馈结果' },
      { icon: '🤝', label: '商务合作' },
      { icon: '⚠️', label: '投诉建议', badge: '' },
      // { icon: '🎬', label: '广告录音', badge: '' },
      // { icon: '📊', label: '行情走势' },
      // { icon: '🎥', label: '回收教学视频' }
    ],

    vipFeatList: [
      { icon: '⭐', label: '收藏报价单' },
      { icon: '📈', label: '报价变动' },
      { icon: '📷', label: '拍照查价' },
      { icon: '📩', label: '报价短信通知' }
    ],

    contactItems: [
      { icon: '💬', label: '添加微信' },
      { icon: '📞', label: '客服电话' },
      { icon: '🏪', label: '门店列表' }
    ],

    _phoneTimer: null
  },

  onLoad() {
    this.setData({ online: app.getNetworkStatus ? app.getNetworkStatus() : true, statusBarHeight: app.globalData.statusBarHeight })
    this.loadData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'profile' })
    }
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
  },

  loadData() {
    this.loadUserInfo()
    this.loadWalletAndPoints()
    this.loadUnreadCount()
    wx.stopPullDownRefresh()
  },

  loadUserInfo() {
    const user = app.globalData.userInfo || {}
    userApi.getProfile().then(res => {
      const data = (res.data || res || {})
      app.globalData.userInfo = data
      this.setData({ userInfo: data })
    }).catch(() => {
      this.setData({ userInfo: user })
    })
  },

  loadWalletAndPoints() {
    userApi.getWallet().then(res => {
      this.setData({ walletInfo: (res.data || res || { balance: '0.00' }) })
    }).catch(() => {})

    userApi.getPoints().then(res => {
      this.setData({ pointsInfo: (res.data || res || { points: 0 }) })
    }).catch(() => {})
  },

  loadUnreadCount() {
    messageApi.getUnreadCount().then(res => {
      const count = res.data?.count || res.count || 0
      const entries = this.data.quickEntries
      if (entries.length > 3) entries[3].badge = count
      this.setData({ quickEntries: entries })
    }).catch(() => {})
  },

  onQuickEntryTap(e) {
    const index = e.currentTarget.dataset.index
    switch (index) {
      case 0: wx.navigateTo({ url: '/pages/wallet/wallet' }); break
      case 1: wx.navigateTo({ url: '/pages/coupons/coupons' }); break
      case 2: wx.navigateTo({ url: '/pages/red-packet/red-packet' }); break
      case 3: wx.navigateTo({ url: '/pages/announcement/announcement' }); break
    }
  },

  onPointActivityTap(e) {
    const index = e.currentTarget.dataset.index
    switch (index) {
      case 0: wx.navigateTo({ url: '/pages/my-points/my-points' }); break
      case 1: wx.navigateTo({ url: '/pages/points-lottery/points-lottery' }); break
      case 2: wx.navigateTo({ url: '/pages/points-mall/points-mall' }); break
      case 3: wx.navigateTo({ url: '/pages/invite-friends/invite-friends' }); break
    }
  },

  onCommonFuncTap(e) {
    const index = e.currentTarget.dataset.index
    const routes = [
      '/pages/recycling-process/recycling-process',
      '/pages/my-stock/my-stock',
      '/pages/mailing-address/mailing-address',
      '/pages/feedback/feedback',
      '/pages/faq/faq',
      '/pages/feedback-result/feedback-result',
      '/pages/business-cooperation/business-cooperation',
      '/pages/feedback/feedback',
      '/pages/ad-recording/ad-recording',
      '/pages/price-trend/price-trend',
      '/pages/video-list/video-list'
    ]
    if (routes[index]) wx.navigateTo({ url: routes[index] })
  },

  onVipFeatTap(e) {
    const index = e.currentTarget.dataset.index
    const routes = [
      '/pages/my-favorites/my-favorites',
      '/pages/price-changes/price-changes',
      '/pages/scan-price/scan-price',
      '/pages/sms-notify/sms-notify'
    ]
    if (routes[index]) wx.navigateTo({ url: routes[index] })
  },

  onContactTap(e) {
    const index = e.currentTarget.dataset.index
    switch (index) {
      case 0:
        wx.setClipboardData({
          data: CONTACT.WECHAT_ID,
          success: () => wx.showToast({ title: '微信号已复制', icon: 'success' })
        })
        break
      case 1:
        wx.makePhoneCall({ phoneNumber: CONTACT.PHONE })
        break
      case 2:
        wx.switchTab({ url: '/pages/index/index' })
        break
    }
  },

  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        const tempPath = res.tempFilePaths[0]
        userApi.uploadAvatar(tempPath).then(uploadRes => {
          const url = uploadRes.data.url || tempPath
          const info = this.data.userInfo
          info.avatar = url
          this.setData({ userInfo: info })
          app.globalData.userInfo = info
          wx.showToast({ title: '头像更新成功', icon: 'success' })
        }).catch(() => {
          wx.showToast({ title: '上传失败', icon: 'error' })
        })
      }
    })
  },

  goToMyPoints() { wx.navigateTo({ url: '/pages/my-points/my-points' }) },

  goToMembership() { wx.navigateTo({ url: '/pages/membership/membership' }) }
})
