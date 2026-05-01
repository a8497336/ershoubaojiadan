<template>
  <div class="user-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增用户</el-button>
            <el-input v-model="keyword" placeholder="搜索用户名/手机号" clearable style="width: 240px" @clear="loadData" @keyup.enter="loadData">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" @click="loadData">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无用户数据">
        <el-table-column prop="user_no" label="用户编号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="total_recycled" label="回收台数" width="90" />
        <el-table-column prop="total_amount" label="累计收益" width="110">
          <template #default="{ row }">¥{{ Number(row.total_amount).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="membership_expire" label="会员到期" width="170">
          <template #default="{ row }">
            <el-tag v-if="row.membership_expire && new Date(row.membership_expire) > new Date()" type="warning" size="small">VIP</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="170" />
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button :type="row.status === 1 ? 'danger' : 'success'" link size="small" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="addVisible" title="新增用户" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="addForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="初始积分">
          <el-input-number v-model="addForm.points" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAddSubmit">确认创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="昵称"><el-input v-model="editForm.nickname" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="editForm.phone" /></el-form-item>
        <el-form-item label="积分"><el-input-number v-model="editForm.points" :min="0" /></el-form-item>
        <el-form-item label="查价次数"><el-input-number v-model="editForm.scan_remaining" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="用户详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户编号">{{ detailData.user_no }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ detailData.points }}</el-descriptions-item>
        <el-descriptions-item label="回收台数">{{ detailData.total_recycled }}</el-descriptions-item>
        <el-descriptions-item label="累计收益">¥{{ Number(detailData.total_amount || 0).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="会员到期">{{ detailData.membership_expire || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'">{{ detailData.status === 1 ? '正常' : '禁用' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detailData.created_at }}</el-descriptions-item>
      </el-descriptions>
      
      <el-divider>用户订单历史</el-divider>
      <el-table :data="userOrders" v-loading="detailLoading" stripe max-height="300">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">¥{{ Number(row.total_amount || 0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, getUserDetail, createUser, updateUser, updateUserStatus, deleteUser, getUserOrders } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const detailLoading = ref(false)
const tableData = ref([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const editVisible = ref(false)
const editForm = ref({})
const addVisible = ref(false)
const addFormRef = ref(null)
const submitLoadingAdd = ref(false)
const addForm = ref({
  username: '',
  phone: '',
  nickname: '',
  points: 0
})

const addRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

const detailVisible = ref(false)
const detailData = ref({})
const userOrders = ref([])

const statusMap = {
  shipping: { label: '待发货', type: 'info' },
  transit: { label: '运输中', type: '' },
  inspecting: { label: '质检中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUsers({ keyword: keyword.value, page: page.value, pageSize: pageSize.value })
    tableData.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  addForm.value = {
    username: '',
    phone: '',
    nickname: '',
    points: 0
  }
  addVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoadingAdd.value = true
      try {
        await createUser(addForm.value)
        ElMessage.success('用户创建成功')
        addVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitLoadingAdd.value = false
      }
    }
  })
}

const handleEdit = (row) => {
  editForm.value = { ...row }
  editVisible.value = true
}

const handleSave = async () => {
  try {
    await updateUser(editForm.value.id, editForm.value)
    ElMessage.success('更新成功')
    editVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  }
}

const handleToggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定${newStatus === 1 ? '启用' : '禁用'}该用户？`, '提示', { type: 'warning' })
    await updateUserStatus(row.id, { status: newStatus })
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该用户？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleViewDetail = async (row) => {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const [userRes, ordersRes] = await Promise.all([
      getUserDetail(row.id),
      getUserOrders(row.id)
    ])
    detailData.value = userRes.data
    userOrders.value = ordersRes.data.list || []
  } catch (error) {
    ElMessage.error('加载详情失败')
  } finally {
    detailLoading.value = false
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
