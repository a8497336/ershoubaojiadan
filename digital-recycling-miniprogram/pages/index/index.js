const { categoryApi, contentApi, brandApi, priceApi } = require('../../utils/api-modules')
const { getImageUrl } = require('../../utils/config')

Page({
  data: {
    activeCategory: 0,
    categoryTabs: ['环保手机报价', '数码相机报价', '新机靓机报价'],
    activeVideoTab: 0,
    videoTabs: ['查看报价', '实用功能', '下单相关', '收入相关'],
    videos: [],
    banners: [],
    announcements: [],
    storeInfo: null,
    showBackTop: false,
    categories: [],
    phoneBrands: [],
    internalBrands: [],
    electronicsBrands: [],
    difficultBrands: [],
    goodPhoneBrands: [],
    liquorBrands: [],
    hotPriceList: [],
    priceLoading: false
  },

  onLoad() {
    this.loadCategories()
    this.loadBanners()
    this.loadAnnouncements()
    this.loadStores()
    this.loadVideos()
    this.loadHotPrices()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  loadCategories() {
    categoryApi.getCategories().then((res) => {
      const categories = res.data || []
      this.setData({ categories })
      if (categories.length > 0) {
        const tabs = categories.map(c => c.name)
        this.setData({ categoryTabs: tabs })
        this.loadBrandsByCategory(categories[0].id)
      }
    }).catch((err) => {
      console.error('加载分类失败:', err)
      wx.showToast({
        title: '加载失败，请下拉刷新',
        icon: 'none'
      })
    })
  },

  loadBrandsByCategory(categoryId) {
    brandApi.getBrands(categoryId).then((res) => {
      const brands = (res.data || []).map(b => ({
        id: b.id,
        bg: b.bg_color ? `bg-${b.bg_color}` : 'bg-default',
        icon: b.logo || b.name.substring(0, 2),
        name: b.name,
        categoryId: b.category_id,
        hasTodayPrice: b.has_today_price || false,
        priceRange: b.price_range || ''
      }))
      this.updateBrandListByCategory(categoryId, brands)
    }).catch((err) => {
      console.error('加载品牌列表失败:', err)
      wx.showToast({
        title: '品牌加载失败',
        icon: 'none'
      })
    })
  },

  updateBrandListByCategory(categoryId, brands) {
    const category = this.data.categories.find(c => c.id === categoryId)
    const categoryName = category?.name || ''

    if (categoryName.includes('手机') || categoryId === this.data.categories[0]?.id) {
      this.setData({ phoneBrands: brands })
    } else if (categoryName.includes('内配')) {
      this.setData({ internalBrands: brands })
    } else if (categoryName.includes('电子') || categoryName.includes('杂货')) {
      this.setData({ electronicsBrands: brands })
    } else if (categoryName.includes('疑难')) {
      this.setData({ difficultBrands: brands })
    } else if (categoryName.includes('靓机') || categoryName.includes('好机')) {
      this.setData({ goodPhoneBrands: brands })
    } else if (categoryName.includes('酒')) {
      this.setData({ liquorBrands: brands })
    } else {
      this.setData({ phoneBrands: brands })
    }
  },

  loadBanners() {
    contentApi.getBanners().then((res) => {
      const banners = (res.data || []).map(banner => ({
        ...banner,
        image: getImageUrl(banner.image)
      }))
      this.setData({ banners })
    }).catch((err) => {
      console.error('加载轮播图失败:', err)
    })
  },

  loadAnnouncements() {
    contentApi.getAnnouncements({ page: 1, pageSize: 5 }).then((res) => {
      const data = res.data || {}
      const announcements = (data.list || []).map(a => a.title || a.content || '')
      this.setData({ announcements })
    }).catch(() => {
      this.setData({
        announcements: [
          '东莞东城 冯先生 门店批量 收益8500元',
          '深圳华强北 李先生 回收手机 收益12000元',
          '广州天河 王先生 批量回收 收益6800元'
        ]
      })
    })
  },

  loadStores() {
    contentApi.getStores().then((res) => {
      const stores = res.data || []
      if (stores.length > 0) {
        const store = stores[0]
        this.setData({
          storeInfo: {
            name: store.name || '门店',
            contact: store.contact || store.manager || '',
            phone: store.phone || '',
            address: store.address || '',
            latitude: store.latitude || 0,
            longitude: store.longitude || 0
          }
        })
      }
    }).catch(() => {
      this.setData({
        storeInfo: {
          name: '安徽门店',
          contact: '范凯旋',
          phone: '18755875222',
          address: '安徽省阜阳市颍州区双子塔写字楼 A 座',
          latitude: 33.1624,
          longitude: 115.6218
        }
      })
    })
  },

  loadVideos() {
    contentApi.getVideos().then((res) => {
      this.setData({ videos: res.data || [] })
    }).catch(() => {
      this.setData({
        videos: [
          { icon: '/images/icons/search.svg', title: '华为手机查询报价' },
          { icon: '/images/icons/search.svg', title: '报价单查看教程' },
          { icon: '/images/icons/chart.svg', title: '报价单统货功能机' }
        ]
      })
    })
  },

  loadHotPrices() {
    this.setData({ priceLoading: true })
    priceApi.getTodayPrices({}).then((res) => {
      const list = (res.data.list || []).map(item => {
        const prices = (item.Prices || []).map(p => parseFloat(p.price)).filter(p => p > 0)
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
        return {
          id: item.id,
          model: item.model || item.name || '',
          brand: item.Brand?.name || '',
          series: item.series || '',
          maxPrice: maxPrice > 0 ? `¥${maxPrice}` : '询价',
          priceCount: prices.length
        }
      }).sort((a, b) => {
        const priceA = parseFloat(a.maxPrice.replace('¥', '')) || 0
        const priceB = parseFloat(b.maxPrice.replace('¥', '')) || 0
        return priceB - priceA
      }).slice(0, 12)

      this.setData({ hotPriceList: list, priceLoading: false })
    }).catch(() => {
      this.setData({ priceLoading: false })
    })
  },

  onPageScroll(e) {
    this.setData({ showBackTop: e.scrollTop > 300 })
  },

  switchCategory(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeCategory: index })
    if (this.data.categories[index]) {
      this.loadBrandsByCategory(this.data.categories[index].id)
    }
  },

  switchVideoTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeVideoTab: index })
    const categories = ['查看报价', '实用功能', '下单相关', '收入相关']
    const category = categories[index] || ''
    if (category) {
      contentApi.getVideos(category).then((res) => {
        this.setData({ videos: res.data || [] })
      }).catch((err) => {
        console.error('加载视频列表失败:', err)
      })
    }
  },

  scrollToTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 })
  },

  goToBrandList(e) {
    const brandId = e.currentTarget.dataset.id || ''
    const brandName = e.currentTarget.dataset.name || ''
    const category = e.currentTarget.dataset.category || ''
    let url = '/pages/price-quote/price-quote'
    const params = []
    if (brandId) params.push('brandId=' + brandId)
    if (brandName) params.push('brand=' + encodeURIComponent(brandName))
    if (category) params.push('category=' + encodeURIComponent(category))
    if (params.length > 0) url += '?' + params.join('&')
    wx.navigateTo({ url })
  },

  goToScanPrice() {
    wx.switchTab({ url: '/pages/scan-price/scan-price' })
  },

  goToInvite() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
    wx.showToast({ title: '请点击右上角分享', icon: 'none' })
  },

  onSearch(e) {
    const keyword = e.detail.value
    if (keyword) {
      wx.navigateTo({ url: '/pages/brand-list/brand-list?keyword=' + encodeURIComponent(keyword) })
    }
  },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  },

  copyPhone(e) {
    const phone = e.currentTarget.dataset.phone
    wx.setClipboardData({ data: phone, success: () => { wx.showToast({ title: '已复制', icon: 'success' }) } })
  },

  openLocation() {
    const store = this.data.storeInfo
    if (store && store.latitude && store.longitude) {
      wx.openLocation({
        latitude: store.latitude,
        longitude: store.longitude,
        name: store.name || '数码回收网门店',
        address: store.address || ''
      })
    } else {
      wx.openLocation({
        latitude: 33.1624,
        longitude: 115.6218,
        name: '数码回收网废旧手机回收中心',
        address: '安徽省阜阳市太和县双浮镇双北路1号'
      })
    }
  },

  copyWechat() {
    wx.setClipboardData({ data: '15361862828', success: () => { wx.showToast({ title: '微信号已复制', icon: 'success' }) } })
  },

  goToStoreList() {
    wx.navigateTo({ url: '/pages/brand-list/brand-list?category=门店' })
  },

  goToVideoList() {
    wx.navigateTo({ url: '/pages/brand-list/brand-list?category=视频' })
  },

  goToPriceQuote() {
    wx.navigateTo({ url: '/pages/price-quote/price-quote' })
  },

  goToPriceDetail(e) {
    const productId = e.currentTarget.dataset.id
    if (productId) {
      wx.navigateTo({
        url: `/pages/price-quote/price-quote?productId=${productId}`
      })
    } else {
      this.goToPriceQuote()
    }
  }
})
