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
    selectedGradeIndex: 0,
    grades: ['全新', '靓机', '小花', '大花', '爆屏', '不开机'],
    quantity: 1,
    cartCount: 0
  },

  onLoad(options) {
    if (options.keyword) {
      this.setData({ searchKeyword: decodeURIComponent(options.keyword || '') })
    }
    if (options.categoryId) {
      this.setData({ currentCategoryIndex: parseInt(options.categoryId) || 0 })
    }
    this.setData({ online: app.getNetworkStatus ? app.getNetworkStatus() : true })
    this.loadData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
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
        this.selectBrand({ currentTarget: { dataset: { id: brands[0].id } } })
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
    this.setData({ selectedBrandId: id, productsLoading: true })

    productApi.getProducts({ brand_id: id }).then(res => {
      const data = res.data || {}
      const prods = data.list || data || []
      const seriesMap = new Map()
      ;(Array.isArray(prods) ? prods : []).forEach(p => {
        const seriesName = p.series_name || (p.Brand && p.Brand.name) || '其他'
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, [])
        }
        seriesMap.get(seriesName).push({
          id: p.id,
          name: p.name,
          model: p.model || p.name,
          price: (p.Prices && p.Prices.length > 0) ? p.Prices[0].price : (p.highest_price || p.price || 0),
          priceText: (p.Prices && p.Prices.length > 0) ? ('¥' + p.Prices[0].price) : '询价',
          series: p.series_name || '',
          brand: (p.Brand && p.Brand.name) || '',
          image: p.image || '',
          productId: p.id
        })
      })
      const productGroups = []
      seriesMap.forEach((products, title) => {
        productGroups.push({ title, products })
      })
      this.setData({ productGroups, productsLoading: false })
    }).catch(() => {
      this.setData({ productGroups: [], productsLoading: false })
    })
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  doSearch() {
    const kw = (this.data.searchKeyword || '').trim()
    if (!kw) return
    wx.navigateTo({ url: '/pages/brand-list/brand-list?keyword=' + encodeURIComponent(kw) })
  },

  openProductDetail(e) {
    const product = e.currentTarget.dataset.item
    this.setData({
      selectedProduct: product,
      showModal: true,
      selectedGradeIndex: 0,
      quantity: 1
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  nop() {},

  selectGrade(e) {
    this.setData({ selectedGradeIndex: e.currentTarget.dataset.index })
  },

  decreaseQty() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 })
    }
  },

  increaseQty() {
    this.setData({ quantity: this.data.quantity + 1 })
  },

  addToCart() {
    const product = this.data.selectedProduct
    const grade = this.data.grades[this.data.selectedGradeIndex]
    cartApi.add({
      productId: product.productId || product.id,
      product_name: product.model || product.name,
      condition: grade,
      quantity: this.data.quantity,
      price: product.price
    }).then(() => {
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
      const total = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
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

  loadMoreProducts() {}
})
