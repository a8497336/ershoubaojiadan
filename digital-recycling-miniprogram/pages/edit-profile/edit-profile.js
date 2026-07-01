const app = getApp()
const { userApi, authApi } = require('../../utils/api-modules')
const { checkLogin } = require('../../utils/common')

Page({
  data: {
    userInfo: {},
    nicknameInput: '',
    avatarDone: false,
    nicknameDone: false,
    phoneDone: false,
    profileIncomplete: false,
    incompleteCount: 0,
    statusBarHeight: 0
  },

  onLoad() {
    if (!checkLogin('/pages/edit-profile/edit-profile')) return
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 0,
      pageStyle: `--status-bar-h: ${app.globalData.statusBarHeight || 0}px;`
    })
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    userApi.getProfile().then(res => {
      const data = res.data || res || {}
      const status = this._checkProfileComplete(data)
      this.setData({
        userInfo: data,
        nicknameInput: data.nickname || '',
        ...status
      })
    }).catch(() => {
      const user = app.globalData.userInfo || {}
      const status = this._checkProfileComplete(user)
      this.setData({
        userInfo: user,
        nicknameInput: user.nickname || '',
        ...status
      })
    })
  },

  _checkProfileComplete(user) {
    const incompleteItems = []
    const isDefaultAvatar = !user.avatar ||
      user.avatar === '/images/icons/avatar.svg' ||
      (user.avatar || '').indexOf('avatar.svg') > -1
    if (isDefaultAvatar) incompleteItems.push('avatar')
    if (!user.nickname || user.nickname === '微信用户') incompleteItems.push('nickname')
    if (!user.phone) incompleteItems.push('phone')

    return {
      profileIncomplete: incompleteItems.length > 0,
      incompleteCount: incompleteItems.length,
      avatarDone: !isDefaultAvatar,
      nicknameDone: !!(user.nickname && user.nickname !== '微信用户'),
      phoneDone: !!user.phone
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    if (!avatarUrl) return

    wx.showLoading({ title: '上传中...' })
    userApi.uploadAvatar(avatarUrl).then(uploadRes => {
      wx.hideLoading()
      const url = uploadRes.data?.url || uploadRes.url
      if (!url) {
        wx.showToast({ title: '头像上传失败', icon: 'error' })
        return
      }
      const info = { ...this.data.userInfo, avatar: url }
      const status = this._checkProfileComplete(info)
      this.setData({ userInfo: info, ...status })
      app.globalData.userInfo = info
      wx.showToast({ title: '头像更新成功', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '上传失败，请重试', icon: 'error' })
    })
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({ nicknameInput: e.detail.value })
  },

  // 昵称失焦保存
  onNicknameBlur() {
    const nickname = (this.data.nicknameInput || '').trim()
    if (!nickname) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    if (nickname === this.data.userInfo.nickname) return

    userApi.updateProfile({ nickname }).then(() => {
      const info = { ...this.data.userInfo, nickname }
      const status = this._checkProfileComplete(info)
      this.setData({ userInfo: info, ...status })
      app.globalData.userInfo = info
      wx.showToast({ title: '昵称已更新', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' })
    })
  },

  // 获取手机号
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
        const status = this._checkProfileComplete(info)
        this.setData({ userInfo: info, ...status })
        app.globalData.userInfo = info
        wx.showToast({ title: '手机号绑定成功', icon: 'success' })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: err.message || '绑定失败', icon: 'none' })
    })
  }
})
