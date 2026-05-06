const app = getApp()
const contentApi = require('../../utils/api-modules').contentApi
const categoryApi = require('../../utils/api-modules').categoryApi
const priceApi = require('../../utils/api-modules').priceApi
const searchApi = require('../../utils/api-modules').searchApi
const { CONTACT, STORE } = require('../../utils/constants')

Page({
  data: {
    statusBarHeight: 0,
    banners: [],
    announcements: [],
    storesData: [],
    storeInfo: null,
    categories: [],

    searchKeyword: '',
    activeCategory: 0,
    bannerCurrent: 0,
    currentAnnouncementIndex: 0,

    videos: [],
    videoTabs: ['查看报价', '实用功能', '下单相关', '收入相关'],
    activeVideoTab: 0,
    filteredVideos: [],

    loading: true,
    priceLoading: true,
    showBackTop: false,
    toastVisible: false,
    toastMsg: '',
    networkError: false,
    online: true,

    currentCategorySection: null,
    currentBrands: [],
    brandsLoading: false,

    hotPriceList: [],

    displayAnnouncements: [],
    announcementTimer: null,
    bannerTimer: null,

    phoneBrands: [
      { bg: 'bg-xiaomi', icon: '📱', iconStyle: 'font-size:20rpx;', name: '热门老年机' },
      { bg: 'bg-apple', icon: '', iconStyle: 'font-size:20rpx;', name: '智能机/电容屏' },
      { bg: 'bg-huawei', icon: '🔧', iconStyle: 'font-size:20rpx;', name: '手机拆机件' },
      { bg: 'bg-blackberry', icon: '🔋', iconStyle: 'font-size:20rpx;', name: '电池' },
      { bg: 'bg-oppo', icon: 'OP', name: 'OPPO' },
      { bg: 'bg-vivo', icon: 'V', name: 'VIVO' },
      { bg: 'bg-xiaomi', icon: 'mi', name: '小米' },
      { bg: 'bg-huawei', icon: 'HW', name: '华为OK板' },
      { bg: 'bg-huawei', icon: 'HW', name: '华为' },
      { bg: 'bg-samsung', icon: 'S', name: '三星' },
      { bg: 'bg-apple', icon: '🍎', name: '苹果' },
      { bg: 'bg-apple', icon: '⚠️', iconStyle: 'font-size:18rpx;', name: '高仿苹果' },
      { bg: 'bg-jinli', icon: 'G', name: '金立' },
      { bg: 'bg-lenovo', icon: 'L', name: '联想' },
      { bg: 'bg-coolpad', icon: 'cool', iconStyle: 'font-size:18rpx;', name: '酷派/ivvi' },
      { bg: 'bg-meizu', icon: 'M', name: '魅族' },
      { bg: 'bg-smartisan', icon: 'T', name: '锤子' },
      { bg: 'bg-360', icon: '+', name: '360' },
      { bg: 'bg-htc', icon: 'htc', name: 'HTC' },
      { bg: 'bg-blackberry', icon: '●●●', iconStyle: 'font-size:18rpx;', name: '黑莓' },
      { bg: 'bg-oneplus', icon: '1+', name: '一加' },
      { bg: 'bg-realme', icon: 'R', name: '真我/realme' },
      { bg: 'bg-nokia', icon: 'N', name: '诺基亚' },
      { bg: 'bg-meitu', icon: 'M', name: '美图' },
      { bg: 'bg-leeco', icon: 'L', name: '乐视' },
      { bg: 'bg-nubia', icon: 'n', name: '努比亚' },
      { bg: 'bg-chinamobile', icon: '移', name: '中国移动' },
      { bg: 'bg-tcl', icon: 'T', name: 'TCL' },
      { bg: 'bg-zte', icon: 'Z', name: '中兴' },
      { bg: 'bg-8848', icon: '8848', name: '8848' },
      { bg: 'bg-sugar', icon: 'GOME', iconStyle: 'font-size:18rpx;', name: '糖果/国美' },
      { bg: 'bg-bbk', icon: '步', name: '步步高' },
      { bg: 'bg-hisense', icon: 'H', name: '海信' },
      { bg: 'bg-doov', icon: 'D', name: '朵唯' },
      { bg: 'bg-gree', icon: 'G', name: '格力' },
      { bg: 'bg-moto', icon: 'M', name: '摩托罗拉' },
      { bg: 'bg-asus', icon: 'A', name: '华硕' },
      { bg: 'bg-royole', icon: '柔', name: '柔宇' },
      { bg: 'bg-google', icon: 'G', name: '谷歌Google' }
    ],

    internalBrands: [
      { bg: 'bg-blackberry', icon: '🔲', iconStyle: 'font-size:20rpx;', name: '主板芯片' },
      { bg: 'bg-apple', icon: '🍎', iconStyle: 'font-size:20rpx;', name: '苹果主板' },
      { bg: 'bg-blackberry', icon: '💾', iconStyle: 'font-size:20rpx;', name: '内存卡' },
      { bg: 'bg-apple', icon: '🖥️', iconStyle: 'font-size:18rpx;', name: '苹果高端屏' },
      { bg: 'bg-blackberry', icon: '📱', iconStyle: 'font-size:20rpx;', name: '手机屏' },
      { bg: 'bg-blackberry', icon: '⬛', iconStyle: 'font-size:18rpx;', name: '冷光屏黑白屏' },
      { bg: 'bg-apple', icon: '📲', iconStyle: 'font-size:18rpx;', name: 'IPAD内爆屏' },
      { bg: 'bg-blackberry', icon: '📷', iconStyle: 'font-size:18rpx;', name: '国产摄像头' },
      { bg: 'bg-hisense', icon: '🏭', iconStyle: 'font-size:18rpx;', name: '企业库存机' },
      { bg: 'bg-hisense', icon: '♻️', iconStyle: 'font-size:18rpx;', name: '电子废弃物' }
    ],

    electronicsBrands: [
      { bg: 'bg-apple', icon: '🎧', iconStyle: 'font-size:20rpx;', name: '苹果耳机' },
      { bg: 'bg-blackberry', icon: '💳', iconStyle: 'font-size:20rpx;', name: 'POS机' },
      { bg: 'bg-blackberry', icon: '📻', iconStyle: 'font-size:18rpx;', name: '对讲机' },
      { bg: 'bg-blackberry', icon: '🪪', iconStyle: 'font-size:16rpx;', name: '身份证阅读器' },
      { bg: 'bg-blackberry', icon: '📡', iconStyle: 'font-size:18rpx;', name: '方盒路由器' },
      { bg: 'bg-blackberry', icon: '📡', iconStyle: 'font-size:18rpx;', name: '路由器' },
      { bg: 'bg-hisense', icon: '🌐', iconStyle: 'font-size:18rpx;', name: '光纤猫' },
      { bg: 'bg-blackberry', icon: '📺', iconStyle: 'font-size:16rpx;', name: '4k/2k机顶盒' },
      { bg: 'bg-apple', icon: '📦', iconStyle: 'font-size:18rpx;', name: '苹果盒子' },
      { bg: 'bg-blackberry', icon: '🎮', iconStyle: 'font-size:16rpx;', name: '小游戏机' },
      { bg: 'bg-blackberry', icon: '🕹️', iconStyle: 'font-size:16rpx;', name: '大游戏机' },
      { bg: 'bg-blackberry', icon: '🗺️', iconStyle: 'font-size:18rpx;', name: '汽车导航' },
      { bg: 'bg-blackberry', icon: '🔍', iconStyle: 'font-size:18rpx;', name: '扫描枪' },
      { bg: 'bg-blackberry', icon: '📺', iconStyle: 'font-size:18rpx;', name: '户户通' },
      { bg: 'bg-blackberry', icon: '📀', iconStyle: 'font-size:18rpx;', name: 'EVD、唱戏机' },
      { bg: 'bg-apple', icon: '🎵', iconStyle: 'font-size:18rpx;', name: 'ipod系列' },
      { bg: 'bg-blackberry', icon: '🍽️', iconStyle: 'font-size:16rpx;', name: '美团点餐机' },
      { bg: 'bg-hisense', icon: '📶', iconStyle: 'font-size:16rpx;', name: '随身4Gwifi' },
      { bg: 'bg-blackberry', icon: '📖', iconStyle: 'font-size:14rpx;', name: '亚马逊电子书' },
      { bg: 'bg-blackberry', icon: '🖨️', iconStyle: 'font-size:16rpx;', name: '条码打印机' }
    ],

    difficultBrands: [
      { bg: 'bg-huawei', icon: '📱', name: '华为', hasUpdate: false },
      { bg: 'bg-vivo', icon: 'V', name: 'VIVO', hasUpdate: false },
      { bg: 'bg-oppo', icon: 'O', name: 'OPPO', hasUpdate: false },
      { bg: 'bg-realme', icon: 'R', name: 'realme', hasUpdate: false },
      { bg: 'bg-xiaomi', icon: 'mi', name: '小米', hasUpdate: false },
      { bg: 'bg-apple', icon: '🍎', name: '苹果', hasUpdate: false },
      { bg: 'bg-samsung', icon: 'S', name: '三星', hasUpdate: false },
      { bg: 'bg-oneplus', icon: '1+', name: '一加', hasUpdate: false },
      { bg: 'bg-nokia', icon: 'N', name: '诺基亚', hasUpdate: false },
      { bg: 'bg-jinli', icon: 'G', name: '金立', hasUpdate: false },
      { bg: 'bg-meitu', icon: 'M', name: '美图', hasUpdate: false },
      { bg: 'bg-meizu', icon: 'M', name: '魅族', hasUpdate: false },
      { bg: 'bg-nubia', icon: 'n', name: '努比亚', hasUpdate: false },
      { bg: 'bg-360', icon: '+', name: '360', hasUpdate: false },
      { bg: 'bg-smartisan', icon: 'T', name: '锤子', hasUpdate: false },
      { bg: 'bg-zte', icon: 'Z', name: '中兴', hasUpdate: false },
      { bg: 'bg-coolpad', icon: 'C', name: '酷派', hasUpdate: false },
      { bg: 'bg-lenovo', icon: 'L', name: '联想', hasUpdate: false },
      { bg: 'bg-htc', icon: 'H', name: 'HTC', hasUpdate: false },
      { bg: 'bg-blackberry', icon: '●●●', name: '黑莓', hasUpdate: false },
      { bg: 'bg-sugar', icon: 'S', name: '糖果/国美', hasUpdate: false },
      { bg: 'bg-hisense', icon: 'H', name: '海信', hasUpdate: false },
      { bg: 'bg-doov', icon: 'D', name: '朵唯', hasUpdate: true },
      { bg: 'bg-8848', icon: '8848', name: '8848', hasUpdate: false }
    ],

    goodPhoneBrands: [
      { bg: 'bg-apple', icon: '🍎', name: '苹果有保' },
      { bg: 'bg-apple', icon: '🍎', name: '苹果无保' },
      { bg: 'bg-huawei', icon: 'HW', name: '华为旗舰' },
      { bg: 'bg-huawei', icon: 'HW', name: '华为' },
      { bg: 'bg-realme', icon: 'R', name: '真我/realme' },
      { bg: 'bg-oppo', icon: 'OP', name: 'OPPO' },
      { bg: 'bg-vivo', icon: 'iQ', iconStyle: 'font-size:20rpx;', name: 'iQOO' },
      { bg: 'bg-vivo', icon: 'V', name: 'VIVO' }
    ],

    liquorBrands: [
      { bg: 'bg-sugar', icon: '茅台', iconStyle: 'font-size:20rpx;', name: '常见茅台' },
      { bg: 'bg-sugar', icon: '茅台', iconStyle: 'font-size:20rpx;', name: '历年茅台' },
      { bg: 'bg-sugar', icon: '茅台', iconStyle: 'font-size:20rpx;', name: '生肖茅台' },
      { bg: 'bg-sugar', icon: '国产', iconStyle: 'font-size:18rpx;', name: '国产名酒' },
      { bg: 'bg-sugar', icon: '洋酒', iconStyle: 'font-size:18rpx;', name: '品牌洋酒' },
      { bg: 'bg-sugar', icon: '威士忌', iconStyle: 'font-size:16rpx;', name: '洋酒威士忌' }
    ],

    searchTimer: null
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight, online: app.getNetworkStatus ? app.getNetworkStatus() : true })
    this.init()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'home' })
    }
  },

  onHide() {
    this.stopAnnouncementRotation()
    this.stopBannerRotation()
  },

  onUnload() {
    this.stopAnnouncementRotation()
    this.stopBannerRotation()
  },

  onPullDownRefresh() {
    this.init()
  },

  onPageScroll(e) {
    this.setData({ showBackTop: e.scrollTop > 600 })
  },

  init() {
    this.setData({ loading: true, networkError: false })
    this.waitForLogin().then(() => {
      this.fetchHomeData().then(() => {
        this.setData({ loading: false })
        this.startBannerRotation()
        this.startAnnouncementRotation()
      }).catch(() => {
        this.setData({ loading: false, networkError: true })
      })
    }).catch(() => {
      this.setData({ loading: false, networkError: true })
    })
    wx.stopPullDownRefresh()
  },

  waitForLogin() {
    return new Promise((resolve) => {
      const check = () => {
        const token = wx.getStorageSync('token')
        if (token) return resolve()
        if (this._loginCheckCount === undefined) this._loginCheckCount = 0
        if (this._loginCheckCount++ > 25) return resolve()
        setTimeout(check, 200)
      }
      check()
    })
  },

  async fetchHomeData() {
    try {
      const [bannerRes, announceRes, storeRes, videoRes, catRes] = await Promise.all([
        this.fetchBanners(),
        this.fetchAnnouncements(),
        this.fetchStores(),
        this.fetchVideos('查看报价'),
        this.fetchCategories()
      ])
      this.setData({ banners: bannerRes, announcements: announceRes })

      if (announceRes.length > 0) {
        this.setData({
          displayAnnouncements: announceRes.map(a => ({
            title: a.title,
            time: this.formatTimeAgo(a.created_at || a.createTime)
          }))
        })
      } else {
        this.setData({
          displayAnnouncements: [
            { title: '东莞东城 冯先生 门店批量 收益8500元', time: '135分钟前' }
          ]
        })
      }

      if (storeRes.length > 0) {
        this.setData({ storesData: storeRes })
        this.processStore(storeRes)
      } else {
        this.setData({ storeInfo: STORE.DEFAULT_STORE })
      }

      if (catRes.length > 0) {
        const catTabs = catRes.map(c => c.name)
        this.setData({ categories: catRes, categoryTabs: catTabs })
        this.fetchCategoryBrands()
      }

      this.fetchHotPrices()
    } catch (e) {
      console.error('首页数据加载失败:', e)
    }
  },

  fetchBanners() {
    return new Promise(resolve => {
      contentApi.getBanners().then(res => {
        resolve(res.data || [])
      }).catch(() => resolve([]))
    })
  },

  fetchAnnouncements() {
    return new Promise(resolve => {
      contentApi.getAnnouncements({ pageSize: 5 }).then(res => {
        const list = res.data?.list || res.data || []
        resolve(Array.isArray(list) ? list : [])
      }).catch(() => resolve([]))
    })
  },

  fetchStores() {
    return new Promise(resolve => {
      contentApi.getStores().then(res => {
        resolve(res.data || [])
      }).catch(() => resolve([]))
    })
  },

  fetchCategories() {
    return new Promise(resolve => {
      categoryApi.getCategories().then(res => {
        const cats = res.data || []
        resolve(Array.isArray(cats) ? cats : [])
      }).catch(() => resolve([]))
    })
  },

  processStore(stores) {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        let nearest = null
        let minDist = Infinity
        stores.forEach(s => {
          if (s.latitude && s.longitude) {
            const dist = this.haversineDistance(res.latitude, res.longitude, Number(s.latitude), Number(s.longitude))
            if (dist < minDist) { minDist = dist; nearest = { ...s, distance: dist.toFixed(2) } }
          }
        })
        this.setData({ storeInfo: nearest || stores[0] })
      },
      fail: () => { this.setData({ storeInfo: stores[0] || null }) }
    })
  },

  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  fetchCategoryBrands() {
    const cats = this.data.categories
    if (cats.length === 0) return
    const cat = cats[this.data.activeCategory] || cats[0]
    if (!cat) return
    this.setData({ brandsLoading: true, currentCategorySection: { id: cat.id, name: cat.name, code: cat.code || '' } })
    console.log(this.data.currentCategorySection,this.data.currentBrands)
    if (cat.Brands && cat.Brands.length > 0) {
      const brands = cat.Brands.map(b => ({
        id: b.id, name: b.name,
        bg_color: b.bg_color || 'bg-apple',
        icon_text: b.icon_text || (b.name ? b.name.substring(0, 2) : ''),
        icon_style: b.icon_style ? 'font-size:' + b.icon_style : '',
        has_update: b.has_update
      }))
      this.setData({ currentBrands: brands, brandsLoading: false })
    } else {
      categoryApi.getCategoryBrands(cat.id).then(res => {
        const brands = (res.data || res || []).map(b => ({
          id: b.id, name: b.name,
          bg_color: b.bg_color || 'bg-apple',
          icon_text: b.icon_text || (b.name ? b.name.substring(0, 2) : ''),
          icon_style: b.icon_style ? 'font-size:' + b.icon_style : '',
          has_update: b.has_update
        }))
        this.setData({ currentBrands: brands, brandsLoading: false })
      }).catch(() => {
        this.setData({ currentBrands: [], brandsLoading: false })
      })
    }
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeCategory: index })
    this.fetchCategoryBrands()
  },

  fetchVideos(category) {
    return new Promise(resolve => {
      contentApi.getVideos(category).then(res => {
        const videoData = res.data || res || []
        const videos = videoData.map(v => ({
          id: v.id, title: v.title || v.name,
          cover_image: v.cover_image || v.cover || '',
          video_url: v.video_url || v.url,
          category: v.category || v.categoryId || v.category_id || '',
          categoryId: v.categoryId || v.category_id || v.category || '',
          duration: v.duration || 0
        }))
        const finalVideos = videos.length > 0 ? videos : [
          { id: 1, title: '暂无数据', cover_image: '', category: '查看报价' },
          // { id: 2, title: '报价单查看教程', cover_image: '', category: '实用功能' },
          // { id: 3, title: '如何下单回收手机', cover_image: '', category: '下单相关' },
          // { id: 4, title: '回收收入提现指南', cover_image: '', category: '收入相关' }
        ]
        this.setData({ videos: finalVideos, filteredVideos: finalVideos })
        resolve(finalVideos)
      }).catch(() => {
        const fallback = [
          { id: 1, title: '华为手机查询报价教程', cover_image: '', category: '查看报价' },
          { id: 2, title: '报价单查看教程', cover_image: '', category: '实用功能' },
          { id: 3, title: '如何下单回收手机', cover_image: '', category: '下单相关' },
          { id: 4, title: '回收收入提现指南', cover_image: '', category: '收入相关' }
        ]
        this.setData({ videos: fallback, filteredVideos: fallback })
        resolve(fallback)
      })
    })
  },

  switchVideoTab(e) {
    const tabId = parseInt(e.currentTarget.dataset.index)
    const { videoTabs } = this.data
    const category = videoTabs[tabId]
    this.setData({ activeVideoTab: tabId })
    this.fetchVideos(category)
  },

  onVideoTap(e) {
    const video = this.data.filteredVideos[e.currentTarget.dataset.index]
    if (video && video.id) {
      wx.navigateTo({ url: `/pages/video-play/video-play?url=${encodeURIComponent(video.video_url || '')}&title=${encodeURIComponent(video.title || '')}&category=${encodeURIComponent(video.category || '')}` })
    }
  },

  fetchHotPrices() {
    priceApi.getTodayPrices({ page: 1, pageSize: 20 }).then(res => {
      const data = res.data || res || {}
      const rawList = data.list || []
      const list = rawList.slice(0, 20).map(item => {
        const prices = {}
        if (item.Prices && item.Prices.length > 0) {
          item.Prices.forEach(p => {
            if (p.Condition && p.Condition.code) {
              prices[p.Condition.code] = p.price
            }
          })
        }
        const maxPrice = item.Prices && item.Prices.length > 0
          ? Math.max(...item.Prices.map(p => parseFloat(p.price) || 0))
          : 0
        return {
          id: item.id,
          brand: item.Brand ? item.Brand.name : '',
          model: item.model_code || item.name || '',
          maxPrice: maxPrice > 0 ? '¥' + maxPrice.toFixed(0) : ''
        }
      }).filter(item => item.maxPrice)
      this.setData({ hotPriceList: list, priceLoading: false })
    }).catch(() => { this.setData({ hotPriceList: [], priceLoading: false }) })
  },

  onSearchInput(e) {
    this.clearSearchTimer()
    this.data.searchKeyword = e.detail.value
    this.data.searchTimer = setTimeout(() => { this.handleSearch() }, 800)
  },

  handleSearch() {
    const keyword = (this.data.searchKeyword || '').trim()
    if (!keyword) return
    this.clearSearchTimer()
    searchApi.search({ keyword }).then(res => {
      const results = res.data || res || []
      if (results.length > 0) {
        wx.navigateTo({ url: '/pages/brand-list/brand-list?keyword=' + encodeURIComponent(keyword) })
      } else {
        this.showToast('未找到相关结果')
      }
    }).catch(() => {
      wx.navigateTo({ url: '/pages/brand-list/brand-list?keyword=' + encodeURIComponent(keyword) })
    })
  },

  clearSearchTimer() {
    if (this.data.searchTimer) { clearTimeout(this.data.searchTimer); this.data.searchTimer = null }
  },

  goToBrandList(e) {
    let brandId = ''
    let brandName = ''
    if (e && e.currentTarget && e.currentTarget.dataset) {
      brandId = e.currentTarget.dataset.id || ''
      brandName = e.currentTarget.dataset.name || ''
    }
    if (brandId) {
      wx.navigateTo({ url: '/pages/price-quote/price-quote?brandId=' + brandId + '&title=' + encodeURIComponent(brandName) })
    } else {
      wx.switchTab({ url: '/pages/brand-list/brand-list' })
    }
  },

  onBrandTap(e) {
    const id = e ? e.currentTarget.dataset.id : ''
    const name = e ? e.currentTarget.dataset.name : ''
    if (id) {
      wx.navigateTo({ url: '/pages/price-quote/price-quote?brandId=' + id + '&title=' + encodeURIComponent(name || '') })
    } else {
      wx.switchTab({ url: '/pages/brand-list/brand-list' })
    }
  },

  goToScanPrice() { wx.switchTab({ url: '/pages/scan-price/scan-price' }) },
  goToInvite() { wx.navigateTo({ url: '/pages/invite-friends/invite-friends' }) },
  goToPriceQuote() { wx.navigateTo({ url: '/pages/price-quote/price-quote' }) },
  goToVideoList() { wx.navigateTo({ url: '/pages/video-list/video-list' }) },
  goToRecyclingProcess() { wx.navigateTo({ url: '/pages/recycling-process/recycling-process' }) },

  makePhoneCall(e) {
    const phone = e.currentTarget.dataset.phone || this.data.storeInfo.phone || this.data.storeInfo.contact_phone || ''
    if (!phone) { this.showToast('暂无联系电话'); return }
    wx.makePhoneCall({ phoneNumber: phone })
  },

  copyWechat(e) {
    const wxid = e ? (e.currentTarget.dataset.wxid || '') : (this.data.storeInfo ? (this.data.storeInfo.wechat || CONTACT.WECHAT_ID) : CONTACT.WECHAT_ID)
    if (!wxid) { this.showToast('暂无内容'); return }
    wx.setClipboardData({ data: wxid, success: () => this.showToast('微信号已复制') })
  },

  openLocation() {
    const s = this.data.storeInfo
    if (!s) { this.showToast('暂无门店信息'); return }
    wx.openLocation({
      latitude: s.latitude ? Number(s.latitude) : STORE.DEFAULT_STORE.latitude,
      longitude: s.longitude ? Number(s.longitude) : STORE.DEFAULT_STORE.longitude,
      name: s.name || '数码回收网废旧手机回收中心',
      address: (s.province || '') + (s.city || '') + (s.district || '') + (s.address || '')
    })
  },

  goToStoreList() {
    const s = this.data.storeInfo
    if (s && s.latitude && s.longitude) { this.openLocation() }
    else { this.showToast('暂无门店信息') }
  },

  scrollToTop() { wx.pageScrollTo({ scrollTop: 0, duration: 300 }) },

  showToast(msg) {
    this.setData({ toastVisible: true, toastMsg: msg })
    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => { this.setData({ toastVisible: false }) }, 2000)
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return minutes + '分钟前'
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return hours + '小时前'
    return Math.floor(hours / 24) + '天前'
  },

  onBannerChange(e) { this.setData({ bannerCurrent: e.detail.current }) },

  startBannerRotation() {
    this.stopBannerRotation()
    const total = this.data.banners.length || 3
    if (total <= 1) return
    this.data.bannerTimer = setInterval(() => {
      this.setData({ bannerCurrent: (this.data.bannerCurrent + 1) % total })
    }, 3000)
  },

  stopBannerRotation() {
    if (this.data.bannerTimer) { clearInterval(this.data.bannerTimer); this.data.bannerTimer = null }
  },

  startAnnouncementRotation() {
    this.stopAnnouncementRotation()
    const list = this.data.displayAnnouncements
    if (list.length <= 1) return
    this.data.announcementTimer = setInterval(() => {
      this.setData({ currentAnnouncementIndex: (this.data.currentAnnouncementIndex + 1) % list.length })
    }, 3000)
  },

  stopAnnouncementRotation() {
    if (this.data.announcementTimer) { clearInterval(this.data.announcementTimer); this.data.announcementTimer = null }
  }
})
