const app = getApp()
Page({
  data: {
    smsEnabled: false,
    priceAlert: false,
    orderNotify: true,
    promoNotify: false,
    loading: false
  },
  onLoad() {
    const settings = wx.getStorageSync('sms_settings')
    if (settings) this.setData(settings)
  },
  onToggle(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: !this.data[field] })
    this.saveSettings()
  },
  saveSettings() {
    const { smsEnabled, priceAlert, orderNotify, promoNotify } = this.data
    wx.setStorageSync('sms_settings', { smsEnabled, priceAlert, orderNotify, promoNotify })
    wx.showToast({ title: '设置已保存', icon: 'success' })
  }
})
