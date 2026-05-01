<template>
  <div class="order-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddOrder">新增订单</el-button>
            <el-button :disabled="!selectedOrders.length" @click="handleBatchShip">批量发货 ({{ selectedOrders.length }})</el-button>
            <el-button :disabled="!selectedOrders.length" @click="handleBatchExport">导出选中</el-button>
            <el-button @click="handleExportAll">导出全部</el-button>
            <el-select v-model="filterStatus" placeholder="订单状态" clearable style="width: 140px" @change="loadData">
              <el-option label="待发货" value="shipping" />
              <el-option label="运输中" value="transit" />
              <el-option label="质检中" value="inspecting" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-input v-model="keyword" placeholder="搜索订单号/运单号" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无订单数据" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="order_no" label="订单号" width="200" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">{{ row.User?.nickname || row.User?.user_no || '-' }}</template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="110">
          <template #default="{ row }">¥{{ Number(row.total_amount || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tracking_no" label="运单号" width="140">
          <template #default="{ row }">{{ row.tracking_no || '-' }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="$router.push(`/order/${row.id}`)">详情</el-button>
            <el-button v-if="row.status === 'shipping'" type="success" link size="small" @click="handleLogistics(row)">发货</el-button>
            <el-button v-if="row.status === 'transit'" type="warning" link size="small" @click="handleInspect(row)">质检</el-button>
            <el-button v-if="row.status === 'inspecting'" type="success" link size="small" @click="handlePay(row)">打款</el-button>
            <el-button v-if="row.status === 'cancelled'" type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            <el-button v-if="row.status === 'cancelled'" type="info" link size="small" disabled>已取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, sizes, prev, pager, next" :page-sizes="[10, 20, 50]" style="margin-top: 16px; justify-content: flex-end" @size-change="loadData" @current-change="loadData" />
    </el-card>

    <el-dialog v-model="logisticsVisible" title="录入物流信息" width="500px">
      <el-form :model="logisticsForm" label-width="80px">
        <el-form-item label="快递公司"><el-input v-model="logisticsForm.logistics_company" /></el-form-item>
        <el-form-item label="运单号"><el-input v-model="logisticsForm.tracking_no" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="logisticsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLogistics">确认发货</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="inspectVisible" title="录入质检结果" width="500px">
      <el-form :model="inspectForm" label-width="80px">
        <el-form-item label="实际金额"><el-input-number v-model="inspectForm.actual_amount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="inspectForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inspectVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInspect">确认质检</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addOrderVisible" title="新增订单" width="600px">
      <el-form :model="addOrderForm" :rules="addOrderRules" ref="addOrderFormRef" label-width="80px">
        <el-form-item label="用户ID" prop="user_id">
          <el-input v-model="addOrderForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addOrderForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addOrderVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAddOrderSubmit">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrders, createOrder, deleteOrder, updateOrderLogistics, inspectOrder, payOrder, exportOrders } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const filterStatus = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedOrders = ref([])
const addOrderVisible = ref(false)
const addOrderFormRef = ref(null)
const addOrderForm = ref({
  user_id: '',
  remark: ''
})

const addOrderRules = {
  user_id: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ]
}

const statusMap = {
  shipping: { label: '待发货', type: 'info' },
  transit: { label: '运输中', type: '' },
  inspecting: { label: '质检中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const logisticsVisible = ref(false)
const logisticsForm = ref({})
const inspectVisible = ref(false)
const inspectForm = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrders({ status: filterStatus.value, keyword: keyword.value, page: page.value, pageSize: pageSize.value })
    tableData.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const handleAddOrder = () => {
  addOrderForm.value = {
    user_id: '',
    remark: ''
  }
  addOrderVisible.value = true
}

const handleAddOrderSubmit = async () => {
  if (!addOrderFormRef.value) return
  
  await addOrderFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await createOrder(addOrderForm.value)
        ElMessage.success('订单创建成功')
        addOrderVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该订单？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteOrder(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleLogistics = (row) => {
  logisticsForm.value = { id: row.id, logistics_company: '', tracking_no: '' }
  logisticsVisible.value = true
}

const saveLogistics = async () => {
  await updateOrderLogistics(logisticsForm.value.id, logisticsForm.value)
  ElMessage.success('发货成功')
  logisticsVisible.value = false
  loadData()
}

const handleInspect = (row) => {
  inspectForm.value = { id: row.id, actual_amount: row.total_amount, remark: '' }
  inspectVisible.value = true
}

const saveInspect = async () => {
  await inspectOrder(inspectForm.value.id, inspectForm.value)
  ElMessage.success('质检完成')
  inspectVisible.value = false
  loadData()
}

const handlePay = async (row) => {
  try {
    await ElMessageBox.confirm(`确认打款 ¥${row.total_amount}？`, '确认打款', { type: 'warning' })
    await payOrder(row.id)
    ElMessage.success('打款成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleBatchShip = async () => {
  const shippingOrders = selectedOrders.value.filter(o => o.status === 'shipping')
  if (shippingOrders.length === 0) {
    ElMessage.warning('选中的订单中没有待发货的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认批量发货 ${shippingOrders.length} 个订单？`, '批量发货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    logisticsForm.value = { id: shippingOrders[0].id, logistics_company: '', tracking_no: '' }
    logisticsVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleBatchExport = async () => {
  try {
    ElMessage.info('正在导出...')
    const orderIds = selectedOrders.value.map(o => o.id)
    const res = await exportOrders({ 
      status: filterStatus.value, 
      keyword: keyword.value,
      ids: orderIds.join(',')
    })
    
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `订单列表_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const handleExportAll = async () => {
  try {
    ElMessage.info('正在导出...')
    const res = await exportOrders({ 
      status: filterStatus.value, 
      keyword: keyword.value
    })
    
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `订单列表_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

onMounted(loadData)
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
