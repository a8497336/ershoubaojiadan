/**
 * 定位测试 Demo - 小程序入口
 * 与主项目 digital-recycling-miniprogram 的 appid / 隐私配置保持一致
 * 用于独立调试 wx.getFuzzyLocation 定位功能
 */

App({
  onLaunch() {
    console.log('[demo] app onLaunch')

    // 注意：故意不在此处监听 wx.onNeedPrivacyAuthorization
    // 原因：回调中直接 resolve agree 会导致原生隐私弹窗永远无法弹出，
    //      且会污染隐私授权状态（demo 项目需要正常测试 wx.requirePrivacyAuthorize 弹窗）。
    //      demo 应保持原生行为，让 requirePrivacyAuthorize 自然弹出原生弹窗。
  },

  globalData: {
    // 最近一次定位结果（与主项目 app.globalData 不互通，独立存储）
    lastLocation: null,
    // 最近一次隐私查询结果
    privacySetting: null,
    // 启动时间（用于日志标识）
    bootTime: new Date().toISOString(),
    // 虚拟支付测试预留字段（dom 端采用免登模式,不强依赖 token）
    token: null,
    userInfo: null
  }
})