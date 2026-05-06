const { userApi } = require('../../utils/api-modules')
const { PAGE_SIZE } = require('../../utils/constants')

Page({
  data: {
    list: [],
    loading: true,
    networkError: false,
    page: 1,
    hasMore: true
  },

  onLoad() { this.init() },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], hasMore: true })
    this.init()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadData()
  },

  init() {
    this.setData({ loading: true, networkError: false })
    this.loadData()
  },

  loadData() {
    userApi.getCoupons({ page: this.data.page, pageSize: PAGE_SIZE }).then(res => {
      const list = res.data?.list || res.data || []
      const coupons = this.data.page === 1 ? list : [...this.data.list, ...list]
      this.setData({
        list: coupons,
        loading: false,
        hasMore: list.length >= PAGE_SIZE,
        networkError: false
      })
    }).catch(() => {
      this.setData({ loading: false, networkError: this.data.list.length === 0 })
    })
  },

  onItemTap(e) {
    const item = this.data.list[e.currentTarget.dataset.index]
    if (!item) return
    wx.showToast({ title: item.title || '卡券详情', icon: 'none' })
  }
})
