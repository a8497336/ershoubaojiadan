const { cartApi, orderApi } = require('../../utils/api-modules')

Page({
  data: {
    cartItems: [],
    totalItems: 0,
    totalDevices: 0,
    selectedCount: 0,
    totalPrice: '0.00',
    isAllSelected: false,
    allSelected: false,
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
        allSelected: allSelected,
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
    cartApi.update(item.id, { is_selected: !item.selected }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  toggleSelect(e) {
    this.toggleItemSelection(e)
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
    cartApi.update(item.id, { quantity: item.totalQuantity - 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  decreaseQty(e) {
    this.decreaseQuantity(e)
  },

  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    cartApi.update(item.id, { quantity: item.totalQuantity + 1 }).then(() => {
      this.loadCart()
    }).catch(() => {})
  },

  increaseQty(e) {
    this.increaseQuantity(e)
  },

  handleDelete(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.cartItems[index]
    if (!item) return
    this.setData({ showDeleteConfirm: true, deleteTargetId: item.id })
  },

  showDeleteModal(e) {
    this.handleDelete(e)
  },

  closeDeleteConfirm() {
    this.setData({ showDeleteConfirm: false, deleteTargetId: null })
  },

  hideDeleteModal() {
    this.closeDeleteConfirm()
  },

  stopPropagation() {},

  nop() {
    this.stopPropagation()
  },

  confirmDelete() {
    const id = this.data.deleteTargetId
    if (!id) return
    cartApi.remove(id).then(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
      this.loadCart()
    }).catch(() => {
      this.setData({ showDeleteConfirm: false, deleteTargetId: null })
    })
  },

  handleClearAll() {
    this.setData({ showClearConfirm: true })
  },

  showClearModal() {
    this.handleClearAll()
  },

  handleClearCategory() {
    this.setData({ showClearConfirm: true })
  },

  closeClearConfirm() {
    this.setData({ showClearConfirm: false })
  },

  hideClearModal() {
    this.closeClearConfirm()
  },

  confirmClearAll() {
    cartApi.clear().then(() => {
      this.setData({ showClearConfirm: false })
      this.loadCart()
    }).catch(() => {
      this.setData({ showClearConfirm: false })
    })
  },

  confirmClear() {
    this.confirmClearAll()
  },

  handleAddMore() {
    wx.switchTab({ url: '/pages/brand-list/brand-list' })
  },

  goToBrandList() {
    wx.switchTab({ url: '/pages/brand-list/brand-list' })
  },

  handleSubmit() {
    if (this.data.selectedCount <= 0) {
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

  submitOrder() {
    this.handleSubmit()
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 回收车', path: '/pages/shopping/shopping' }
  }
})
