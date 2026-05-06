const { pointsApi } = require('../../utils/api-modules')
const { PAGE_SIZE } = require('../../utils/constants')
Page({
  data: {
    points: 0,
    list: [],
    loading: true,
    networkError: false,
    page: 1,
    hasMore: true
  },
  onLoad() { this.init() },
  onPullDownRefresh() { this.setData({ page: 1, list: [], hasMore: true }); this.init(); wx.stopPullDownRefresh() },
  onReachBottom() { if (!this.data.hasMore || this.data.loading) return; this.setData({ page: this.data.page + 1 }); this.loadProducts() },
  init() { this.setData({ loading: true, networkError: false }); this.loadPoints(); this.loadProducts() },
  loadPoints() {
    pointsApi.getBalance().then(res => {
      this.setData({ points: res.data?.points || res.data?.balance || 0 })
    }).catch(() => {})
  },
  loadProducts() {
    this.setData({ loading: true })
    pointsApi.getProducts({ page: this.data.page, pageSize: PAGE_SIZE }).then(res => {
      const list = res.data?.list || res.data || []
      const products = this.data.page === 1 ? list : [...this.data.list, ...list]
      this.setData({ list: products, loading: false, hasMore: list.length >= PAGE_SIZE, networkError: false })
    }).catch(() => { this.setData({ loading: false, networkError: this.data.list.length === 0 }) })
  },
  onExchange(e) {
    const item = this.data.list[e.currentTarget.dataset.index]
    if (!item) return
    if (this.data.points < item.required_points) {
      wx.showToast({ title: '积分不足', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认兑换',
      content: `花费${item.required_points}积分兑换"${item.name}"？`,
      success: (res) => {
        if (res.confirm) {
          pointsApi.exchange(item.id).then(() => {
            wx.showToast({ title: '兑换成功', icon: 'success' })
            this.loadPoints()
          }).catch((err) => { wx.showToast({ title: err.message || '兑换失败', icon: 'none' }) })
        }
      }
    })
  }
})
