const { priceApi } = require('../../utils/api-modules')

Page({
  data: {
    priceDate: '',
    updateTime: '',
    viewCount: 0,
    priceList: [],
    seriesList: [],
    isEmpty: false,
    loading: true,
    brandId: null,
    brand: '',
    category: '',
    productId: null
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

    priceApi.getTodayPrices(apiData).then((res) => {
      const data = res.data || {}
      const rawList = data.list || []

      const processedList = rawList.map(item => {
        const prices = {}

        ;(item.Prices || []).forEach(priceItem => {
          const code = priceItem.Condition ? priceItem.Condition.code : priceItem.condition_code
          if (code && priceItem.price !== undefined && priceItem.price !== null) {
            prices[code] = parseFloat(priceItem.price)
          }
        })

        return {
          id: item.id,
          model: item.model || item.name || '',
          series: item.series || (item.Category ? item.Category.name : '其他'),
          brand: item.Brand ? item.Brand.name : '',
          ...prices,
          _rawPrices: item.Prices || []
        }
      })

      const seriesMap = {}
      let seriesIndex = 0

      processedList.forEach((item) => {
        const seriesName = item.series || '其他'

        if (!seriesMap[seriesName]) {
          seriesIndex++
          seriesMap[seriesName] = {
            index: seriesIndex,
            name: seriesName,
            items: []
          }
        }

        seriesMap[seriesName].items.push({
          productId: item.id,
          model: item.model,
          price1: this.formatPrice(item.screen_good || item.price1),
          price1Class: this.getPriceClass(item.screen_good || item.price1),
          price2: this.formatPrice(item.screen_good_large || item.price2),
          price2Class: this.getPriceClass(item.screen_good_large || item.price2),
          price3: this.formatPrice(item.screen_good_small || item.price3),
          price3Class: this.getPriceClass(item.screen_good_small || item.price3),
          price4: this.formatPrice(item.screen_bad || item.price4),
          price4Class: this.getPriceClass(item.screen_bad || item.price4),
          price5: this.formatPrice(item.no_power || item.price5),
          price5Class: this.getPriceClass(item.no_power || item.price5),
          price6: this.formatPrice(item.board_bad || item.price6),
          price6Class: this.getPriceClass(item.board_bad || item.price6),
          price7: this.formatPrice(item.screen_good_broken || item.price7),
          price7Class: this.getPriceClass(item.screen_good_broken || item.price7),
          price8: this.formatPrice(item.bad_no_tag || item.price8),
          price8Class: this.getPriceClass(item.bad_no_tag || item.price8)
        })
      })

      const seriesList = Object.values(seriesMap)

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
        seriesList: seriesList,
        isEmpty: seriesList.length === 0,
        loading: false
      })
    }).catch(() => {
      this.setData({
        loading: false,
        isEmpty: true,
        seriesList: []
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