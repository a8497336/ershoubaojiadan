import request from '@/utils/request'

// ========== 认证 / 管理员 ==========
export const login = (data) => request.post('/admin/auth/login', data)
export const getAdminInfo = () => request.get('/admin/auth/info')
export const updatePassword = (data) => request.put('/admin/auth/password', data)

// ========== 仪表盘 ==========
export const getDashboardOverview = () => request.get('/admin/dashboard/overview')
export const getDashboardTrend = (params) => request.get('/admin/dashboard/trend', { params })
export const getCategoryDistribution = () => request.get('/admin/dashboard/category-distribution')

// ========== 订单 ==========
export const getOrders = (params) => request.get('/admin/orders', { params })
export const getOrderDetail = (id) => request.get(`/admin/orders/${id}`)
export const createOrder = (data) => request.post('/admin/orders', data)
export const deleteOrder = (id) => request.delete(`/admin/orders/${id}`)
export const updateOrderLogistics = (id, data) => request.put(`/admin/orders/${id}/logistics`, data)
export const inspectOrder = (id, data) => request.put(`/admin/orders/${id}/inspect`, data)
export const payOrder = (id) => request.put(`/admin/orders/${id}/pay`)
export const exportOrders = (params) => request.get('/admin/orders/export', { params, responseType: 'blob' })

// ========== 价格 / 成色 / 品牌 ==========
export const getPrices = (params) => request.get('/admin/prices', { params })
export const createPrice = (data) => request.post('/admin/prices', data)
export const deletePrice = (id) => request.delete(`/admin/prices/${id}`)
export const batchUpdatePrices = (data) => request.post('/admin/prices/batch', data)
export const getPriceTrend = (productId, params) => request.get(`/admin/prices/trend/${productId}`, { params })

export const getConditions = () => request.get('/admin/conditions')
export const createCondition = (data) => request.post('/admin/conditions', data)
export const updateCondition = (id, data) => request.put(`/admin/conditions/${id}`, data)
export const deleteCondition = (id) => request.delete(`/admin/conditions/${id}`)

export const getBrands = (params) => request.get('/admin/brands', { params })
export const createBrand = (data) => request.post('/admin/brands', data)
export const updateBrand = (id, data) => request.put(`/admin/brands/${id}`, data)
export const deleteBrand = (id) => request.delete(`/admin/brands/${id}`)

// ========== 商品 / 分类 ==========
export const getProducts = (params) => request.get('/admin/products', { params })
export const createProduct = (data) => request.post('/admin/products', data)
export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/admin/products/${id}`)
export const importProducts = (data) => request.post('/admin/products/import', data)
export const previewProducts = (data) => request.post('/admin/products/preview', data)
export const uploadFile = (data) => request.post('/admin/upload', data)

export const getCategories = () => request.get('/admin/categories')
export const createCategory = (data) => request.post('/admin/categories', data)
export const updateCategory = (id, data) => request.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => request.delete(`/admin/categories/${id}`)

// ========== 会员 ==========
export const getMembershipPlans = () => request.get('/admin/membership/plans')
export const createMembershipPlan = (data) => request.post('/admin/membership/plans', data)
export const updateMembershipPlan = (id, data) => request.put(`/admin/membership/plans/${id}`, data)
export const deleteMembershipPlan = (id) => request.delete(`/admin/membership/plans/${id}`)

export const getMembers = (params) => request.get('/admin/members', { params })
export const getMembershipOrders = (params) => request.get('/admin/membership/orders', { params })
export const updateMemberStatus = (id, data) => request.put(`/admin/members/${id}/status`, data)
export const deleteMember = (id) => request.delete(`/admin/members/${id}`)

// ========== 统计 ==========
export const getUserTrend = (params) => request.get('/admin/statistics/user-trend', { params })
export const getOrderTrend = (params) => request.get('/admin/statistics/order-trend', { params })
export const getBrandRanking = (params) => request.get('/admin/statistics/brand-ranking', { params })

// ========== 用户 ==========
export const getUsers = (params) => request.get('/admin/users', { params })
export const exportUsers = (params) => request.get('/admin/users/export', { params, responseType: 'blob' })
export const getUserDetail = (id) => request.get(`/admin/users/${id}`)
export const createUser = (data) => request.post('/admin/users', data)
export const updateUser = (id, data) => request.put(`/admin/users/${id}`, data)
export const updateUserStatus = (id, data) => request.put(`/admin/users/${id}/status`, data)
export const deleteUser = (id) => request.delete(`/admin/users/${id}`)
export const getUserOrders = (id, params) => request.get(`/admin/users/${id}/orders`, { params })

// ========== 系统设置 / 角色 / 日志 ==========
export const getSettings = () => request.get('/admin/settings')
export const updateSettings = (data) => request.put('/admin/settings', data)

export const getAdmins = (params) => request.get('/admin/admins', { params })
export const createAdmin = (data) => request.post('/admin/admins', data)
export const updateAdmin = (id, data) => request.put(`/admin/admins/${id}`, data)
export const deleteAdmin = (id) => request.delete(`/admin/admins/${id}`)

export const getRoles = () => request.get('/admin/roles')
export const createRole = (data) => request.post('/admin/roles', data)
export const updateRole = (id, data) => request.put(`/admin/roles/${id}`, data)
export const deleteRole = (id) => request.delete(`/admin/roles/${id}`)

export const getPermissions = () => request.get('/admin/permissions')
export const getLogs = (params) => request.get('/admin/logs', { params })

// ========== 内容管理（轮播 / 公告 / 门店 / 视频 / 消息） ==========
export const getBanners = (params) => request.get('/admin/banners', { params })
export const createBanner = (data) => request.post('/admin/banners', data)
export const updateBanner = (id, data) => request.put(`/admin/banners/${id}`, data)
export const deleteBanner = (id) => request.delete(`/admin/banners/${id}`)

export const getAnnouncements = (params) => request.get('/admin/announcements', { params })
export const createAnnouncement = (data) => request.post('/admin/announcements', data)
export const updateAnnouncement = (id, data) => request.put(`/admin/announcements/${id}`, data)
export const deleteAnnouncement = (id) => request.delete(`/admin/announcements/${id}`)

// ========== 弹窗广告管理 ==========
export const getPopupAds = (params) => request.get('/admin/popup-ads', { params })
export const createPopupAd = (data) => request.post('/admin/popup-ads', data)
export const updatePopupAd = (id, data) => request.put(`/admin/popup-ads/${id}`, data)
export const deletePopupAd = (id) => request.delete(`/admin/popup-ads/${id}`)

export const getStores = (params) => request.get('/admin/stores', { params })
export const createStore = (data) => request.post('/admin/stores', data)
export const updateStore = (id, data) => request.put(`/admin/stores/${id}`, data)
export const deleteStore = (id) => request.delete(`/admin/stores/${id}`)
export const geocodeAddress = (address) => request.get('/admin/stores/geocode', { params: { address } })

export const getVideos = (params) => request.get('/admin/videos', { params })
export const createVideo = (data) => request.post('/admin/videos', data)
export const updateVideo = (id, data) => request.put(`/admin/videos/${id}`, data)
export const deleteVideo = (id) => request.delete(`/admin/videos/${id}`)

export const broadcastMessage = (data) => request.post('/admin/messages/broadcast', data)
export const sendMessage = (data) => request.post('/admin/messages/send', data)

// ========== 报价图片管理（老年机 / 智能机-电容屏） ==========
export const getFeaturePhoneImages = () => request.get('/admin/feature-phone-images')
export const updateFeaturePhoneImage = (type, data) => request.put(`/admin/feature-phone-images/${type}`, data)
export const deleteFeaturePhoneImage = (type) => request.delete(`/admin/feature-phone-images/${type}`)
