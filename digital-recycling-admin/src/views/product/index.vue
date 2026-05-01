<template>
  <div class="product-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <div class="header-actions">
            <el-select v-model="activeTab" style="width: 140px" @change="loadData">
              <el-option label="分类管理" value="category" />
              <el-option label="品牌管理" value="brand" />
              <el-option label="产品管理" value="product" />
            </el-select>
            <el-button type="primary" @click="handleAdd">新增</el-button>
          </div>
        </div>
      </template>

      <template v-if="activeTab === 'category'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分类名称" />
          <el-table-column prop="code" label="编码" />
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'brand'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="Category.name" label="所属分类" width="140" />
          <el-table-column prop="name" label="品牌名称" />
          <el-table-column prop="icon_text" label="图标文字" width="100" />
          <el-table-column prop="bg_color" label="背景色" width="120" />
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column label="操作" width="220">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link size="small" @click="handleQuoteConfig(row)">报价配置</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
      </template>

      <template v-if="activeTab === 'product'">
        <div style="margin-bottom: 16px; display: flex; gap: 12px">
          <el-select v-model="filterBrandId" placeholder="选择品牌" clearable style="width: 160px" @change="loadData">
            <el-option v-for="b in allBrands" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
          <el-input v-model="keyword" placeholder="搜索产品名称" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData" />
          <el-button type="primary" @click="loadData">搜索</el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="Brand.name" label="品牌" width="100" />
          <el-table-column prop="name" label="产品名称" />
          <el-table-column prop="model_code" label="型号" width="120" />
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
      </template>
    </el-card>

    <el-dialog v-model="formVisible" :title="formId ? '编辑' : '新增'" width="500px">
      <el-form :model="formData" label-width="80px">
        <template v-if="activeTab === 'category'">
          <el-form-item label="名称"><el-input v-model="formData.name" /></el-form-item>
          <el-form-item label="编码"><el-input v-model="formData.code" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="formData.sort_order" :min="0" /></el-form-item>
        </template>
        <template v-if="activeTab === 'brand'">
          <el-form-item label="分类"><el-select v-model="formData.category_id" style="width: 100%"><el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
          <el-form-item label="名称"><el-input v-model="formData.name" /></el-form-item>
          <el-form-item label="图标文字"><el-input v-model="formData.icon_text" /></el-form-item>
          <el-form-item label="背景色"><el-input v-model="formData.bg_color" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="formData.sort_order" :min="0" /></el-form-item>
        </template>
        <template v-if="activeTab === 'product'">
          <el-form-item label="分类"><el-select v-model="formData.category_id" placeholder="请选择分类" style="width: 100%"><el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
          <el-form-item label="品牌"><el-select v-model="formData.brand_id" placeholder="请选择品牌" style="width: 100%" @change="handleProductBrandChange"><el-option v-for="b in allBrands" :key="b.id" :label="b.name" :value="b.id" /></el-select></el-form-item>
          <el-form-item label="名称"><el-input v-model="formData.name" /></el-form-item>
          <el-form-item label="系列"><el-input v-model="formData.series_name" /></el-form-item>
          <el-form-item label="型号"><el-input v-model="formData.model_code" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="formData.sort_order" :min="0" /></el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="quoteConfigVisible" title="报价页面配置" width="600px">
      <el-form :model="quoteForm" label-width="120px">
        <el-form-item label="品牌">
          <span style="font-weight: bold; font-size: 16px;">{{ quoteForm.name }}</span>
        </el-form-item>
        <el-form-item label="页面标题">
          <el-input v-model="quoteForm.quote_title" :placeholder="`今日${quoteForm.name}回收报价`" />
        </el-form-item>
        <el-form-item label="浏览量">
          <el-input v-model="quoteForm.quote_view_count" placeholder="61954098" />
        </el-form-item>
        <el-form-item label="收件人">
          <el-input v-model="quoteForm.quote_receiver_name" placeholder="陈约" />
        </el-form-item>
        <el-form-item label="收款电话">
          <el-input v-model="quoteForm.quote_receiver_phone" placeholder="15361862828" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="quoteForm.quote_receiver_address" type="textarea" :rows="2" placeholder="广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B" />
        </el-form-item>
        <el-form-item label="回收规则">
          <el-input
            v-model="quoteRulesText"
            type="textarea"
            :rows="4"
            placeholder="每行一条规则"
          />
        </el-form-item>
        <el-form-item label="底部备注">
          <el-input
            v-model="quoteFooterText"
            type="textarea"
            :rows="5"
            placeholder="每行一条备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="quoteConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuoteConfig">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getCategories, createCategory, updateCategory, deleteCategory, getBrands, createBrand, updateBrand, deleteBrand, getProducts, createProduct, updateProduct, deleteProduct } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('category')
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const keyword = ref('')
const filterBrandId = ref('')
const categories = ref([])
const allBrands = ref([])
const formVisible = ref(false)
const formId = ref(null)
const formData = ref({})

const quoteConfigVisible = ref(false)
const quoteForm = ref({})
const quoteRulesText = ref('')
const quoteFooterText = ref('')

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'category') {
      const res = await getCategories()
      tableData.value = res.data
    } else if (activeTab.value === 'brand') {
      const res = await getBrands({ page: page.value, pageSize: pageSize.value })
      tableData.value = res.data.list
      total.value = res.data.pagination.total
    } else {
      const res = await getProducts({ brand_id: filterBrandId.value, keyword: keyword.value, page: page.value, pageSize: pageSize.value })
      tableData.value = res.data.list
      total.value = res.data.pagination.total
    }
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  const res = await getCategories()
  categories.value = res.data
}

const loadBrands = async () => {
  const res = await getBrands({ pageSize: 200 })
  allBrands.value = res.data.list
}

const handleAdd = () => {
  formId.value = null
  formData.value = { sort_order: 0 }
  formVisible.value = true
}

const handleProductBrandChange = (brandId) => {
  const brand = allBrands.value.find(b => b.id === brandId)
  if (brand && brand.category_id) {
    formData.value.category_id = brand.category_id
  }
}

const handleEdit = (row) => {
  formId.value = row.id
  formData.value = { ...row }
  formVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  const fns = { category: deleteCategory, brand: deleteBrand, product: deleteProduct }
  await fns[activeTab.value](row.id)
  ElMessage.success('删除成功')
  loadData()
}

const handleSave = async () => {
  const fns = {
    category: { create: createCategory, update: updateCategory },
    brand: { create: createBrand, update: updateBrand },
    product: { create: createProduct, update: updateProduct }
  }
  const fn = formId.value ? fns[activeTab.value].update : fns[activeTab.value].create
  const id = formId.value
  await id ? fn(id, formData.value) : fn(formData.value)
  ElMessage.success('保存成功')
  formVisible.value = false
  loadData()
}

const handleQuoteConfig = (row) => {
  quoteForm.value = { ...row }
  if (row.quote_rules) {
    try {
      const rules = JSON.parse(row.quote_rules)
      quoteRulesText.value = Array.isArray(rules) ? rules.join('\n') : row.quote_rules
    } catch {
      quoteRulesText.value = row.quote_rules
    }
  } else {
    quoteRulesText.value = ''
  }
  if (row.quote_footer_notes) {
    try {
      const notes = JSON.parse(row.quote_footer_notes)
      quoteFooterText.value = Array.isArray(notes) ? notes.join('\n') : row.quote_footer_notes
    } catch {
      quoteFooterText.value = row.quote_footer_notes
    }
  } else {
    quoteFooterText.value = ''
  }
  quoteConfigVisible.value = true
}

const saveQuoteConfig = async () => {
  try {
    const data = {
      quote_title: quoteForm.value.quote_title,
      quote_view_count: quoteForm.value.quote_view_count,
      quote_receiver_name: quoteForm.value.quote_receiver_name,
      quote_receiver_phone: quoteForm.value.quote_receiver_phone,
      quote_receiver_address: quoteForm.value.quote_receiver_address,
      quote_rules: JSON.stringify(quoteRulesText.value.split('\n').filter(line => line.trim())),
      quote_footer_notes: JSON.stringify(quoteFooterText.value.split('\n').filter(line => line.trim()))
    }
    await updateBrand(quoteForm.value.id, data)
    ElMessage.success('报价配置保存成功')
    quoteConfigVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '保存失败')
  }
}

watch(activeTab, () => {
  page.value = 1
  loadData()
})

onMounted(async () => {
  await loadCategories()
  await loadBrands()
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
