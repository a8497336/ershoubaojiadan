Page({
  data: {
    cooperations: [
      { icon: '🏪', title: '门店合作', desc: '线下门店入驻，共享回收资源' },
      { icon: '📦', title: '批量回收', desc: '大批量手机回收，价格更优' },
      { icon: '🤝', title: '渠道代理', desc: '成为区域代理，享受专属权益' },
      { icon: '📊', title: '数据服务', desc: '行业数据报告，市场行情分析' }
    ],
    contactPhone: '16618180111',
    contactWechat: '16618180111'
  },

  handleCall() {
    wx.makePhoneCall({ phoneNumber: this.data.contactPhone })
  },

  handleCopyWechat() {
    wx.setClipboardData({
      data: this.data.contactWechat,
      success: () => wx.showToast({ title: '微信号已复制', icon: 'success' })
    })
  }
})
