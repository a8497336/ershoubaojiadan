const { request, uploadFile } = require('./api')

const authApi = {
  wxLogin: (code, userInfo, extra) => {
    const data = { code, userInfo }
    if (extra) {
      if (extra.encryptedData) data.encryptedData = extra.encryptedData
      if (extra.iv) data.iv = extra.iv
      if (extra.location) data.location = extra.location
    }
    return request({ url: '/auth/wx-login', method: 'POST', data })
  },
  bindPhone: (code) => request({ url: '/auth/phone-bind', method: 'POST', data: { code } }),
  bindPhoneNoLogin: (code) => request({ url: '/auth/phone-bind-nologin', method: 'POST', data: { code } }),
  checkToken: () => request({ url: '/auth/check-token' })
}

const userApi = {
  getProfile: () => request({ url: '/user/profile' }),
  updateProfile: (data) => request({ url: '/user/profile', method: 'PUT', data }),
  getStats: () => request({ url: '/user/stats' }),
  getAddresses: () => request({ url: '/user/addresses' }),
  createAddress: (data) => request({ url: '/user/addresses', method: 'POST', data }),
  updateAddress: (id, data) => request({ url: `/user/addresses/${id}`, method: 'PUT', data }),
  deleteAddress: (id) => request({ url: `/user/addresses/${id}`, method: 'DELETE' }),
  getWallet: () => request({ url: '/wallet/info' }),
  getPoints: () => request({ url: '/points/balance' }),
  getCoupons: (data) => request({ url: '/coupons', data }),
  getRedPackets: (data) => request({ url: '/red-packets', data }),
  getRecordings: (data) => request({ url: '/user/recordings', data }),
  getFavorites: (data) => request({ url: '/user/favorites', data }),
  uploadAvatar: (filePath) => uploadFile(filePath, '/user/avatar')
}

const categoryApi = {
  getCategories: () => request({ url: '/categories' }),
  getCategoryBrands: (id) => request({ url: `/categories/${id}/brands` })
}

const brandApi = {
  getBrands: (categoryId) => request({ url: '/brands', data: { category_id: categoryId } }),
  getBrandDetail: (id) => request({ url: `/brands/${id}` })
}

const productApi = {
  getProducts: (data) => request({ url: '/products', data }),
  getProductDetail: (id) => request({ url: `/products/${id}` }),
  getProductsByBrand: (brandId) => request({ url: `/brands/${brandId}/products` })
}

const priceApi = {
  getTodayPrices: (data) => request({ url: '/prices/today', data }),
  getConditions: () => request({ url: '/prices/conditions' }),
  getPriceHistory: (productId, data) => request({ url: `/prices/history/${productId}`, data }),
  getPriceTrend: (productId, data) => request({ url: `/prices/trend/${productId}`, data }),
  getChanges: (data) => request({ url: '/prices/changes', data })
}

const cartApi = {
  getCart: () => request({ url: '/cart' }),
  getList: () => request({ url: '/cart' }),
  addToCart: (data) => request({ url: '/cart', method: 'POST', data }),
  add: (data) => request({ url: '/cart', method: 'POST', data }),
  updateCartItem: (id, data) => request({ url: `/cart/${id}`, method: 'PUT', data }),
  update: (id, data) => request({ url: `/cart/${id}`, method: 'PUT', data }),
  deleteCartItem: (id) => request({ url: `/cart/${id}`, method: 'DELETE' }),
  remove: (id) => request({ url: `/cart/${id}`, method: 'DELETE' }),
  selectAll: (isSelected) => request({ url: '/cart/select-all', method: 'PUT', data: { is_selected: isSelected } }),
  clearCart: () => request({ url: '/cart/clear', method: 'DELETE' }),
  clear: () => request({ url: '/cart/clear', method: 'DELETE' })
}

const orderApi = {
  createOrder: (data) => request({ url: '/orders', method: 'POST', data }),
  getOrders: (data) => request({ url: '/orders', data }),
  getOrderDetail: (id) => request({ url: `/orders/${id}` }),
  cancelOrder: (id, reason) => request({ url: `/orders/${id}/cancel`, method: 'PUT', data: { reason } })
}

const membershipApi = {
  getPlans: () => request({ url: '/membership/plans' }),
  getStatus: () => request({ url: '/membership/status' }),
  purchase: (planId) => request({ url: '/membership/purchase', method: 'POST', data: { plan_id: planId } })
  // payCallback 已移除 — 改用微信小程序虚拟支付 wx.requestVirtualPayment
  // 真实支付回调由后端 /api/membership/virtual-pay-notify 接收
}

const walletApi = {
  getInfo: () => request({ url: '/wallet/info' }),
  getLogs: (data) => request({ url: '/wallet/logs', data }),
  withdraw: (amount) => request({ url: '/wallet/withdraw', method: 'POST', data: { amount } })
}

const pointsApi = {
  getBalance: () => request({ url: '/points/balance' }),
  getLogs: (data) => request({ url: '/points/logs', data }),
  getLotteryRecords: () => request({ url: '/points/lottery-records' }),
  getProducts: (data) => request({ url: '/points/products', data }),
  exchange: (productId) => request({ url: '/points/exchange', method: 'POST', data: { product_id: productId } }),
  signIn: () => request({ url: '/points/sign', method: 'POST' })
}

const messageApi = {
  getMessages: (data) => request({ url: '/messages', data }),
  markRead: (id) => request({ url: `/messages/${id}/read`, method: 'PUT' }),
  markAllRead: () => request({ url: '/messages/read-all', method: 'PUT' }),
  getUnreadCount: () => request({ url: '/messages/unread-count' }),
  submitFeedback: (data) => request({ url: '/messages/feedback', method: 'POST', data })
}

const feedbackApi = {
  getList: (data) => request({ url: '/feedback', data })
}

const contentApi = {
  getBanners: () => request({ url: '/banners' }),
  getAnnouncements: (data) => request({ url: '/announcements', data }),
  getStores: () => request({ url: '/stores' }),
  getVideos: (category) => request({ url: '/videos', data: { category } }),
  getHotPrices: () => request({ url: '/prices/hot' }),
  getBrandsByCategory: (id) => request({ url: `/categories/${id}/brands` })
}

const searchApi = {
  search: (keyword, data) => request({ url: '/search', data: { keyword, ...data } }),
  getHotKeywords: () => request({ url: '/search/hot' })
}

const scanApi = {
  recognize: (data) => request({ url: '/scan/recognize', method: 'POST', data })
}

const userStockApi = {
  getList: (data) => request({ url: '/user-stock', data }),
  addStock: (data) => request({ url: '/user-stock', method: 'POST', data }),
  updateStock: (id, data) => request({ url: `/user-stock/${id}`, method: 'PUT', data }),
  deleteStock: (id) => request({ url: `/user-stock/${id}`, method: 'DELETE' }),
  sellStock: (id, data) => request({ url: `/user-stock/${id}/sell`, method: 'POST', data }),
  getStats: () => request({ url: '/user-stock/stats' })
}

const placesApi = {
  getNearby: (data) => request({ url: '/places/nearby', data }),
  getNearbyByStores: (data) => request({ url: '/places/nearby-by-stores', method: 'POST', data }),
  getNearestStore: (data) => request({ url: '/places/nearest-store', data })
}

const settingsApi = {
  getQuoteConfig: () => request({ url: '/settings/quote' }),
  getContactInfo: () => request({ url: '/settings/contact' })
}

const featurePhoneImageApi = {
  get: (type) => request({ url: '/feature-phone-image', data: { type } })
}

module.exports = {
  authApi,
  userApi,
  categoryApi,
  brandApi,
  productApi,
  priceApi,
  cartApi,
  orderApi,
  membershipApi,
  walletApi,
  pointsApi,
  messageApi,
  feedbackApi,
  contentApi,
  searchApi,
  scanApi,
  userStockApi,
  placesApi,
  settingsApi,
  featurePhoneImageApi,
  uploadFile
}
