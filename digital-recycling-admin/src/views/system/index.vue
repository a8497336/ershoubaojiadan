<template>
  <div class="system-settings">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-select v-model="activeTab" style="width: 140px" @change="loadData">
            <el-option label="基本配置" value="settings" />
            <el-option label="管理员" value="admins" />
            <el-option label="角色权限" value="roles" />
            <el-option label="操作日志" value="logs" />
          </el-select>
        </div>
      </template>

      <template v-if="activeTab === 'settings'">
        <el-form :model="settingsForm" label-width="120px" style="max-width: 600px">
          <el-form-item label="收件人姓名"><el-input v-model="settingsForm.receiver_name" /></el-form-item>
          <el-form-item label="收款电话"><el-input v-model="settingsForm.receiver_phone" /></el-form-item>
          <el-form-item label="收货地址"><el-input v-model="settingsForm.receiver_address" type="textarea" :rows="2" /></el-form-item>
          <el-form-item label="客服电话"><el-input v-model="settingsForm.service_phone" /></el-form-item>
          <el-form-item label="客服微信"><el-input v-model="settingsForm.service_wechat" /></el-form-item>
          <el-form-item label="会员服务电话"><el-input v-model="settingsForm.membership_phone" /></el-form-item>
          <el-form-item label="免费查价次数"><el-input-number v-model="settingsForm.free_scan_count" :min="0" /></el-form-item>
          <el-form-item label="签到积分"><el-input-number v-model="settingsForm.sign_points" :min="0" /></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-if="activeTab === 'admins'">
        <el-button type="primary" style="margin-bottom: 16px" @click="handleAddAdmin">新增管理员</el-button>
        <el-table :data="admins" v-loading="loading" stripe>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="real_name" label="姓名" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column label="角色" width="120">
            <template #default="{ row }">{{ row.Role?.name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="last_login_at" label="最后登录" width="170" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditAdmin(row)">编辑</el-button>
              <el-button v-if="row.username !== 'admin'" type="danger" link size="small" @click="handleDeleteAdmin(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'roles'">
        <el-button type="primary" style="margin-bottom: 16px" @click="handleAddRole">新增角色</el-button>
        <el-table :data="roles" v-loading="loading" stripe>
          <el-table-column prop="name" label="角色名称" />
          <el-table-column prop="code" label="编码" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="权限数" width="100">
            <template #default="{ row }">{{ row.Permissions?.length || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditRole(row)">编辑</el-button>
              <el-button v-if="row.code !== 'super_admin'" type="danger" link size="small" @click="handleDeleteRole(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'logs'">
        <el-table :data="logs" v-loading="loading" stripe>
          <el-table-column label="管理员" width="120">
            <template #default="{ row }">{{ row.Admin?.real_name || row.Admin?.username }}</template>
          </el-table-column>
          <el-table-column prop="module" label="模块" width="100" />
          <el-table-column prop="action" label="动作" width="100" />
          <el-table-column prop="detail" label="详情" />
          <el-table-column prop="ip" label="IP" width="130" />
          <el-table-column prop="created_at" label="时间" width="170" />
        </el-table>
        <el-pagination v-model:current-page="logPage" v-model:page-size="logPageSize" :total="logTotal" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadLogs" />
      </template>
    </el-card>

    <el-dialog v-model="adminVisible" :title="adminForm.id ? '编辑管理员' : '新增管理员'" width="500px">
      <el-form :model="adminForm" label-width="80px">
        <el-form-item label="用户名"><el-input v-model="adminForm.username" :disabled="!!adminForm.id" /></el-form-item>
        <el-form-item v-if="!adminForm.id" label="密码"><el-input v-model="adminForm.password" type="password" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="adminForm.real_name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="adminForm.phone" /></el-form-item>
        <el-form-item label="角色"><el-select v-model="adminForm.role_id" style="width: 100%"><el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" /></el-select></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAdmin">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleVisible" :title="roleForm.id ? '编辑角色' : '新增角色'" width="600px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="名称"><el-input v-model="roleForm.name" /></el-form-item>
        <el-form-item label="编码"><el-input v-model="roleForm.code" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="roleForm.description" /></el-form-item>
        <el-form-item label="权限">
          <el-checkbox-group v-model="roleForm.permission_ids">
            <el-checkbox v-for="perm in permissionsList" :key="perm.id" :value="perm.id">{{ perm.name }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSettings, updateSettings, getAdmins, createAdmin, updateAdmin, deleteAdmin, getRoles, createRole, updateRole, deleteRole, getLogs, getPermissions } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('settings')
const loading = ref(false)
const settingsForm = ref({})
const admins = ref([])
const roles = ref([])
const logs = ref([])
const logPage = ref(1)
const logPageSize = ref(20)
const logTotal = ref(0)
const adminVisible = ref(false)
const adminForm = ref({})
const roleVisible = ref(false)
const roleForm = ref({})
const permissionsList = ref([])

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'settings') {
      const res = await getSettings()
      settingsForm.value = res.data
    } else if (activeTab.value === 'admins') {
      const res = await getAdmins()
      admins.value = res.data
    } else if (activeTab.value === 'roles') {
      const res = await getRoles()
      roles.value = res.data
    } else if (activeTab.value === 'logs') {
      loadLogs()
    }
  } finally {
    loading.value = false
  }
}

const loadLogs = async () => {
  loading.value = true
  try {
    const res = await getLogs({ page: logPage.value, pageSize: logPageSize.value })
    logs.value = res.data.list
    logTotal.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  await updateSettings(settingsForm.value)
  ElMessage.success('保存成功')
}

const handleAddAdmin = () => {
  adminForm.value = {}
  adminVisible.value = true
}

const handleEditAdmin = (row) => {
  adminForm.value = { ...row }
  adminVisible.value = true
}

const handleDeleteAdmin = async (row) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteAdmin(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const saveAdmin = async () => {
  await adminForm.value.id ? updateAdmin(adminForm.value.id, adminForm.value) : createAdmin(adminForm.value)
  ElMessage.success('保存成功')
  adminVisible.value = false
  loadData()
}

const handleAddRole = async () => {
  roleForm.value = { permission_ids: [] }
  await loadPermissions()
  roleVisible.value = true
}

const handleEditRole = async (row) => {
  const permissionIds = (row.Permissions || []).map((p) => p.id)
  roleForm.value = { ...row, permission_ids: permissionIds }
  await loadPermissions()
  roleVisible.value = true
}

const loadPermissions = async () => {
  try {
    const res = await getPermissions()
    const perms = res.data || []
    const flatPerms = []
    const flatten = (list) => {
      list.forEach((item) => {
        flatPerms.push({ id: item.id, name: item.name, code: item.code })
        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      })
    }
    flatten(perms)
    permissionsList.value = flatPerms
  } catch (e) {
    permissionsList.value = []
  }
}

const handleDeleteRole = async (row) => {
  await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  loadData()
}

const saveRole = async () => {
  await roleForm.value.id ? updateRole(roleForm.value.id, roleForm.value) : createRole(roleForm.value)
  ElMessage.success('保存成功')
  roleVisible.value = false
  loadData()
}

watch(activeTab, loadData)
onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
