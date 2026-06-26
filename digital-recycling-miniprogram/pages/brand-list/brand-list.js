const app = getApp()
const contentApi = require('../../utils/api-modules').contentApi
const categoryApi = require('../../utils/api-modules').categoryApi
const productApi = require('../../utils/api-modules').productApi
const cartApi = require('../../utils/api-modules').cartApi

Page({
  data: {
    loading: true,
    searchKeyword: '',
    categories: [],
    currentCategoryIndex: 0,
    brands: [],
    selectedBrandId: null,
    products: [],
    productGroups: [],
    productsLoading: false,
    showModal: false,
    selectedProduct: {},
    conditions: [],
    conditionsLoading: false,
    cartCount: 0,
    statusBarHeight: 0,
    productPage: 1,
    productPageSize: 20,
    productHasMore: true,
    productLoadingMore: false,
    productScrollTop: 0
  },

  onLoad(options) {
    if (options.categoryId) {
      this.setData({ currentCategoryIndex: parseInt(options.categoryId) || 0 })
    }
    this.setData({ online: app.getNetworkStatus ? app.getNetworkStatus() : true })
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })
    this.loadData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'priceList' })
    }
    this.updateCartCount()
  },

  loadData() {
    this.setData({ loading: true })
    this.fetchCategories().then(() => {
      this.setData({ loading: false })
      this.fetchBrands()
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  fetchCategories() {
    return new Promise((resolve) => {
      categoryApi.getCategories().then(res => {
        const cats = res.data || res || []
        this.setData({ categories: Array.isArray(cats) ? cats : [] })
        resolve()
      }).catch(() => resolve())
    })
  },

  fetchBrands() {
    const cats = this.data.categories
    if (cats.length === 0) return
    const cat = cats[this.data.currentCategoryIndex] || cats[0]
    if (!cat) return
    contentApi.getBrandsByCategory(cat.id).then(res => {
      const brands = res.data || res || []
      this.setData({ brands: Array.isArray(brands) ? brands : [] })
      if (brands.length > 0) {
        this.selectBrand({ currentTarget: { dataset: { id: brands[2].id } } })
      }
    }).catch(() => {
      this.setData({ brands: [] })
    })
  },

  switchCategory(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentCategoryIndex: index, brands: [], productGroups: [], selectedBrandId: null })
    this.fetchBrands()
  },

  selectBrand(e) {
    const id = e.currentTarget.dataset.id
    if(id === 2 || id === 1) {
      this.goToFeaturePhone(id === 1 ? 'oldMan' : 'dianrong')
      return
    }
    this.setData({
      selectedBrandId: id,
      productsLoading: true,
      productPage: 1,
      productHasMore: true,
      productGroups: [],
      productLoadingMore: false,
      productScrollTop: 0
    })
    this.loadProducts(1)
  },

  loadProducts(page) {
    const isFirstPage = page === 1
    this.setData({
      productsLoading: isFirstPage,
      productLoadingMore: !isFirstPage
    })

    productApi.getProducts({
      brand_id: this.data.selectedBrandId,
      page: page,
      pageSize: this.data.productPageSize
    }).then(res => {
      const data = res.data || {}
      const prods = data.list || data || []
      const list = Array.isArray(prods) ? prods : []
      const seriesMap = new Map()
      list.forEach(p => {
        let highestPrice = 0
        if (p.Prices && p.Prices.length > 0) {
          highestPrice = Math.max(...p.Prices.map(pr => pr.price || 0))
        } else {
          highestPrice = p.highest_price || p.price || 0
        }
        const seriesName = p.series_name || (p.Brand && p.Brand.name) || '其他'
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, [])
        }
        seriesMap.get(seriesName).push({
          id: p.id,
          name: p.name,
          model_code: p.model_code || p.name,
          price: highestPrice,
          highestPrice: highestPrice,
          highestPriceText: highestPrice > 0 ? ('¥' + highestPrice) : '询价',
          series: p.series_name || '',
          brand: (p.Brand && p.Brand.name) || '',
          image: p.image || '',
          productId: p.id
        })
      })

      if (isFirstPage) {
        const newGroups = []
        seriesMap.forEach((products, title) => {
          newGroups.push({ title, products })
        })
        this.setData({
          productGroups: newGroups,
          productsLoading: false
        })
      } else {
        const groups = this.data.productGroups.map(g => ({
          title: g.title,
          products: [...g.products]
        }))
        seriesMap.forEach((newProducts, title) => {
          const idx = groups.findIndex(g => g.title === title)
          if (idx >= 0) {
            groups[idx].products = [...groups[idx].products, ...newProducts]
          } else {
            groups.push({ title, products: newProducts })
          }
        })
        this.setData({
          productGroups: groups,
          productLoadingMore: false
        })
      }

      this.setData({
        productPage: page,
        productHasMore: list.length >= this.data.productPageSize
      })
    }).catch(() => {
      this.setData({ productsLoading: false, productLoadingMore: false })
    })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  goToSearch() {
    const keyword = (this.data.searchKeyword || '').trim()
    let url = '/pages/product-search/product-search'
    if (keyword) {
      url += '?keyword=' + encodeURIComponent(keyword)
    }
    wx.navigateTo({ url })
  },

  goToFeaturePhone(e) {
    const type = e  || 'oldMan'
    wx.navigateTo({
      url: '/pages/feature-phone-image/feature-phone-image?type=' + encodeURIComponent(type)
    })
  },

  openProductDetail(e) {
    const product = e.currentTarget.dataset.item
    this.setData({ showModal: true, conditions: [], conditionsLoading: true, selectedProduct: product })
    productApi.getProductDetail(product.productId || product.id).then(res => {
      const detail = res.data || res || {}
      const prices = detail.prices || []
      const conditions = prices.map(p => ({
        conditionId: p.condition_id || (p.Condition && p.Condition.id) || 0,
        conditionName: (p.Condition && p.Condition.name) || '',
        conditionCode: (p.Condition && p.Condition.code) || '',
        price: p.price || 0,
        priceText: p.price > 0 ? ('¥' + p.price) : '/',
        quantity: 0
      }))
      this.setData({
        selectedProduct: Object.assign({}, product, { image: detail.image || product.image, name: detail.name || product.name }),
        conditions: conditions,
        conditionsLoading: false
      })
    }).catch(() => {
      const fallbackConditions = (product.Prices || []).map(p => ({
        conditionId: p.condition_id || (p.Condition && p.Condition.id) || 0,
        conditionName: (p.Condition && p.Condition.name) || '',
        conditionCode: (p.Condition && p.Condition.code) || '',
        price: p.price || 0,
        priceText: p.price > 0 ? ('¥' + p.price) : '/',
        quantity: 0
      }))
      this.setData({ conditions: fallbackConditions, conditionsLoading: false })
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  goToPriceTrend() {
    const product = this.data.selectedProduct
    const productId = product.productId || product.id
    if (!productId) {
      wx.showToast({ title: '产品信息不完整', icon: 'none' })
      return
    }
    this.setData({ showModal: false })
    this.requireLogin('/pages/price-trend/price-trend?productId=' + productId + '&model=' + encodeURIComponent(product.model_code || product.name || ''))
  },

  nop() {},

  decreaseConditionQty(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'conditions[' + idx + '].quantity'
    const current = this.data.conditions[idx].quantity
    if (current > 0) {
      this.setData({ [key]: current - 1 })
    }
  },

  increaseConditionQty(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'conditions[' + idx + '].quantity'
    const current = this.data.conditions[idx].quantity
    this.setData({ [key]: current + 1 })
  },

  addToCart() {
    const product = this.data.selectedProduct
    const conditions = this.data.conditions
    const items = conditions.filter(c => c.quantity > 0 && c.price > 0)
    if (items.length === 0) {
      wx.showToast({ title: '请选择成色', icon: 'none' })
      return
    }
    const promises = items.map(c => {
      return cartApi.add({
        product_id: product.productId || product.id,
        condition_id: c.conditionId,
        quantity: c.quantity,
        unit_price: c.price
      })
    })
    Promise.all(promises).then(() => {
      wx.showToast({ title: '已加入回收车', icon: 'success' })
      this.closeModal()
      this.updateCartCount()
    }).catch(() => {
      wx.showToast({ title: '添加失败', icon: 'error' })
    })
  },

  updateCartCount() {
    cartApi.getList().then(res => {
      const items = res.data || res || []
      const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      this.setData({ cartCount: total })
      app.globalData.cartCount = total
    }).catch(() => {})
  },

  goToCart() {
    wx.switchTab({ url: '/pages/shopping/shopping' })
  },

  goBack() {
    wx.navigateBack({ delta: 1 })
  },

  loadMoreProducts() {
    if (!this.data.productHasMore || this.data.productLoadingMore || this.data.productsLoading) return
    const nextPage = this.data.productPage + 1
    this.setData({ productPage: nextPage })
    this.loadProducts(nextPage)
  },

  requireLogin(targetUrl) {
    const token = wx.getStorageSync('token')
    if (token) {
      wx.navigateTo({ url: targetUrl })
    } else {
      wx.navigateTo({ url: '/pages/login/login?redirect=' + encodeURIComponent(targetUrl) })
    }
  }
})
