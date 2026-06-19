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
    dateRange: { start: '', end: '' },
    showDetail: false,
    detailX: 0,
    detailY: 0,
    detailData: {
      condition: '',
      date: '',
      price: 0
    },
    canvasWidth: 300,
    canvasHeight: 200,
    canvasDpr: 1,
    canvasReady: false,
    allPoints: []
  },

  onLoad(options) {
    const productId = options.productId ? parseInt(options.productId) : null
    const model = options.model ? decodeURIComponent(options.model) : ''
    
    this.setData({ productId, model })
    
    wx.setNavigationBarTitle({
      title: model ? `${model} - 价格趋势` : '价格趋势'
    })
    // 等待 canvas 就绪后再加载数据，避免重复请求
  },

  onReady() {
    this.initCanvas()
  },

  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('.trend-canvas').boundingClientRect(rect => {
      if (rect) {
        const dpr = wx.getSystemInfoSync().pixelRatio || 1
        this.setData({
          canvasWidth: rect.width,
          canvasHeight: rect.height,
          canvasDpr: dpr,
          canvasReady: true
        }, () => {
          this.loadPriceTrend()
        })
      } else {
        // 降级：canvas 节点未找到，仍尝试加载数据
        this.setData({ canvasReady: true }, () => {
          this.loadPriceTrend()
        })
      }
    }).exec()
  },

  loadPriceTrend() {
    const { productId, days } = this.data
    
    this.setData({ isLoading: true })
    
    priceApi.getPriceTrend(productId, { days })
      .then(res => {
        const trendData = res.data || res
        
        this.calculateChartData(trendData)
        
        this.setData({
          trendData,
          filteredPrices: trendData.currentPrices || [],
          isLoading: false
        }, () => {
          if (this.data.canvasReady) {
            setTimeout(() => this.drawChart(), 100)
          }
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
    const pricePadding = (maxPrice - minPrice) * 0.15 || 10
    
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
    
    const allPoints = []
    trendData.trendData.forEach((conditionData, index) => {
      if (conditionData.data && conditionData.data.length > 0) {
        conditionData.data.forEach(point => {
          allPoints.push({
            x: this.calculateX(point.date),
            y: this.calculateY(point.price),
            date: point.date,
            price: point.price,
            condition: conditionData.name,
            color: this.data.lineColors[index % this.data.lineColors.length],
            index: index
          })
        })
      }
    })
    
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
      },
      allPoints
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

  drawChart() {
    const { canvasWidth, canvasHeight, canvasDpr, trendData, lineColors } = this.data
    if (!canvasWidth || !canvasHeight || !trendData || !trendData.trendData) return
    
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = canvasWidth - padding.left - padding.right
    const chartHeight = canvasHeight - padding.top - padding.bottom
    
    const ctx = wx.createCanvasContext('trendChart')
    
    // 高 DPR 屏幕缩放，确保 Retina 屏渲染清晰
    const dpr = canvasDpr || 1
    ctx.scale(dpr, dpr)
    
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    ctx.setStrokeStyle('#e8e8e8')
    ctx.setLineWidth(1)
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvasWidth - padding.right, y)
      ctx.stroke()
    }
    
    ctx.setStrokeStyle('#d9d9d9')
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvasHeight - padding.bottom)
    ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom)
    ctx.stroke()
    
    const { yLabels } = this.data
    ctx.setFillStyle('#999999')
    ctx.setFontSize(10)
    ctx.setTextAlign('right')
    yLabels.forEach((label, i) => {
      const y = padding.top + (chartHeight / 4) * i + 3
      ctx.fillText(label.toString(), padding.left - 6, y)
    })
    
    const { dateRange } = this.data
    ctx.setTextAlign('center')
    const xLabelDates = this.getDateLabels()
    xLabelDates.forEach((date, i) => {
      const x = padding.left + (chartWidth / (xLabelDates.length - 1 || 1)) * i
      ctx.fillText(date, x, canvasHeight - padding.bottom + 16)
    })
    
    trendData.trendData.forEach((conditionData, lineIndex) => {
      if (!conditionData.data || conditionData.data.length < 1) return
      
      const validData = conditionData.data
        .filter(p => p.price > 0)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
      
      if (validData.length < 1) return
      
      const color = lineColors[lineIndex % lineColors.length]
      
      ctx.setStrokeStyle(color)
      ctx.setLineWidth(2)
      ctx.setLineCap('round')
      ctx.setLineJoin('round')
      
      ctx.beginPath()
      validData.forEach((point, i) => {
        const x = padding.left + this.calculateX(point.date) * chartWidth / 100
        const y = padding.top + this.calculateY(point.price) * chartHeight / 100
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
      
      validData.forEach(point => {
        const x = padding.left + this.calculateX(point.date) * chartWidth / 100
        const y = padding.top + this.calculateY(point.price) * chartHeight / 100
        
        ctx.setFillStyle(color)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.setFillStyle('#ffffff')
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      })
    })
    
    ctx.draw()
  },

  getDateLabels() {
    const { dateRange } = this.data
    if (!dateRange.start || !dateRange.end) return []
    
    const start = new Date(dateRange.start)
    const end = new Date(dateRange.end)
    const labels = []
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const step = Math.max(1, Math.floor(totalDays / 5))
    
    for (let i = 0; i <= totalDays; i += step) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }
    
    if (labels.length > 0 && labels[labels.length - 1] !== `${end.getMonth() + 1}/${end.getDate()}`) {
      labels.push(`${end.getMonth() + 1}/${end.getDate()}`)
    }
    
    return labels
  },

  onChartTap(e) {
    const { allPoints } = this.data
    const touch = e.touches[0]
    
    const query = wx.createSelectorQuery()
    query.select('.trend-canvas').boundingClientRect(rect => {
      if (!rect) return
      
      // 使用 canvas 相对于视口的实际位置计算触摸坐标
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const padding = { top: 20, right: 20, bottom: 40, left: 50 }
      const chartWidth = rect.width - padding.left - padding.right
      const chartHeight = rect.height - padding.top - padding.bottom
      
      let nearestPoint = null
      let minDistance = 25
      
      allPoints.forEach(point => {
        const px = padding.left + point.x * chartWidth / 100
        const py = padding.top + point.y * chartHeight / 100
        const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
        
        if (distance < minDistance) {
          minDistance = distance
          nearestPoint = point
        }
      })
      
      if (nearestPoint) {
        this.showPointDetail(nearestPoint, rect)
      }
    }).exec()
  },

  onChartTouchEnd() {
    setTimeout(() => {
      this.setData({ showDetail: false })
    }, 2000)
  },

  showPointDetail(point, rect) {
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom
    
    // 使用 rect 的实际视口位置计算弹窗坐标（position: fixed 需要视口坐标）
    const x = rect.left + padding.left + point.x * chartWidth / 100
    const y = rect.top + padding.top + point.y * chartHeight / 100
    
    this.setData({
      showDetail: true,
      detailX: x,
      detailY: y - 10,
      detailData: {
        condition: point.condition,
        date: point.date.slice(5),
        price: point.price
      }
    })
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
