const { priceApi } = require('../../utils/api-modules')
const { PAGE_SIZE } = require('../../utils/constants')
Page({
  data: { list: [], loading: true, networkError: false, page: 1, hasMore: true },
  onLoad() { this.init() },
  onPullDownRefresh() { this.setData({ page: 1, list: [], hasMore: true }); this.init(); wx.stopPullDownRefresh() },
  onReachBottom() { if (!this.data.hasMore || this.data.loading) return; this.setData({ page: this.data.page + 1 }); this.loadData() },
  init() { this.setData({ loading: true, networkError: false }); this.loadData() },
  loadData() {
    priceApi.getChanges({ page: this.data.page, pageSize: PAGE_SIZE }).then(res => {
      const list = res.data?.list || res.data || []
      const result = this.data.page === 1 ? list : [...this.data.list, ...list]
      this.setData({ list: result, loading: false, hasMore: list.length >= PAGE_SIZE, networkError: false })
    }).catch(() => { this.setData({ loading: false, networkError: this.data.list.length === 0 }) })
  },
  onItemTap(e) { const item = this.data.list[e.currentTarget.dataset.index]; if (item && item.product_id) wx.navigateTo({ url: `/pages/price-quote/price-quote?productId=${item.product_id}` }) }
})
