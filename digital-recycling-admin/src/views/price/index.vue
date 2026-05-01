<template>
  <div class="price-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>报价管理</span>
          <div class="header-actions">
            <el-button @click="handleConditionManage">条件管理</el-button>
            <el-button type="primary" @click="handleAddPrice">新增报价</el-button>
            <el-select v-model="filterBrandId" placeholder="选择品牌" clearable style="width: 160px" @change="handleFilterChange">
              <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id" />
            </el-select>
            <el-button type="primary" @click="handleBatchSave">保存修改</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border empty-text="暂无报价数据">
        <el-table-column prop="name" label="产品名称" width="160" fixed />
        <el-table-column prop="Brand.name" label="品牌" width="100" />
        <el-table-column prop="series_name" label="系列" width="120" />
        <el-table-column prop="model_code" label="型号" width="120" />
        <el-table-column v-for="cond in conditions" :key="cond.id" :label="cond.name" width="110">
          <template #default="{ row }">
            <el-input
              :model-value="getPriceValue(row, cond.id)"
              @update:model-value="val => setPriceValue(row, cond.id, val)"
              size="small"
              type="number"
              placeholder=""
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDeletePrice(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
    </el-card>

    <el-dialog v-model="addPriceVisible" title="新增报价" width="500px">
      <el-form :model="addPriceForm" ref="addPriceFormRef" label-width="80px">
        <el-form-item label="品牌" prop="brand_id" :rules="[{ required: true, message: '请选择品牌', trigger: 'change' }]">
          <el-select v-model="addPriceForm.brand_id" placeholder="请选择品牌" style="width: 100%" clearable @change="handleBrandChange">
            <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="product_id" :rules="[{ required: true, message: '请选择产品', trigger: 'change' }]">
          <el-select v-model="addPriceForm.product_id" placeholder="请选择产品" style="width: 100%" filterable>
            <el-option v-for="p in filteredProducts" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-divider v-if="addPriceForm.product_id && conditions.length" content-position="left">报价输入</el-divider>
        <el-form-item v-for="cond in conditions" :key="cond.id" :label="cond.name">
          <el-input-number v-model="addPriceForm.prices[cond.id]" :min="0" :precision="2" placeholder="请输入价格" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addPriceVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddPriceSubmit">确认添加</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="conditionVisible" title="条件管理" width="600px">
      <el-button type="primary" style="margin-bottom: 16px" @click="handleAddCondition">新增条件</el-button>
      <el-table :data="conditionList" v-loading="conditionLoading" stripe empty-text="暂无条件">
        <el-table-column prop="name" label="条件名称" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEditCondition(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDeleteCondition(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="conditionFormVisible" :title="conditionForm.id ? '编辑条件' : '新增条件'" width="400px" append-to-body>
        <el-form :model="conditionForm" :rules="conditionRules" ref="conditionFormRef" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="conditionForm.name" placeholder="请输入条件名称" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="conditionForm.sort_order" :min="0" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="conditionFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveCondition">保存</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPrices, batchUpdatePrices, getConditions, getBrands, createPrice, deletePrice, createCondition, updateCondition, deleteCondition, getProducts } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const conditions = ref([])
const brands = ref([])
const allProducts = ref([])
const filterBrandId = ref('')
const page = ref(1)
const pageSize = ref(50)
const total = ref(0)

const addPriceVisible = ref(false)
const addPriceFormRef = ref(null)
const addPriceForm = ref({
  brand_id: '',
  product_id: '',
  prices: {}
})

const filteredProducts = computed(() => {
  if (!addPriceForm.value.brand_id) return allProducts.value
  return allProducts.value.filter(p => p.brand_id === addPriceForm.value.brand_id)
})

const handleBrandChange = () => {
  addPriceForm.value.product_id = ''
}

const getPriceValue = (row, conditionId) => {
  if (!row.Prices) return ''
  const p = row.Prices.find(p => p.condition_id === conditionId)
  return p ? p.price : ''
}

const setPriceValue = (row, conditionId, val) => {
  if (!row.Prices) row.Prices = []
  let p = row.Prices.find(p => p.condition_id === conditionId)
  if (p) {
    p.price = val
  } else {
    row.Prices.push({
      condition_id: conditionId,
      price: val,
      is_available: 1,
      isNew: true
    })
  }
}

const conditionVisible = ref(false)
const conditionLoading = ref(false)
const conditionList = ref([])
const conditionFormVisible = ref(false)
const conditionFormRef = ref(null)
const conditionForm = ref({
  name: '',
  sort_order: 0
})

const conditionRules = {
  name: [
    { required: true, message: '请输入条件名称', trigger: 'blur' }
  ]
}

const loadData = async () => {
  loading.value = true
  try {
    const priceRes = await getPrices({ brand_id: filterBrandId.value, page: page.value, pageSize: pageSize.value })
    tableData.value = priceRes.data.list
    total.value = priceRes.data.pagination.total
  } finally {
    loading.value = false
  }
}

const loadBaseData = async () => {
  const [condRes, brandRes, productRes] = await Promise.all([
    getConditions(),
    getBrands({ pageSize: 200 }),
    getProducts({ pageSize: 500 })
  ])
  conditions.value = condRes.data
  brands.value = brandRes.data.list
  allProducts.value = productRes.data.list
}

const handleFilterChange = () => {
  page.value = 1
  loadData()
}

const handleBatchSave = async () => {
  try {
    const prices = []
    tableData.value.forEach(product => {
      if (product.Prices) {
        product.Prices.forEach(p => {
          const priceVal = parseFloat(p.price)
          if (isNaN(priceVal) || priceVal === 0) return
          prices.push({
            product_id: product.id,
            condition_id: p.condition_id,
            price: priceVal,
            is_available: p.is_available !== undefined ? p.is_available : 1
          })
        })
      }
    })
    if (prices.length === 0) {
      ElMessage.warning('没有可保存的报价数据')
      return
    }
    await batchUpdatePrices({ prices })
    ElMessage.success('报价更新成功')
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

const handleAddPrice = () => {
  const pricesObj = {}
  conditions.value.forEach(c => { pricesObj[c.id] = undefined })
  addPriceForm.value = {
    brand_id: '',
    product_id: '',
    prices: pricesObj
  }
  addPriceVisible.value = true
}

const handleAddPriceSubmit = async () => {
  if (!addPriceFormRef.value) return

  await addPriceFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { brand_id, product_id, prices } = addPriceForm.value
        const entries = Object.entries(prices).filter(([, val]) => val !== undefined && val !== null && val !== '')
        if (entries.length === 0) {
          ElMessage.warning('请至少输入一个条件的价格')
          return
        }
        for (const [condition_id, price] of entries) {
          await createPrice({ product_id, condition_id, price: parseFloat(price) })
        }
        ElMessage.success('报价添加成功')
        addPriceVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '添加失败')
      }
    }
  })
}

const handleDeletePrice = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该产品的所有报价？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    if (row.Prices && row.Prices.length > 0) {
      for (const p of row.Prices) {
        if (p.id) await deletePrice(p.id)
      }
    }
    ElMessage.success('删除成功')
    if (tableData.value.length <= 1 && page.value > 1) {
      page.value--
    }
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleConditionManage = async () => {
  conditionVisible.value = true
  conditionLoading.value = true
  try {
    const res = await getConditions()
    conditionList.value = res.data
  } catch (error) {
    ElMessage.error('加载条件列表失败')
  } finally {
    conditionLoading.value = false
  }
}

const handleAddCondition = () => {
  conditionForm.value = {
    name: '',
    sort_order: 0
  }
  conditionFormVisible.value = true
}

const handleEditCondition = (row) => {
  conditionForm.value = { ...row }
  conditionFormVisible.value = true
}

const handleDeleteCondition = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该条件？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteCondition(row.id)
    ElMessage.success('删除成功')
    handleConditionManage()
    loadBaseData()
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSaveCondition = async () => {
  if (!conditionFormRef.value) return

  await conditionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (conditionForm.value.id) {
          await updateCondition(conditionForm.value.id, conditionForm.value)
          ElMessage.success('更新成功')
        } else {
          await createCondition(conditionForm.value)
          ElMessage.success('创建成功')
        }
        conditionFormVisible.value = false
        handleConditionManage()
        loadBaseData()
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(async () => {
  await loadBaseData()
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 12px;
}
</style>
