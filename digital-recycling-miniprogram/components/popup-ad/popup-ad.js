Component({
  properties: {
    adData: { type: Object, value: null },
    visible: { type: Boolean, value: false }
  },

  data: {
    currentIndex: 0,
    statusBarHeight: 0,
    currentLink: ''
  },

  lifetimes: {
    attached() {
      // 获取状态栏高度，用于全屏模式顶部安全距离
      try {
        const sysInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
        this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 })
      } catch (e) {
        this.setData({ statusBarHeight: 20 })
      }
    }
  },

  observers: {
    'visible': function (val) {
      if (!val) {
        // 关闭时重置索引
        this.setData({ currentIndex: 0, currentLink: '' })
      }
    },
    'adData, currentIndex': function (adData, currentIndex) {
      // 同步当前图片对应的跳转链接
      let link = ''
      if (adData && adData.images && adData.images[currentIndex]) {
        link = adData.images[currentIndex].link || ''
      }
      this.setData({ currentLink: link })
    }
  },

  methods: {
    /**
     * 点击广告图片
     * - 小程序内部路径（以 / 开头）：使用 wx.navigateTo 跳转
     * - H5 链接：复制到剪贴板并提示
     * - 无链接：仅关闭弹窗
     */
    onImageTap() {
      const images = this.properties.adData && this.properties.adData.images || []
      const item = images[this.data.currentIndex]
      const link = item && item.link

      this.close()

      if (!link) return

      // 小程序内部页面跳转
      if (link.indexOf('/pages/') === 0) {
        wx.navigateTo({
          url: link,
          fail: () => {
            // 跳转失败时降级为 switchTab（可能是 tabBar 页面）
            wx.switchTab({
              url: link,
              fail: () => this._copyLink(link)
            })
          }
        })
      } else {
        this._copyLink(link)
      }
    },

    _copyLink(link) {
      wx.setClipboardData({
        data: link,
        success: () => {
          wx.showToast({ title: '链接已复制', icon: 'none' })
        }
      })
    },

    onClose() {
      this.close()
    },

    close() {
      // 不直接修改 properties.visible，由父组件通过 bind:close 控制
      this.setData({ currentIndex: 0 })
      this.triggerEvent('close')
    },

    onSwiperChange(e) {
      this.setData({ currentIndex: e.detail.current })
    },

    // 阻止冒泡，防止点击弹窗内容时关闭
    noop() {}
  }
})
