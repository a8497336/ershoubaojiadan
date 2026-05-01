const { request, uploadFile } = require('./api')

const authApi = {
  wxLogin: (code) => request({ url: '/auth/wx-login', method: 'POST', data: { code } }),
  bindPhone: (code) => request({ url: '/auth/phone-bind', method: 'POST', data: { code } }),
  checkToken: () => request({ url: '/auth/check-token' })
}

const userApi = {
  getProfile: () => request({ url: '/user/profile' }),
  updateProfile: (data) => request({ url: '/user/profile', method: 'PUT', data }),
  getStats: () => request({ url: '/user/stats' }),
  getAddresses: () => request({ url: '/user/addresses' }),
  createAddress: (data) => request({ url: '/user/addresses', method: 'POST', data }),
  updateAddress: (id, data) => request({ url: `/user/addresses/${id}`, method: 'PUT', data }),
  deleteAddress: (id) => request({ url: `/user/addresses/${id}`, method: 'DELETE' })
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
  getProductDetail: (id) => request({ url: `/products/${id}` })
}

const priceApi = {
  getTodayPrices: (data) => request({ url: '/prices/today', data }),
  getConditions: () => request({ url: '/prices/conditions' }),
  getPriceHistory: (productId, data) => request({ url: `/prices/history/${productId}`, data }),
  getPriceTrend: (productId, data) => request({ url: `/prices/trend/${productId}`, data })
}

const cartApi = {
  getCart: () => request({ url: '/cart' }),
  addToCart: (data) => request({ url: '/cart', method: 'POST', data }),
  updateCartItem: (id, data) => request({ url: `/cart/${id}`, method: 'PUT', data }),
  deleteCartItem: (id) => request({ url: `/cart/${id}`, method: 'DELETE' }),
  selectAll: (isSelected) => request({ url: '/cart/select-all', method: 'PUT', data: { is_selected: isSelected } }),
  clearCart: () => request({ url: '/cart/clear', method: 'DELETE' })
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
  purchase: (planId) => request({ url: '/membership/purchase', method: 'POST', data: { plan_id: planId } }),
  payCallback: (orderNo) => request({ url: '/membership/pay-callback', method: 'POST', data: { order_no: orderNo } })
}

const walletApi = {
  getInfo: () => request({ url: '/wallet/info' }),
  getLogs: (data) => request({ url: '/wallet/logs', data }),
  withdraw: (amount) => request({ url: '/wallet/withdraw', method: 'POST', data: { amount } })
}

const pointsApi = {
  getBalance: () => request({ url: '/points/balance' }),
  getLogs: (data) => request({ url: '/points/logs', data }),
  signIn: () => request({ url: '/points/sign', method: 'POST' })
}

const messageApi = {
  getMessages: (data) => request({ url: '/messages', data }),
  markRead: (id) => request({ url: `/messages/${id}/read`, method: 'PUT' }),
  markAllRead: () => request({ url: '/messages/read-all', method: 'PUT' }),
  getUnreadCount: () => request({ url: '/messages/unread-count' })
}

const contentApi = {
  getBanners: () => request({ url: '/banners' }),
  getAnnouncements: (data) => request({ url: '/announcements', data }),
  getStores: () => request({ url: '/stores' }),
  getVideos: (category) => request({ url: '/videos', data: { category } })
}

const searchApi = {
  search: (keyword, data) => request({ url: '/search', data: { keyword, ...data } }),
  getHotKeywords: () => request({ url: '/search/hot' })
}

const userStockApi = {
  getList: (data) => request({ url: '/user-stock', data }),
  addStock: (data) => request({ url: '/user-stock', method: 'POST', data }),
  updateStock: (id, data) => request({ url: `/user-stock/${id}`, method: 'PUT', data }),
  deleteStock: (id) => request({ url: `/user-stock/${id}`, method: 'DELETE' }),
  sellStock: (id, data) => request({ url: `/user-stock/${id}/sell`, method: 'POST', data }),
  getStats: () => request({ url: '/user-stock/stats' })
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
  contentApi,
  searchApi,
  userStockApi,
  uploadFile
}
