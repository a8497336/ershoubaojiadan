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
     * - 小程序短链（#小程序://）：wx.navigateToMiniProgram shortLink 打开
     * - 小程序内部路径：navigateTo 跳转，tabBar 页面用 switchTab
     * - H5 链接：跳转 webview 页面打开
     * - 其他：复制到剪贴板兜底
     * - 无链接：仅关闭弹窗
     */
    onImageTap() {
      const images = this.properties.adData && this.properties.adData.images || []
      const item = images[this.data.currentIndex]
      const link = item && item.link

      this.close()

      if (!link || !link.trim()) return

      const trimmedLink = link.trim()

      // 微信小程序短链（如 #小程序://旧机汇回收/邀请好友/BEMqjs6YoyrXiko）
      if (trimmedLink.indexOf('#小程序://') === 0 || trimmedLink.indexOf('#小程序%3A//') === 0) {
        const shortLink = decodeURIComponent(trimmedLink)
        wx.navigateToMiniProgram({
          shortLink: shortLink,
          fail: (err) => {
            console.error('[popup-ad] navigateToMiniProgram shortLink fail:', err)
            this._copyLink(trimmedLink)
          }
        })
        return
      }

      // 小程序内部页面跳转（兼容 /pages/ 和 pages/ 开头）
      const isMiniPage = trimmedLink.indexOf('/pages/') === 0 || trimmedLink.indexOf('pages/') === 0
      if (isMiniPage) {
        const url = trimmedLink.indexOf('/') === 0 ? trimmedLink : '/' + trimmedLink
        // 提取纯路径和 query
        const [pathOnly, queryStr] = url.split('?')
        const query = queryStr ? '?' + queryStr : ''

        // 判断是否是 tabBar 页面
        const tabBarPages = [
          '/pages/index/index',
          '/pages/brand-list/brand-list',
          '/pages/scan-price/scan-price',
          '/pages/shopping/shopping',
          '/pages/profile/profile'
        ]
        const isTabBar = tabBarPages.some(p => pathOnly === p || pathOnly === p.replace(/^\//, ''))

        // 路径自动修正：/pages/xxx/index → /pages/xxx/xxx
        const pathParts = pathOnly.replace(/^\//, '').split('/')
        let finalUrl = pathOnly + query
        let altUrl = null
        if (pathParts.length === 3 && pathParts[2] === 'index') {
          altUrl = '/pages/' + pathParts[0] + '/' + pathParts[1] + '/' + pathParts[1] + query
        }

        const tryNavigate = (targetUrl) => {
          wx.navigateTo({
            url: targetUrl,
            fail: () => {
              // 尝试备用路径
              if (altUrl && targetUrl !== altUrl) {
                tryNavigate(altUrl)
              } else {
                this._copyLink(trimmedLink)
              }
            }
          })
        }

        if (isTabBar) {
          wx.switchTab({
            url: pathOnly,
            fail: () => {
              tryNavigate(finalUrl)
            }
          })
        } else {
          tryNavigate(finalUrl)
        }
      } else if (trimmedLink.indexOf('http://') === 0 || trimmedLink.indexOf('https://') === 0) {
        // H5 链接：跳转 webview 页面
        wx.navigateTo({
          url: '/pages/webview/webview?url=' + encodeURIComponent(trimmedLink),
          fail: () => this._copyLink(trimmedLink)
        })
      } else {
        // 其他格式链接兜底复制
        this._copyLink(trimmedLink)
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
