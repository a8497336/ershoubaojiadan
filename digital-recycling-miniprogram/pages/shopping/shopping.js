const { cartApi, orderApi } = require('../../utils/api-modules')

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
    showClearConfirm: false,
    deleteTargetId: null
  },

  onLoad() {
    this.loadCart()
  },

  onShow() {
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
      unitPrice: raw.unit_price || 0,
      totalQuantity: raw.quantity || 1,
      isSelected: !!raw.is_selected
    }
  },

  loadCart() {
    this.setData({ loading: true })
    cartApi.getCart().then((res) => {
      const cart = res.data || {}
      const cartItems = (cart.list || []).map(item => this.formatCartItem(item))
      this.setData({
        cartItems,
        totalItems: cart.totalItems || 0,
        totalDevices: cart.totalDevices || 0,
        selectedCount: cart.selectedCount || 0,
        totalPrice: cart.totalPrice || '0.00',
        isAllSelected: cart.isAllSelected || false,
        isEmpty: cartItems.length === 0,
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false, isEmpty: true })
    })
  },

  toggleItemSelection(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    cartApi.updateCartItem(item.id, { is_selected: !item.isSelected }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  toggleSelectAll() {
    const newSelected = !this.data.isAllSelected
    cartApi.selectAll(newSelected).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item || item.totalQuantity <= 1) return
    cartApi.updateCartItem(item.id, { quantity: item.totalQuantity - 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    cartApi.updateCartItem(item.id, { quantity: item.totalQuantity + 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  handleDelete(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    this.setData({ showDeleteConfirm: true, deleteTargetId: item.id })
  },

  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false, deleteTargetId: null })
  },

  stopPropagation() {},

  confirmDelete() {
    const id = this.data.deleteTargetId
    if (!id) return
    cartApi.deleteCartItem(id).then(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
      this.loadCart()
    }).catch(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
    })
  },

  handleClearAll() {
    this.setData({ showClearConfirm: true })
  },

  handleClearCategory() {
    this.setData({ showClearConfirm: true })
  },

  closeClearConfirm() {
    this.setData({ showClearConfirm: false })
  },

  confirmClearAll() {
    cartApi.clearCart().then(() => {
      this.setData({ showClearConfirm: false })
      this.loadCart()
    }).catch(() => {
      this.setData({ showClearConfirm: false })
    })
  },

  handleAddMore() {
    wx.switchTab({ url: '/pages/brand-list/brand-list' })
  },

  handleSubmit() {
    if (this.data.selectedCount <= 0) {
      wx.showToast({ title: '请选择要回收的商品', icon: 'none' })
      return
    }
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

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 回收车', path: '/pages/shopping/shopping' }
  }
})
