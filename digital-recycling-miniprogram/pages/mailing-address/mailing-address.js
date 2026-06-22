const { settingsApi } = require('../../utils/api-modules')

Page({
  data: {
    address: {
      name: '陈约',
      phone: '15555962610',
      detail: '广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B',
      service_wechat: '',
      service_phone: ''
    },
    wechat: '15555962610'
  },

  onLoad() {
    this.loadAddressConfig()
  },

  async loadAddressConfig() {
    try {
      const res = await settingsApi.getQuoteConfig()
      if (res.data) {
        this.setData({
          address: {
            name: res.data.receiver_name || this.data.address.name,
            phone: res.data.receiver_phone || this.data.address.phone,
            detail: res.data.receiver_address || this.data.address.detail,
            service_wechat: res.data.service_wechat ||  this.data.address.wechat,
            service_phone: res.data.service_phone ||  this.data.address.phone
          }
        })
      }
    } catch (err) {
      console.error('获取地址配置失败:', err)
    }
  },

  handleCopyAddress() {
    const addr = `${this.data.address.name} ${this.data.address.phone}\n${this.data.address.detail}`
    wx.setClipboardData({
      data: addr,
      success: () => {
        wx.showToast({ title: '地址已复制', icon: 'success' })
      }
    })
  },

  handleCopyWechat() {
    wx.setClipboardData({
      data: this.data.wechat,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' })
      }
    })
  },

  handleCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.address.phone
    })
  }
})
