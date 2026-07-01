const app = getApp()

Page({
  data: {},

  onLoad(options) {
    // 从小程序码 scene 参数解析邀请码
    const inviteCode = options.scene ? decodeURIComponent(options.scene) : ''

    if (!inviteCode) {
      // 无邀请码，直接去首页
      wx.switchTab({ url: '/pages/index/index' })
      return
    }

    const token = wx.getStorageSync('token')
    if (token) {
      // 已登录老用户，忽略邀请码，直接去首页
      wx.switchTab({ url: '/pages/index/index' })
    } else {
      // 未登录，存储邀请码并跳转登录页
      app.globalData.pendingInviteCode = inviteCode
      wx.redirectTo({
        url: `/pages/login/login?invite_code=${inviteCode}&redirect=${encodeURIComponent('/pages/index/index')}`
      })
    }
  }
})
