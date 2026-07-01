const { inviteApi } = require('../../utils/api-modules')
const { checkLogin } = require('../../utils/common')

Page({
  data: {
    inviteCode: '',
    submitting: false,
    bound: false,
    rewardTimes: 0
  },

  onLoad() {
    if (!checkLogin('/pages/bind-invite/bind-invite')) return
  },

  onInput(e) {
    const val = (e.detail.value || '').trim()
    this.setData({ inviteCode: val })
  },

  onClear() {
    this.setData({ inviteCode: '' })
  },

  noop() {},

  onSubmit() {
    const code = this.data.inviteCode
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    if (this.data.submitting) return

    this.setData({ submitting: true })
    inviteApi.bindInviteCode(code).then(res => {
      const data = res.data || res || {}
      this.setData({
        submitting: false,
        bound: true,
        rewardTimes: data.rewardTimes || 0
      })
    }).catch(err => {
      this.setData({ submitting: false })
      wx.showToast({ title: err.message || '绑定失败', icon: 'none' })
    })
  },

  onSuccessConfirm() {
    this.setData({ bound: false })
    wx.navigateBack()
  }
})
