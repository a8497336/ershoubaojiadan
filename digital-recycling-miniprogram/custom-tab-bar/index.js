Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home'
    },
    badgeCount: {
      type: Number,
      value: 0
    },
    showNewBadge: {
      type: Boolean,
      value: true
    },
    showDotBadge: {
      type: Boolean,
      value: false
    }
  },

  data: {
    tabs: [
      { key: 'home', text: '首页', icon: 'home', page: '/pages/index/index' },
      { key: 'priceList', text: '产品列表', icon: 'file-invoice-dollar', page: '/pages/brand-list/brand-list' },
      { key: 'scanPrice', text: '扫码报价', icon: 'qrcode', page: '/pages/scan-price/scan-price', isCenter: true },
      { key: 'shopping', text: '回收车', icon: 'shopping-cart', page: '/pages/shopping/shopping' },
      { key: 'profile', text: '我的', icon: 'user', page: '/pages/profile/profile' }
    ]
  },

  methods: {
    handleTabClick(e) {
      const tab = e.currentTarget.dataset.tab
      if (tab.key === this.data.activeTab) return

      wx.switchTab({
        url: tab.page,
        fail: () => {
          wx.showToast({ title: '页面跳转失败，请重试', icon: 'none' })
        }
      })

      this.triggerEvent('tab-change', { tab: tab.key })
    }
  }
})
