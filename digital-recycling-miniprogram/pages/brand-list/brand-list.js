const { brandApi, productApi, priceApi, cartApi, searchApi, categoryApi } = require('../../utils/api-modules')

Page({
  data: {
    activeBrand: 0,
    activeCategory: 0,
    isModalOpen: false,
    modalProduct: null,
    quantities: [0, 0, 0, 0, 0, 0, 0, 0],
    cartBadgeCount: 0,
    toastVisible: false,
    toastMessage: '',
    categoryTabs: [],
    categories: [],
    brands: [],
    brandsMap: {},
    productGroups: [],
    quantityConditions: [],
    searchKeyword: '',
    isEmpty: false,
    loading: false,
    brandId: null,
    categoryId: null
  },

  onLoad(options) {
    const app = getApp()
    this.setData({ cartBadgeCount: app.globalData.cartCount || 0 })

    if (options.brandId) {
      this.setData({ brandId: parseInt(options.brandId) })
    }

    if (options.category) {
      const category = decodeURIComponent(options.category)
      this.setData({ categoryId: category, categoryParam: category })
    }

    if (options.keyword) {
      const keyword = decodeURIComponent(options.keyword)
      this.setData({ searchKeyword: keyword })
      this.doSearch(keyword)
    }

    this.loadCategories()
    this.loadConditions()
  },

  loadCategories() {
    categoryApi.getCategories().then((res) => {
      const categories = res.data || []
      const tabs = categories.map(c => c.name)
      this.setData({
        categoryTabs: tabs,
        categories: categories
      })

      if (categories.length > 0) {
        let targetIndex = 0

        if (this.data.categoryParam) {
          const foundIndex = categories.findIndex(
            c => c.name === this.data.categoryParam || c.code === this.data.categoryParam
          )
          if (foundIndex >= 0) {
            targetIndex = foundIndex
            this.setData({ activeCategory: targetIndex })
          }
        }

        this.loadBrandsByCategory(categories[targetIndex].id)
      }
    }).catch((err) => {
      console.error('加载分类失败:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  loadBrandsByCategory(categoryId) {
    brandApi.getBrands(categoryId).then((res) => {
      const brandsData = res.data || []
      const brands = brandsData.map(b => ({
        id: b.id,
        name: b.name
      }))

      const brandsMap = {}
      brandsData.forEach(b => { brandsMap[b.id] = b.name })

      this.setData({
        brands: brands,
        brandsMap: brandsMap,
        isEmpty: brands.length === 0
      })

      if (brands.length > 0) {
        this.setData({ activeBrand: 0 })
        this.loadProductsByBrand(brandsData[0].id)
      } else {
        this.setData({ productGroups: [], isEmpty: true })
      }
    }).catch((err) => {
      console.error('加载品牌列表失败:', err)
      this.setData({ brands: [], isEmpty: true })
    })
  },

  loadProductsByBrand(brandId) {
    this.setData({ loading: true, isEmpty: false })

    productApi.getProducts({
      brand_id: brandId,
      pageSize: 100
    }).then((res) => {
      const data = res.data || {}
      const products = data.list || []

      if (products.length === 0) {
        this.setData({
          productGroups: [],
          isEmpty: true,
          loading: false
        })
        return
      }

      const seriesMap = {}

      products.forEach(p => {
        const seriesName = p.series_name || p.Category?.name || '其他'
        const prices = p.Prices || []

        const validPrices = prices
          .map(pr => parseFloat(pr.price))
          .filter(price => !isNaN(price) && price > 0)
        const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0

        const productItem = {
          id: p.id,
          name: p.name || p.model_code || '',
          model: p.model_code || '',
          price: maxPrice > 0 ? `¥${maxPrice}` : '询价',
          priceValue: maxPrice,
          prices: prices.map(pr => ({
            conditionName: pr.Condition?.name || '',
            conditionCode: pr.Condition?.code || '',
            price: pr.price
          }))
        }

        if (!seriesMap[seriesName]) {
          seriesMap[seriesName] = {
            title: seriesName,
            products: []
          }
        }

        seriesMap[seriesName].products.push(productItem)
      })

      const productGroups = Object.values(seriesMap).map(group => ({
        ...group,
        products: group.products.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0))
      }))

      this.setData({
        productGroups: productGroups,
        isEmpty: productGroups.length === 0,
        loading: false
      })
    }).catch((err) => {
      console.error('加载产品列表失败:', err)
      this.setData({
        productGroups: [],
        isEmpty: true,
        loading: false
      })
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },

  doSearch(keyword) {
    if (!keyword) return
    searchApi.search(keyword).then((res) => {
      const products = res.data ? res.data.list || res.data : []
      const groups = products.map(p => ({
        title: p.name,
        productId: p.id,
        products: [{ name: p.name, price: '查看详情' }]
      }))
      this.setData({
        productGroups: groups,
        isEmpty: groups.length === 0
      })
    }).catch((err) => {
      console.error('搜索失败:', err)
      this.setData({ productGroups: [], isEmpty: true })
    })
  },

  loadConditions() {
    priceApi.getConditions().then((res) => {
      const conditions = (res.data || []).map(c => ({
        id: c.id,
        name: c.name,
        price: '0'
      }))
      this.setData({ 
        quantityConditions: conditions.length > 0 ? conditions : this.getDefaultConditions(),
        quantities: conditions.map(() => 0) 
      })
    }).catch((err) => {
      console.error('加载条件列表失败:', err)
      this.setData({
        quantityConditions: this.getDefaultConditions(),
        quantities: [0, 0, 0, 0, 0, 0]
      })
    })
  },
  
  getDefaultConditions() {
    return [
      { name: '开机屏好', price: '0' },
      { name: '开机大屏好', price: '0' },
      { name: '开机小屏好', price: '0' },
      { name: '开机屏坏', price: '0' },
      { name: '不开机', price: '0' },
      { name: '废板-整机', price: '0' }
    ]
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value
    if (keyword) {
      this.doSearch(keyword)
    } else {
      this.setData({ isEmpty: false })
    }
  },

  switchCategory(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeCategory: index,
      activeBrand: 0,
      productGroups: [],
      isEmpty: false
    })

    if (this.data.categories && this.data.categories[index]) {
      this.loadBrandsByCategory(this.data.categories[index].id)
    }
  },

  switchBrand(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeBrand: index })
    const brand = this.data.brands[index]
    if (brand && brand.id) {
      this.loadProductsByBrand(brand.id)
    }
  },

  openModal(e) {
    const product = e.currentTarget.dataset.product
    const productId = e.currentTarget.dataset.productid

    this.setData({
      modalProduct: {
        id: productId,
        name: product.name || product.model || '产品详情',
        ...product
      },
      isModalOpen: true,
      quantities: this.data.quantityConditions.map(() => 0)
    })

    if (productId) {
      productApi.getProductDetail(productId).then((res) => {
        const detail = res.data
        if (detail && detail.prices) {
          const conditions = detail.prices.map(p => ({
            id: p.Condition?.id || p.condition_id,
            name: p.Condition?.name || '未知成色',
            code: p.Condition?.code || '',
            price: String(p.price || 0)
          })).sort((a, b) => parseFloat(b.price) - parseFloat(a.price))

          this.setData({
            quantityConditions: conditions.length > 0 ? conditions : this.getDefaultConditions(),
            quantities: conditions.map(() => 0)
          })
        }
      }).catch((err) => {
        console.error('获取产品详情失败:', err)
      })
    }
  },

  closeModal() {
    this.setData({ isModalOpen: false })
  },

  stopPropagation() {},

  changeQuantity(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    const delta = parseInt(e.currentTarget.dataset.delta)
    const quantities = this.data.quantities
    quantities[index] = Math.max(0, (quantities[index] || 0) + delta)
    this.setData({ quantities })
  },

  addToCart() {
    let total = 0
    const promises = []
    this.data.quantities.forEach((q, idx) => {
      if (q > 0 && this.data.quantityConditions[idx]) {
        total += q
        const condition = this.data.quantityConditions[idx]
        promises.push(cartApi.addToCart({
          product_id: this.data.modalProduct.id,
          condition_id: condition.id,
          quantity: q
        }))
      }
    })

    if (total > 0 && promises.length > 0) {
      Promise.all(promises).then(() => {
        const app = getApp()
        app.refreshCart()
        this.setData({ cartBadgeCount: app.globalData.cartCount + total })
        this.showToast(`已添加 ${total} 台到回收车`)
        this.closeModal()
      }).catch(() => {
        this.showToast('添加失败，请重试')
      })
    } else {
      this.showToast('请选择数量')
    }
  },

  goToQuickOrder() {
    wx.navigateTo({ url: '/pages/shopping/shopping' })
  },

  showPriceHistory() {
    wx.showToast({ title: '历史价格功能开发中', icon: 'none' })
  },

  showCartToast() {
    wx.navigateTo({ url: '/pages/shopping/shopping' })
  },

  showToast(message) {
    this.setData({ toastMessage: message, toastVisible: true })
    setTimeout(() => { this.setData({ toastVisible: false }) }, 2000)
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 品牌列表', path: '/pages/brand-list/brand-list' }
  },

  goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.switchTab({ url: '/pages/index/index' })
    }
  }
})
