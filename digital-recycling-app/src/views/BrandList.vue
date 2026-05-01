<template>
  <div class="brand-list-container">
    <!-- 顶部导航 -->
    <nav class="navbar">
      <div class="nav-back" @click="goHome"></div>
      <div class="nav-title">产品列表</div>
      <div class="nav-right">
        <div class="nav-more">
          <span></span><span></span><span></span>
        </div>
        <div class="nav-minus">−</div>
        <div class="nav-record">◎</div>
      </div>
    </nav>

    <!-- 搜索区域 -->
    <div class="search-section">
      <span class="search-label">选择机型</span>
      <div class="search-box" @click="focusSearch">
        <div class="search-icon"></div>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索品牌/型号"
          @keyup.enter="handleSearch"
          @input="onSearchInput"
        />
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="category-tabs">
      <div
        v-for="(tab, index) in categoryTabs"
        :key="index"
        :class="['category-tab', { active: activeCategory === index }]"
        @click="selectCategory(index)"
      >
        {{ tab }}
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧品牌导航 -->
      <aside class="brand-sidebar">
        <div
          v-for="(brand, index) in brands"
          :key="index"
          :class="['brand-item', { active: activeBrand === index }]"
          @click="selectBrand(index)"
        >
          {{ brand.name }}
        </div>
      </aside>

      <!-- 右侧产品列表 -->
      <div class="product-list">
        <template v-if="!isEmpty">
          <!-- 快速下单提示 -->
          <div class="quick-order-banner">
            <span class="quick-order-text">懒得选机器？想要卖多台？</span>
            <div class="quick-order-btn">快速下单</div>
          </div>

          <!-- 产品分组 -->
          <template v-for="(group, groupIndex) in currentProductGroups" :key="groupIndex">
            <div class="group-title">{{ group.title }}</div>
            <div
              v-for="(product, productIndex) in group.products"
              :key="productIndex"
              class="product-item"
              @click="openModal(product)"
            >
              <div class="product-info">
                <div class="product-dot"></div>
                <span class="product-name">{{ product.name }}</span>
              </div>
              <div class="product-price-section">
                <div class="product-price">{{ product.price }}</div>
                <div class="product-price-tag">预计可卖</div>
              </div>
            </div>
          </template>
        </template>

        <!-- 空状态 -->
        <template v-else>
          <EmptyState
            icon="📱"
            title="暂无品牌数据"
            description="请稍后再试"
          />
        </template>
      </div>
    </div>

    <!-- 底部悬浮回收车 -->
    <div class="floating-cart" @click="showCartToast">
      <div class="cart-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        <div class="cart-badge" v-if="cartBadgeCount > 0">{{ cartBadgeCount }}</div>
      </div>
    </div>

    <!-- 产品详情弹窗 -->
    <div
      :class="['modal-overlay', { show: isModalOpen }]"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <div class="modal-title">{{ modalProduct?.name || '产品详情' }}</div>
          <div class="modal-close" @click="closeModal"></div>
        </div>

        <!-- 弹窗内容 -->
        <div class="modal-body">
          <!-- 产品图片 -->
          <div class="modal-image-placeholder">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="#f0f0f0"/>
              <text x="50" y="55" text-anchor="middle" fill="#999" font-size="14">产品图片</text>
            </svg>
          </div>

          <!-- 等级说明栏 -->
          <div class="grade-bar">
            <div class="grade-label">
              等级说明
              <div class="grade-info-icon">?</div>
            </div>
            <div class="history-price">查看历史价格</div>
          </div>

          <!-- 数量输入区域 -->
          <div class="quantity-section">
            <div class="section-title">输入数量</div>

            <div
              v-for="(condition, index) in quantityConditions"
              :key="index"
              class="quantity-item"
            >
              <div class="quantity-info">
                <div class="quantity-name">
                  {{ condition.name }}
                  <div class="quantity-help">?</div>
                </div>
                <div class="quantity-price">回收价: <strong>¥{{ condition.price }} / 台</strong></div>
              </div>
              <div class="quantity-control">
                <button
                  class="quantity-btn minus"
                  :style="{ color: quantities[index] > 0 ? '#333' : '#ccc' }"
                  @click="changeQuantity(index, -1)"
                >−</button>
                <input type="number" class="quantity-input" :value="quantities[index]" readonly>
                <button class="quantity-btn plus" @click="changeQuantity(index, 1)">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeModal">关闭</button>
          <button class="btn btn-outline btn-cart-count" v-if="cartBadgeCount > 0">
            回收车 {{ cartBadgeCount }}
          </button>
          <button class="btn btn-outline btn-cart-count" v-else>
            回收车
          </button>
          <button class="btn btn-primary" @click="addToCart">加入回收车</button>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div class="toast" v-if="toastVisible">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import { categoryApi, brandApi, productApi, priceApi } from '../api'
import { useCartStore } from '../stores/cart'
import { useAppStore } from '../stores/app'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const appStore = useAppStore()

function goHome() {
  router.push('/')
}

const activeBrand = ref(0)
const activeCategory = ref(0)
const isModalOpen = ref(false)
const modalProduct = ref<any>(null)
const quantities = reactive([0, 0, 0, 0, 0, 0])
const toastVisible = ref(false)
const toastMessage = ref('')
const loading = ref(false)
const searchKeyword = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

let toastTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
  document.body.style.overflow = ''
})

const categoryTabs = ref<string[]>([])
const categories = ref<any[]>([])
const brands = ref<any[]>([])
const productGroups = ref<any[]>([])
const quantityConditions = ref<any[]>([])

const cartBadgeCount = computed(() => cartStore.badgeCount)

const currentProductGroups = computed(() => productGroups.value)

const isEmpty = computed(() => brands.value.length === 0 || productGroups.value.length === 0)

async function fetchCategories() {
  try {
    const res: any = await categoryApi.getList()
    categories.value = res.data || []
    if (categories.value.length > 0) {
      categoryTabs.value = categories.value.map((c: any) => c.name)
    }
  } catch (e) {
    // ignore
  }
}

async function fetchBrands(categoryId?: number) {
  loading.value = true
  try {
    const params: any = {}
    if (categoryId) params.category_id = categoryId
    const res: any = await brandApi.getList(params)
    brands.value = res.data || []
    if (brands.value.length > 0) {
      await fetchProducts(brands.value[0].id)
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

async function fetchProducts(brandId: number) {
  loading.value = true
  try {
    const res: any = await productApi.getList({ brand_id: brandId })
    const products = res.data?.list || res.data || []
    if (products.length > 0) {
      const seriesMap = new Map<string, any[]>()
      products.forEach((p: any) => {
        const seriesName = p.series_name || p.Brand?.name || '其他'
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, [])
        }
        seriesMap.get(seriesName)!.push({
          id: p.id,
          name: p.name,
          price: p.Prices && p.Prices.length > 0 ? `¥${p.Prices[0].price}` : '询价',
          rawPrice: p.Prices && p.Prices.length > 0 ? p.Prices[0].price : 0,
          productId: p.id
        })
      })
      productGroups.value = Array.from(seriesMap.entries()).map(([title, prods]) => ({
        title,
        products: prods
      }))
    } else {
      productGroups.value = []
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

async function selectBrand(index: number) {
  activeBrand.value = index
  if (brands.value[index]) {
    await fetchProducts(brands.value[index].id)
  }
}

async function selectCategory(index: number) {
  activeCategory.value = index
  if (categories.value[index]) {
    await fetchBrands(categories.value[index].id)
  }
}

async function openModal(product: any) {
  modalProduct.value = product
  isModalOpen.value = true
  quantities.fill(0)
  document.body.style.overflow = 'hidden'
  try {
    if (product.productId) {
      const res: any = await productApi.getDetail(product.productId)
      const detail = res.data
      if (detail && detail.Prices && detail.Prices.length > 0) {
        quantityConditions.value = detail.Prices.map((p: any) => ({
          name: p.Condition?.name || '默认',
          price: String(p.price || 0),
          conditionId: p.condition_id || p.Condition?.id
        }))
        quantities.splice(0, quantities.length, ...quantityConditions.value.map(() => 0))
      } else if (detail && detail.prices && detail.prices.length > 0) {
        quantityConditions.value = detail.prices.map((p: any) => ({
          name: p.Condition?.name || p.condition_name || '默认',
          price: String(p.price || 0),
          conditionId: p.condition_id || p.Condition?.id
        }))
        quantities.splice(0, quantities.length, ...quantityConditions.value.map(() => 0))
      }
    }
  } catch (e) {
    // ignore
  }
}

function closeModal(event?: Event) {
  if (event && event.target !== event.currentTarget) return
  isModalOpen.value = false
  document.body.style.overflow = ''
}

function changeQuantity(index: number, delta: number) {
  quantities[index] = Math.max(0, (quantities[index] || 0) + delta)
}

async function addToCart() {
  let total = 0
  quantities.forEach(q => { total += q || 0 })

  if (total > 0 && modalProduct.value) {
    try {
      for (let i = 0; i < quantityConditions.value.length; i++) {
        if (quantities[i] > 0) {
          await cartStore.addItem({
            product_id: modalProduct.value.productId,
            condition_id: quantityConditions.value[i].conditionId,
            quantity: quantities[i]
          })
        }
      }
      showToast(`已添加 ${total} 台到回收车`)
      closeModal()
    } catch (e) {
      showToast('添加失败，请重试')
    }
  } else {
    showToast('请选择数量')
  }
}

function showCartToast() {
  router.push('/shopping')
}

function focusSearch() {
  const input = document.querySelector('.search-input') as HTMLInputElement
  input?.focus()
}

async function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    if (brands.value.length > 0) {
      await fetchProducts(brands.value[activeBrand.value].id)
    }
    return
  }
  loading.value = true
  try {
    const res: any = await productApi.getList({ keyword })
    const products = res.data?.list || res.data || []
    if (products.length > 0) {
      const seriesMap = new Map<string, any[]>()
      products.forEach((p: any) => {
        const seriesName = p.series_name || p.Brand?.name || '搜索结果'
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, [])
        }
        seriesMap.get(seriesName)!.push({
          id: p.id,
          name: p.name,
          price: p.Prices && p.Prices.length > 0 ? `¥${p.Prices[0].price}` : '询价',
          rawPrice: p.Prices && p.Prices.length > 0 ? p.Prices[0].price : 0,
          productId: p.id
        })
      })
      productGroups.value = Array.from(seriesMap.entries()).map(([title, prods]) => ({
        title,
        products: prods
      }))
    } else {
      productGroups.value = []
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
}

function showToast(message: string) {
  if (toastTimer) { clearTimeout(toastTimer) }
  toastMessage.value = message
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 2000)
}

onMounted(async () => {
  await fetchCategories()
  const keyword = route.query.keyword as string
  if (keyword) {
    searchKeyword.value = keyword
    await handleSearch()
  } else if (categories.value.length > 0) {
    await fetchBrands(categories.value[0].id)
  } else {
    await fetchBrands()
  }
})
</script>

<style scoped>
.brand-list-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
}

/* ========== 顶部导航栏 ========== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.nav-back {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back::after {
  content: '';
  width: 10px;
  height: 10px;
  border-left: 2px solid #333;
  border-bottom: 2px solid #333;
  transform: rotate(45deg);
}

.nav-title {
  font-size: 17px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-more {
  display: flex;
  gap: 3px;
}

.nav-more span {
  width: 4px;
  height: 4px;
  background: #333;
  border-radius: 50%;
}

.nav-minus, .nav-record {
  width: 20px;
  height: 20px;
  border: 1.5px solid #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* ========== 搜索区域 ========== */
.search-section {
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 99;
  border-bottom: 1px solid #f0f0f0;
}

.search-label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.search-box {
  flex: 1;
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 6px;
}

.search-icon {
  width: 16px;
  height: 16px;
  border: 1.5px solid #999;
  border-radius: 50%;
  position: relative;
}

.search-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 1.5px;
  background: #999;
  bottom: -3px;
  right: -4px;
  transform: rotate(45deg);
}

.search-placeholder {
  font-size: 13px;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

/* ========== 分类Tab ========== */
.category-tabs {
  position: fixed;
  top: 90px;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 20px;
  z-index: 98;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tab {
  font-size: 15px;
  color: #666;
  position: relative;
  padding-bottom: 8px;
  cursor: pointer;
}

.category-tab.active {
  color: #333;
  font-weight: 600;
}

.category-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #ff2442;
  border-radius: 2px;
}

/* ========== 主体内容区 ========== */
.main-content {
  position: fixed;
  top: 134px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background: #fff;
}

/* 左侧品牌导航 */
.brand-sidebar {
  width: 85px;
  background: #f8f8f8;
  overflow-y: auto;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}

.brand-item {
  padding: 14px 10px;
  font-size: 13px;
  color: #666;
  text-align: center;
  position: relative;
  line-height: 1.3;
}

.brand-item.active {
  background: #fff;
  color: #ff2442;
  font-weight: 600;
}

.brand-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background: #ff2442;
  border-radius: 0 2px 2px 0;
}

/* 右侧产品列表 */
.product-list {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  padding: 0 12px;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

/* 快速下单提示 */
.quick-order-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 8px;
}

.quick-order-text {
  font-size: 13px;
  color: #666;
}

.quick-order-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff2442;
  font-size: 13px;
  border: 1px solid #ff2442;
  padding: 4px 10px;
  border-radius: 14px;
}

.quick-order-btn::after {
  content: '';
  width: 6px;
  height: 6px;
  border-top: 1.5px solid #ff2442;
  border-right: 1.5px solid #ff2442;
  transform: rotate(45deg);
}

/* 产品分组标题 */
.group-title {
  font-size: 15px;
  color: #ff2442;
  font-weight: 600;
  padding: 12px 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.group-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: #ff2442;
  border-radius: 2px;
}

/* 产品项 */
.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.product-item:active {
  background: #fafafa;
}

.product-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-dot {
  width: 6px;
  height: 6px;
  background: #ccc;
  border-radius: 50%;
  flex-shrink: 0;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.product-price-section {
  text-align: right;
}

.product-price {
  font-size: 16px;
  color: #ff2442;
  font-weight: 600;
}

.product-price-tag {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* ========== 底部悬浮回收车 ========== */
.floating-cart {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  cursor: pointer;
}

.cart-icon {
  width: 28px;
  height: 28px;
  position: relative;
}

.cart-icon svg {
  width: 100%;
  height: 100%;
  fill: #ff2442;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #ff2442;
  color: #fff;
  font-size: 11px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  font-weight: 600;
}

/* ========== 产品详情弹窗（底部弹出） ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  will-change: opacity, visibility;
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 85vh;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  will-change: transform;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.modal-overlay.show .modal-content {
  transform: translateY(0);
}

/* 弹窗头部 */
.modal-header {
  padding: 15px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid #f5f5f5;
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.modal-close {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-close::before,
.modal-close::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 2px;
  background: #999;
}

.modal-close::before {
  transform: rotate(45deg);
}

.modal-close::after {
  transform: rotate(-45deg);
}

/* 弹窗滚动区域 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
}

/* 产品图片 */
.modal-image-placeholder {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  margin: 15px 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image-placeholder svg {
  width: 100%;
  height: 100%;
}

/* 等级说明栏 */
.grade-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.grade-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #ff2442;
  font-weight: 500;
}

.grade-info-icon {
  width: 16px;
  height: 16px;
  border: 1px solid #ff2442;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #ff2442;
}

.history-price {
  font-size: 13px;
  color: #ff2442;
  display: flex;
  align-items: center;
  gap: 2px;
}

.history-price::after {
  content: '';
  width: 5px;
  height: 5px;
  border-top: 1.5px solid #ff2442;
  border-right: 1.5px solid #ff2442;
  transform: rotate(45deg);
}

/* 数量输入区域 */
.quantity-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: #ff2442;
  border-radius: 2px;
}

.quantity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.quantity-info {
  flex: 1;
}

.quantity-name {
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.quantity-help {
  width: 14px;
  height: 14px;
  border: 1px solid #ccc;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #999;
}

.quantity-price {
  font-size: 13px;
  color: #999;
}

.quantity-price strong {
  color: #ff2442;
  font-weight: 600;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.quantity-btn:active {
  background: #f5f5f5;
}

.quantity-btn.minus {
  border-right: 1px solid #ddd;
  color: #ccc;
}

.quantity-btn.plus {
  border-left: 1px solid #ddd;
  color: #333;
}

.quantity-input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: none;
  font-size: 15px;
  color: #333;
  -webkit-appearance: none;
  outline: none;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.quantity-input:focus {
  border: 1px solid #ff3344;
  box-shadow: 0 0 0 3px rgba(255, 51, 68, 0.1);
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* 弹窗底部操作栏 */
.modal-footer {
  padding: 10px 15px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f5f5f5;
  background: #fff;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-outline {
  background: #fff;
  color: #ff2442;
  border: 1px solid #ff2442;
}

.btn-primary {
  background: #ff2442;
  color: #fff;
}

.btn-cart-count {
  position: relative;
}

/* Toast 提示 */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.toast-enter-to {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.toast-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

/* 隐藏滚动条但保持功能 */
.brand-sidebar::-webkit-scrollbar,
.product-list::-webkit-scrollbar,
.modal-body::-webkit-scrollbar {
  display: none;
}

/* 适配安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .modal-footer {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}
</style>
