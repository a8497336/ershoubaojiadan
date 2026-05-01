const { orderApi } = require('../../utils/api-modules')

const STATUS_MAP = {
  shipping: { text: '待发货', color: '#ff9500' },
  transit: { text: '运输中', color: '#007aff' },
  inspecting: { text: '质检中', color: '#5856d6' },
  completed: { text: '已完成', color: '#34c759' },
  cancelled: { text: '已取消', color: '#8e8e93' }
}

Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'shipping', label: '待发货' },
      { key: 'transit', label: '运输中' },
      { key: 'completed', label: '已完成' },
      { key: 'cancelled', label: '已取消' }
    ],
    filteredOrders: [],
    isLoading: true,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    if (options.status) {
      this.setData({ activeTab: options.status })
    }
    this.loadOrders()
  },

  onShow() {
    this.setData({ page: 1, hasMore: true, filteredOrders: [] })
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, filteredOrders: [] })
    this.loadOrders()
    wx.stopPullDownRefresh()
  },

  formatOrder(raw) {
    const items = (raw.Items || []).map(it => ({
      name: it.product_name || '',
      condition: it.condition_name || '',
      price: it.unit_price || 0,
      quantity: it.quantity || 1
    }))
    const statusInfo = STATUS_MAP[raw.status] || { text: raw.status, color: '#999' }
    const totalAmountText = (raw.total_amount || 0).toFixed(2)
    const createTime = raw.created_at ? raw.created_at.replace('T', ' ').substring(0, 16) : ''
    return {
      id: raw.id,
      orderNo: raw.order_no || '',
      status: raw.status,
      statusInfo,
      items,
      totalAmountText,
      createTime,
      trackingNo: raw.tracking_no || '',
      logisticsCompany: raw.logistics_company || ''
    }
  },

  loadOrders() {
    this.setData({ isLoading: true })
    orderApi.getOrders({
      status: this.data.activeTab,
      page: this.data.page,
      pageSize: 10
    }).then((res) => {
      const data = res.data || {}
      const rawList = data.list || []
      const newOrders = rawList.map(o => this.formatOrder(o))
      this.setData({
        filteredOrders: this.data.page === 1 ? newOrders : [...this.data.filteredOrders, ...newOrders],
        hasMore: rawList.length >= 10,
        isLoading: false
      })
    }).catch(() => {
      this.setData({ isLoading: false })
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.key
    this.setData({ activeTab: tab, page: 1, filteredOrders: [], hasMore: true })
    this.loadOrders()
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` })
  },

  cancelOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          orderApi.cancelOrder(id, '用户主动取消').then(() => {
            wx.showToast({ title: '订单已取消', icon: 'success' })
            this.setData({ page: 1, filteredOrders: [], hasMore: true })
            this.loadOrders()
          }).catch(() => {
            wx.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      }
    })
  },

  viewLogistics(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${id}` })
  },

  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 我的订单', path: '/pages/order-list/order-list' }
  }
})
