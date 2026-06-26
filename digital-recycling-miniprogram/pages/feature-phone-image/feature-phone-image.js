const { priceApi, featurePhoneImageApi } = require('../../utils/api-modules')

Page({
  data: {
    type: '',
    title: '热门老年机',
    image: '',
    // 与 price-quote 头部保持一致的字段
    viewCount: 0,
    updateTime: '',
    isVip: false,
    quoteDailyRemaining: 0
  },

  // 防止重複彈窗
  _blocked: false,

  onLoad(options) {
    const type = (options && options.type) || ''
    const config = this.resolveConfig(type)
    // 计算与 price-quote 头部一致的占位数据
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const updateTime = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`
    this.setData({
      type: type,
      title: config.title,
      image: config.image,
      updateTime
    })
    // 同步更新导航栏标题
    if (config.title) {
      wx.setNavigationBarTitle({ title: config.title })
    }
    // 拉取真实的查价数据（含浏览量自增 + 剩余次数 + VIP 状态）
    this.loadUserQuota(type)
    // 异步加载后端最新图片（兜底图已在 setData 中赋值）
    this.loadFeaturePhoneImage(type)
  },

  resolveConfig(type) {
    if (type === 'dianrong') {
      return {
        title: '智能机/电容屏',
        image: '/images/price/dianrong.png' // 兜底图
      }
    }
    // 默认为热门老年机（含 type=oldMan 与空值/未知值）
    return {
      title: '热门老年机',
      image: '/images/price/oldMan.png' // 兜底图
    }
  },

  loadFeaturePhoneImage(type) {
    // 如果 type 不是 oldMan/dianrong，无需调用后端
    if (type !== 'oldMan' && type !== 'dianrong') return

    featurePhoneImageApi.get(type).then((res) => {
      const data = (res && res.data) || res || {}
      const found = !!data.found
      const image = data.image
      if (found && image) {
        // 后端有配置：使用后端 URL
        this.setData({ image: image })
      }
      // 未配置或 image 为空：保持兜底图
    }).catch((err) => {
      console.warn('[feature-phone-image] 加载远程图片失败，使用兜底图', err)
      // 失败时保留兜底图
    })
  },

  loadUserQuota(type) {
    const token = wx.getStorageSync('token')
    if (!token) {
      this._blocked = true
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 600)
      return
    }

    // 调用 /prices/today 触发后端累加浏览量
    priceApi.getTodayPrices({ type: type }).then((res) => {
      const data = (res && res.data) || res || {}
      const isVip = !!data.isVip
      const quoteRemaining = parseInt(data.quoteRemaining) || 0
      const quoteDailyRemaining = parseInt(data.quoteDailyRemaining) || 0
      const viewCount = parseInt(data.viewCount) || 0
      // 0 次拦截：会员 / 总次数 / 每日次数 任一 > 0 即允许
      const hasAccess = isVip || quoteRemaining > 0 || quoteDailyRemaining > 0

      this.setData({
        isVip,
        quoteDailyRemaining,
        viewCount,
        quotaLoaded: true,
        accessGranted: hasAccess
      })

      if (hasAccess) {
        return
      }
      this.showNoQuotaModal(type)
    }).catch((err) => {
      // 复用 price-quote 的 403/10007 拦截（次数用完）
      const statusCode = (err && err.statusCode) || (err && err.code) || 0
      if (statusCode === 403 || statusCode === 10007) {
        // 次数用完：header 不再 loading，但保持 accessGranted=false 隐藏图片
        this.setData({ quotaLoaded: true })
        this.showNoQuotaModal(type)
        return
      }
      // 其他异常不阻塞页面渲染（兜底允许查看，避免永久 loading/黑屏）
      wx.showToast({ title: '次数信息获取失败', icon: 'none' })
      this.setData({ quotaLoaded: true, accessGranted: true })
    })
  },

  showNoQuotaModal(type) {
    if (this._blocked) return
    this._blocked = true
    const redirectUrl = '/pages/feature-phone-image/feature-phone-image?type=' + encodeURIComponent(type || '')
    wx.showModal({
      title: '提示',
      content: '查看该报价单需要开通报价会员，您未开通会员或者会员已到期，请开通',
      confirmText: '开通会员',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/membership/membership?redirect=' + encodeURIComponent(redirectUrl)
          })
        } else {
          wx.navigateBack({ delta: 1 })
        }
      },
      fail: () => {
        wx.navigateBack({ delta: 1 })
      }
    })
  },

  previewImage() {
    if (!this.data.image) return
    wx.previewImage({
      current: this.data.image,
      urls: [this.data.image]
    })
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.switchTab({ url: '/pages/index/index' })
    }
  }
})
