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
            <el-button type="danger" @click="handleClearByBrand" :disabled="!filterBrandId">清空该品牌报价</el-button>
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
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewTrend(row)">查看趋势</el-button>
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

    <el-dialog v-model="trendVisible" :title="trendProduct.name + ' - 价格趋势'" width="700px" destroy-on-close>
      <!-- Product summary -->
      <div class="trend-summary" v-if="trendSummary">
        <div class="trend-summary-row">
          <span class="trend-label">品牌：</span>
          <span>{{ trendProduct.Brand?.name || '--' }}</span>
          <span class="trend-label" style="margin-left: 16px;">型号：</span>
          <span>{{ trendProduct.model || trendProduct.name || '--' }}</span>
        </div>
        <div class="trend-summary-row">
          <span class="trend-label">当前最高价：</span>
          <span class="trend-price-up">¥{{ trendSummary.maxPrice }}</span>
          <span class="trend-label" style="margin-left: 16px;">当前最低价：</span>
          <span class="trend-price-down">¥{{ trendSummary.minPrice }}</span>
          <span class="trend-label" style="margin-left: 16px;">较昨日：</span>
          <span :class="trendSummary.priceChange >= 0 ? 'trend-price-up' : 'trend-price-down'">
            {{ trendSummary.priceChange >= 0 ? '+' : '' }}{{ trendSummary.priceChange }}
            ({{ trendSummary.priceChangePercent }}%)
          </span>
        </div>
      </div>
      <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center;">
        <span style="font-size: 14px; color: #666;">时间范围：</span>
        <el-radio-group v-model="trendDays" @change="loadTrendData">
          <el-radio-button :value="7">7天</el-radio-button>
          <el-radio-button :value="15">15天</el-radio-button>
          <el-radio-button :value="30">30天</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="trendChartRef" style="width: 100%; height: 400px;" v-show="trendHasData"></div>
      <div v-if="!trendHasData && !trendLoading" style="width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; color: #909399; font-size: 14px;">
        暂无价格趋势数据
      </div>
      <div v-if="trendLoading" v-loading="true" style="height: 400px;"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getPrices, batchUpdatePrices, getConditions, getBrands, createPrice, deletePrice, clearPricesByBrand, createCondition, updateCondition, deleteCondition, getProducts, getPriceTrend } from '@/api'
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
    getBrands({ pageSize: 500 }),
    getProducts()
  ])
  conditions.value = condRes.data
  brands.value = Array.isArray(brandRes.data) ? brandRes.data : (brandRes.data.list || [])
  allProducts.value = Array.isArray(productRes.data) ? productRes.data : (productRes.data.list || [])
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

const handleClearByBrand = async () => {
  if (!filterBrandId.value) {
    ElMessage.warning('请先选择品牌')
    return
  }
  const brandName = brands.value.find(b => b.id === filterBrandId.value)?.name || ''
  try {
    await ElMessageBox.confirm(
      `确定清空「${brandName}」品牌下所有产品的报价及产品？此操作不可恢复！`,
      '危险操作',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    const res = await clearPricesByBrand(filterBrandId.value)
    const data = res.data
    ElMessage.success(data.message || `已清空 ${data.priceDeleted || 0} 条报价，删除 ${data.productDeleted || 0} 个产品`)
    filterBrandId.value = ''
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '清空失败')
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
    const condRes = await getConditions()
    conditionList.value = condRes.data
    conditions.value = condRes.data
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
        const condRes = await getConditions()
        conditionList.value = condRes.data
        conditions.value = condRes.data
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const trendVisible = ref(false)
const trendProduct = ref({ name: '' })
const trendDays = ref(15)
const trendLoading = ref(false)
const trendSummary = ref(null)
const trendHasData = ref(false)
const trendChartRef = ref(null)
let trendChartInstance = null

const handleViewTrend = (row) => {
  trendProduct.value = row
  trendDays.value = 15
  trendVisible.value = true
  nextTick(() => {
    loadTrendData()
  })
}

const loadTrendData = async () => {
  if (!trendProduct.value.id) return
  trendLoading.value = true
  try {
    const res = await getPriceTrend(trendProduct.value.id, { days: trendDays.value })
    const data = res.data
    trendSummary.value = data.summary || null
    trendHasData.value = data.trendData && data.trendData.length > 0
    if (trendHasData.value) {
      renderTrendChart(data)
    }
  } catch (error) {
    ElMessage.error('加载趋势数据失败')
    trendHasData.value = false
  } finally {
    trendLoading.value = false
  }
}

const renderTrendChart = (data) => {
  if (!trendChartRef.value) return
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  trendChartInstance = echarts.init(trendChartRef.value)
  const colors = ['#ff2d4a', '#1890ff', '#52c41a', '#faad14', '#722ed1', '#13c2c2']
  const series = (data.trendData || []).map((item, index) => ({
    name: item.name,
    type: 'line',
    data: (item.data || []).map(d => [d.date, d.price]),
    smooth: true,
    lineStyle: { width: 2, color: colors[index % colors.length] },
    itemStyle: { color: colors[index % colors.length] }
  }))
  trendChartInstance.setOption({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series
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
.trend-summary {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.trend-summary-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #333;
  line-height: 2;
}
.trend-label {
  color: #909399;
}
.trend-price-up {
  color: #f56c6c;
  font-weight: 600;
}
.trend-price-down {
  color: #67c23a;
  font-weight: 600;
}
</style>
