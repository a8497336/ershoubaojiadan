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
    // 仅开发版（开发者工具预览）显示测试按钮，避免生产环境暴露
    showDevTestBar: (typeof wx.getAccountInfoSync === 'function' && wx.getAccountInfoSync().miniProgram.envVersion === 'develop') || false,
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
    showFab: true,
    _fabTimer: null,
    toastVisible: false,
    toastMsg: '',
    networkError: false,
    online: true,

    // 弹窗广告
    popupAdData: null,
    popupAdVisible: false,
    _popupAdClosedKey: 'popup_ad_closed',

    currentCategorySection: null,
    currentBrands: [],
    brandsLoading: false,

    hotPriceList: [],

    displayAnnouncements: [],
    announcementTimer: null,
    bannerTimer: null,

    // ===== 公告详情弹窗 =====
    noticeDetailVisible: false,
    noticeDetail: { id: null, title: '', content: '', time: '' },
    _announcementsCache: [],

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

    searchTimer: null,
    storeLoading: false,

    // ===== dev-test-bar 调试面板字段（参考 dom）=====
    systemInfo: '',
    sdkVersion: '',
    apiCheckText: '',
    privacyStatus: '',
    privacyStatusClass: '',
    locationResult: '',
    locationResultClass: '',
    consoleLogs: []
  },

  onLoad(options) {
    // 缓存最近一次成功获取到的用户位置（_fallbackStoreToLocal 兜底用，非 data 字段）
    this._lastUserLat = null
    this._lastUserLng = null
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      pageStyle: `--status-bar-h: ${app.globalData.statusBarHeight || 0}px;`,
      online: app.getNetworkStatus ? app.getNetworkStatus() : true
    })

    // 处理邀请码：未登录时携带 invite_code 进入登录页（不阻止首页数据加载）
    this._handleInviteCode(options)

    this._loadSystemInfoDevTest()
    this.init()
    this._autoLoadNearbyStore()
  },

  _handleInviteCode(options) {
    // 优先从分享链接的 invite_code 参数获取
    let inviteCode = options && options.invite_code

    // 扫小程序码进入：从 scene 参数解析（微信会传入 encode 后的 scene）
    if (!inviteCode && options && options.scene) {
      inviteCode = decodeURIComponent(options.scene)
    }

    if (!inviteCode) return

    const token = wx.getStorageSync('token')
    if (token) {
      // 老用户已登录，忽略邀请码
      return
    }

    // 未登录，跳转登录页并携带邀请码
    app.globalData.pendingInviteCode = inviteCode
    wx.navigateTo({
      url: `/pages/login/login?invite_code=${inviteCode}&redirect=${encodeURIComponent('/pages/index/index')}`
    })
  },

  onReady() {
    // 测量 nav-bar 实际高度（含 statusBar），用于 page-container padding-top 占位
    const query = wx.createSelectorQuery()
    query.select('.nav-bar').boundingClientRect()
    query.select('.page-container').boundingClientRect()
    query.exec((res) => {
      const navRect = res && res[0]
      const pageRect = res && res[1]
      if (!navRect || !pageRect) return
      const navH = navRect.height
      // rpx → px: 屏幕宽 / 750
      const sysInfo = wx.getSystemInfoSync()
      const rpxToPx = sysInfo.windowWidth / 750
      const navH_Rpx = Math.ceil(navH / rpxToPx)
      this.setData({
        pageStyle: `--nav-h: ${navH_Rpx}rpx; --status-bar-h: ${app.globalData.statusBarHeight || 0}px;`
      })
    })
  },

  /**
   * 进入页面(onLoad)即自动加载最近门店
   * 与原 onFindNearbyStore 核心逻辑一致,适配自动场景
   * - 隐私预检:wx.getPrivacySetting → 命中则调 wx.requirePrivacyAuthorize(弹原生弹窗)
   * - 定位:wx.getFuzzyLocation → processStore
   * - 失败兜底:STORE.DEFAULT_STORE
   * - 系统定位服务关闭:_showLocationServiceModal
   */
  _autoLoadNearbyStore() {
    if (this.data.storeLoading) return  // 防重入
    if (typeof wx.getPrivacySetting === 'function') {
      wx.getPrivacySetting({
        success: (privRes) => {
          if (privRes.needAuthorization) {
            // 隐私未同意:弹原生授权弹窗
            wx.requirePrivacyAuthorize({
              success: () => this._doFindNearbyStore(),
              fail: () => {
                // 用户拒绝隐私 → 兜底默认门店
                this.setData({ storeInfo: STORE.DEFAULT_STORE })
              }
            })
            return
          }
          this._doFindNearbyStore()
        },
        fail: () => this._doFindNearbyStore()
      })
    } else {
      // 旧版基础库:无 getPrivacySetting → 直接定位
      this._doFindNearbyStore()
    }
  },

  // ===== dev-test-bar: 加载系统信息（参考 dom _loadSystemInfo）=====
  _loadSystemInfoDevTest() {
    try {
      const sys = wx.getSystemInfoSync()
      const summary = `libVersion=${sys.SDKVersion || '-'} | model=${sys.model || '-'} | system=${sys.system || '-'} | platform=${sys.platform || '-'}`
      const apis = []
      apis.push(typeof wx.getPrivacySetting === 'function' ? 'getPrivacySetting✓' : 'getPrivacySetting✗')
      apis.push(typeof wx.requirePrivacyAuthorize === 'function' ? 'requirePrivacyAuthorize✓' : 'requirePrivacyAuthorize✗')
      apis.push(typeof wx.getFuzzyLocation === 'function' ? 'getFuzzyLocation✓' : 'getFuzzyLocation✗')
      this.setData({
        systemInfo: summary,
        sdkVersion: sys.SDKVersion || '',
        apiCheckText: apis.join(' | ')
      })
      this._logDevTest('系统信息: ' + summary, 'info')
      this._logDevTest('API 可用性: ' + apis.join(' | '), 'info')
    } catch (e) {
      this._logDevTest('getSystemInfoSync fail: ' + (e && e.message || JSON.stringify(e)), 'error')
    }
  },

  // ===== dev-test-bar: 调试日志工具（参考 dom log）=====
  // 同时输出到 console.log（vConsole 可见）+ 写入 data.consoleLogs（页面内可见）
  _logDevTest(msg, level = 'info') {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const text = `[${time}] [${level.toUpperCase()}] ${msg}`
    console.log(text)
    const logs = [{ text, level }, ...this.data.consoleLogs].slice(0, 10)
    this.setData({ consoleLogs: logs })
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar()
    if (tabBar) {
      tabBar.setData({ activeTab: 'home' })
    }
    // 首次加载由 onLoad → init 处理
    if (this._hasLoaded) {
      // 从其他页面返回：静默刷新数据（不触发 loading 覆盖，避免滚动位置丢失）
      this.fetchHomeData().then(() => {
        this.startBannerRotation()
        this.startAnnouncementRotation()
      }).catch(() => {})
      // 恢复滚动位置
      if (this._scrollTop > 0) {
        wx.pageScrollTo({ scrollTop: this._scrollTop, duration: 0 })
      }
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
    const scrollTop = e.scrollTop
    // 保存滚动位置，用于从其他页面返回时恢复
    this._scrollTop = scrollTop
    this.setData({ showBackTop: scrollTop > 600 })
    // 滚动时隐藏 FAB，停止 300ms 后再显示
    if (scrollTop > 200) {
      this.setData({ showFab: false })
      if (this.data._fabTimer) clearTimeout(this.data._fabTimer)
      this.data._fabTimer = setTimeout(() => {
        this.setData({ showFab: true })
      }, 300)
    } else {
      this.setData({ showFab: true })
    }
  },

  init() {
    this.setData({ loading: true, networkError: false })
    this.fetchHomeData().then(() => {
      this.setData({ loading: false })
      this._hasLoaded = true
      this.startBannerRotation()
      this.startAnnouncementRotation()
      // 弹窗广告加载延迟一会在数据就绪后触发
      this._tryShowPopupAd()
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
        // 缓存原始公告数据，供点击公告展示详情用
        this._announcementsCache = announceRes.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content || a.detail || a.description || '',
          time: this.formatTimeAgo(a.created_at || a.createTime)
        }))
        this.setData({
          displayAnnouncements: this._announcementsCache.map(a => ({
            id: a.id,
            title: a.title,
            time: a.time
          }))
        })
      } else {
        this._announcementsCache = []
        this.setData({
          displayAnnouncements: [
            { id: 'default', title: '东莞东城 冯先生 门店批量 收益8500元', time: '135分钟前' }
          ]
        })
      }

      if (storeRes.length > 0) {
        this.setData({ storesData: storeRes })
        // 仅当已有缓存用户位置时才计算距离并展示门店；否则保持 storeInfo=null 展示「查找附近门店」按钮
        const cachedLat = app.globalData.latitude
        const cachedLng = app.globalData.longitude
        if (typeof cachedLat === 'number' && typeof cachedLng === 'number') {
          this.processStore(storeRes, cachedLat, cachedLng)
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
      return
    }

    // 兜底：所有 store 都没 latitude/longitude 字段，尝试用 stores[0] 配合 lat/lng 算 haversine 距离
    const s0 = stores[0]
    const s0Lat = typeof s0.latitude === 'number' ? s0.latitude : parseFloat(s0.latitude)
    const s0Lng = typeof s0.longitude === 'number' ? s0.longitude : parseFloat(s0.longitude)
    if (Number.isFinite(s0Lat) && Number.isFinite(s0Lng)) {
      const dist = haversineDistance(lat, lng, s0Lat, s0Lng)
      const fallback = { ...s0, distance: dist.toFixed(2) }
      this.setData({ storeInfo: fallback })
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

    // 诊断日志：用户位置缓存状态（vConsole 排查用）
    console.log('[home] fetchNearby ->', { lat, lng, hasUserLocation: this._lastUserLat != null && this._lastUserLng != null })

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
    const userLat = this._lastUserLat
    const userLng = this._lastUserLng
    const hasUserLoc = typeof userLat === 'number' && typeof userLng === 'number' && !isNaN(userLat) && !isNaN(userLng)

    if (stores && stores.length > 0) {
      // 兜底：用 storesData + 缓存用户位置 算 haversine 距离
      // 覆盖场景：后端 /places/nearest-store 返回的 list 全部 distance 为 null 且 item 缺 latitude/longitude
      let nearest = null
      let minDist = Infinity
      let candidateCount = 0
      if (hasUserLoc) {
        stores.forEach(s => {
          const sLat = typeof s.latitude === 'number' ? s.latitude : parseFloat(s.latitude)
          const sLng = typeof s.longitude === 'number' ? s.longitude : parseFloat(s.longitude)
          if (Number.isFinite(sLat) && Number.isFinite(sLng)) {
            candidateCount++
            const dist = haversineDistance(userLat, userLng, sLat, sLng)
            if (dist < minDist) {
              minDist = dist
              nearest = { ...s, distance: dist.toFixed(2), source: 'haversine:fallback-local' }
            }
          }
        })
      }
      if (nearest) {
        console.log('[home] fallback-distance ->', { reason: 'stores_with_coords', candidateCount, nearestDistance: nearest.distance })
        this.setData({ storeInfo: nearest })
        return
      }
      // 算不出距离（无用户位置 / storesData 无坐标）：保持现有降级
      console.log('[home] fallback-distance ->', { reason: 'no_coords_or_no_user_loc', candidateCount: 0, nearestDistance: null })
      this.setData({ storeInfo: { ...stores[0] } })
    } else if (STORE.DEFAULT_STORE) {
      this.setData({ storeInfo: { ...STORE.DEFAULT_STORE } })
    }
  },

  /**
   * dev-test-bar: [1] 检测隐私设置（参考 dom onCheckPrivacySetting）
   */
  onDevTestCheckPrivacy() {
    this._logDevTest('--- 开始: [1] 检测隐私设置 ---', 'info')
    if (typeof wx.getPrivacySetting !== 'function') {
      this._logDevTest('当前基础库不支持 wx.getPrivacySetting', 'error')
      this.setData({
        privacyStatus: '基础库不支持（SDKVersion < 2.32.3）',
        privacyStatusClass: 'status-error'
      })
      return
    }
    wx.getPrivacySetting({
      success: (res) => {
        const text = `needAuthorization=${res.needAuthorization} | privacyContractName=${res.privacyContractName || '-'}`
        this._logDevTest('[1] getPrivacySetting success: ' + text, 'info')
        this.setData({
          privacyStatus: text,
          privacyStatusClass: 'status-success'
        })
        app.globalData.privacySetting = res
      },
      fail: (err) => {
        const errMsg = (err.errMsg || JSON.stringify(err))
        this._logDevTest('[1] getPrivacySetting fail: ' + errMsg, 'error')
        this.setData({
          privacyStatus: '查询失败: ' + errMsg,
          privacyStatusClass: 'status-error'
        })
      }
    })
  },

  /**
   * dev-test-bar: [2] 申请隐私授权（参考 dom onRequirePrivacyAuthorize）
   */
  onDevTestRequirePrivacy() {
    this._logDevTest('--- 开始: [2] 申请隐私授权 ---', 'info')
    if (typeof wx.requirePrivacyAuthorize !== 'function') {
      this._logDevTest('当前基础库不支持 wx.requirePrivacyAuthorize', 'error')
      this.setData({
        privacyStatus: '基础库不支持（SDKVersion < 3.0.0）',
        privacyStatusClass: 'status-error'
      })
      return
    }
    this._logDevTest('正在弹出原生隐私授权弹窗（请在弹窗中选择「同意」或「拒绝」）', 'info')
    wx.requirePrivacyAuthorize({
      success: () => {
        this._logDevTest('[2] requirePrivacyAuthorize SUCCESS - 用户同意隐私协议', 'info')
        this.setData({
          privacyStatus: '✓ 已同意隐私协议',
          privacyStatusClass: 'status-success'
        })
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || JSON.stringify(err)
        this._logDevTest('[2] requirePrivacyAuthorize FAIL: ' + errMsg, 'error')
        this.setData({
          privacyStatus: '✗ 拒绝: ' + errMsg,
          privacyStatusClass: 'status-error'
        })
      }
    })
  },

  /**
   * dev-test-bar: [4] 一键完整流程（参考 dom onFullFlow，参考 [dom/pages/index/index.js#L131-L173]）
   */
  onDevTestFullFlow() {
    this._logDevTest('=== 开始: [4] 一键完整流程（隐私预检 → 申请 → 定位）===', 'info')
    if (typeof wx.getPrivacySetting === 'function') {
      wx.getPrivacySetting({
        success: (res) => {
          this._logDevTest('[4] 步骤1/3: 隐私预检 needAuthorization=' + res.needAuthorization, 'info')
          if (res.needAuthorization) {
            this._logDevTest('[4] 步骤2/3: 弹出隐私授权', 'info')
            if (typeof wx.requirePrivacyAuthorize === 'function') {
              wx.requirePrivacyAuthorize({
                success: () => {
                  this._logDevTest('[4] 步骤2/3: ✓ 用户同意隐私', 'info')
                  this._logDevTest('[4] 步骤3/3: 调用 getFuzzyLocation', 'info')
                  this.onDevTestGetLocation()
                },
                fail: (err) => {
                  const errMsg = (err && err.errMsg) || ''
                  this._logDevTest('[4] 步骤2/3: ✗ 用户拒绝隐私 ' + errMsg, 'error')
                  this.setData({ devTestResult: '失败: 用户拒绝隐私授权' })
                }
              })
            } else {
              this._logDevTest('基础库不支持 requirePrivacyAuthorize，跳过', 'warn')
              this._logDevTest('[4] 步骤3/3: 调用 getFuzzyLocation', 'info')
              this.onDevTestGetLocation()
            }
          } else {
            this._logDevTest('[4] 步骤2/3: 隐私已同意，跳过', 'info')
            this._logDevTest('[4] 步骤3/3: 调用 getFuzzyLocation', 'info')
            this.onDevTestGetLocation()
          }
        },
        fail: (err) => {
          this._logDevTest('[4] 隐私预检失败，直接定位: ' + (err.errMsg || ''), 'warn')
          this.onDevTestGetLocation()
        }
      })
    } else {
      this._logDevTest('基础库不支持 getPrivacySetting，直接定位', 'warn')
      this.onDevTestGetLocation()
    }
  },

  /**
   * dev-test-bar: 长按 [3] 复制 lat,lng 到剪贴板（参考 dom onCopyLocation）
   */
  onDevTestCopyLocation() {
    const loc = app.globalData.lastLocation
    if (!loc) {
      this._logDevTest('尚无定位结果可复制', 'warn')
      wx.showToast({ title: '暂无定位结果', icon: 'none' })
      return
    }
    wx.setClipboardData({
      data: `${loc.latitude},${loc.longitude}`,
      success: () => {
        this._logDevTest('已复制 lat,lng 到剪贴板', 'info')
        wx.showToast({ title: '已复制', icon: 'success' })
      },
      fail: (err) => {
        this._logDevTest('复制失败: ' + (err.errMsg || ''), 'error')
      }
    })
  },

  /**
   * 开发测试：手动触发定位接口
   * 只读探针：不写 app.globalData、不触发 _fetchNearbyStores / requestStoreLocation、不污染 storeInfo
   * 修复点：complete 回调 + 10秒安全超时 + 隐私协议先检查（覆盖定位接口不会触发 success/fail 的场景）
   */
  onDevTestGetLocation() {
    this._logDevTest('--- 开始: [3] 获取模糊位置 ---', 'info')
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

    // 启动 10 秒兜底 timer，防止定位接口永不回调的场景
    this._devTestTimeout = setTimeout(() => {
      this._devTestTimeout = null
      wx.hideLoading()
      // 仅当 success/fail 都没触发（devTestResult 仍空）时弹超时
      if (!this.data.devTestResult) {
        this.setData({ devTestResult: '超时: 定位 10秒未响应' })
        this._logDevTest('超时: 定位 10秒未响应', 'error')
        console.warn('[dev-test] location timeout ->', { reason: 'no callback in 10s' })
        wx.showModal({
          title: '位置超时',
          content: '定位接口 10秒未返回任何回调。\n可能原因：\n1. 隐私协议未接受\n2. 系统位置授权未开启\n3. 微信位置服务被禁用\n4. 开发工具模拟器无 GPS 信号',
          confirmText: '我知道了',
          showCancel: false
        })
      }
    }, 10000)
    // 5) 隐私设置预检（基础库 2.32.3+）：用 wx.getPrivacySetting 明确判断是否需要重新授权
    if (typeof wx.getPrivacySetting === 'function') {
      wx.getPrivacySetting({
        success: (privRes) => {
          console.log('[dev-test] getPrivacySetting ->', privRes)
          if (privRes.needAuthorization) {
            // 隐私声明尚未同意：改用 wx.requirePrivacyAuthorize（带「同意 / 拒绝」按钮的原生授权弹窗）。
            // 不再调 wx.openPrivacyContract（只读详情页，无同意按钮）。
            this.setData({ devTestResult: '需先同意隐私声明（正在弹出授权框）' })
            this._logDevTest('需先同意隐私声明（正在弹出授权框）', 'warn')
          }
          // 无论是否需要授权，统一走 _devTestAfterPrivacy（其内部会处理 requirePrivacyAuthorize）
          this._devTestAfterPrivacy()
        },
        fail: (err) => {
          console.warn('[dev-test] getPrivacySetting fail ->', err)
          this._devTestAfterPrivacy()
        }
      })
    } else {
      // 旧版基础库：无 getPrivacySetting API → 走老逻辑（requirePrivacyAuthorize）
      this._devTestAfterPrivacy()
    }
  },

  /**
   * 隐私检查通过后的定位逻辑
   * 优先 wx.requirePrivacyAuthorize（向后兼容旧版基础库），
   * 再调 wx.getFuzzyLocation
   */
  _devTestAfterPrivacy() {
    if (typeof wx.requirePrivacyAuthorize === 'function') {
      wx.requirePrivacyAuthorize({
        success: () => {
          if (this._devTestTimeout) {
            clearTimeout(this._devTestTimeout)
            this._devTestTimeout = null
          }
          this._devTestDoGetLocation()
        },
        fail: () => {
          if (this._devTestTimeout) {
            clearTimeout(this._devTestTimeout)
            this._devTestTimeout = null
          }
          wx.hideLoading()
          // 用户拒绝了 wx.requirePrivacyAuthorize 弹出的原生隐私声明弹窗
          this.setData({ devTestResult: '失败: 用户拒绝隐私协议' })
          this._logDevTest('失败: 用户拒绝隐私协议', 'error')
          console.warn('[dev-test] requirePrivacyAuthorize fail')
          wx.showModal({
            title: '需要隐私协议',
            content: '请点击「调用 wx.getFuzzyLocation」按钮后，在弹出的原生隐私声明弹窗中选择「同意」。若未弹出，请检查 app.json 是否配置了 __usePrivacyCheck__: true。',
            confirmText: '我知道了',
            showCancel: false
          })
        }
      })
    } else if (typeof wx.openPrivacyContract === 'function') {
      // 旧版基础库：无 requirePrivacyAuthorize，但有 openPrivacyContract（旧式只读详情页）。
      // 仅作为 fallback：基础库 < 2.32.3 时使用，提示用户在详情页底部点击「我已知晓」后再继续。
      this.setData({ devTestResult: '需先同意隐私声明（旧版基础库，请在详情页确认后点击「我已知晓」）' })
      wx.openPrivacyContract({
        success: () => {
          console.log('[dev-test] openPrivacyContract 关闭')
          if (this._devTestTimeout) {
            clearTimeout(this._devTestTimeout)
            this._devTestTimeout = null
          }
          this._devTestDoGetLocation()
        },
        fail: () => {
          console.warn('[dev-test] openPrivacyContract fail')
          if (this._devTestTimeout) {
            clearTimeout(this._devTestTimeout)
            this._devTestTimeout = null
          }
          this._devTestDoGetLocation()
        }
      })
    } else {
      // 极旧基础库：既无 requirePrivacyAuthorize 也无 openPrivacyContract，直接定位
      if (this._devTestTimeout) {
        clearTimeout(this._devTestTimeout)
        this._devTestTimeout = null
      }
      this._devTestDoGetLocation()
    }
  },

  /**
   * 开发者调试：清除定位相关的全部 storage + globalData 缓存，
   * 便于反复测试「未授权 / 已授权 / 已拒绝」等不同分支。
   */
  onDevTestClearCache() {
    this._logDevTest('--- 开始: [5] 清除定位缓存 ---', 'info')
    try {
      wx.removeStorageSync('location_prompt_done')
      wx.removeStorageSync('location_permission_done')
      wx.removeStorageSync('privacy_agreed')
    } catch (e) {
      console.warn('[dev-test] clear cache fail', e)
    }
    try {
      app.globalData.latitude = undefined
      app.globalData.longitude = undefined
    } catch (e) {}
    this._lastUserLat = null
    this._lastUserLng = null
    this.setData({
      storeInfo: null,
      devTestResult: '已清除定位缓存（localStorage + globalData）',
      privacyStatus: '',
      privacyStatusClass: '',
      locationResult: '',
      locationResultClass: ''
    })
    this._logDevTest('已清除定位缓存（localStorage + globalData）', 'info')
    console.log('[dev-test] cache cleared')
    wx.showToast({ title: '已清除定位缓存', icon: 'success' })
  },

  /**
   * 实际调用定位
   * 优先 wx.getFuzzyLocation（基础库 2.25.0+，申请门槛低）
   * 10 秒安全超时已在 onDevTestGetLocation 中统一管理
   */
  _devTestDoGetLocation() {
    const showSuccessModal = (res, source) => {
      const summary = `lat=${(res.latitude || 0).toFixed(6)}, lng=${(res.longitude || 0).toFixed(6)}, acc=${res.accuracy || 0}m`
      const full = `lat=${(res.latitude || 0).toFixed(6)} | lng=${(res.longitude || 0).toFixed(6)} | acc=${res.accuracy || 0}m | speed=${res.speed || '-'} | altitude=${res.altitude || '-'}`
      this.setData({ devTestResult: summary, locationResult: full, locationResultClass: '' })
      this._logDevTest('getFuzzyLocation SUCCESS: ' + full, 'info')
      console.log('[dev-test] ' + source + ' success ->', res)
      wx.showModal({
        title: '位置成功',
        content: `source: ${source}\nlatitude: ${res.latitude}\nlongitude: ${res.longitude}\naccuracy: ${res.accuracy}m\nspeed: ${res.speed || '-'}\naltitude: ${res.altitude || '-'}\nerrMsg: ${res.errMsg}`,
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
    }

    const showFailModal = (err, source) => {
      const errMsg = (err && err.errMsg) || '未知错误'
      this.setData({ devTestResult: `失败: ${errMsg}`, locationResult: `✗ 失败: ${errMsg}`, locationResultClass: 'status-error' })
      this._logDevTest('getFuzzyLocation FAIL: ' + errMsg, 'error')
      console.warn('[dev-test] ' + source + ' fail ->', err)
      // 针对常见系统级错误给出针对性提示
      let content = `source: ${source}\nerrMsg: ${errMsg}\n\n（测试按钮不会写入 app.globalData，也不会触发 _fetchNearbyStores）`
      let confirmText = '我知道了'
      let onConfirm = null
      if (errMsg.includes('system permission denied') || errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')) {
        content = '系统未授权位置权限。\n\n请前往：\n【设置】→【隐私】→【定位服务】→ 找到【微信】→ 改为【使用期间】或【始终】\n\n开启后重新点击测试按钮。'
        confirmText = '去开启'
        onConfirm = () => {
          if (typeof wx.openAppAuthorizeSetting === 'function') {
            wx.openAppAuthorizeSetting()
          }
        }
      } else if (errMsg.includes('fuzzyLocation:fail system permission denied') || errMsg.includes('system permission denied')) {
        content = 'iOS 系统未开启微信的位置权限。\n\n请前往：\n【设置】→【微信】→【位置】→ 改为【使用 App 期间】或【始终】\n\n开启后重新点击测试按钮。'
        confirmText = '去开启'
        onConfirm = () => {
          if (typeof wx.openAppAuthorizeSetting === 'function') {
            wx.openAppAuthorizeSetting()
          }
        }
      } else if (errMsg.includes('fail authorize') || errMsg.includes('auth deny') || errMsg.includes('auth denied')) {
        content = '用户拒绝了位置授权。\n\n如需重新授权，请进入：\n【设置】→【微信】→【位置】→ 改为【使用 App 期间】'
        confirmText = '去开启'
        onConfirm = () => {
          if (typeof wx.openAppAuthorizeSetting === 'function') {
            wx.openAppAuthorizeSetting()
          }
        }
      }
      const isSystemError = errMsg.includes('system permission denied') || errMsg.includes('auth') || errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')
      wx.showModal({
        title: '位置失败',
        content,
        confirmText,
        cancelText: '关闭',
        showCancel: isSystemError,
        success: (modalRes) => {
          if (modalRes.confirm && onConfirm) onConfirm()
        }
      })
    }

    // 仅测试 wx.getFuzzyLocation（与 app.json requiredPrivateInfos 一致，
    // 模糊定位与精确位置互斥不能共存）
    if (typeof wx.getFuzzyLocation === 'function') {
      let handled = false
      wx.getFuzzyLocation({
        type: 'gcj02',
        success: (res) => {
          handled = true
          showSuccessModal(res, 'getFuzzyLocation')
        },
        fail: (err) => {
          handled = true
          showFailModal(err, 'getFuzzyLocation')
        },
        complete: () => {
          if (!handled) {
            console.warn('[dev-test] getFuzzyLocation complete without callback')
            showFailModal({ errMsg: 'getFuzzyLocation complete without success/fail' }, 'getFuzzyLocation')
          }
          // 清理父级超时
          if (this._devTestTimeout) {
            clearTimeout(this._devTestTimeout)
            this._devTestTimeout = null
          }
          wx.hideLoading()
        }
      })
    } else {
      // 旧版基础库无 getFuzzyLocation
      showFailModal({ errMsg: '基础库不支持 wx.getFuzzyLocation' }, 'getFuzzyLocation')
      if (this._devTestTimeout) {
        clearTimeout(this._devTestTimeout)
        this._devTestTimeout = null
      }
      wx.hideLoading()
    }
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
    contentApi.getHotPrices().then(res => {
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
    wx.navigateTo({ url: '/pages/product-search/product-search?keyword=' + encodeURIComponent(keyword) })
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
  goToFeaturePhone(e) {
    const type = e  || 'oldMan'
    wx.navigateTo({
      url: '/pages/feature-phone-image/feature-phone-image?type=' + encodeURIComponent(type)
    })
  },
  onBrandTap(e) {
    const id = e ? e.currentTarget.dataset.id : ''
    const name = e ? e.currentTarget.dataset.name : ''
    console.log(id)
    if(id === 2 || id === 1) {
      this.goToFeaturePhone(id === 1 ? 'oldMan' : 'dianrong')
      return
    }
    if (id) {
      this.requireLogin('/pages/price-quote/price-quote?brandId=' + id + '&title=' + encodeURIComponent(name || ''))
    } else {
      wx.switchTab({ url: '/pages/brand-list/brand-list' })
    }
  },

  goToScanPrice() { wx.switchTab({ url: '/pages/scan-price/scan-price' }) },
  goToInvite() { wx.navigateTo({ url: '/pages/invite-friends/invite-friends' }) },
  goToPriceQuote() { this._precheckQuoteAndNavigate('/pages/price-quote/price-quote') },
  goToFavorites() { wx.navigateTo({ url: '/pages/my-favorites/my-favorites' }) },
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
    wx.setClipboardData({
      data: wxid,
      // success: () => this.showToast('微信号已复制'),
      fail: (err) => {
        console.error('复制微信号失败：', err)
        wx.showModal({
          title: '微信号',
          content: wxid,
          confirmText: '好的',
          showCancel: false
        })
      }
    })
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

  /**
   * 点击公告栏：展示公告详情弹窗
   * 用 _announcementsCache 查找完整内容（content）
   * 兜底：若只有占位公告（无 content），给用户提示
   */
  onNoticeTap(e) {
    const id = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id
    const cache = this._announcementsCache || []
    let detail = cache.find(item => String(item.id) === String(id))
    if (!detail && this.data.displayAnnouncements.length > 0) {
      // 兜底：取当前轮播到的 index
      const idx = this.data.currentAnnouncementIndex || 0
      detail = cache[idx]
    }
    if (!detail) {
      wx.showToast({ title: '暂无公告详情', icon: 'none' })
      return
    }
    if (!detail.content) {
      wx.showToast({ title: '该公告暂无详细内容', icon: 'none' })
      return
    }
    // 暂停轮播，避免弹窗打开后背后还在动
    this.stopAnnouncementRotation()
    this.setData({
      noticeDetailVisible: true,
      noticeDetail: {
        id: detail.id,
        title: detail.title,
        content: detail.content,
        time: detail.time
      }
    })
  },

  /**
   * 关闭公告详情弹窗
   */
  onNoticeDetailClose() {
    this.setData({ noticeDetailVisible: false })
    // 恢复轮播
    if (this.data.displayAnnouncements && this.data.displayAnnouncements.length > 1) {
      this.startAnnouncementRotation()
    }
  },

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

  _showLocationServiceModal() {
    wx.showModal({
      title: '定位服务未开启',
      content: '手机定位服务未开启，无法为您展示离您最近的门店。请前往系统设置开启定位服务后重试。',
      confirmText: '去开启',
      cancelText: '取消',
      success: (modalRes) => {
        if (modalRes.confirm) {
          // 优先用 wx.openAppAuthorizeSetting（基础库 2.20.1+，已取代 wx.openSetting）
          if (typeof wx.openAppAuthorizeSetting === 'function') {
            wx.openAppAuthorizeSetting()
          } else {
            this.showToast('请在系统设置中开启定位')
          }
        }
      }
    })
  },

  /**
   * 实际执行定位与最近门店计算（隐私预检已通过）
   * 由 _autoLoadNearbyStore 调用
   */
  _doFindNearbyStore() {
    if (this.data.storeLoading) return
    this.setData({ storeLoading: true })

    // 10 秒超时兜底：防止定位接口永不回调
    const timeoutId = setTimeout(() => {
      this.setData({ storeLoading: false })
      this.showToast('定位超时，请重试')
    }, 10000)

    const clearTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
    }

    const onSuccess = (res) => {
      clearTimer()
      const latitude = res.latitude
      const longitude = res.longitude
      app.globalData.latitude = latitude
      app.globalData.longitude = longitude
      this._lastUserLat = latitude
      this._lastUserLng = longitude
      wx.setStorageSync('location_prompt_done', true)
      wx.setStorageSync('location_permission_done', true)

      if (this.data.storesData && this.data.storesData.length > 0) {
        this.processStore(this.data.storesData, latitude, longitude)
      } else {
        this.setData({ storeInfo: STORE.DEFAULT_STORE })
      }
      this.requestStoreLocation(latitude, longitude)
      this.setData({ storeLoading: false })
    }

    const onFail = (err) => {
      clearTimer()
      this.setData({ storeLoading: false })
      const errMsg = (err && err.errMsg) || ''
      if (errMsg.includes('system permission denied') || errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF') || errMsg.includes('location unavailable')) {
        this._showLocationServiceModal()
      } else {
        this.showToast('定位失败，请检查位置权限')
      }
    }

    // 先检查授权状态，未授权则引导用户开启
    const doGetLocation = () => {
      if (typeof wx.getFuzzyLocation === 'function') {
        let handled = false
        wx.getFuzzyLocation({
          type: 'gcj02',
          success: (res) => {
            handled = true
            onSuccess(res)
          },
          fail: (err) => {
            handled = true
            onFail(err)
          },
          complete: () => {
            if (!handled) {
              onFail({ errMsg: '定位接口未响应' })
            }
          }
        })
      } else {
        onFail({ errMsg: '基础库不支持 wx.getFuzzyLocation' })
      }
    }

    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userFuzzyLocation'] || res.authSetting['scope.userLocation']) {
          // 已授权，直接定位
          doGetLocation()
        } else {
          // 未授权：用 wx.authorize 直接触发系统授权弹窗
          wx.authorize({
            scope: 'scope.userFuzzyLocation',
            success: () => {
              doGetLocation()
            },
            fail: (err) => {
              clearTimer()
              this.setData({ storeLoading: false })
              const errMsg = (err && err.errMsg) || ''
              if (errMsg.includes('system permission denied') || errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF') || errMsg.includes('location unavailable')) {
                this._showLocationServiceModal()
              } else {
                // 用户拒绝授权：提示后可打开设置页
                wx.showModal({
                  title: '需要位置权限',
                  content: '需要获取您的位置才能查找附近门店，是否前往设置开启？',
                  confirmText: '去设置',
                  cancelText: '取消',
                  success: (modalRes) => {
                    if (modalRes.confirm && typeof wx.openSetting === 'function') {
                      wx.openSetting()
                    }
                  }
                })
              }
            }
          })
        }
      },
      fail: () => {
        // getSetting 失败，尝试直接定位
        doGetLocation()
      }
    })
  },

  fetchLocationAndStores() {
    const app = getApp()

    // 诊断日志：用户位置/门店数据状态摘要（vConsole 排查用）
    const storesData = this.data.storesData
    console.log('[home] globalLocation ->', {
      hasUserLocation: typeof app.globalData.latitude === 'number' && typeof app.globalData.longitude === 'number',
      hasStores: Array.isArray(storesData) && storesData.length > 0,
      storesWithCoords: Array.isArray(storesData) ? storesData.filter(s => s && s.latitude && s.longitude).length : 0
    })

    // 处理 success 后的业务逻辑（共用）
    const onLocationSuccess = (locationRes) => {
      const latitude = locationRes.latitude
      const longitude = locationRes.longitude
      app.globalData.latitude = latitude
      app.globalData.longitude = longitude
      // 缓存到 page 实例（供 _fallbackStoreToLocal 兜底使用，不走 setData）
      this._lastUserLat = latitude
      this._lastUserLng = longitude
      wx.setStorageSync('location_permission_done', true)
      this.requestStoreLocation(latitude, longitude)
      // 同步重算 processStore：保证 storeInfo 立即有距离（不依赖异步后端）
      if (this.data.storesData && this.data.storesData.length > 0) {
        this.processStore(this.data.storesData, latitude, longitude)
      } else {
        this.setData({ storeInfo: STORE.DEFAULT_STORE })
      }
      const token = wx.getStorageSync('token')
      this.loadHomeData()
    }

    const onLocationFail = () => {
      // 统一提示开启手机定位服务
      this._showLocationServiceModal()
      wx.setStorageSync('location_prompt_done', true)
      const token = wx.getStorageSync('token')
      this.loadHomeData()
    }

    // 仅使用 wx.getFuzzyLocation（app.json 的 requiredPrivateInfos 只声明了它，
    // 模糊定位与精确位置互斥不能共存，因此不再 fallback 精确位置接口）。
    // 模糊定位精度约 1km，用于「最近门店距离展示」足够。
    if (typeof wx.getFuzzyLocation === 'function') {
      let handled = false
      wx.getFuzzyLocation({
        type: 'gcj02',
        success: (res) => {
          handled = true
          console.log('[home] getFuzzyLocation success ->', res)
          onLocationSuccess(res)
        },
        fail: (err) => {
          handled = true
          console.warn('[home] getFuzzyLocation fail ->', err)
          onLocationFail()
        },
        complete: () => {
          if (!handled) {
            console.warn('[home] getFuzzyLocation complete without success/fail')
            onLocationFail()
          }
        }
      })
    } else {
      // 旧版基础库无 getFuzzyLocation：提示失败（不再用未声明的精确位置接口）
      onLocationFail()
    }
  },

  /**
   * 首屏进入时检查位置：先做隐私预检，再走 getFuzzyLocation
   * 与 fetchLocationAndStores 区别：本方法在 app.json __usePrivacyCheck__ 开启时
   * 主动检测 needAuthorization，命中则同步调 requirePrivacyAuthorize 让用户同意
   */
  checkLocationWithPrivacy() {
    if (typeof wx.getPrivacySetting === 'function') {
      wx.getPrivacySetting({
        success: (privRes) => {
          if (privRes.needAuthorization) {
            // 隐私声明尚未同意 → 弹隐私协议
            if (typeof wx.requirePrivacyAuthorize === 'function') {
              wx.requirePrivacyAuthorize({
                success: () => this.fetchLocationAndStores(),
                fail: () => {
                  // 拒绝隐私 → 走兜底
                  this._fetchHomeDataAfterLocation()
                }
              })
            } else {
              this.fetchLocationAndStores()
            }
            return
          }
          this.fetchLocationAndStores()
        },
        fail: () => {
          // getPrivacySetting 失败 → 走老逻辑
          this.fetchLocationAndStores()
        }
      })
    } else {
      this.fetchLocationAndStores()
    }
  },

  _fetchHomeDataAfterLocation() {
    const token = wx.getStorageSync('token')
    this.loadHomeData()
  },

  /**
   * 悬浮客服按钮点击事件（open-type="contact" 会自动跳转到微信原生客服，
   * bindcontact 用于接收用户发送消息的回調，仅用于日誌記錄）
   */
  onContactTap(e) {
    console.log('[home] onContactTap -> open customer service', e && e.detail)
  },

  /**
   * 悬浮条「电话」按钮：拨打门店电话（storeInfo.phone → contact_phone → CONTACT.SERVICE_PHONE 兜底）
   */
  onFabPhoneCall() {
    
    const s = this.data.storeInfo
    // const phone = (s && (s.phone || s.contact_phone)) || CONTACT.SERVICE_PHONE
    // const phone = '15555962610'
    // if (!phone) { this.showToast('暂无联系电话'); return }
    wx.makePhoneCall({ phoneNumber: '15555962610' })
  },

  /**
   * 悬浮条「问题」按钮：跳转到常见问题页面
   */
  onFabQuestion() {
    wx.navigateTo({ url: '/pages/faq/faq' })
  },

  // ===== 弹窗广告 =====
  _tryShowPopupAd() {
    // 仅首次进入时检查弹窗（不重复弹）
    if (this._popupChecked) return
    this._popupChecked = true

    contentApi.getPopupAds().then(res => {
      const ad = (res && res.data) || res || null
      if (!ad || ad.status !== 1) return

      // 校验生效时间
      const now = Date.now()
      if (ad.start_time && new Date(ad.start_time).getTime() > now) return
      if (ad.end_time && new Date(ad.end_time).getTime() < now) return

      // 仅首次：检查本地存储
      if (ad.show_frequency === 'first') {
        const closed = wx.getStorageSync(this.data._popupAdClosedKey)
        if (closed) return
      }

      // 有图片才展示
      if (!ad.images || ad.images.length === 0) return

      this.setData({ popupAdData: ad, popupAdVisible: true })
    }).catch(() => {/* 静默失败 */})
  },

  onPopupAdClose() {
    const ad = this.data.popupAdData
    if (ad && ad.show_frequency === 'first') {
      wx.setStorageSync(this.data._popupAdClosedKey, true)
    }
    this.setData({ popupAdVisible: false })
  },

  navigateToLogin() {
    wx.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent('/pages/index/index') })
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
