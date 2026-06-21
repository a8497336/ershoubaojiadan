const { priceApi } = require('../../utils/api-modules')

// 触摸容差半径 (px)，扩大点击区域，提升点击命中率
const TOUCH_HIT_RADIUS = 30
// 弹窗持续显示时间 (ms)
const DETAIL_HIDE_DELAY = 3000

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
    canvasReady: false,
    allPoints: []
  },

  // 保存 canvas 节点引用（不参与响应式）
  _canvas: null,
  _ctx: null,
  _dpr: 1,
  _canvasRect: null,
  // 弹窗关闭定时器
  _hideTimer: null,
  // 防止 touchstart + tap 双重触发
  _detailJustShown: false,

  onLoad(options) {
    const productId = options.productId ? parseInt(options.productId) : null
    const model = options.model ? decodeURIComponent(options.model) : ''

    this.setData({ productId, model })

    wx.setNavigationBarTitle({
      title: model ? `${model} - 价格趋势` : '价格趋势'
    })
  },

  onReady() {
    // 1. 触发数据加载
    this.loadPriceTrend()
    // 2. 延迟一帧尝试初始化 canvas（如果 canvas 此时已渲染则直接初始化）
    wx.nextTick(() => this._initCanvasIfNeeded())
  },

  onUnload() {
    this._clearHideTimer()
  },

  // 初始化 canvas 节点，已初始化则跳过
  _initCanvasIfNeeded() {
    if (this._canvas) {
      // 已初始化，数据有就重绘
      if (this.data.trendData) this.drawChart()
      return
    }

    const query = wx.createSelectorQuery()
    query.select('#trendChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          // canvas 节点未找到（可能还在 wx:if 内未渲染），稍后由 loadPriceTrend 触发重试
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio || 1
        const width = res[0].width
        const height = res[0].height

        // Canvas 2D 必须显式设置画布宽高 (CSS 像素 * dpr)
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        this._canvas = canvas
        this._ctx = ctx
        this._dpr = dpr

        this.setData({
          canvasWidth: width,
          canvasHeight: height,
          canvasReady: true
        })

        // 缓存 canvas 在页面中的位置（用于 hit detection 守卫）
        wx.createSelectorQuery().select('#trendChart')
          .boundingClientRect()
          .exec((rectRes) => {
            if (rectRes && rectRes[0]) {
              this._canvasRect = rectRes[0]
            }
          })

        // 如果数据已就绪，立即绘制
        if (this.data.trendData) {
          this.drawChart()
        }
      })
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
          // setData 回调在视图更新后执行，此时 canvas 节点已在视图中
          // 触发 canvas 初始化（如果还没初始化）或直接重绘
          this._initCanvasIfNeeded()
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

    // 先计算好新的 range，避免 calcX/calcY 读取 this.data 中的过期值
    const newPriceRange = {
      min: minPrice - pricePadding,
      max: maxPrice + pricePadding
    }
    const newDateRange = {
      start: sortedDates[0] || '',
      end: sortedDates[sortedDates.length - 1] || ''
    }

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

    // 内联计算点位坐标，使用刚算好的 range，不依赖 this.data
    const allPoints = []
    trendData.trendData.forEach((conditionData, index) => {
      if (conditionData.data && conditionData.data.length > 0) {
        conditionData.data.forEach(point => {
          allPoints.push({
            x: this.calcX(point.date, newDateRange),
            y: this.calcY(point.price, newPriceRange),
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
      priceRange: newPriceRange,
      dateRange: newDateRange,
      allPoints
    })
  },

  calcX(date, dateRange) {
    if (!dateRange.start || !dateRange.end) return 50

    const start = new Date(dateRange.start).getTime()
    const end = new Date(dateRange.end).getTime()
    const current = new Date(date).getTime()

    if (end === start) return 50

    return ((current - start) / (end - start)) * 100
  },

  calcY(price, priceRange) {
    if (priceRange.max === priceRange.min) return 50

    return 100 - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * 100
  },

  drawChart() {
    if (!this._ctx) return
    const { canvasWidth, canvasHeight, trendData, lineColors, yLabels } = this.data
    if (!canvasWidth || !canvasHeight || !trendData || !trendData.trendData) return

    const ctx = this._ctx
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = canvasWidth - padding.left - padding.right
    const chartHeight = canvasHeight - padding.top - padding.bottom

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 横向网格线
    ctx.strokeStyle = '#e8e8e8'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(canvasWidth - padding.right, y)
      ctx.stroke()
    }

    // 坐标轴
    ctx.strokeStyle = '#d9d9d9'
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, canvasHeight - padding.bottom)
    ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom)
    ctx.stroke()

    // Y 轴标签
    ctx.fillStyle = '#999999'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    yLabels.forEach((label, i) => {
      const y = padding.top + (chartHeight / 4) * i
      ctx.fillText(label.toString(), padding.left - 6, y)
    })

    // X 轴标签
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const xLabelDates = this.getDateLabels()
    xLabelDates.forEach((date, i) => {
      const x = padding.left + (chartWidth / (xLabelDates.length - 1 || 1)) * i
      ctx.fillText(date, x, canvasHeight - padding.bottom + 6)
    })

    // 重置 baseline，避免影响后续绘制
    ctx.textBaseline = 'alphabetic'

    // 折线
    const priceRange = this.data.priceRange
    const dateRange = this.data.dateRange

    trendData.trendData.forEach((conditionData, lineIndex) => {
      if (!conditionData.data || conditionData.data.length < 1) return

      const validData = conditionData.data
        .filter(p => p.price > 0)
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      if (validData.length < 1) return

      const color = lineColors[lineIndex % lineColors.length]

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      validData.forEach((point, i) => {
        const x = padding.left + this.calcX(point.date, dateRange) * chartWidth / 100
        const y = padding.top + this.calcY(point.price, priceRange) * chartHeight / 100

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // 数据点
      validData.forEach(point => {
        const x = padding.left + this.calcX(point.date, dateRange) * chartWidth / 100
        const y = padding.top + this.calcY(point.price, priceRange) * chartHeight / 100

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, 2 * Math.PI)
        ctx.fill()
      })
    })

    // 绘制 tooltip（在 canvas 上，无层级遮挡问题）
    if (this.data.showDetail) {
      this._drawTooltip(ctx, padding, chartWidth, chartHeight)
    }
  },

  _drawTooltip(ctx, padding, chartWidth, chartHeight) {
    const { detailData } = this.data
    if (!detailData || detailData.px === undefined) return

    const px = padding.left + detailData.px * chartWidth / 100
    const py = padding.top + detailData.py * chartHeight / 100

    const lines = [
      detailData.condition,
      detailData.date,
      '¥' + detailData.price
    ]

    ctx.font = '11px sans-serif'
    const textWidths = lines.map(l => ctx.measureText(l).width)
    const maxWidth = Math.max(...textWidths)
    const lineHeight = 16
    const boxWidth = maxWidth + 20
    const boxHeight = lines.length * lineHeight + 12
    const arrowH = 6

    const canvasH = this.data.canvasHeight
    const boxX = px - boxWidth / 2
    const clampedX = Math.max(2, Math.min(boxX, this.data.canvasWidth - boxWidth - 2))

    // 默认画在数据点下方，放不下时画在上方
    let boxY = py + arrowH + 8
    let arrowUp = true // 箭头朝上（指数据点）

    if (boxY + boxHeight > canvasH - 2) {
      // 下方放不下，画在上方
      boxY = py - boxHeight - arrowH - 8
      arrowUp = false
      if (boxY < 2) boxY = 2
    }

    // 圆角背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    this._roundRect(ctx, clampedX, boxY, boxWidth, boxHeight, 6)

    // 箭头
    ctx.beginPath()
    if (arrowUp) {
      ctx.moveTo(px - 5, boxY - arrowH)
      ctx.lineTo(px, boxY)
      ctx.lineTo(px + 5, boxY - arrowH)
    } else {
      ctx.moveTo(px - 5, boxY + boxHeight)
      ctx.lineTo(px, boxY + boxHeight + arrowH)
      ctx.lineTo(px + 5, boxY + boxHeight)
    }
    ctx.fill()

    // 文字
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    lines.forEach((line, i) => {
      const textY = boxY + 8 + i * lineHeight + lineHeight / 2
      if (i === 0) { ctx.font = '10px sans-serif'; ctx.globalAlpha = 0.8 }
      else if (i === 2) { ctx.font = 'bold 12px sans-serif'; ctx.globalAlpha = 1 }
      else { ctx.font = '10px sans-serif'; ctx.globalAlpha = 0.7 }
      ctx.fillText(line, clampedX + boxWidth / 2, textY)
    })
    ctx.globalAlpha = 1
  },

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
    ctx.fill()
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

  // touchstart 主响应
  onChartTouchStart(e) {
    this._detailJustShown = false
    this._handleChartTouch(e)
  },

  // tap 作为降级 + 关闭弹窗
  onChartTap(e) {
    if (this._detailJustShown) {
      this._detailJustShown = false
      return
    }
    if (this.data.showDetail) {
      // 弹窗已显示：关闭并重绘
      this._clearHideTimer()
      this.setData({ showDetail: false }, () => this.drawChart())
      return
    }
    this._handleChartTouch(e)
  },

  _handleChartTouch(e) {
    const { allPoints, canvasWidth, canvasHeight, showDetail } = this.data
    if (!this._canvasRect) return

    let x, y
    if (e.touches && e.touches[0]) {
      x = e.touches[0].x
      y = e.touches[0].y
    } else if (e.detail && e.detail.x !== undefined) {
      x = e.detail.x
      y = e.detail.y
    } else {
      return
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = canvasWidth - padding.left - padding.right
    const chartHeight = canvasHeight - padding.top - padding.bottom

    let nearestPoint = null
    let minDistance = TOUCH_HIT_RADIUS

    for (let i = 0; i < allPoints.length; i++) {
      const point = allPoints[i]
      const px = padding.left + point.x * chartWidth / 100
      const py = padding.top + point.y * chartHeight / 100
      const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))

      if (distance < minDistance) {
        minDistance = distance
        nearestPoint = point
      }
    }

    if (nearestPoint) {
      this._showPointDetail(nearestPoint)
    } else if (showDetail) {
      this._clearHideTimer()
      this.setData({ showDetail: false }, () => this.drawChart())
    }
  },

  _showPointDetail(point) {
    this._detailJustShown = true

    this._clearHideTimer()
    this._hideTimer = setTimeout(() => {
      this.setData({ showDetail: false }, () => this.drawChart())
    }, DETAIL_HIDE_DELAY)

    this.setData({
      showDetail: true,
      detailData: {
        condition: point.condition,
        date: point.date.slice(5),
        price: point.price,
        // 存储点位百分比坐标，供 drawChart 绘制 tooltip
        px: point.x,
        py: point.y
      }
    }, () => {
      // 重绘图表，在 canvas 上绘制 tooltip
      this.drawChart()
    })
  },

  _clearHideTimer() {
    if (this._hideTimer) {
      clearTimeout(this._hideTimer)
      this._hideTimer = null
    }
  },

  selectDays(e) {
    const days = parseInt(e.currentTarget.dataset.days)
    this.setData({ days })
    this.loadPriceTrend()
  },

  selectCondition(e) {
    const rawCondition = e.currentTarget.dataset.condition
    const conditionId = (rawCondition === null || rawCondition === undefined || rawCondition === '') ? null : parseInt(rawCondition)
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

  goToOrder() {
    wx.switchTab({
      url: '/pages/shopping/shopping'
    })
  }
})
