import request from '@/utils/request'

export const login = (data) => request.post('/admin/auth/login', data)
export const getAdminInfo = () => request.get('/admin/auth/info')
export const updatePassword = (data) => request.put('/admin/auth/password', data)

export const getDashboardOverview = () => request.get('/admin/dashboard/overview')
export const getDashboardTrend = (params) => request.get('/admin/dashboard/trend', { params })

export const getUsers = (params) => request.get('/admin/users', { params })
export const getUserDetail = (id) => request.get(`/admin/users/${id}`)
export const createUser = (data) => request.post('/admin/users', data)
export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)
export const updateUserStatus = (id, data) => request.put(`/admin/users/${id}/status`, data)
export const deleteUser = (id) => request.delete(`/admin/users/${id}`)
export const getUserOrders = (id, params) => request.get(`/admin/users/${id}/orders`, { params })

export const getCategories = () => request.get('/admin/categories')
export const createCategory = (data) => request.post('/admin/categories', data)
export const updateCategory = (id, data) => request.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => request.delete(`/admin/categories/${id}`)

export const getBrands = (params) => request.get('/admin/brands', { params })
export const createBrand = (data) => request.post('/admin/brands', data)
export const updateBrand = (id, data) => request.put(`/admin/brands/${id}`, data)
export const deleteBrand = (id) => request.delete(`/admin/brands/${id}`)

export const getProducts = (params) => request.get('/admin/products', { params })
export const createProduct = (data) => request.post('/admin/products', data)
export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/admin/products/${id}`)

export const getPrices = (params) => request.get('/admin/prices', { params })
export const createPrice = (data) => request.post('/admin/prices', data)
export const deletePrice = (id) => request.delete(`/admin/prices/${id}`)
export const batchUpdatePrices = (data) => request.put('/admin/prices/batch', data)
export const updatePrice = (id, data) => request.put(`/admin/prices/${id}`, data)
export const getPriceHistory = (params) => request.get('/admin/prices/history', { params })
export const getConditions = () => request.get('/admin/prices/conditions')
export const createCondition = (data) => request.post('/admin/prices/conditions', data)
export const updateCondition = (id, data) => request.put(`/admin/prices/conditions/${id}`, data)
export const deleteCondition = (id) => request.delete(`/admin/prices/conditions/${id}`)

export const getOrders = (params) => request.get('/admin/orders', { params })
export const getOrderDetail = (id) => request.get(`/admin/orders/${id}`)
export const createOrder = (data) => request.post('/admin/orders', data)
export const deleteOrder = (id) => request.delete(`/admin/orders/${id}`)
export const updateOrderStatus = (id, data) => request.put(`/admin/orders/${id}/status`, data)
export const updateOrderLogistics = (id, data) => request.put(`/admin/orders/${id}/logistics`, data)
export const inspectOrder = (id, data) => request.put(`/admin/orders/${id}/inspect`, data)
export const payOrder = (id) => request.put(`/admin/orders/${id}/pay`)
export const batchUpdateOrderStatus = (data) => request.put('/admin/orders/batch/status', data)
export const exportOrders = (params) => request.get('/admin/orders/export', { params, responseType: 'blob' })

export const getMembershipPlans = () => request.get('/admin/membership/plans')
export const createMembershipPlan = (data) => request.post('/admin/membership/plans', data)
export const updateMembershipPlan = (id, data) => request.put(`/admin/membership/plans/${id}`, data)
export const deleteMembershipPlan = (id) => request.delete(`/admin/membership/plans/${id}`)
export const getMembers = (params) => request.get('/admin/membership/members', { params })
export const updateMemberStatus = (id, data) => request.put(`/admin/membership/members/${id}/status`, data)
export const deleteMember = (id) => request.delete(`/admin/membership/members/${id}`)
export const getMembershipOrders = (params) => request.get('/admin/membership/orders', { params })

export const getBanners = (params) => request.get('/admin/banners', { params })
export const createBanner = (data) => request.post('/admin/banners', data)
export const updateBanner = (id, data) => request.put(`/admin/banners/${id}`, data)
export const deleteBanner = (id) => request.delete(`/admin/banners/${id}`)

export const getAnnouncements = (params) => request.get('/admin/announcements', { params })
export const createAnnouncement = (data) => request.post('/admin/announcements', data)
export const updateAnnouncement = (id, data) => request.put(`/admin/announcements/${id}`, data)
export const deleteAnnouncement = (id) => request.delete(`/admin/announcements/${id}`)

export const getStores = (params) => request.get('/admin/stores', { params })
export const createStore = (data) => request.post('/admin/stores', data)
export const updateStore = (id, data) => request.put(`/admin/stores/${id}`, data)
export const deleteStore = (id) => request.delete(`/admin/stores/${id}`)

export const getVideos = (params) => request.get('/admin/videos', { params })
export const createVideo = (data) => request.post('/admin/videos', data)
export const updateVideo = (id, data) => request.put(`/admin/videos/${id}`, data)
export const deleteVideo = (id) => request.delete(`/admin/videos/${id}`)

export const broadcastMessage = (data) => request.post('/admin/messages/broadcast', data)
export const sendMessage = (data) => request.post('/admin/messages/send', data)

export const getStatisticsOverview = () => request.get('/admin/statistics/overview')
export const getUserTrend = (params) => request.get('/admin/statistics/user-trend', { params })
export const getOrderTrend = (params) => request.get('/admin/statistics/order-trend', { params })
export const getCategoryDistribution = () => request.get('/admin/statistics/category-distribution')
export const getBrandRanking = (params) => request.get('/admin/statistics/brand-ranking', { params })

export const getAdmins = () => request.get('/admin/admins')
export const createAdmin = (data) => request.post('/admin/admins', data)
export const updateAdmin = (id, data) => request.put(`/admin/admins/${id}`, data)
export const deleteAdmin = (id) => request.delete(`/admin/admins/${id}`)

export const getRoles = () => request.get('/admin/roles')
export const createRole = (data) => request.post('/admin/roles', data)
export const updateRole = (id, data) => request.put(`/admin/roles/${id}`, data)
export const deleteRole = (id) => request.delete(`/admin/roles/${id}`)

export const getPermissions = () => request.get('/admin/permissions')

export const getLogs = (params) => request.get('/admin/logs', { params })

export const getSettings = () => request.get('/admin/settings')
export const updateSettings = (data) => request.put('/admin/settings', data)

export const uploadFile = (formData) => request.post('/admin/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
