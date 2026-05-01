const { orderApi } = require('../../utils/api-modules')

const STATUS_MAP = {
  shipping: { text: '待发货', color: '#ff9500' },
  transit: { text: '运输中', color: '#007aff' },
  inspecting: { text: '质检中', color: '#5856d6' },
  confirmed: { text: '已确认', color: '#34c759' },
  completed: { text: '已完成', color: '#34c759' },
  cancelled: { text: '已取消', color: '#8e8e93' }
}

Page({
  data: {
    order: null,
    isLoading: true,
    timelineExpanded: false,
    orderProcessTimeline: []
  },

  onLoad(options) {
    if (options.id) {
      this.loadOrderDetail(options.id)
    }
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

    const logistics = {
      company: raw.logistics_company || '',
      trackingNo: raw.tracking_no || '',
      status: raw.logistics_status || '',
      timeline: (raw.Timelines || []).map(t => ({
        desc: t.description || t.desc || '',
        time: t.happened_at ? t.happened_at.replace('T', ' ').substring(0, 16) : ''
      }))
    }

    return {
      id: raw.id,
      order_no: raw.order_no || '',
      status: raw.status,
      statusInfo,
      items,
      totalAmountText,
      logistics,
      cancelReason: raw.cancel_reason || '',
      created_at: raw.created_at ? raw.created_at.replace('T', ' ').substring(0, 16) : '',
      completed_at: raw.completed_at ? raw.completed_at.replace('T', ' ').substring(0, 16) : '',
      cancelled_at: raw.cancelled_at ? raw.cancelled_at.replace('T', ' ').substring(0, 16) : ''
    }
  },

  loadOrderDetail(id) {
    this.setData({ isLoading: true })
    orderApi.getOrderDetail(id).then((res) => {
      const raw = res.data
      const order = this.formatOrder(raw)
      const processTimeline = this.generateOrderProcessTimeline(order)
      this.setData({
        order,
        orderProcessTimeline: processTimeline,
        isLoading: false
      })
    }).catch(() => {
      this.setData({ isLoading: false })
      wx.showToast({ title: '订单不存在', icon: 'none' })
    })
  },

  generateOrderProcessTimeline(order) {
    const timeline = []
    const now = new Date()

    timeline.push({
      status: 'pending',
      title: '订单创建',
      desc: '您已成功提交订单，等待发货',
      time: order.created_at || now.toISOString(),
      active: true,
      completed: true
    })

    if (order.status === 'transit' || order.status === 'inspecting' || order.status === 'confirmed' || order.status === 'completed') {
      timeline.push({
        status: 'shipped',
        title: '商品已发货',
        desc: '您的商品已寄出，等待验收',
        time: order.created_at || '',
        active: order.status === 'transit',
        completed: true
      })
    }

    if (order.status === 'inspecting' || order.status === 'confirmed' || order.status === 'completed') {
      timeline.push({
        status: 'inspecting',
        title: '商品质检中',
        desc: '仓库正在对商品进行检测和评估',
        time: '',
        active: order.status === 'inspecting',
        completed: order.status !== 'inspecting'
      })
    }

    if (order.status === 'confirmed' || order.status === 'completed') {
      timeline.push({
        status: 'confirmed',
        title: '价格已确认',
        desc: '质检完成，回收价格已确认',
        time: '',
        active: order.status === 'confirmed',
        completed: order.status === 'completed'
      })
    }

    if (order.status === 'completed') {
      timeline.push({
        status: 'completed',
        title: '订单完成',
        desc: '款项已支付到您的账户，订单已完成',
        time: order.completed_at || '',
        active: true,
        completed: true
      })
    }

    if (order.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        title: '订单已取消',
        desc: '订单已取消，如有疑问请联系客服',
        time: order.cancelled_at || '',
        active: true,
        completed: true
      })
    }

    return timeline.reverse()
  },

  toggleTimeline() {
    this.setData({ timelineExpanded: !this.data.timelineExpanded })
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          orderApi.cancelOrder(this.data.order.id).then(() => {
            wx.showToast({ title: '订单已取消', icon: 'success' })
            this.loadOrderDetail(this.data.order.id)
          }).catch(() => {
            wx.showToast({ title: '取消失败', icon: 'none' })
          })
        }
      }
    })
  },

  copyTrackingNo() {
    const trackingNo = this.data.order?.logistics?.trackingNo
    if (trackingNo) {
      wx.setClipboardData({
        data: trackingNo,
        success: () => { wx.showToast({ title: '运单号已复制', icon: 'success' }) }
      })
    }
  },

  copyOrderNo() {
    const orderNo = this.data.order?.order_no
    if (orderNo) {
      wx.setClipboardData({
        data: orderNo,
        success: () => { wx.showToast({ title: '订单号已复制', icon: 'success' }) }
      })
    }
  },

  contactService() {
    wx.makePhoneCall({ phoneNumber: '15361862828' })
  },

  goToHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 订单详情', path: '/pages/order-list/order-list' }
  }
})
