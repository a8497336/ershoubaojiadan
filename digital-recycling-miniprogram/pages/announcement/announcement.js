const { contentApi } = require('../../utils/api-modules')

Page({
  data: {
    announcements: [],
    loading: true,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.fetchAnnouncements()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, announcements: [] })
    this.fetchAnnouncements().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.fetchAnnouncements()
    }
  },

  async fetchAnnouncements() {
    if (!this.data.hasMore) return
    this.setData({ loading: true })
    try {
      const res = await contentApi.getAnnouncements({
        page: this.data.page,
        pageSize: this.data.pageSize
      })
      const list = (res.data && res.data.list) || res.data || (res && res.list) || []
      this.setData({
        announcements: this.data.page === 1 ? list : [...this.data.announcements, ...list],
        hasMore: list.length >= this.data.pageSize,
        loading: false
      })
    } catch (err) {
      console.error('获取公告失败:', err)
      this.setData({ loading: false })
    }
  },

  onAnnouncementTap(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.announcements[index]
    if (item) {
      wx.showModal({
        title: item.title,
        content: item.content || item.summary || '暂无详情',
        showCancel: false
      })
    }
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
})
