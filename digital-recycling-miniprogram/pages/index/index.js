const app = getApp()
const { contentApi, categoryApi, priceApi, searchApi, userApi, placesApi } = require('../../utils/api-modules')
const { haversineDistance } = require('../../utils/distance')
const { CONTACT, STORE } = require('../../utils/constants')

Page({
  data: {
    statusBarHeight: 0,
    banners: [],
    announcements: [],
    storesData: [],
    storeInfo: null,
    showDevTestBar: true,
    devTestResult: '',
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

    showLocationSheet: false,
    locationAgreed: false,
    locationSheetChecked: false,
    locationPrompted: false,

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
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ activeTab: 'home' })
    }
    // 无论登录与否，进入首页都请求定位（除非本次会话内已提示过）
    const prompted = wx.getStorageSync('location_prompt_done')
    const token = wx.getStorageSync('token')
    if (!prompted) {
      this.requestLocationPermission()
    } else if (!token) {
      this.navigateToLogin()
    } else {
      this.loadHomeData()
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
    this.fetchHomeData().then(() => {
      this.setData({ loading: false })
      this.startBannerRotation()
      this.startAnnouncementRotation()
    }).catch(() => {
      this.setData({ loading: false, networkError: true })
    })
    wx.stopPullDownRefresh()
  },

  loadHomeData() {
    this.setData({ loading: true, networkError: false })
    this.fetchHomeData().then(() => {
      this.setData({ loading: false })
      this.startBannerRotation()
      this.startAnnouncementRotation()
    }).catch(() => {
      this.setData({ loading: false, networkError: true })
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
        // 关键：先读 lat/lng 缓存，再传给 processStore（同步算距离）
        const cachedLat = app.globalData.latitude
        const cachedLng = app.globalData.longitude
        this.processStore(storeRes, cachedLat, cachedLng)
        // 异步增强：腾讯地图驾车矩阵（失败也无害）
        if (typeof cachedLat === 'number' && typeof cachedLng === 'number') {
          this._fetchNearbyStores(cachedLat, cachedLng)
        }
      } else {
        this.setData({ storeInfo: STORE.DEFAULT_STORE })
        const cachedLat = app.globalData.latitude
        const cachedLng = app.globalData.longitude
        if (typeof cachedLat === 'number' && typeof cachedLng === 'number') {
          this._fetchNearbyStores(cachedLat, cachedLng)
        }
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
        const list = (res.data || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        resolve(list)
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

  processStore(stores, lat, lng) {
    if (!stores || stores.length === 0) {
      this.setData({ storeInfo: null })
      return
    }

    const hasLocation = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)

    if (!hasLocation) {
      const fallback = { ...stores[0] }
      delete fallback.distance
      this.setData({ storeInfo: fallback })
      return
    }

    let nearest = null
    let minDist = Infinity
    stores.forEach(s => {
      if (s.latitude && s.longitude) {
        const dist = haversineDistance(lat, lng, Number(s.latitude), Number(s.longitude))
        if (dist < minDist) {
          minDist = dist
          nearest = { ...s, distance: dist.toFixed(2) }
        }
      }
    })

    if (nearest) {
      this.setData({ storeInfo: nearest })
    } else {
      const fallback = { ...stores[0] }
      delete fallback.distance
      this.setData({ storeInfo: fallback })
    }
  },

  requestStoreLocation(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return
    this._fetchNearbyStores(lat, lng)
  },

  _fetchNearbyStores(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return

    const apply = (item, source) => {
      if (!item) return false
      const distMeters = typeof item.distance === 'number' ? item.distance : null
      const distanceKm = distMeters !== null ? Number((distMeters / 1000).toFixed(2)) : null
      const storeInfo = {
        id: item.id,
        name: item.name || item.title,
        title: item.title || item.name,
        address: item.address,
        tel: item.phone || item.tel || item.contact_phone,
        phone: item.phone || item.tel || item.contact_phone,
        contact_name: item.contact_name,
        wechat: item.wechat,
        latitude: typeof item.latitude === 'number' ? item.latitude : parseFloat(item.latitude),
        longitude: typeof item.longitude === 'number' ? item.longitude : parseFloat(item.longitude),
        distance: distanceKm,
        distanceRaw: distMeters,
        duration: item.duration,
        source: source || 'qqmap:matrix',
        nearbyList: undefined
      }
      this.setData({ storeInfo })
      console.log('[home] nearby ->', {
        source,
        nearestTitle: storeInfo.name,
        distanceKm,
        distanceRaw: distMeters
      })
      return true
    }

    // 前端 haversine 兜底：当后端 list 全部 distance 为 null 时（腾讯地图驾车矩阵失败），
    // 用 haversineDistance 重新算直线距离（km），按距离升序排序
    const haversineFallback = (list) => {
      if (!Array.isArray(list) || list.length === 0) return null
      const withCoords = []
      const withoutCoords = []
      list.forEach(item => {
        const latNum = typeof item.latitude === 'number' ? item.latitude : parseFloat(item.latitude)
        const lngNum = typeof item.longitude === 'number' ? item.longitude : parseFloat(item.longitude)
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          const distKm = Number(haversineDistance(lat, lng, latNum, lngNum).toFixed(2))
          withCoords.push({ ...item, distance: distKm, distanceRaw: distKm * 1000, source: 'haversine:fallback' })
        } else {
          withoutCoords.push({ ...item, distance: null, distanceRaw: null })
        }
      })
      withCoords.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      const sorted = withCoords.concat(withoutCoords)
      if (withCoords.length === 0) {
        // 所有门店都无坐标，走本地 fallback
        console.log('[home] nearest-fallback ->', { reason: 'all_distance_null', candidateCount: 0, nearestDistance: null })
        this._fallbackStoreToLocal()
        return true
      }
      console.log('[home] nearest-fallback ->', { reason: 'all_distance_null', candidateCount: withCoords.length, nearestDistance: withCoords[0].distance })
      return apply(sorted[0], 'haversine:fallback')
    }

    // 1) 优先调后端腾讯地图距离矩阵 API（驾车距离）
    placesApi.getNearestStore({ lat, lng, mode: 'driving' }).then((res) => {
      const payload = (res && res.data) || res || {}
      const list = Array.isArray(payload.list) ? payload.list : []
      const source = payload.source || 'qqmap:matrix'
      console.log('[home] nearest-store ->', { source, listLength: list.length, first: list[0] ? { title: list[0].name, distance: list[0].distance } : null })
      if (list.length > 0) {
        // 检测：list 全部 distance 为 null → 腾讯地图驾车距离不可用，前端 haversine 兜底
        const allNull = list.every(item => item == null || item.distance == null || typeof item.distance !== 'number')
        if (allNull) {
          haversineFallback(list)
          return
        }
        apply(list[0], source)
        return
      }
      // 2) 兜底到旧的 nearby-by-stores（基于 stores 名称搜腾讯地图 POI）
      this._fallbackToNearbyByStores(lat, lng, apply)
    }).catch((err) => {
      console.warn('[home] getNearestStore failed', err)
      this._fallbackToNearbyByStores(lat, lng, apply)
    })
  },

  _fallbackToNearbyByStores(lat, lng, apply) {
    const stores = this.data.storesData || []
    const storeKeywords = stores.map(s => s && (s.name || s.title)).filter(Boolean)

    if (storeKeywords.length === 0) {
      // storesData 为空：用通用关键字 "回收"
      placesApi.getNearby({ lat, lng, keyword: '回收', radius: 5000, limit: 20 }).then((res) => {
        const payload = (res && res.data) || res || {}
        const list = Array.isArray(payload.list) ? payload.list : []
        if (list.length > 0) {
          apply(list[0], 'qqmap:回收')
          return
        }
        this._fallbackStoreToLocal()
      }).catch(() => this._fallbackStoreToLocal())
      return
    }

    placesApi.getNearbyByStores({ lat, lng, stores, radius: 5000, limit: 20 }).then((res) => {
      const payload = (res && res.data) || res || {}
      const list = Array.isArray(payload.list) ? payload.list : []
      if (list.length > 0) {
        apply(list[0], 'qqmap:stores')
        return
      }
      this._fallbackStoreToLocal()
    }).catch(() => this._fallbackStoreToLocal())
  },

  _fallbackStoreToLocal() {
    const stores = this.data.storesData
    if (stores && stores.length > 0) {
      // 保留 stores[0].distance（如果之前 processStore 已用 haversine 写入）
      // 不再 delete fallback.distance，避免误伤
      this.setData({ storeInfo: { ...stores[0] } })
    } else if (STORE.DEFAULT_STORE) {
      this.setData({ storeInfo: { ...STORE.DEFAULT_STORE } })
    }
  },

  /**
   * 开发测试：手动触发 wx.getLocation
   * 只读探针：不写 app.globalData、不触发 _fetchNearbyStores / requestStoreLocation、不污染 storeInfo
   * 修复点：complete 回调 + 10秒安全超时 + 隐私协议先检查（覆盖 wx.getLocation 不会触发 success/fail 的场景）
   */
  onDevTestGetLocation() {
    // 1) 取消旧 timer，避免多次点击多个 timer 打架
    if (this._devTestTimeout) {
      clearTimeout(this._devTestTimeout)
      this._devTestTimeout = null
    }
    // 2) 防御性 hideLoading：万一上次 loading 卡住，先清掉
    wx.hideLoading()
    // 3) 清空旧摘要
    this.setData({ devTestResult: '' })
    // 4) 显示新的 loading
    wx.showLoading({ title: '定位中...', mask: true })

    // 5) 隐私协议先检查（仅当 app.json 开了 __usePrivacyCheck__ 且 API 可用）
    if (typeof wx.requirePrivacyAuthorize === 'function') {
      wx.requirePrivacyAuthorize({
        success: () => {
          // 用户已同意隐私协议 → 进入定位
          this._devTestDoGetLocation()
        },
        fail: () => {
          // 用户拒绝隐私协议 → 立即收起 loading + 提示
          wx.hideLoading()
          this.setData({ devTestResult: '失败: 用户拒绝隐私协议' })
          console.warn('[dev-test] requirePrivacyAuthorize fail')
          wx.showModal({
            title: '需要隐私协议',
            content: '请先同意《小程序用户隐私保护指引》后再测试位置。',
            confirmText: '我知道了',
            showCancel: false
          })
        }
      })
    } else {
      // 旧版基础库：无 requirePrivacyAuthorize API → 直接走定位
      this._devTestDoGetLocation()
    }
  },

  /**
   * 实际调用 wx.getLocation
   * 必须提供 success / fail / complete 三回调；complete 兜底 hideLoading
   * 启动 10 秒安全超时，防止 complete 也不触发的极端情况
   */
  _devTestDoGetLocation() {
    // 启动 10 秒兜底 timer
    this._devTestTimeout = setTimeout(() => {
      this._devTestTimeout = null
      wx.hideLoading()
      // 仅当 success/fail 都没触发（devTestResult 仍空）时弹超时
      if (!this.data.devTestResult) {
        this.setData({ devTestResult: '超时: wx.getLocation 10秒未响应' })
        console.warn('[dev-test] getLocation timeout ->', { reason: 'no callback in 10s' })
        wx.showModal({
          title: '位置超时',
          content: 'wx.getLocation 10秒未返回任何回调。\n可能原因：\n1. 隐私协议未接受\n2. 系统位置授权未开启\n3. 微信位置服务被禁用',
          confirmText: '我知道了',
          showCancel: false
        })
      }
    }, 10000)

    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const summary = `lat=${(res.latitude || 0).toFixed(6)}, lng=${(res.longitude || 0).toFixed(6)}, acc=${res.accuracy || 0}m`
        this.setData({ devTestResult: summary })
        console.log('[dev-test] getLocation success ->', res)
        wx.showModal({
          title: '位置成功',
          content: `latitude: ${res.latitude}\nlongitude: ${res.longitude}\naccuracy: ${res.accuracy}m\nspeed: ${res.speed || '-'}\naltitude: ${res.altitude || '-'}\nerrMsg: ${res.errMsg}`,
          confirmText: '复制 lat,lng',
          cancelText: '关闭',
          success: (modalRes) => {
            if (modalRes.confirm) {
              wx.setClipboardData({
                data: `${res.latitude},${res.longitude}`,
                success: () => {
                  wx.showToast({ title: '已复制', icon: 'success' })
                }
              })
            }
          }
        })
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || '未知错误'
        this.setData({ devTestResult: `失败: ${errMsg}` })
        console.warn('[dev-test] getLocation fail ->', err)
        wx.showModal({
          title: '位置失败',
          content: `errMsg: ${errMsg}\n\n（测试按钮不会写入 app.globalData，也不会触发 _fetchNearbyStores）`,
          confirmText: '我知道了',
          showCancel: false
        })
      },
      complete: () => {
        // 关键：complete 永远会触发（success / fail / 异常路径之后）→ 确保 loading 一定消失
        if (this._devTestTimeout) {
          clearTimeout(this._devTestTimeout)
          this._devTestTimeout = null
        }
        wx.hideLoading()
        console.log('[dev-test] getLocation complete -> loading hidden')
      }
    })
  },

  fetchCategoryBrands() {
    const cats = this.data.categories
    if (cats.length === 0) return
    const cat = cats[this.data.activeCategory] || cats[0]
    if (!cat) return
    this.setData({ brandsLoading: true, currentCategorySection: { id: cat.id, name: cat.name, code: cat.code || '' } })
    console.log(this.data.currentCategorySection,this.data.currentBrands)
    if (cat.Brands && cat.Brands.length > 0) {
      const sorted = [...cat.Brands].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const brands = sorted.map(b => ({
        id: b.id, name: b.name,
        bg_color: b.bg_color || 'bg-apple',
        icon_text: b.icon_text || (b.name ? b.name.substring(0, 2) : ''),
        icon_style: b.icon_style ? 'font-size:' + b.icon_style : '',
        has_update: b.has_update
      }))
      this.setData({ currentBrands: brands, brandsLoading: false })
    } else {
      categoryApi.getCategoryBrands(cat.id).then(res => {
        const raw = res.data || res || []
        const sorted = [...raw].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        const brands = sorted.map(b => ({
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
      this.requireLogin('/pages/price-quote/price-quote?brandId=' + brandId + '&title=' + encodeURIComponent(brandName))
    } else {
      wx.switchTab({ url: '/pages/brand-list/brand-list' })
    }
  },

  onBrandTap(e) {
    const id = e ? e.currentTarget.dataset.id : ''
    const name = e ? e.currentTarget.dataset.name : ''
    if (id) {
      this.requireLogin('/pages/price-quote/price-quote?brandId=' + id + '&title=' + encodeURIComponent(name || ''))
    } else {
      wx.switchTab({ url: '/pages/brand-list/brand-list' })
    }
  },

  goToScanPrice() { wx.switchTab({ url: '/pages/scan-price/scan-price' }) },
  goToInvite() { wx.navigateTo({ url: '/pages/invite-friends/invite-friends' }) },
  goToPriceQuote() { this._precheckQuoteAndNavigate('/pages/price-quote/price-quote') },
  goToVideoList() { wx.navigateTo({ url: '/pages/video-list/video-list' }) },
  goToRecyclingProcess() { wx.navigateTo({ url: '/pages/recycling-process/recycling-process' }) },

  _precheckQuoteAndNavigate(targetUrl) {
    const token = wx.getStorageSync('token')
    if (!token) {
      this.requireLogin(targetUrl)
      return
    }
    userApi.getProfile().then((res) => {
      const profile = (res && res.data) || res || {}
      const isVip = !!profile.isVip
      const quoteRemaining = parseInt(profile.quoteRemaining) || 0
      const quoteDailyRemaining = parseInt(profile.quoteDailyRemaining) || 0

      if (isVip || quoteRemaining > 0 || quoteDailyRemaining > 0) {
        wx.navigateTo({ url: targetUrl })
        return
      }

      wx.showModal({
        title: '提示',
        content: '查看该报价单需要开通报价会员，您未开通会员或者会员已到期，请开通',
        confirmText: '开通会员',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            wx.navigateTo({
              url: '/pages/membership/membership?redirect=' + encodeURIComponent(targetUrl)
            })
          }
        }
      })
    }).catch(() => {
      this.requireLogin(targetUrl)
    })
  },

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
    const lat = Number(s.latitude)
    const lng = Number(s.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      this.showToast('门店坐标未设置，暂时无法导航')
      return
    }
    const fullAddress = [s.province, s.city, s.district, s.address]
      .filter(Boolean)
      .map(p => String(p).trim())
      .filter(Boolean)
      .join('')
    wx.openLocation({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      name: s.name || s.title || '回收门店',
      address: fullAddress || s.address || '',
      scale: 16
    })
  },

  goToStoreList() {
    wx.navigateTo({ url: '/pages/store-list/store-list' })
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
  },

  checkPermissionSheets() {
    const token = wx.getStorageSync('token')
    if (!token) {
      setTimeout(() => this.requestLocationPermission(), 1000)
    }
  },

  requestLocationPermission() {
    const token = wx.getStorageSync('token')
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          this.fetchLocationAndStores()
          if (!token) this.navigateToLogin()
          else this.loadHomeData()
        } else {
          // 未授权 / 曾经拒绝 → 显示自定义隐私授权弹窗
          this.setData({ showLocationSheet: true, locationPrompted: true })
        }
      },
      fail: () => {
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      }
    })
  },

  askForLocationPermission() {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        this.fetchLocationAndStores()
        wx.setStorageSync('location_prompt_done', true)
      },
      fail: (err) => {
        const errMsg = err.errMsg || ''
        if (errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF') || errMsg.includes('system permission denied') || errMsg.includes('location unavailable')) {
          this._showLocationServiceModal()
        }
        wx.setStorageSync('location_prompt_done', true)
        const token = wx.getStorageSync('token')
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      }
    })
  },

  _showLocationServiceModal() {
    wx.showModal({
      title: '定位服务未开启',
      content: '手机定位服务未开启，无法为您展示离您最近的门店。请前往系统设置开启定位服务后重试。',
      confirmText: '去开启',
      cancelText: '取消',
      success: (modalRes) => {
        if (modalRes.confirm) {
          if (typeof wx.openAppAuthorizeSetting === 'function') {
            wx.openAppAuthorizeSetting()
          } else if (typeof wx.openSetting === 'function') {
            wx.openSetting()
          } else {
            this.showToast('请在系统设置中开启定位')
          }
        }
      }
    })
  },

  fetchLocationAndStores() {
    const app = getApp()
    wx.getLocation({
      type: 'gcj02',
      success: (locationRes) => {
        const latitude = locationRes.latitude
        const longitude = locationRes.longitude
        app.globalData.latitude = latitude
        app.globalData.longitude = longitude
        wx.setStorageSync('location_permission_done', true)
        this.requestStoreLocation(latitude, longitude)
        // 同步重算 processStore：保证 storeInfo 立即有距离（不依赖异步后端）
        if (this.data.storesData && this.data.storesData.length > 0) {
          this.processStore(this.data.storesData, latitude, longitude)
        } else {
          this.setData({ storeInfo: STORE.DEFAULT_STORE })
        }
        const token = wx.getStorageSync('token')
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      },
      fail: () => {
        // 统一提示开启手机定位服务（不再依赖具体 errMsg 关键字）
        this._showLocationServiceModal()
        wx.setStorageSync('location_prompt_done', true)
        const token = wx.getStorageSync('token')
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      }
    })
  },

  navigateToLogin() {
    wx.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/index/index') })
  },

  toggleLocationCheck() {
    this.setData({ locationSheetChecked: !this.data.locationSheetChecked })
  },

  onLocationDeny() {
    this.setData({ showLocationSheet: false, locationAgreed: false, locationSheetChecked: false })
    wx.setStorageSync('location_prompt_done', true)
    wx.setStorageSync('location_permission_done', true)
    const token = wx.getStorageSync('token')
    if (!token) this.navigateToLogin()
    else this.loadHomeData()
  },

  onLocationAllow() {
    if (!this.data.locationSheetChecked) {
      this.showToast('请先勾选并阅读隐私协议')
      return
    }
    this.setData({ showLocationSheet: false, locationAgreed: true })
    wx.setStorageSync('location_prompt_done', true)
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        this.fetchLocationAndStores()
        const token = wx.getStorageSync('token')
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      },
      fail: (err) => {
        const errMsg = err.errMsg || ''
        if (errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF') || errMsg.includes('system permission denied') || errMsg.includes('location unavailable')) {
          this._showLocationServiceModal()
        }
        wx.setStorageSync('location_permission_done', true)
        const token = wx.getStorageSync('token')
        if (!token) this.navigateToLogin()
        else this.loadHomeData()
      }
    })
  },

  onPrivacyDeny() {
    this.setData({ showPrivacySheet: false })
    wx.setStorageSync('privacy_permission_done', true)
    wx.showToast({ title: '部分功能可能无法使用', icon: 'none' })
    const token = wx.getStorageSync('token')
    if (!token) this.navigateToLogin()
    else this.loadHomeData()
  },

  onPrivacyAgree() {
    wx.setStorageSync('privacy_permission_done', true)
    this.setData({ showPrivacySheet: false, privacyAgreed: true })
    const token = wx.getStorageSync('token')
    if (!token) this.navigateToLogin()
    else this.loadHomeData()
  },

  requireLogin(targetUrl) {
    const token = wx.getStorageSync('token')
    if (token) {
      wx.navigateTo({ url: targetUrl })
    } else {
      wx.navigateTo({ url: '/pages/membership/membership?redirect=' + encodeURIComponent(targetUrl) })
    }
  }
})
