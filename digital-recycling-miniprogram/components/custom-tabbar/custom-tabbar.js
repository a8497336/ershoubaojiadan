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
      { key: 'priceList', text: '产品列表', icon: 'price', page: '/pages/brand-list/brand-list' },
      { key: 'scanPrice', text: '扫码报价', icon: 'scan', page: '/pages/scan-price/scan-price', isCenter: true },
      { key: 'shopping', text: '回收车', icon: 'cart', page: '/pages/shopping/shopping' },
      { key: 'profile', text: '我的', icon: 'profile', page: '/pages/profile/profile' }
    ]
  },

  methods: {
    handleTabClick(e) {
      const tab = e.currentTarget.dataset.tab
      if (tab.key === this.data.activeTab) return
      
      wx.switchTab({
        url: tab.page,
        fail: () => {
          wx.navigateTo({ url: tab.page })
        }
      })
      
      this.triggerEvent('tab-change', { tab: tab.key })
    }
  }
})
