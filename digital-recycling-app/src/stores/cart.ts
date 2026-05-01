import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '../api'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>([])
  const loading = ref(false)

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const selectedItems = computed(() => items.value.filter(item => item.is_selected))
  const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalPrice = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0)
  })
  const isAllSelected = computed(() => items.value.length > 0 && items.value.every(item => item.is_selected))
  const badgeCount = computed(() => items.value.length)

  async function fetchCart() {
    loading.value = true
    try {
      const res: any = await cartApi.getList()
      items.value = res.data.list || []
    } catch (e) {
      // ignore
    } finally {
      loading.value = false
    }
  }

  async function addItem(data: { product_id: number; condition_id: number; quantity?: number }) {
    const res: any = await cartApi.addItem(data)
    await fetchCart()
    return res
  }

  async function updateItem(id: number, data: { quantity?: number; is_selected?: boolean }) {
    await cartApi.updateItem(id, data)
    await fetchCart()
  }

  async function deleteItem(id: number) {
    await cartApi.deleteItem(id)
    await fetchCart()
  }

  async function toggleSelectAll(selected: boolean) {
    await cartApi.selectAll(selected)
    await fetchCart()
  }

  async function clearCart() {
    await cartApi.clear()
    items.value = []
  }

  return {
    items,
    loading,
    totalCount,
    selectedItems,
    selectedCount,
    totalPrice,
    isAllSelected,
    badgeCount,
    fetchCart,
    addItem,
    updateItem,
    deleteItem,
    toggleSelectAll,
    clearCart
  }
})
