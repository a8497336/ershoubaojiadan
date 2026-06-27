<template>
  <div class="popup-ad-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>弹窗广告设置</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="getImageUrl(row.images[0].url)"
              :preview-src-list="row.images.map(i => getImageUrl(i.url))"
              :preview-teleported="true"
              fit="cover"
              style="width: 60px; height: 40px; border-radius: 4px"
            />
            <span v-else style="color:#ccc">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.popup_type === 'local' ? '' : 'warning'" size="small">
              {{ row.popup_type === 'local' ? '局部弹窗' : '全屏广告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片数" width="80">
          <template #default="{ row }">
            {{ (row.images || []).length }} 张
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="70" />
        <el-table-column label="弹窗次数" width="90">
          <template #default="{ row }">
            {{ row.show_frequency === 'always' ? '每次' : '仅首次' }}
          </template>
        </el-table-column>
        <el-table-column label="生效时间" width="320">
          <template #default="{ row }">
            <span v-if="row.start_time || row.end_time" style="font-size:12px">
              {{ formatTime(row.start_time) }} ~ {{ formatTime(row.end_time) }}
            </span>
            <span v-else style="color:#999">长期有效</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无弹窗广告，点击右上角新增创建" />
        </template>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="formId ? '编辑弹窗广告' : '新增弹窗广告'" width="650px" @closed="resetForm">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="广告标题">
          <el-input v-model="formData.title" placeholder="请输入广告标题" />
        </el-form-item>

        <el-form-item label="广告样式">
          <el-radio-group v-model="formData.popup_type">
            <el-radio value="local">局部弹窗</el-radio>
            <el-radio value="fullscreen">全屏广告</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="广告图片" required>
          <div class="image-list">
            <div v-for="(item, index) in formData.images" :key="index" class="image-item">
              <div class="image-upload-box">
                <el-upload
                  class="popup-uploader"
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="(res) => handleImageUploadSuccess(res, index)"
                  :on-error="handleUploadError"
                  :before-upload="beforeUpload"
                  accept="image/*"
                >
                  <img v-if="item.url" :src="getImageUrl(item.url)" class="popup-image" />
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>上传图片</span>
                  </div>
                </el-upload>
                <el-button
                  v-if="item.url"
                  type="danger"
                  size="small"
                  class="image-delete-btn"
                  @click="removeImage(index)"
                >
                  删除
                </el-button>
              </div>
              <div class="image-link-input">
                <span class="link-label">跳转链接：</span>
                <el-input v-model="item.link" placeholder="点击图片跳转的链接" clearable />
              </div>
            </div>
            <el-button
              v-if="formData.images.length < 3"
              type="primary"
              plain
              size="small"
              @click="addImage"
            >
              + 添加图片
            </el-button>
            <div class="upload-tip" v-if="formData.images.length < 3">最多可添加 3 张图片，建议尺寸 600x400 像素</div>
          </div>
        </el-form-item>

        <el-form-item label="弹窗次数">
          <el-radio-group v-model="formData.show_frequency">
            <el-radio value="always">每次</el-radio>
            <el-radio value="first">仅首次</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生效时间">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort_order" :min="0" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPopupAds, createPopupAd, updatePopupAd, deletePopupAd } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const formVisible = ref(false)
const formId = ref(null)
const formRef = ref(null)
const formData = ref({
  title: '',
  popup_type: 'local',
  images: [],
  show_frequency: 'always',
  sort_order: 0,
  status: 1
})
const timeRange = ref(null)

const formRules = {
  title: [
    { required: true, message: '请输入广告标题', trigger: 'blur' },
    { max: 100, message: '标题不能超过 100 个字符', trigger: 'blur' }
  ]
}

const uploadUrl = '/api/admin/upload'
const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
}

const getImageUrl = (path) => {
  if (!path) return ''
  // 完整 URL（含协议）直接返回，避免本地 http 被强转 https 导致加载失败
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // 相对路径走 vite 代理访问后端
  if (path.startsWith('/uploads')) return `/api${path}`
  return path
}

/**
 * 格式化时间显示，无时间显示"不限"
 */
const formatTime = (t) => {
  if (!t) return '不限'
  const d = new Date(t)
  if (isNaN(d.getTime())) return String(t).slice(0, 16)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const handleImageUploadSuccess = (response, index) => {
  if (response.code === 0) {
    // 用 splice 替换整个对象，确保 Vue 响应式更新
    const oldItem = formData.value.images[index]
    formData.value.images.splice(index, 1, { ...oldItem, url: response.data.url })
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

const addImage = () => {
  if (formData.value.images.length >= 3) {
    ElMessage.warning('最多只能添加 3 张图片')
    return
  }
  formData.value.images.push({ url: '', link: '' })
}

const removeImage = (index) => {
  formData.value.images.splice(index, 1)
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPopupAds({ page: page.value, pageSize: pageSize.value })
    tableData.value = res.data.list || res.data
    total.value = res.data.pagination?.total || 0
  } catch (e) {
    ElMessage.error(e?.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  formId.value = null
  formData.value = {
    title: '',
    popup_type: 'local',
    images: [],
    show_frequency: 'always',
    sort_order: 0,
    status: 1
  }
  timeRange.value = null
  formVisible.value = true
}

const handleEdit = (row) => {
  formId.value = row.id
  formData.value = {
    title: row.title,
    popup_type: row.popup_type,
    images: row.images && row.images.length > 0 ? JSON.parse(JSON.stringify(row.images)) : [],
    show_frequency: row.show_frequency,
    sort_order: row.sort_order,
    status: row.status
  }
  timeRange.value = row.start_time && row.end_time ? [row.start_time, row.end_time] : null
  formVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该弹窗广告？', '提示', { type: 'warning' })
    await deletePopupAd(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '删除失败')
    }
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  if (formData.value.images.length === 0) {
    ElMessage.warning('请至少添加一张广告图片')
    return
  }
  const hasEmptyUrl = formData.value.images.some(item => !item.url)
  if (hasEmptyUrl) {
    ElMessage.warning('请上传所有广告图片')
    return
  }

  saving.value = true
  try {
    const data = { ...formData.value }
    if (timeRange.value && timeRange.value.length === 2) {
      data.start_time = timeRange.value[0]
      data.end_time = timeRange.value[1]
    } else {
      data.start_time = null
      data.end_time = null
    }

    if (formId.value) {
      await updatePopupAd(formId.value, data)
    } else {
      await createPopupAd(data)
    }
    ElMessage.success('保存成功')
    formVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * dialog 完全关闭后重置表单和校验状态
 */
const resetForm = () => {
  formId.value = null
  formData.value = {
    title: '',
    popup_type: 'local',
    images: [],
    show_frequency: 'always',
    sort_order: 0,
    status: 1
  }
  timeRange.value = null
  formRef.value && formRef.value.clearValidate()
}

watch(page, loadData)
onMounted(loadData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.image-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.image-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.image-upload-box {
  position: relative;
  flex-shrink: 0;
}

.popup-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 200px;
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.popup-uploader:hover {
  border-color: #409eff;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.popup-image {
  width: 200px;
  height: 130px;
  object-fit: cover;
  display: block;
  border-radius: 4px;
}

.image-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}

.image-link-input {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
}

.link-label {
  flex-shrink: 0;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
