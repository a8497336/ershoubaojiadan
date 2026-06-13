const { userApi } = require('../../utils/api-modules')

Page({
  data: {
    inviteCode: '',
    inviteCount: 0,
    totalReward: 0,
    inviteList: [],
    loading: true,
    networkError: false
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.loadInviteInfo()
  },

  retryLoad() {
    this.setData({ loading: true, networkError: false })
    this.loadInviteInfo()
  },

  async loadInviteInfo() {
    this.setData({ loading: true, networkError: false })
    try {
      const res = await userApi.getProfile()
      const user = res.data || res || {}
      this.setData({
        inviteCode: user.invite_code || user.userId || '',
        inviteCount: user.invite_count || 0,
        totalReward: user.invite_reward || 0,
        loading: false,
        networkError: false
      })
    } catch (err) {
      console.error('获取邀请信息失败:', err)
      const isNetworkError = !err || err.message === '网络连接失败，请检查网络设置'
        || (err.errMsg && err.errMsg.includes('fail'))
      this.setData({
        loading: false,
        networkError: isNetworkError
      })
    }
  },

  handleCopyCode() {
    const code = this.data.inviteCode

    if (!code) {
      wx.showToast({ title: '暂无邀请码', icon: 'none' })
      return
    }

    wx.setClipboardData({
      data: String(code),
      success: () => {
        wx.vibrateShort({ type: 'light' })
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      },
      fail: () => {
        wx.showModal({
          title: '邀请码',
          content: code,
          showCancel: false
        })
      }
    })

  },

  onShareAppMessage() {
    return {
      title: '联赢电子回收网 - 专业数码产品回收平台',
      path: `/pages/index/index?invite_code=${this.data.inviteCode}`,
      imageUrl: ''
    }
  },

  onShareTimeline() {
    return {
      title: '联赢电子回收网 - 专业数码产品回收平台',
      query: `invite_code=${this.data.inviteCode}`,
      imageUrl: ''
    }
  }
})