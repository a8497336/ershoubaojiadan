<template>
  <div class="user-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">新增用户</el-button>
            <el-input v-model="filters.phone" placeholder="手机号" clearable style="width: 140px" @clear="loadData" @keyup.enter="loadData" />
            <el-input v-model="filters.referrer" placeholder="推荐人" clearable style="width: 120px" @clear="loadData" @keyup.enter="loadData" />
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="加入开始" end-placeholder="加入结束" value-format="YYYY-MM-DD" style="width: 240px" @change="loadData" />
            <el-input v-model="filters.keyword" placeholder="搜索用户/手机号/编号" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button type="success" @click="handleExport">导出Excel</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无用户数据">
        <el-table-column prop="user_no" label="用户编号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="referrer" label="推荐人" width="100">
          <template #default="{ row }">{{ row.referrer || '-' }}</template>
        </el-table-column>
        <el-table-column prop="referral_count" label="推荐人数" width="90">
          <template #default="{ row }">{{ row.referral_count || 0 }}</template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" />
        <el-table-column prop="quoteDailyRemaining" label="当日剩余次数" width="100" />
        <el-table-column prop="total_recycled" label="回收台数" width="90" />
        <el-table-column prop="total_amount" label="累计收益" width="110">
          <template #default="{ row }">¥{{ Number(row.total_amount).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="plan_name" label="会员类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.plan_name" type="warning" size="small">{{ row.plan_name }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="membership_expire" label="会员到期" width="130">
          <template #default="{ row }">{{ row.membership_expire || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="170" />
        <el-table-column label="操作" fixed="right" width="300">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleViewReferrals(row)">推荐历史</el-button>
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
        <el-form-item label="推荐人"><el-input v-model="editForm.referrer" placeholder="请输入推荐人" /></el-form-item>
        <el-form-item label="积分"><el-input-number v-model="editForm.points" :min="0" /></el-form-item>
        <el-form-item label="当日剩余次数"><el-input v-model="editForm.quoteDailyRemaining" disabled /></el-form-item>
        <!-- <el-form-item label="每日查价次数"><el-input-number v-model="editForm.quote_remaining" :min="0" /></el-form-item> -->
        <el-form-item label="会员类型">
          <el-select v-model="editForm.membership_id" placeholder="选择会员类型" clearable style="width: 100%">
            <el-option v-for="p in membershipPlans" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="会员到期">
          <el-date-picker v-model="editForm.membership_expire" type="date" placeholder="选择到期日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="用户详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户编号">{{ detailData.user_no }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detailData.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="推荐人">{{ detailData.referrer || '-' }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ detailData.points }}</el-descriptions-item>
        <el-descriptions-item label="回收台数">{{ detailData.total_recycled }}</el-descriptions-item>
        <el-descriptions-item label="累计收益">¥{{ Number(detailData.total_amount || 0).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="会员到期">{{ detailData.membership_expire || '-' }}</el-descriptions-item>
        <el-descriptions-item label="会员类型">{{ detailData.plan_name || '-' }}</el-descriptions-item>
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

    <!-- 推荐历史弹窗 -->
    <el-dialog v-model="referralVisible" :title="`推荐历史 - ${referralUserName}`" width="750px">
      <el-table :data="referrals" v-loading="referralLoading" stripe empty-text="暂无推荐记录">
        <el-table-column prop="user_no" label="用户编号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="plan_name" label="会员类型" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.plan_name" type="warning" size="small">{{ row.plan_name }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="170" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, exportUsers, getUserDetail, createUser, updateUser, updateUserStatus, deleteUser, getUserOrders, getUserReferrals, getMembershipPlans } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const submitLoading = ref(false)
const detailLoading = ref(false)
const tableData = ref([])
const filters = ref({ keyword: '', phone: '', referrer: '' })
const dateRange = ref(null)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const editVisible = ref(false)
const editForm = ref({})
const addVisible = ref(false)
const addFormRef = ref(null)
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
const membershipPlans = ref([])

const referralVisible = ref(false)
const referralLoading = ref(false)
const referrals = ref([])
const referralUserName = ref('')

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
    const params = {
      keyword: filters.value.keyword,
      phone: filters.value.phone,
      referrer: filters.value.referrer,
      page: page.value,
      pageSize: pageSize.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.date_from = dateRange.value[0]
      params.date_to = dateRange.value[1]
    }
    const res = await getUsers(params)
    tableData.value = res.data.list
    total.value = res.data.pagination.total
  } catch (error) {
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  try {
    const params = {
      keyword: filters.value.keyword,
      phone: filters.value.phone,
      referrer: filters.value.referrer
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.date_from = dateRange.value[0]
      params.date_to = dateRange.value[1]
    }
    const res = await exportUsers(params)
    const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `用户列表_${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(error.message || '导出失败')
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
      submitLoading.value = true
      try {
        await createUser(addForm.value)
        ElMessage.success('用户创建成功')
        addVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleEdit = (row) => {
  editForm.value = { ...row }
  editVisible.value = true
}

const handleSave = async () => {
  submitLoading.value = true
  try {
    await updateUser(editForm.value.id, editForm.value)
    ElMessage.success('更新成功')
    editVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitLoading.value = false
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

const handleViewReferrals = async (row) => {
  referralVisible.value = true
  referralLoading.value = true
  referralUserName.value = row.nickname || row.user_no
  try {
    const res = await getUserReferrals(row.id)
    referrals.value = res.data || []
  } catch (error) {
    ElMessage.error('加载推荐历史失败')
  } finally {
    referralLoading.value = false
  }
}

onMounted(() => {
  loadData()
  getMembershipPlans().then(res => {
    membershipPlans.value = res.data || []
  }).catch(() => {})
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
</style>
