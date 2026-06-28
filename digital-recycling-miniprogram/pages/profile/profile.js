const app = getApp()
const { userApi, authApi, messageApi } = require('../../utils/api-modules')
const { CONTACT } = require('../../utils/constants')
const { checkLogin, clearAllData } = require('../../utils/common')

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
      // { icon: '🛒', label: '积分商城' },
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
    this.setData({
      online: app.getNetworkStatus ? app.getNetworkStatus() : true,
      statusBarHeight: app.globalData.statusBarHeight,
      pageStyle: `--status-bar-h: ${app.globalData.statusBarHeight || 0}px; --nav-h: 88rpx;`
    })
    this.loadData()
  },

  onReady() {
    // 测量 .profile-nav 实际高度（含状态栏），写入 --nav-h 用于 .profile-page padding-top 占位
    const query = wx.createSelectorQuery()
    query.select('.profile-nav').boundingClientRect()
    query.exec((res) => {
      const navRect = res && res[0]
      if (!navRect) return
      const sysInfo = wx.getSystemInfoSync()
      const rpxToPx = sysInfo.windowWidth / 750
      const navH_Rpx = Math.ceil(navRect.height / rpxToPx)
      this.setData({ pageStyle: `--status-bar-h: ${app.globalData.statusBarHeight || 0}px; --nav-h: ${navH_Rpx}rpx;` })
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'profile' })
    }
    if (!checkLogin('/pages/profile/profile')) return
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
      data.is_vip = data.isVip || false
      data.membershipExpired = !!(data.membershipId && !data.isVip)
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
      case 1: wx.navigateTo({ url: '/pages/points-mall/points-mall' }); break
      case 2: wx.navigateTo({ url: '/pages/invite-friends/invite-friends' }); break
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
        wx.navigateTo({ url: '/pages/store-list/store-list' })
        break
    }
  },

  // 微信 chooseAvatar 回调：选择头像后上传
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (!avatarUrl) return

    wx.showLoading({ title: '上传中...' })
    userApi.uploadAvatar(avatarUrl).then(uploadRes => {
      wx.hideLoading()
      const url = uploadRes.data?.url || uploadRes.url || avatarUrl
      const info = { ...this.data.userInfo, avatar: url }
      this.setData({ userInfo: info })
      app.globalData.userInfo = info

      // 更新后端记录
      userApi.updateProfile({ avatar: url }).catch(() => {})

      wx.showToast({ title: '头像更新成功', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '上传失败，请重试', icon: 'error' })
    })
  },

  // 昵称 blur 回调：失焦时保存
  onNicknameBlur(e) {
    const nickname = e.detail.value
    if (!nickname || nickname === this.data.userInfo.nickname) return

    userApi.updateProfile({ nickname }).then(() => {
      const info = { ...this.data.userInfo, nickname }
      this.setData({ userInfo: info })
      app.globalData.userInfo = info
      wx.showToast({ title: '昵称已更新', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  },

  // 微信 getPhoneNumber 回调：获取手机号
  onGetPhoneNumber(e) {
    const { code, errMsg } = e.detail
    if (!code) {
      if (errMsg && errMsg.indexOf('deny') > -1) {
        wx.showToast({ title: '您取消了授权', icon: 'none' })
      }
      return
    }

    wx.showLoading({ title: '获取中...' })
    authApi.bindPhone(code).then(res => {
      wx.hideLoading()
      const phone = res.data?.phone || res.phone
      if (phone) {
        const info = { ...this.data.userInfo, phone }
        this.setData({ userInfo: info })
        app.globalData.userInfo = info
        wx.showToast({ title: '手机号绑定成功', icon: 'success' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.message || '绑定失败', icon: 'none' })
    })
  },

  goToMyPoints() { wx.navigateTo({ url: '/pages/my-points/my-points' }) },

  goToMembership() { wx.navigateTo({ url: '/pages/membership/membership' }) },

  onLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      confirmColor: '#ff2d4a',
      success: (res) => {
        if (!res.confirm) return
        clearAllData().then(() => {
          app.globalData.userInfo = {}
          wx.reLaunch({ url: '/pages/login/login' })
        })
      }
    })
  }
})
