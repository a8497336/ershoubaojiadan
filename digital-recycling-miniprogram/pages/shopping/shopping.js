const { cartApi, orderApi, priceApi } = require('../../utils/api-modules')
const { checkLogin } = require('../../utils/common')
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
    statusBarHeight: 0,
    navHeightRpx: 88,
    pageStyle: '--nav-h: 88rpx;'
  },

  onLoad() {
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })
  },

  onReady() {
    // 测量 nav-bar 实际高度（含状态栏），用于 .cart-page padding-top 占位，避免内容被 fixed 顶部遮挡
    const query = wx.createSelectorQuery()
    query.select('.nav-bar').boundingClientRect()
    query.exec((res) => {
      const navRect = res && res[0]
      if (!navRect) return
      const sysInfo = wx.getSystemInfoSync()
      const rpxToPx = sysInfo.windowWidth / 750
      const navH_Rpx = Math.ceil(navRect.height / rpxToPx)
      this.setData({ navHeightRpx: navH_Rpx, pageStyle: `--nav-h: ${navH_Rpx}rpx;` })
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'shopping' })
    }
    if (!checkLogin('/pages/shopping/shopping')) return
    this.loadCart()
  },

  buildPriceMap(priceData) {
    const priceMap = {}
    const rawList = priceData || []
    rawList.forEach(item => {
      const productId = item.id
      ;(item.Prices || []).forEach(p => {
        const conditionId = p.condition_id || (p.Condition ? p.Condition.id : null)
        if (conditionId !== null && p.price !== undefined && p.price !== null) {
          priceMap[`${productId}_${conditionId}`] = parseFloat(p.price)
        }
      })
    })
    return priceMap
  },

  formatCartItem(raw, latestPriceMap) {
    const productId = raw.product_id
    const conditionId = raw.condition_id
    const key = `${productId}_${conditionId}`
    const latestPrice = latestPriceMap && latestPriceMap[key] !== undefined ? latestPriceMap[key] : null
    const unitPrice = raw.unit_price || 0
    const displayPrice = latestPrice !== null ? latestPrice : unitPrice

    return {
      id: raw.id,
      productId: productId,
      conditionId: conditionId,
      productName: raw.Product ? raw.Product.name : '未知产品',
      productImage: raw.Product && raw.Product.image ? raw.Product.image : '',
      conditionName: raw.Condition ? raw.Condition.name : '',
      price: displayPrice,
      originalPrice: unitPrice,
      hasLatestPrice: latestPrice !== null && latestPrice !== unitPrice,
      totalQuantity: raw.quantity || 1,
      selected: !!raw.is_selected
    }
  },

  loadCart() {
    this.setData({ loading: true })

    let cartData = null
    let priceData = []
    let cartLoaded = false
    let priceLoaded = false

    const checkAndProcess = () => {
      if (!cartLoaded) return
      const finalPriceData = priceLoaded ? priceData : []
      const cart = cartData || {}
      const latestPriceMap = this.buildPriceMap(finalPriceData)
      const cartItems = (cart.list || []).map(item => this.formatCartItem(item, latestPriceMap))
      const selectedItems = cartItems.filter(i => i.selected)
      const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length
      const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.totalQuantity), 0)
      this.setData({
        cartItems,
        totalItems: cart.totalItems || cartItems.length,
        totalDevices: cart.totalDevices || cartItems.length,
        selectedCount: selectedItems.length,
        totalPrice: totalPrice.toFixed(2),
        isAllSelected: allSelected,
        isEmpty: cartItems.length === 0,
        loading: false
      })
    }

    cartApi.getList().then((res) => {
      cartData = res.data || res || {}
      cartLoaded = true
      checkAndProcess()
    }).catch(() => {
      cartData = {}
      cartLoaded = true
      checkAndProcess()
    })

    priceApi.getTodayPrices().then((res) => {
      priceData = res.data || []
      priceLoaded = true
      if (cartLoaded) checkAndProcess()
    }).catch(() => {
      priceData = []
      priceLoaded = true
      if (cartLoaded) checkAndProcess()
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
          // 构造订单负载：仅提交用户已选中的商品（C-4 修复）
          const items = this.data.cartItems
            .filter(item => item.selected)
            .map(item => ({
              product_id: item.productId,
              condition_id: item.conditionId,
              quantity: item.totalQuantity,
              unit_price: item.price,
              product_name: item.productName
            }))
          if (items.length === 0) {
            wx.showToast({ title: '未选中任何商品', icon: 'none' })
            return
          }
          const contact = wx.getStorageSync('contact') || ''
          const addressId = wx.getStorageSync('defaultAddressId') || null
          orderApi.createOrder({ items, contact, address_id: addressId, source: 'shopping_cart' }).then((res) => {
            wx.showToast({ title: '订单创建成功', icon: 'success' })
            const orderId = res && (res.data && (res.data.orderId || res.data.id) || res.orderId || res.id)
            setTimeout(() => {
              if (orderId) {
                wx.navigateTo({ url: `/pages/order-detail/order-detail?id=${orderId}` })
              } else {
                wx.switchTab({ url: '/pages/index/index' })
              }
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