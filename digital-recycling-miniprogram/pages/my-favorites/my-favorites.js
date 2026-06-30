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

  onLoad() {
    this.loadFirstPage()
  },

  onShow() {
    // 从其他页面返回后重新加载，保持旧数据不闪烁
    if (this._hasLoaded) {
      this.loadFirstPage()
    }
  },

  onPullDownRefresh() {
    this.loadFirstPage()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading || this._loadingMore) return
    this._loadingMore = true
    this.setData({ page: this.data.page + 1 })
    this.loadData().finally(() => {
      this._loadingMore = false
    })
  },

  loadFirstPage() {
    if (this._loading) return
    this._loading = true
    this.setData({ loading: true, networkError: false, page: 1, hasMore: true })

    userApi.getFavorites({ page: 1, pageSize: PAGE_SIZE }).then(res => {
      const list = (res.data && res.data.list) || res.list || []
      this.setData({
        list: list,
        loading: false,
        hasMore: list.length >= PAGE_SIZE,
        networkError: false
      })
      this._hasLoaded = true
    }).catch(() => {
      this.setData({
        loading: false,
        networkError: this.data.list.length === 0
      })
    }).finally(() => {
      this._loading = false
    })
  },

  loadData() {
    return userApi.getFavorites({ page: this.data.page, pageSize: PAGE_SIZE }).then(res => {
      const list = (res.data && res.data.list) || res.list || []
      const result = [...this.data.list, ...list]
      this.setData({
        list: result,
        loading: false,
        hasMore: list.length >= PAGE_SIZE,
        networkError: false
      })
    }).catch(() => {
      this.setData({
        loading: false,
        networkError: this.data.list.length === 0
      })
    })
  },

  // 点击收藏项，跳转到对应品牌的报价单
  onItemTap(e) {
    const item = this.data.list[e.currentTarget.dataset.index]
    if (!item || !item.brand_id) return
    wx.navigateTo({
      url: `/pages/price-quote/price-quote?brandId=${item.brand_id}&brand=${encodeURIComponent(item.brand_name || '')}`
    })
  },

  // 取消收藏
  onRemoveFavorite(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.list[index]
    if (!item) return

    wx.showModal({
      title: '取消收藏',
      content: `确定取消收藏「${item.brand_name || '该品牌'}」吗？`,
      success: (res) => {
        if (!res.confirm) return
        userApi.removeFavorite(item.id).then(() => {
          const list = this.data.list.filter((_, i) => i !== index)
          this.setData({ list })
          wx.showToast({ title: '已取消收藏', icon: 'none' })
        }).catch(() => {
          wx.showToast({ title: '操作失败', icon: 'none' })
        })
      }
    })
  }
})
