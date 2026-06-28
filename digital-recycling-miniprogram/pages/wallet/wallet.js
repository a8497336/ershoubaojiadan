const { userApi, walletApi } = require('../../utils/api-modules')
const { PAGE_SIZE } = require('../../utils/constants')

Page({
  data: {
    balance: '0.00',
    logs: [],
    page: 1,
    hasMore: true,
    loading: true,
    networkError: false
  },

  onLoad() {
    this.init()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, logs: [], hasMore: true })
    this.init()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadLogs()
  },

  init() {
    this.setData({ loading: true, networkError: false })
    this.loadData().then(() => {
      this.setData({ loading: false })
    }).catch(() => {
      this.setData({ loading: false, networkError: true })
    })
  },

  async loadData() {
    await this.loadBalance()
    await this.loadLogs()
  },

  loadBalance() {
    return walletApi.getInfo().then(res => {
      const info = res.data || res || {}
      this.setData({ balance: info.balance || '0.00' })
    }).catch(() => {})
  },

  loadLogs() {
    return walletApi.getLogs({ page: this.data.page, pageSize: PAGE_SIZE }).then(res => {
      const list = res.data?.list || res.data || []
      const logs = this.data.page === 1 ? list : [...this.data.logs, ...list]
      this.setData({
        logs,
        hasMore: list.length >= PAGE_SIZE,
        networkError: false
      })
    }).catch(() => {
      if (this.data.logs.length === 0) {
        this.setData({ networkError: true })
      }
    })
  },

  onLogTap(e) {
    const log = this.data.logs[e.currentTarget.dataset.index]
    if (log && log.id) {
      console.log('交易详情:', log)
    }
  }
})
