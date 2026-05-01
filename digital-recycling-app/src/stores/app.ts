import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoryApi, brandApi } from '../api'

export const useAppStore = defineStore('app', () => {
  const categories = ref<any[]>([])
  const brands = ref<any[]>([])
  const loading = ref(false)
  const categoriesLoaded = ref(false)
  const brandsLoaded = ref(false)

  async function fetchCategories() {
    if (categoriesLoaded.value) return
    loading.value = true
    try {
      const res: any = await categoryApi.getList()
      categories.value = res.data || []
      categoriesLoaded.value = true
    } catch (e) {
      // ignore
    } finally {
      loading.value = false
    }
  }

  async function fetchBrands(params?: any) {
    loading.value = true
    try {
      const res: any = await brandApi.getList(params)
      brands.value = res.data || []
      brandsLoaded.value = true
    } catch (e) {
      // ignore
    } finally {
      loading.value = false
    }
  }

  function clearCache() {
    categoriesLoaded.value = false
    brandsLoaded.value = false
    categories.value = []
    brands.value = []
  }

  return {
    categories,
    brands,
    loading,
    fetchCategories,
    fetchBrands,
    clearCache
  }
})
