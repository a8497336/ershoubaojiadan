const app = getApp()
const searchApi = require('../../utils/api-modules').searchApi
const productApi = require('../../utils/api-modules').productApi
const cartApi = require('../../utils/api-modules').cartApi

Page({
  data: {
    searchKeyword: '',
    searchResults: [],
    searchLoading: false,
    hasSearched: false,
    showModal: false,
    selectedProduct: {},
    conditions: [],
    conditionsLoading: false,
    cartCount: 0
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ searchKeyword: decodeURIComponent(options.keyword || '') })
      this.doSearch()
    }
  },

  onShow() {
    this.updateCartCount()
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  doSearch() {
    const kw = (this.data.searchKeyword || '').trim()
    if (!kw) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    this.setData({ searchLoading: true, searchResults: [], hasSearched: true })
    searchApi.search(kw, { pageSize: 500 }).then(res => {
      const data = res.data || res || []
      const list = Array.isArray(data) ? data : (data.list || [])
      const categoryMap = new Map()
      list.forEach(p => {
        let highestPrice = 0
        if (p.Prices && p.Prices.length > 0) {
          highestPrice = Math.max(...p.Prices.map(pr => pr.price || 0))
        }
        const categoryName = (p.Category && p.Category.name) || '其他分类'
        const brandName = (p.Brand && p.Brand.name) || '其他品牌'
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, new Map())
        }
        const brandMap = categoryMap.get(categoryName)
        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, [])
        }
        brandMap.get(brandName).push({
          id: p.id,
          name: p.name,
          model_code: p.model_code || p.name,
          price: highestPrice,
          highestPrice: highestPrice,
          highestPriceText: highestPrice > 0 ? ('¥' + highestPrice) : '询价',
          series: p.series_name || '',
          image: p.image || '',
          productId: p.id
        })
      })
      const searchResults = []
      categoryMap.forEach((brandMap, categoryName) => {
        const brands = []
        brandMap.forEach((products, brandName) => {
          brands.push({ brandName, products })
        })
        searchResults.push({ categoryName, brands })
      })
      this.setData({ searchResults, searchLoading: false })
    }).catch(() => {
      this.setData({ searchLoading: false })
      wx.showToast({ title: '搜索失败，请重试', icon: 'none' })
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

  nop() {},

  goToPriceTrend() {
    const product = this.data.selectedProduct
    const productId = product.productId || product.id
    if (!productId) {
      wx.showToast({ title: '产品信息不完整', icon: 'none' })
      return
    }
    this.setData({ showModal: false })
    wx.navigateTo({
      url: '/pages/price-trend/price-trend?productId=' + productId + '&model=' + encodeURIComponent(product.model_code || product.name || '')
    })
  },

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
  }
})
