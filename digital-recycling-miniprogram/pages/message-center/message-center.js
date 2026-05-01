const { messageApi } = require('../../utils/api-modules')

const TYPE_MAP = {
  order: { label: '订单', color: '#007aff', icon: '/images/icons/cart.svg' },
  price: { label: '报价', color: '#ff2d4a', icon: '/images/icons/chart.svg' },
  system: { label: '系统', color: '#34c759', icon: '/images/icons/announcement.svg' },
  points: { label: '积分', color: '#ff9500', icon: '/images/icons/points.svg' },
  wallet: { label: '钱包', color: '#5856d6', icon: '/images/icons/wallet.svg' }
}

Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'unread', label: '未读' },
      { key: 'order', label: '订单' },
      { key: 'price', label: '报价' },
      { key: 'system', label: '系统' }
    ],
    filteredMessages: [],
    isLoading: true,
    unreadCount: 0,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadUnreadCount()
    this.loadMessages()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true, filteredMessages: [] })
    this.loadMessages()
    this.loadUnreadCount()
    wx.stopPullDownRefresh()
  },

  loadUnreadCount() {
    messageApi.getUnreadCount().then((res) => {
      this.setData({ unreadCount: res.data || 0 })
    }).catch(() => {})
  },

  formatMessage(raw) {
    const typeInfo = TYPE_MAP[raw.type] || TYPE_MAP.system
    const timeText = raw.created_at ? this.formatTime(raw.created_at) : ''
    return {
      id: raw.id,
      title: raw.title || '',
      content: raw.content || '',
      icon: raw.icon || typeInfo.icon,
      typeInfo,
      isRead: !!raw.is_read,
      timeText
    }
  },

  formatTime(dateStr) {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    return (d.getMonth() + 1) + '-' + d.getDate()
  },

  loadMessages() {
    this.setData({ isLoading: true })
    messageApi.getMessages({
      type: this.data.activeTab,
      page: this.data.page,
      pageSize: 20
    }).then((res) => {
      const data = res.data || {}
      const rawList = data.list || []
      const newMessages = rawList.map(m => this.formatMessage(m))
      this.setData({
        filteredMessages: this.data.page === 1 ? newMessages : [...this.data.filteredMessages, ...newMessages],
        hasMore: rawList.length >= 20,
        isLoading: false
      })
    }).catch(() => {
      this.setData({ isLoading: false })
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.key
    this.setData({ activeTab: tab, page: 1, filteredMessages: [], hasMore: true })
    this.loadMessages()
  },

  markAsRead(e) {
    const id = e.currentTarget.dataset.id
    const msg = this.data.filteredMessages.find(m => m.id === id)
    if (msg && msg.isRead) return
    messageApi.markRead(id).then(() => {
      const filteredMessages = this.data.filteredMessages.map(m => {
        if (m.id === id) m.isRead = true
        return m
      })
      this.setData({
        filteredMessages,
        unreadCount: Math.max(0, this.data.unreadCount - 1)
      })
    }).catch(() => {})
  },

  markAllAsRead() {
    messageApi.markAllRead().then(() => {
      const filteredMessages = this.data.filteredMessages.map(m => {
        m.isRead = true
        return m
      })
      this.setData({ filteredMessages, unreadCount: 0 })
      wx.showToast({ title: '已全部标记已读', icon: 'success' })
    }).catch(() => {})
  },

  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.setData({ page: this.data.page + 1 })
      this.loadMessages()
    }
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 消息中心', path: '/pages/message-center/message-center' }
  }
})
