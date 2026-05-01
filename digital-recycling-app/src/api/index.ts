import request from '../utils/request'

export const authApi = {
  phoneLogin: (phone: string) => request.post('/auth/phone-login', { phone }),
  checkToken: () => request.get('/auth/check-token'),
}

export const userApi = {
  getProfile: () => request.get('/user/profile'),
  updateProfile: (data: any) => request.put('/user/profile', data),
  getStats: () => request.get('/user/stats'),
  getAddresses: () => request.get('/user/addresses'),
  addAddress: (data: any) => request.post('/user/addresses', data),
  updateAddress: (id: number, data: any) => request.put(`/user/addresses/${id}`, data),
  deleteAddress: (id: number) => request.delete(`/user/addresses/${id}`),
}

export const categoryApi = {
  getList: () => request.get('/categories'),
  getBrands: (id: number) => request.get(`/categories/${id}/brands`),
}

export const brandApi = {
  getList: (params?: any) => request.get('/brands', { params }),
  getDetail: (id: number) => request.get(`/brands/${id}`),
}

export const productApi = {
  getList: (params?: any) => request.get('/products', { params }),
  getDetail: (id: number) => request.get(`/products/${id}`),
}

export const priceApi = {
  getToday: (params?: any) => request.get('/prices/today', { params }),
  getConditions: () => request.get('/prices/conditions'),
  getHistory: (productId: number, params?: any) => request.get(`/prices/history/${productId}`, { params }),
  getTrend: (productId: number, params?: any) => request.get(`/prices/trend/${productId}`, { params }),
}

export const cartApi = {
  getList: () => request.get('/cart'),
  addItem: (data: any) => request.post('/cart', data),
  updateItem: (id: number, data: any) => request.put(`/cart/${id}`, data),
  deleteItem: (id: number) => request.delete(`/cart/${id}`),
  selectAll: (isSelected: boolean) => request.put('/cart/select-all', { is_selected: isSelected }),
  clear: () => request.delete('/cart/clear'),
}

export const orderApi = {
  create: (data?: any) => request.post('/orders', data ?? {}),
  getList: (params?: any) => request.get('/orders', { params }),
  getDetail: (id: number) => request.get(`/orders/${id}`),
  cancel: (id: number, reason?: string) => request.put(`/orders/${id}/cancel`, { reason }),
}

export const membershipApi = {
  getPlans: () => request.get('/membership/plans'),
  getStatus: () => request.get('/membership/status'),
  purchase: (planId: number) => request.post('/membership/purchase', { plan_id: planId }),
  payCallback: (orderNo: string) => request.post('/membership/pay-callback', { order_no: orderNo }),
}

export const walletApi = {
  getInfo: () => request.get('/wallet/info'),
  getLogs: (params?: any) => request.get('/wallet/logs', { params }),
  withdraw: (amount: number) => request.post('/wallet/withdraw', { amount }),
}

export const pointsApi = {
  getBalance: () => request.get('/points/balance'),
  getLogs: (params?: any) => request.get('/points/logs', { params }),
  sign: () => request.post('/points/sign'),
}

export const messageApi = {
  getList: (params?: any) => request.get('/messages', { params }),
  markRead: (id: number) => request.put(`/messages/${id}/read`),
  markAllRead: () => request.put('/messages/read-all'),
  getUnreadCount: () => request.get('/messages/unread-count'),
  submitFeedback: (data: { type: string; content: string; contact?: string }) => request.post('/messages/feedback', data),
}

export const bannerApi = {
  getList: () => request.get('/banners'),
}

export const announcementApi = {
  getList: (params?: any) => request.get('/announcements', { params }),
}

export const storeApi = {
  getList: () => request.get('/stores'),
}

export const videoApi = {
  getList: (params?: any) => request.get('/videos', { params }),
  getDetail: (id: string) => request.get(`/videos/${id}`),
}

export const settingsApi = {
  getQuoteConfig: () => request.get('/settings/quote'),
}

export const searchApi = {
  search: (params: any) => request.get('/search', { params }),
  getHot: () => request.get('/search/hot'),
}

export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData)
  }
}

export const scanApi = {
  recognize: (data: { imageUrl?: string; keywords?: string[] }) => request.post('/scan/recognize', data),
  getHistory: (params?: any) => request.get('/scan/history', { params }),
}

export const userStockApi = {
  getList: (params?: any) => request.get('/user-stock', { params }),
  addItem: (data: any) => request.post('/user-stock', data),
  updateItem: (id: number, data: any) => request.put(`/user-stock/${id}`, data),
  deleteItem: (id: number) => request.delete(`/user-stock/${id}`),
  sell: (id: number, soldPrice: number) => request.post(`/user-stock/${id}/sell`, { sold_price: soldPrice }),
  getStats: () => request.get('/user-stock/stats'),
}
