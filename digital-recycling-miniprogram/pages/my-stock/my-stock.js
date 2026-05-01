const { userStockApi } = require('../../utils/api-modules')

Page({
  data: {
    stockList: [],
    sortedList: [],
    isLoading: true,
    sortType: 'date',
    sortLabel: '最新添加',
    filterType: 'all',
    totalQuantity: 0,
    hasRise: 0
  },

  onLoad() {
    this.loadStockList()
  },

  onShow() {
    this.loadStockList()
  },

  onPullDownRefresh() {
    this.loadStockList()
    wx.stopPullDownRefresh()
  },

  formatStockItem(raw) {
    const product = raw.Product || {}
    const brand = product.Brand || {}
    const condition = raw.Condition || {}
    return {
      id: raw.id,
      productId: raw.productId || product.id,
      brandName: brand.name || '未知品牌',
      modelName: product.name || '未知型号',
      conditionName: condition.name || '',
      quantity: raw.quantity || 0,
      purchasePrice: parseFloat(raw.purchasePrice) || 0,
      currentPrice: parseFloat(raw.currentPrice) || 0,
      priceChange: parseFloat(raw.priceChange) || 0,
      note: raw.note || '',
      isSold: !!raw.isSold,
      createdAt: raw.created_at ? raw.created_at.replace('T', ' ').substring(0, 16) : ''
    }
  },

  loadStockList() {
    this.setData({ isLoading: true })
    userStockApi.getList({ is_sold: false, page: 1, page_size: 100 }).then((res) => {
      const data = res.data || {}
      const rawList = data.list || []
      const stockList = rawList.map(item => this.formatStockItem(item))

      let totalQuantity = 0
      let hasRise = 0
      stockList.forEach(item => {
        totalQuantity += item.quantity
        if (item.priceChange > 0) hasRise++
      })

      this.setData({
        stockList,
        totalQuantity,
        hasRise,
        isLoading: false
      })
      this.applySort()
    }).catch(() => {
      this.setData({ isLoading: false, stockList: [], sortedList: [] })
    })
  },

  showSortMenu() {
    const items = ['最新添加', '价格涨幅', '数量多少']
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const sortTypes = ['date', 'change', 'quantity']
        this.setData({
          sortType: sortTypes[res.tapIndex],
          sortLabel: items[res.tapIndex]
        })
        this.applySort()
      }
    })
  },

  showFilterMenu() {
    const items = ['全部', '仅看上涨', '仅看下跌']
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const filterTypes = ['all', 'rise', 'fall']
        this.setData({ filterType: filterTypes[res.tapIndex] })
        this.applySort()
      }
    })
  },

  applySort() {
    let list = [...this.data.stockList]
    const { sortType, filterType } = this.data

    if (filterType === 'rise') {
      list = list.filter(item => item.priceChange > 0)
    } else if (filterType === 'fall') {
      list = list.filter(item => item.priceChange < 0)
    }

    if (sortType === 'date') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortType === 'change') {
      list.sort((a, b) => b.priceChange - a.priceChange)
    } else if (sortType === 'quantity') {
      list.sort((a, b) => b.quantity - a.quantity)
    }

    this.setData({ sortedList: list })
  },

  viewTrend(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.stockList.find(i => i.id === id)
    if (item && item.productId) {
      wx.navigateTo({
        url: `/pages/price-trend/price-trend?productId=${item.productId}&model=${encodeURIComponent(item.modelName)}`
      })
    }
  },

  sellStock(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.stockList.find(i => i.id === id)
    if (!item) return
    wx.showModal({
      title: '卖出压货',
      content: `确定标记 ${item.modelName} 为已卖出吗？`,
      success: (res) => {
        if (res.confirm) {
          userStockApi.sellStock(id, { sold_price: item.currentPrice }).then(() => {
            wx.showToast({ title: '已标记卖出', icon: 'success' })
            this.loadStockList()
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },

  removeStock(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除压货',
      content: '确定删除该压货记录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          userStockApi.deleteStock(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadStockList()
          }).catch(() => {
            wx.showToast({ title: '删除失败', icon: 'none' })
          })
        }
      }
    })
  },

  goAddStock() {
    wx.navigateTo({ url: '/pages/brand-list/brand-list?mode=stock' })
  }
})
