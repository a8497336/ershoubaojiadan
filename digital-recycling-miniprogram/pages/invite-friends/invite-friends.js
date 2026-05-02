const { userApi } = require('../../utils/api-modules')

Page({
  data: {
    inviteCode: '',
    inviteCount: 0,
    totalReward: 0,
    inviteList: []
  },

  onLoad() {
    this.loadInviteInfo()
  },

  async loadInviteInfo() {
    try {
      const res = await userApi.getProfile()
      const user = res.data || res || {}
      this.setData({
        inviteCode: user.invite_code || user.userId || '',
        inviteCount: user.invite_count || 0,
        totalReward: user.invite_reward || 0
      })
    } catch (err) {
      console.error('获取邀请信息失败:', err)
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
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      }
    })
  },

  handleShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  onShareAppMessage() {
    return {
      title: '数码回收网 - 专业数码产品回收平台',
      path: `/pages/index/index?invite_code=${this.data.inviteCode}`
    }
  }
})
