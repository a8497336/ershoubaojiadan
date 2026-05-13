const { priceApi, cartApi, searchApi, brandApi } = require('../../utils/api-modules')

Page({
  data: {
    priceDate: '',
    updateTime: '',
    viewCount: 0,
    priceList: [],
    categoryGroups: [],
    conditions: [],
    isEmpty: false,
    loading: true,
    brandId: null,
    brand: '',
    pageTitle: '报价单',
    category: '',
    productId: null,
    keyword: '',
    showSearch: false,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: ''
  },

  onLoad(options) {
    const brandId = options.brandId ? parseInt(options.brandId) : null
    const brand = options.brand ? decodeURIComponent(options.brand) : ''
    const category = options.category ? decodeURIComponent(options.category) : ''
    const productId = options.productId ? parseInt(options.productId) : null

    this.setData({
      brandId,
      brand,
      category,
      productId,
      isEmpty: false
    })

    this.loadTodayPrices({ brand_id: brandId, category, product_id: productId })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  onPullDownRefresh() {
    const { brandId, category } = this.data
    this.loadTodayPrices({ brand_id: brandId, category })
    wx.stopPullDownRefresh()
  },

  loadTodayPrices(options = {}) {
    this.setData({ loading: true, isEmpty: false })

    const apiData = {}
    if (options.brand_id) apiData.brand_id = options.brand_id
    if (options.category) apiData.category = options.category
    if (options.product_id) apiData.product_id = options.product_id

    const conditionsPromise = this.data.conditions.length > 0
      ? Promise.resolve(this.data.conditions)
      : priceApi.getConditions().then(res => {
          const conditions = (res.data || res || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          this.setData({ conditions })
          return conditions
        })

    const configPromise = options.brand_id
      ? brandApi.getBrandDetail(options.brand_id)
      : Promise.resolve(null)

    Promise.all([
      priceApi.getTodayPrices(apiData),
      conditionsPromise,
      configPromise
    ]).then(([priceRes, conditions, brandRes]) => {
      const data = priceRes.data || priceRes || {}
      const rawList = data.list || []
      const brandData = brandRes ? (brandRes.data || brandRes) : null
      const quoteConfig = brandData ? (brandData.quote_config || {}) : {}

      const processedList = rawList.map(item => {
        const priceMap = {}

        ;(item.Prices || []).forEach(priceItem => {
          const conditionId = priceItem.condition_id || (priceItem.Condition ? priceItem.Condition.id : null)
          if (conditionId !== null && priceItem.price !== undefined && priceItem.price !== null) {
            priceMap[conditionId] = parseFloat(priceItem.price)
          }
        })

        return {
          ...item,
          id: item.id,
          model: item.model || item.name || '',
          series: item.series_name || item.series || (item.Category ? item.Category.name : '其他'),
          categoryName: item.Category ? item.Category.name : '其他',
          brand: item.Brand ? item.Brand.name : '',
          remark: item.remark || '',
          priceMap,
          _rawPrices: item.Prices || []
        }
      })

      // 按 series 分组（当 series 有意义时），否则按 category 分组
      const categoryMap = {}
      let categoryIndex = 0

      processedList.forEach((item) => {
        const seriesName = item.series || '其他'
        const categoryName = item.categoryName || '其他'
        // 使用 series 作为分组键，若 series 为空则回退到 category
        const groupKey = seriesName !== '其他' ? seriesName : categoryName

        if (!categoryMap[groupKey]) {
          categoryIndex++
          categoryMap[groupKey] = {
            index: categoryIndex,
            name: groupKey,
            seriesMap: {}
          }
        }

        const subSeriesName = item.series || '其他'
        if (!categoryMap[groupKey].seriesMap[subSeriesName]) {
          categoryMap[groupKey].seriesMap[subSeriesName] = {
            name: subSeriesName,
            items: []
          }
        }

        categoryMap[groupKey].seriesMap[subSeriesName].items.push({
          productId: item.id,
          model: item.model,
          remark: item.remark,
          ...item,
          prices: conditions.map(c => ({
            val: this.formatPrice(item.priceMap[c.id]),
            cls: this.getPriceClass(item.priceMap[c.id])
          }))
        })
      })

      const categoryGroups = Object.values(categoryMap).map(cat => ({
        ...cat,
        seriesList: Object.values(cat.seriesMap).map((series, sIdx) => {
          const chunkSize = 6
          const chunks = []
          for (let i = 0; i < series.items.length; i += chunkSize) {
            chunks.push(series.items.slice(i, i + chunkSize))
          }

          const subTables = chunks.map(chunk => {
            const chunkVisibleConditionIds = new Set()
            chunk.forEach(item => {
              conditions.forEach(c => {
                const price = item.priceMap[c.id]
                if (price !== undefined && price !== null && price > 0) {
                  chunkVisibleConditionIds.add(c.id)
                }
              })
            })

            const chunkVisibleConditions = conditions.filter(c => chunkVisibleConditionIds.has(c.id))

            const chunkItems = chunk.map(item => ({
              ...item,
              prices: chunkVisibleConditions.map(c => ({
                val: this.formatPrice(item.priceMap[c.id]),
                cls: this.getPriceClass(item.priceMap[c.id])
              }))
            }))

            return {
              items: chunkItems,
              visibleConditions: chunkVisibleConditions
            }
          })

          return {
            ...series,
            index: sIdx + 1,
            subTables
          }
        })
      }))

      this.setData({
        priceDate: data.date || new Date().toISOString().split('T')[0],
        updateTime: data.updateTime ?
          new Date(data.updateTime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '',
        viewCount: data.viewCount || 0,
        priceList: processedList,
        categoryGroups: categoryGroups,
        isEmpty: categoryGroups.length === 0,
        loading: false,
        brandId: quoteConfig.brand_id || null,
        brand: quoteConfig.brand_name || '',
        pageTitle: quoteConfig.page_title || '报价单',
        receiverName: quoteConfig.receiver_name || '',
        receiverPhone: quoteConfig.receiver_phone || '',
        receiverAddress: quoteConfig.receiver_address || ''
      })
    }).catch(() => {
      this.setData({
        loading: false,
        isEmpty: true,
        categoryGroups: []
      })
    })
  },

  formatPrice(price) {
    if (price === null || price === undefined || price === '') return '/'
    const num = parseFloat(price)
    if (isNaN(num)) return '/'
    return num > 0 ? `¥${num}` : '/'
  },

  getPriceClass(price) {
    if (price === null || price === undefined || price === '') return 'price-none'
    const num = parseFloat(price)
    if (isNaN(num) || num <= 0) return 'price-none'
    if (num >= 1000) return 'price-high'
    if (num >= 500) return 'price-mid'
    return 'price-low'
  },

  toggleSearch() {
    this.setData({ showSearch: !this.data.showSearch })
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    wx.navigateTo({
      url: `/pages/brand-list/brand-list?keyword=${encodeURIComponent(keyword)}`
    })
  },

  goToPriceTrend(e) {
    const productId = e.currentTarget.dataset.productId
    const model = e.currentTarget.dataset.model
    if (productId) {
      wx.navigateTo({
        url: `/pages/price-trend/price-trend?productId=${productId}&model=${encodeURIComponent(model)}`
      })
    }
  },

  goToStock() {
    wx.navigateTo({
      url: '/pages/my-stock/my-stock'
    })
  },

  goToMailingAddress() {
    wx.navigateTo({
      url: '/pages/mailing-address/mailing-address'
    })
  },

  onShareAppMessage() {
    const { brand, category } = this.data
    let title = '数码回收网 - 今日回收报价'
    if (brand) {
      title = `数码回收网 - ${brand}回收报价`
    } else if (category) {
      title = `数码回收网 - ${category}回收报价`
    }
    return {
      title,
      path: '/pages/price-quote/price-quote'
    }
  }
})
