const { pointsApi } = require('../../utils/api-modules')

Page({
  data: {
    points: 0,
    isSigned: false,
    logs: [],
    loading: true,
    page: 1,
    pageSize: 20,
    hasMore: true
  },

  onLoad() {
    this.fetchPointsBalance()
    this.fetchPointsLogs()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, logs: [] })
    Promise.all([this.fetchPointsBalance(), this.fetchPointsLogs()]).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.fetchPointsLogs()
    }
  },

  async fetchPointsBalance() {
    try {
      const res = await pointsApi.getBalance()
      this.setData({
        points: (res.data && res.data.points) || (res && res.points) || 0,
        isSigned: (res.data && res.data.is_signed) || (res && res.is_signed) || false
      })
    } catch (err) {
      console.error('获取积分余额失败:', err)
    }
  },

  async fetchPointsLogs() {
    if (!this.data.hasMore) return
    this.setData({ loading: true })
    try {
      const res = await pointsApi.getLogs({
        page: this.data.page,
        pageSize: this.data.pageSize
      })
      const list = (res.data && res.data.list) || res.data || (res && res.list) || []
      this.setData({
        logs: this.data.page === 1 ? list : [...this.data.logs, ...list],
        hasMore: list.length >= this.data.pageSize,
        loading: false
      })
    } catch (err) {
      console.error('获取积分记录失败:', err)
      this.setData({ loading: false })
    }
  },

  async handleSignIn() {
    if (this.data.isSigned) return
    try {
      await pointsApi.signIn()
      wx.showToast({ title: '签到成功', icon: 'success' })
      this.setData({ isSigned: true })
      this.fetchPointsBalance()
      this.setData({ page: 1, hasMore: true, logs: [] })
      this.fetchPointsLogs()
    } catch (err) {
      wx.showToast({ title: err.message || '签到失败', icon: 'none' })
    }
  }
})
