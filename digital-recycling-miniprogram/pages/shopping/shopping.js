const { cartApi, orderApi } = require('../../utils/api-modules')
const app = getApp()

Page({
  data: {
    cartItems: [],
    totalItems: 0,
    totalDevices: 0,
    selectedCount: 0,
    totalPrice: '0.00',
    isAllSelected: false,
    isEmpty: true,
    loading: true,
    showDeleteConfirm: false,
    deleteTargetId: null,
    statusBarHeight: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'shopping' })
    }
    this.loadCart()
  },

  formatCartItem(raw) {
    return {
      id: raw.id,
      productId: raw.product_id,
      conditionId: raw.condition_id,
      productName: raw.Product ? raw.Product.name : '未知产品',
      productImage: raw.Product && raw.Product.image ? raw.Product.image : '',
      conditionName: raw.Condition ? raw.Condition.name : '',
      price: raw.unit_price || 0,
      totalQuantity: raw.quantity || 1,
      selected: !!raw.is_selected
    }
  },

  loadCart() {
    this.setData({ loading: true })
    cartApi.getList().then((res) => {
      const cart = res.data || res || {}
      const cartItems = (cart.list || []).map(item => this.formatCartItem(item))
      const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected)
      this.setData({
        cartItems,
        totalItems: cart.totalItems || cartItems.length,
        totalDevices: cart.totalDevices || cartItems.length,
        selectedCount: cart.selectedCount || cartItems.filter(i => i.selected).length,
        totalPrice: cart.totalPrice || '0.00',
        isAllSelected: allSelected,
        isEmpty: cartItems.length === 0,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, isEmpty: true })
    })
  },

  onSelect(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    cartApi.update(item.id, { is_selected: !item.selected }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  onSelectAll() {
    const newSelected = !this.data.isAllSelected
    cartApi.selectAll(newSelected).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  onDecrease(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item || item.totalQuantity <= 1) return
    cartApi.update(item.id, { quantity: item.totalQuantity - 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  onIncrease(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    cartApi.update(item.id, { quantity: item.totalQuantity + 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  onDeleteTap(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    this.setData({ showDeleteConfirm: true, deleteTargetId: item.id })
  },

  onDeleteCancel() {
    this.setData({ showDeleteConfirm: false, deleteTargetId: null })
  },

  onDeleteConfirm() {
    const id = this.data.deleteTargetId
    if (!id) return
    cartApi.remove(id).then(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
      this.loadCart()
    }).catch(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
    })
  },

  onClearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定清空回收车中所有商品？',
      success: (res) => {
        if (res.confirm) {
          cartApi.clear().then(() => {
            this.loadCart()
          }).catch(() => {})
        }
      }
    })
  },

  onAddMore() {
    wx.switchTab({ url: '/pages/brand-list/brand-list' })
  },

  onSubmit() {
    if (this.data.selectedCount <= 0) return
    wx.showModal({
      title: '确认提交',
      content: `确定提交 ${this.data.selectedCount} 台设备的回收订单吗？`,
      success: (res) => {
        if (res.confirm) {
          orderApi.createOrder({}).then((res) => {
            wx.showToast({ title: '订单创建成功', icon: 'success' })
            setTimeout(() => {
              wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${res.data.orderId}` })
            }, 1500)
          }).catch(() => {
            wx.showToast({ title: '订单创建失败', icon: 'none' })
          })
        }
      }
    })
  },

  onShareAppMessage() {
    return { title: '联赢电子回收网 - 回收车', path: '/pages/shopping/shopping' }
  }
})
