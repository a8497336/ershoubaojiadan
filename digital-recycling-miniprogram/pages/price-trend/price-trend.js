const { priceApi } = require('../../utils/api-modules')

Page({
  data: {
    productId: null,
    model: '',
    days: 15,
    selectedCondition: null,
    trendData: null,
    isLoading: true,
    lineColors: ['#ff2d4a', '#1890ff', '#52c41a', '#faad14', '#722ed1'],
    xLabels: [],
    yLabels: [],
    filteredPrices: [],
    priceRange: { min: 0, max: 0 },
    dateRange: { start: '', end: '' }
  },

  onLoad(options) {
    const productId = options.productId ? parseInt(options.productId) : null
    const model = options.model ? decodeURIComponent(options.model) : ''
    
    this.setData({ productId, model })
    
    wx.setNavigationBarTitle({
      title: model ? `${model} - 价格趋势` : '价格趋势'
    })
    
    this.loadPriceTrend()
  },

  loadPriceTrend() {
    const { productId, days } = this.data
    
    this.setData({ isLoading: true })
    
    priceApi.getPriceTrend(productId, { days })
      .then(res => {
        const trendData = res.data
        
        this.calculateChartData(trendData)
        
        this.setData({
          trendData,
          filteredPrices: trendData.currentPrices || [],
          isLoading: false
        })
      })
      .catch(err => {
        console.error('加载价格趋势失败：', err)
        this.setData({ isLoading: false })
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
  },

  calculateChartData(trendData) {
    if (!trendData || !trendData.trendData) return
    
    let allPrices = []
    let allDates = new Set()
    
    trendData.trendData.forEach(conditionData => {
      if (conditionData.data) {
        conditionData.data.forEach(point => {
          if (point.price > 0) allPrices.push(point.price)
          allDates.add(point.date)
        })
      }
    })
    
    const sortedDates = Array.from(allDates).sort()
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0
    const pricePadding = (maxPrice - minPrice) * 0.1 || 10
    
    const xLabels = []
    if (sortedDates.length > 0) {
      const step = Math.ceil(sortedDates.length / 5)
      for (let i = 0; i < sortedDates.length; i += step) {
        const date = sortedDates[i]
        xLabels.push(date.slice(5))
      }
      if (sortedDates.length > 0 && !xLabels.includes(sortedDates[sortedDates.length - 1].slice(5))) {
        xLabels.push(sortedDates[sortedDates.length - 1].slice(5))
      }
    }
    
    const yStep = (maxPrice - minPrice + pricePadding * 2) / 4
    const yLabels = []
    for (let i = 4; i >= 0; i--) {
      yLabels.push(Math.round(minPrice - pricePadding + yStep * i))
    }
    
    this.setData({
      xLabels,
      yLabels,
      priceRange: {
        min: minPrice - pricePadding,
        max: maxPrice + pricePadding
      },
      dateRange: {
        start: sortedDates[0] || '',
        end: sortedDates[sortedDates.length - 1] || ''
      }
    })
  },

  calculateX(date) {
    const { dateRange } = this.data
    if (!dateRange.start || !dateRange.end) return 50
    
    const start = new Date(dateRange.start).getTime()
    const end = new Date(dateRange.end).getTime()
    const current = new Date(date).getTime()
    
    if (end === start) return 50
    
    return ((current - start) / (end - start)) * 100
  },

  calculateY(price) {
    const { priceRange } = this.data
    if (priceRange.max === priceRange.min) return 50
    
    return 100 - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * 100
  },

  selectDays(e) {
    const days = parseInt(e.currentTarget.dataset.days)
    this.setData({ days })
    this.loadPriceTrend()
  },

  selectCondition(e) {
    const conditionId = e.currentTarget.dataset.condition === 'null' ? null : parseInt(e.currentTarget.dataset.condition)
    const { trendData } = this.data
    
    let filteredPrices = trendData.currentPrices || []
    if (conditionId !== null) {
      filteredPrices = filteredPrices.filter(p => p.id === conditionId)
    }
    
    this.setData({
      selectedCondition: conditionId,
      filteredPrices
    })
  },

  addToStock() {
    const { productId, model, trendData } = this.data
    
    wx.showModal({
      title: '加入压货',
      content: `确定将「${model}」加入我的压货吗？`,
      editable: true,
      placeholderText: '请输入数量（可选）',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '已加入压货',
            icon: 'success'
          })
        }
      }
    })
  },

  goToOrder() {
    const { productId, trendData } = this.data
    
    wx.switchTab({
      url: '/pages/shopping/shopping'
    })
  }
})
