<template>
  <div class="shopping-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <span class="header-title">回收车</span>
    </div>

    <!-- 有商品时显示的内容 -->
    <template v-if="!isEmpty">
      <!-- 顶部统计 -->
      <div class="top-stat">
        <div class="stat-info">
          <span class="stat-label">当前已添加</span>
          <span class="stat-num">{{ totalItems }}</span>
          <span class="stat-label">件商品，合计</span>
          <span class="stat-num">{{ totalDevices }}</span>
          <span class="stat-label">台，已选</span>
          <span class="stat-num highlight">{{ selectedCount }}</span>
          <span class="stat-label">台</span>
        </div>
        <button class="clear-btn" @click="handleClearAll">清空</button>
      </div>

      <!-- 商品分类 -->
      <div class="category-section">
        <div class="category-title-wrap">
          <div class="category-left">
            <span class="category-icon">📱</span>
            <span class="category-title">{{ categoryName }}</span>
          </div>
          <button class="clear-category-btn" @click="handleClearCategory">清空</button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="product-list">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="product-item"
          :class="{ 'is-selected': item.is_selected }"
        >
          <div class="item-wrapper" @click="toggleItemSelection(item)">
            <div class="checkbox-round" :class="{ 'is-checked': item.is_selected }">
              <span v-if="item.is_selected">✓</span>
            </div>
            <div class="product-info">
              <div class="product-name">{{ item.Product?.name || '未知产品' }}</div>
              <div class="product-meta">
                <span class="product-condition">成色：{{ item.Condition?.name || '默认' }}</span>
              </div>
              <div class="product-price">
                <span class="price-label">回收价：</span>
                <span class="price-red">¥{{ item.unit_price }}</span>
              </div>
            </div>
          </div>

          <div class="item-actions">
            <div class="qty-control">
              <button
                class="qty-btn qty-minus"
                @click="decreaseQuantity(item)"
                :disabled="item.quantity <= 1"
              >
                <span>−</span>
              </button>
              <span class="qty-num">{{ item.quantity }}</span>
              <button class="qty-btn qty-plus" @click="increaseQuantity(item)">
                <span>+</span>
              </button>
            </div>
            <button class="delete-btn" @click="handleDelete(item)">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 提示文字 -->
      <div class="tip-text" v-once>
        <span class="tip-icon">💡</span>
        提示：左滑可删除产品，点击商品可选择
      </div>

      <!-- 底部结算栏 -->
      <div class="bottom-settle-bar">
        <div class="select-all-wrapper" @click="toggleSelectAll">
          <div class="settle-checkbox" :class="{ 'is-checked': isAllSelected }">
            <span v-if="isAllSelected">✓</span>
          </div>
          <span class="select-all-text" v-once>全选</span>
        </div>
        <div class="total-section">
          <div class="total-text">
            合计:
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="total-hint" v-if="selectedCount > 0">
            已选 {{ selectedCount }} 件商品
          </div>
        </div>
        <button class="btn-add-more" @click="handleAddMore">
          <span>➕</span> 继续添加
        </button>
        <button
          class="btn-submit"
          @click="handleSubmit"
          :disabled="selectedCount === 0"
        >
          提交订单
        </button>
      </div>
    </template>

    <!-- 空购物车状态 -->
    <template v-else>
      <EmptyState
        icon="🛒"
        title="购物车是空的"
        description="快去添加您想要回收的商品吧"
        :show-action="true"
        action-text="去逛逛"
        @action="goToBrandList"
      />
    </template>

    <!-- 底部导航栏 - 使用高级导航组件 -->
    <AdvancedTabBar active-tab="shopping" />

    <!-- 删除确认弹窗 -->
    <Transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
        <div class="modal-content" @click.stop>
          <div class="modal-icon">🗑️</div>
          <div class="modal-title">确认删除</div>
          <div class="modal-text">确定要删除这件商品吗？</div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closeDeleteConfirm">取消</button>
            <button class="modal-btn confirm" @click="confirmDelete">确定</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 清空确认弹窗 -->
    <Transition name="modal">
      <div v-if="showClearConfirm" class="modal-overlay" @click="closeClearConfirm">
        <div class="modal-content" @click.stop>
          <div class="modal-icon">⚠️</div>
          <div class="modal-title">确认清空</div>
          <div class="modal-text">确定要清空回收车吗？</div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closeClearConfirm">取消</button>
            <button class="modal-btn confirm" @click="confirmClearAll">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedTabBar from '../components/AdvancedTabBar.vue'
import EmptyState from '../components/EmptyState.vue'
import { orderApi } from '../api'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const showDeleteConfirm = ref(false)
const showClearConfirm = ref(false)
const deleteTarget = ref<any>(null)

const categoryName = computed(() => {
  if (cartStore.items.length === 0) return '回收车'
  return '回收商品'
})

const isEmpty = computed(() => cartStore.items.length === 0)

const totalItems = computed(() => cartStore.totalCount)
const totalDevices = computed(() => cartStore.totalCount)
const selectedCount = computed(() => cartStore.selectedCount)
const isAllSelected = computed(() => cartStore.isAllSelected)
const totalPrice = computed(() => cartStore.totalPrice)

onMounted(() => {
  cartStore.fetchCart()
})

const goToBrandList = () => {
  router.push('/brand-list')
}

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    cartStore.updateItem(item.id, { quantity: item.quantity - 1 })
  }
}

const increaseQuantity = (item: any) => {
  cartStore.updateItem(item.id, { quantity: item.quantity + 1 })
}

const toggleSelectAll = () => {
  cartStore.toggleSelectAll(!cartStore.isAllSelected)
}

const toggleItemSelection = (item: any) => {
  cartStore.updateItem(item.id, { is_selected: !item.is_selected })
}

const handleDelete = (item: any) => {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

const confirmDelete = () => {
  if (deleteTarget.value) {
    cartStore.deleteItem(deleteTarget.value.id)
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

const handleClearAll = () => {
  showClearConfirm.value = true
}

const confirmClearAll = () => {
  cartStore.clearCart()
  showClearConfirm.value = false
}

const closeClearConfirm = () => {
  showClearConfirm.value = false
}

const handleClearCategory = () => {
  cartStore.clearCart()
}

const handleAddMore = () => {
  router.push('/brand-list')
}

const handleSubmit = async () => {
  if (cartStore.selectedCount > 0) {
    try {
      const res: any = await orderApi.create()
      const orderNo = res.data?.orderNo || ''
      alert(`订单提交成功！订单号：${orderNo}`)
      router.push('/')
    } catch (e) {
      alert('订单提交失败，请重试')
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.shopping-page {
  font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif;
  background-color: #f5f5f5;
  padding-bottom: 100px;
  min-height: 100vh;
  min-width: 320px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.page-header {
  background: #ffffff;
  text-align: center;
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top));
  position: sticky;
  top: 0;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.top-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  margin-bottom: 8px;
}

.stat-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 15px;
  color: #666;
  flex: 1;
}

.stat-label {
  color: #999;
}

.stat-num {
  color: #ff3344;
  font-weight: 600;
  margin: 0 2px;
}

.stat-num.highlight {
  color: #ff3344;
}

.clear-btn {
  background: none;
  border: none;
  color: #ff3344;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.clear-btn:active {
  background: rgba(255, 51, 68, 0.1);
  transform: scale(0.97);
}

.category-section {
  background: #fff;
  margin-bottom: 8px;
}

.category-title-wrap {
  background: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  font-size: 24px;
}

.category-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.clear-category-btn {
  background: #f5f5f5;
  border: none;
  color: #999;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.clear-category-btn:active {
  background: #e8e8e8;
  transform: scale(0.97);
}

.cat-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f8f8;
  padding: 12px 20px;
  font-size: 15px;
  color: #999;
  margin: 0;
}

.tag-icon {
  font-size: 18px;
}

.product-list {
  background: #fff;
}

.product-item {
  background: #fff;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-item.is-selected {
  background: #fff9f9;
}

.item-wrapper {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.item-wrapper:active {
  background: rgba(255, 51, 68, 0.05);
}

.checkbox-round {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #e0e0e0;
  flex-shrink: 0;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
}

.checkbox-round.is-checked {
  background-color: #ff3344;
  border-color: #ff3344;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.4;
}

.product-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.product-brand,
.product-condition {
  font-size: 14px;
  color: #999;
  background: #f5f5f5;
  padding: 4px 10px;
  border-radius: 4px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label {
  font-size: 15px;
  color: #666;
}

.price-red {
  color: #ff2222;
  font-size: 20px;
  font-weight: 800;
}

.item-actions {
  padding: 16px 20px;
  padding-top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.qty-btn {
  width: 44px;
  height: 44px;
  border: none;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  border-radius: 6px;
}

.qty-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #e0e0e0 !important;
  color: #bbb !important;
  box-shadow: none !important;
  transform: none !important;
}

.qty-minus {
  background: #fff;
  color: #333;
}

.qty-minus:active:not(:disabled) {
  background: #e8e8e8;
}

.qty-plus {
  background: linear-gradient(145deg, #ff3344, #ff4754);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 51, 68, 0.3);
}

.qty-plus:active:not(:disabled) {
  box-shadow: 0 1px 4px rgba(255, 51, 68, 0.2);
}

.qty-num {
  font-size: 18px;
  font-weight: 600;
  min-width: 32px;
  text-align: center;
  color: #333;
}

.delete-btn {
  width: 44px;
  height: 44px;
  background: #fff;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.delete-btn:active {
  background: #ff3344;
  border-color: #ff3344;
  transform: scale(0.97);
  color: #fff;
}

.tip-text {
  padding: 16px 20px;
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
}

.tip-icon {
  font-size: 18px;
}

.bottom-settle-bar {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 98;
}

.select-all-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  margin: -8px;
  border-radius: 8px;
  transition: background 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.select-all-wrapper:active {
  background: rgba(0, 0, 0, 0.05);
}

.settle-checkbox {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
}

.settle-checkbox.is-checked {
  background: #ff3344;
  border-color: #ff3344;
}

.select-all-text {
  font-size: 15px;
  color: #666;
}

.total-section {
  flex: 1;
  text-align: center;
}

.total-text {
  font-size: 16px;
  color: #333;
}

.total-price {
  color: #ff4400;
  font-size: 24px;
  font-weight: 800;
}

.total-hint {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.btn-add-more {
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(145deg, #ff9933, #ff8800);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 153, 51, 0.3);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.btn-add-more:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(255, 153, 51, 0.2);
}

.btn-add-more span {
  margin-right: 4px;
}

.btn-submit {
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(145deg, #ff2b40, #ff4754);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 43, 64, 0.3);
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(255, 43, 64, 0.2);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  will-change: opacity;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  max-width: 320px;
  width: 100%;
  animation: slideUp 0.3s ease;
  will-change: transform, opacity;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.modal-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.modal-btn:active {
  transform: scale(0.97);
}

.modal-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.confirm {
  background: linear-gradient(145deg, #ff3344, #ff4754);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 51, 68, 0.3);
}

@media (max-width: 375px) {
  .bottom-settle-bar {
    padding: 10px 10px;
    gap: 6px;
  }

  .btn-add-more,
  .btn-submit {
    padding: 8px 12px;
    font-size: 13px;
  }

  .total-price {
    font-size: 18px;
  }

  .select-all-text {
    font-size: 13px;
  }

  .total-text {
    font-size: 14px;
  }

  .item-wrapper {
    padding: 16px 12px;
    gap: 10px;
  }

  .product-name {
    font-size: 15px;
  }

  .product-meta {
    gap: 8px;
  }

  .product-brand,
  .product-condition {
    font-size: 12px;
    padding: 3px 8px;
  }

  .price-red {
    font-size: 18px;
  }

  .qty-btn {
    width: 38px;
    height: 38px;
    font-size: 20px;
  }

  .qty-num {
    font-size: 16px;
    min-width: 28px;
  }

  .delete-btn {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .item-actions {
    padding: 12px 12px 12px;
  }

  .category-title-wrap {
    padding: 16px;
  }

  .category-title {
    font-size: 18px;
  }

  .cat-tag {
    padding: 10px 16px;
    font-size: 14px;
  }

  .top-stat {
    padding: 12px 16px;
  }

  .stat-info {
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .bottom-settle-bar {
    padding: 8px 8px;
    gap: 4px;
  }

  .btn-add-more,
  .btn-submit {
    padding: 6px 10px;
    font-size: 12px;
  }

  .total-price {
    font-size: 16px;
  }

  .select-all-text {
    font-size: 12px;
  }

  .total-text {
    font-size: 13px;
  }

  .item-wrapper {
    padding: 12px 10px;
    gap: 8px;
  }

  .product-name {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .product-meta {
    gap: 6px;
    margin-bottom: 6px;
  }

  .product-brand,
  .product-condition {
    font-size: 11px;
    padding: 2px 6px;
  }

  .price-red {
    font-size: 16px;
  }

  .qty-btn {
    width: 34px;
    height: 34px;
    font-size: 18px;
  }

  .qty-num {
    font-size: 14px;
    min-width: 24px;
  }

  .delete-btn {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .item-actions {
    padding: 10px 10px 10px;
  }

  .category-title-wrap {
    padding: 14px;
  }

  .category-title {
    font-size: 16px;
  }

  .cat-tag {
    padding: 8px 14px;
    font-size: 13px;
  }

  .top-stat {
    padding: 10px 12px;
  }

  .stat-info {
    font-size: 12px;
  }

  .checkbox-round {
    width: 22px;
    height: 22px;
    font-size: 14px;
  }

  .settle-checkbox {
    width: 22px;
    height: 22px;
    font-size: 14px;
  }
}
</style>
