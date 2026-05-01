<template>
  <div class="member-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>会员管理</span>
          <el-select v-model="activeTab" style="width: 140px" @change="loadData">
            <el-option label="套餐管理" value="plans" />
            <el-option label="会员列表" value="members" />
            <el-option label="会员订单" value="orders" />
          </el-select>
        </div>
      </template>

      <template v-if="activeTab === 'plans'">
        <el-button type="primary" style="margin-bottom: 16px" @click="handleAddPlan">新增套餐</el-button>
        <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无套餐数据">
          <el-table-column prop="name" label="套餐名称" />
          <el-table-column prop="key_code" label="编码" width="120" />
          <el-table-column prop="duration_days" label="有效天数" width="100" />
          <el-table-column prop="price" label="售价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="original_price" label="原价" width="100">
            <template #default="{ row }">¥{{ row.original_price }}</template>
          </el-table-column>
          <el-table-column prop="subscriber_count" label="开通人数" width="100" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditPlan(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDeletePlan(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'members'">
        <div style="margin-bottom: 16px; display: flex; gap: 12px">
          <el-input v-model="memberKeyword" placeholder="搜索用户编号/手机号" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无会员数据">
          <el-table-column prop="user_no" label="用户编号" width="120" />
          <el-table-column prop="nickname" label="昵称" width="120" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="membership_expire" label="会员到期" width="170">
            <template #default="{ row }">
              <el-tag v-if="row.membership_expire && new Date(row.membership_expire) > new Date()" type="warning" size="small">VIP</el-tag>
              <span v-else>{{ row.membership_expire || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="注册时间" width="170" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button :type="row.status === 1 ? 'danger' : 'success'" link size="small" @click="handleToggleMemberStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="danger" link size="small" @click="handleDeleteMember(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
      </template>

      <template v-if="activeTab === 'orders'">
        <div style="margin-bottom: 16px; display: flex; gap: 12px">
          <el-input v-model="orderKeyword" placeholder="搜索订单号" clearable style="width: 200px" @clear="loadData" @keyup.enter="loadData">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" @click="loadData">搜索</el-button>
        </div>
        <el-table :data="tableData" v-loading="loading" stripe empty-text="暂无订单数据">
          <el-table-column prop="order_no" label="订单号" width="200" />
          <el-table-column label="用户" width="120">
            <template #default="{ row }">{{ row.User?.nickname || '-' }}</template>
          </el-table-column>
          <el-table-column label="套餐" width="120">
            <template #default="{ row }">{{ row.Plan?.name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="{ row }">¥{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="pay_status" label="支付状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.pay_status === 1 ? 'success' : 'info'" size="small">{{ row.pay_status === 1 ? '已支付' : '待支付' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="170" />
        </el-table>
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
      </template>
    </el-card>

    <el-dialog v-model="planVisible" :title="planForm.id ? '编辑套餐' : '新增套餐'" width="500px">
      <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="planForm.name" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="编码" prop="key_code">
          <el-input v-model="planForm.key_code" placeholder="请输入套餐编码" />
        </el-form-item>
        <el-form-item label="有效天数" prop="duration_days">
          <el-input-number v-model="planForm.duration_days" :min="1" />
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input-number v-model="planForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="原价" prop="original_price">
          <el-input-number v-model="planForm.original_price" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="planVisible = false">取消</el-button>
        <el-button type="primary" @click="savePlan">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan, deleteMembershipPlan, getMembers, getMembershipOrders, updateMemberStatus, deleteMember } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('plans')
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const planVisible = ref(false)
const planFormRef = ref(null)
const planForm = ref({
  name: '',
  key_code: '',
  duration_days: 30,
  price: 0,
  original_price: 0
})

const planRules = {
  name: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  key_code: [
    { required: true, message: '请输入套餐编码', trigger: 'blur' }
  ],
  duration_days: [
    { required: true, message: '请输入有效天数', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' }
  ]
}

const memberKeyword = ref('')
const orderKeyword = ref('')

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'plans') {
      const res = await getMembershipPlans()
      tableData.value = res.data
    } else if (activeTab.value === 'members') {
      const res = await getMembers({ 
        keyword: memberKeyword.value, 
        page: page.value, 
        pageSize: pageSize.value 
      })
      tableData.value = res.data.list
      total.value = res.data.pagination.total
    } else {
      const res = await getMembershipOrders({ 
        keyword: orderKeyword.value, 
        page: page.value, 
        pageSize: pageSize.value 
      })
      tableData.value = res.data.list
      total.value = res.data.pagination.total
    }
  } finally {
    loading.value = false
  }
}

const handleAddPlan = () => {
  planForm.value = {
    name: '',
    key_code: '',
    duration_days: 30,
    price: 0,
    original_price: 0
  }
  planVisible.value = true
}

const handleEditPlan = (row) => {
  planForm.value = { ...row }
  planVisible.value = true
}

const handleDeletePlan = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该套餐？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteMembershipPlan(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const savePlan = async () => {
  if (!planFormRef.value) return
  
  await planFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (planForm.value.id) {
          await updateMembershipPlan(planForm.value.id, planForm.value)
          ElMessage.success('更新成功')
        } else {
          await createMembershipPlan(planForm.value)
          ElMessage.success('创建成功')
        }
        planVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

const handleToggleMemberStatus = async (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确定${newStatus === 1 ? '启用' : '禁用'}该会员？`, '提示', { type: 'warning' })
    await updateMemberStatus(row.id, { status: newStatus })
    ElMessage.success('操作成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleDeleteMember = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该会员？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    await deleteMember(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

watch(activeTab, () => { page.value = 1; loadData() })
onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
