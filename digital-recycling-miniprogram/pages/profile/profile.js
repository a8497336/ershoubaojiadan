const { userApi, walletApi, messageApi, pointsApi } = require('../../utils/api-modules')

Page({
  data: {
    userInfo: {
      avatar: '',
      userId: '',
      phone: '',
      points: 0
    },
    stats: {
      totalRecycled: 0,
      totalAmount: '0.00',
      co2Saved: '0.00',
      treeEquivalent: 0
    },
    walletInfo: null,
    unreadCount: 0,
    badgeCounts: {
      message: 0,
      announcement: 0
    }
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    this.loadUserData()
  },

  loadUserData() {
    userApi.getProfile().then((res) => {
      const user = res.data || {}
      this.setData({
        userInfo: {
          avatar: user.avatar || '/images/icons/avatar.svg',
          userId: user.user_no || user.id || '',
          phone: user.phone || '未绑定',
          points: user.points || 0
        },
        stats: {
          totalRecycled: user.total_recycled || 0,
          totalAmount: (user.total_amount || 0).toFixed(2),
          co2Saved: (user.co2_saved || 0).toFixed(2),
          treeEquivalent: Math.round((user.co2_saved || 0) / 18.3)
        }
      })
    }).catch(() => {})

    walletApi.getInfo().then((res) => {
      this.setData({ walletInfo: res.data })
    }).catch(() => {})

    messageApi.getUnreadCount().then((res) => {
      const count = res.data || 0
      this.setData({
        unreadCount: count,
        'badgeCounts.message': count
      })
    }).catch(() => {})
  },

  changeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        const { uploadFile } = require('../../utils/api-modules')
        uploadFile(tempFilePath).then((uploadRes) => {
          const avatar = uploadRes.data.url
          userApi.updateProfile({ avatar }).then(() => {
            this.setData({ 'userInfo.avatar': avatar })
            wx.showToast({ title: '头像已更新', icon: 'success' })
          })
        }).catch(() => {
          wx.showToast({ title: '上传失败', icon: 'none' })
        })
      }
    })
  },

  editProfile() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          userApi.updateProfile({ nickname: res.content }).then(() => {
            wx.showToast({ title: '修改成功', icon: 'success' })
          })
        }
      }
    })
  },

  goToSettings() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  goToOrderList(e) {
    const status = e.currentTarget.dataset.status || 'all'
    wx.navigateTo({ url: `/pages/order-list/order-list?status=${status}` })
  },

  goToWallet() {
    wx.showToast({ title: '钱包功能开发中', icon: 'none' })
  },

  goToMessageCenter() {
    wx.navigateTo({ url: '/pages/message-center/message-center' })
  },

  goToMembership() {
    wx.navigateTo({ url: '/pages/membership/membership' })
  },

  goToAddress() {
    wx.showToast({ title: '地址管理开发中', icon: 'none' })
  },

  goToAbout() {
    wx.showToast({ title: '关于我们开发中', icon: 'none' })
  },

  handleEntryClick(e) {
    const type = e.currentTarget.dataset.type
    if (type === 'announcement') {
      wx.navigateTo({ url: '/pages/message-center/message-center' })
    }
  },

  handlePointsActivity(e) {
    const type = e.currentTarget.dataset.type
    switch (type) {
      case 'my-points':
        wx.showToast({ title: '积分详情开发中', icon: 'none' })
        break
      case 'lottery':
        wx.showToast({ title: '积分抽奖开发中', icon: 'none' })
        break
      case 'points-mall':
        wx.showToast({ title: '积分商城开发中', icon: 'none' })
        break
      case 'invite-friends':
        wx.showToast({ title: '邀请好友开发中', icon: 'none' })
        break
    }
  },

  handleCommonFeature(e) {
    const feature = e.currentTarget.dataset.feature
    const featureMap = {
      'recycling-process': '回收流程说明开发中',
      'purchase': '我要采购开发中',
      'mailing-address': '邮寄地址开发中',
      'feedback': '问题反馈开发中',
      'faq': '常见问题开发中',
      'feedback-result': '反馈结果开发中',
      'business-cooperation': '商务合作开发中',
      'complaint': '投诉建议开发中',
      'ad-recording': '广告录音开发中',
      'market-trend': '行情走势开发中',
      'recycling-video': '回收教学视频开发中'
    }
    wx.showToast({ title: featureMap[feature] || '功能开发中', icon: 'none' })
  },

  handleVipFeature(e) {
    const feature = e.currentTarget.dataset.feature
    const featureMap = {
      'saved-quotes': '收藏报价单开发中',
      'quote-changes': '报价变动开发中',
      'photo-check': '/pages/scan-price/scan-price',
      'sms-notify': '报价短信通知开发中'
    }
    const target = featureMap[feature]
    if (target && target.startsWith('/')) {
      wx.switchTab({ url: target })
    } else {
      wx.showToast({ title: target || '功能开发中', icon: 'none' })
    }
  },

  copyWechat() {
    wx.setClipboardData({
      data: 'smhsw_kefu',
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' })
      }
    })
  },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone || '15361862828'
    wx.makePhoneCall({ phoneNumber: phone })
  },

  goToStoreList() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 个人中心', path: '/pages/profile/profile' }
  }
})
