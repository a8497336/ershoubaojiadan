const app = getApp()
const authApi = require('../../utils/api-modules').authApi

const TAB_BAR_PAGES = [
  '/pages/index/index',
  '/pages/brand-list/brand-list',
  '/pages/scan-price/scan-price',
  '/pages/shopping/shopping',
  '/pages/profile/profile'
]

// 用户协议 / 隐私政策 文本(用于 wx.showModal 兜底展示)
// 注:正式协议文本请法务/产品确认后替换此处占位文本
const USER_AGREEMENT_TEXT = `联赢电子回收网(以下简称"本平台")用户协议

1. 服务内容:本平台提供数码产品(手机、平板、笔记本等)回收、估价、寄送、款项支付等一站式服务。
2. 用户义务:您应保证提交回收的设备来源合法、不存在被盗/丢失情况,并如实描述设备状况。
3. 隐私保护:本平台严格遵守《隐私政策》,对您的个人信息与设备数据承担保密义务。
4. 价格说明:平台报价基于公开市场行情,实际回收价格以收到实物检测结果为准。
5. 争议解决:如对本平台服务有任何疑问,请通过"我的-联系客服"与我们联系。

(本协议为合规占位文本,正式版本以法务审核为准。)`

const PRIVACY_AGREEMENT_FALLBACK = `联赢电子回收网隐私政策(兜底文本)

1. 信息收集:为完成回收服务,我们可能收集您的微信昵称/头像、收货地址、联系方式、定位信息(用于查找附近门店)等。
2. 信息使用:仅用于回收订单的处理、款项支付、售后服务及合规审计,不会用于其他商业用途。
3. 信息存储:除法律法规要求外,您的个人信息在订单完成后按规定时限保留与删除。
4. 信息共享:仅在必要范围内向支付通道、物流承运方提供最少必要信息,不会出售给第三方。
5. 您的权利:您有权查看、更正、删除您的个人信息,可通过"我的-联系客服"行使。

(本兜底文本仅在 wx.openPrivacyContract 不可用时展示;推荐在微信小程序后台"设置-用户隐私保护指引"配置正式隐私指引,可被 wx.openPrivacyContract 自动同步展示。)`

Page({
  data: {
    isAgreed: false,
    redirectUrl: '',
    inviteCode: '',
    loggingIn: false,
    avatarUrl: '',
    statusBarHeight: 0
  },

  onLoad(options) {
    if (options && options.redirect) {
      this.setData({ redirectUrl: decodeURIComponent(options.redirect) })
    }
    if (options && options.invite_code) {
      this.setData({ inviteCode: options.invite_code })
    }
    // 兜底：从 globalData 读取首页暂存的邀请码
    if (app && app.globalData && app.globalData.pendingInviteCode && !this.data.inviteCode) {
      this.setData({ inviteCode: app.globalData.pendingInviteCode })
    }
    if (app && app.globalData && typeof app.globalData.statusBarHeight === 'number') {
      this.setData({ statusBarHeight: app.globalData.statusBarHeight })
    }
  },

  onAgreementChange() {
    this.setData({ isAgreed: !this.data.isAgreed })
  },

  /**
   * 修复点:「《用户协议》」链接点击无响应 → 弹 modal 显示协议全文
   * 阻止事件冒泡,避免误触外层 .agreement-check 的 onAgreementChange
   */
  onUserAgreement(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    wx.showModal({
      title: '用户协议',
      content: USER_AGREEMENT_TEXT,
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  /**
   * 修复点:「《隐私政策协议》」链接点击无响应 → 优先调 wx.openPrivacyContract(对接后台隐私指引)
   * 不支持 / 失败时降级为 wx.showModal 显示内置兜底文本
   */
  onPrivacyAgreement(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation()
    if (typeof wx.openPrivacyContract === 'function') {
      wx.openPrivacyContract({
        success: () => console.log('[login] openPrivacyContract closed'),
        fail: (err) => {
          console.warn('[login] openPrivacyContract fail:', err)
          wx.showModal({
            title: '隐私政策',
            content: PRIVACY_AGREEMENT_FALLBACK,
            showCancel: false,
            confirmText: '我知道了'
          })
        }
      })
    } else {
      // 基础库 < 2.32.3 不支持 openPrivacyContract → 兜底
      wx.showModal({
        title: '隐私政策',
        content: PRIVACY_AGREEMENT_FALLBACK,
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  onChooseAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl })
  },

  handleLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }

    if (this.data.loggingIn) return
    this.setData({ loggingIn: true })

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' })
          this.setData({ loggingIn: false })
          return
        }

        authApi.wxLogin(loginRes.code, {
          avatarUrl: this.data.avatarUrl || '/images/icons/avatar.svg',
          nickName: '微信用户'
        }, { inviteCode: this.data.inviteCode })
          .then((res) => {
            const token = res.data.token
            const userInfoData = res.data.userInfo || {}
            wx.setStorageSync('token', token)
            app.globalData.token = token
            app.globalData.userInfo = userInfoData
            wx.showToast({ title: '登录成功', icon: 'success' })
            this.setData({ loggingIn: false })
            this.navigateToHome()
          })
          .catch((err) => {
            wx.showToast({ title: err.message || '登录失败', icon: 'none' })
            this.setData({ loggingIn: false })
          })
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败，请重试', icon: 'none' })
        this.setData({ loggingIn: false })
      }
    })
  },

  /**
   * 拦截原生导航栏左上角「返回」按钮 / Android 物理返回键
   * 统一跳转到首页,与「暂不登录」按钮行为一致
   * options.from: 'backbutton'(左上角/物理键) | 'navigateBack'(API 调用,本场景不会出现)
   * 返回 true 阻止默认 navigateBack,避免和 switchTab 同时触发造成栈混乱
   */
  onNavBack() {
    wx.switchTab({ url: '/pages/index/index' })
    return true
  },

  handleCancel() {
    wx.switchTab({ url: '/pages/index/index' })
    // wx.navigateBack({
    //   delta: 1,
    //   fail: () => {
    //     wx.switchTab({ url: '/pages/index/index' })
    //   }
    // })
  },

  navigateToHome() {
    const redirectUrl = this.data.redirectUrl
    if (redirectUrl) {
      const isTabBar = TAB_BAR_PAGES.some(p => redirectUrl.startsWith(p))
      if (isTabBar) {
        wx.switchTab({ url: redirectUrl }).catch(() => {
          wx.switchTab({ url: '/pages/index/index' })
        })
      } else {
        wx.redirectTo({ url: redirectUrl }).catch(() => {
          wx.switchTab({ url: '/pages/index/index' })
        })
      }
    } else {
      wx.switchTab({ url: '/pages/index/index' }).catch(() => {
        wx.navigateBack()
      })
    }
  }
})