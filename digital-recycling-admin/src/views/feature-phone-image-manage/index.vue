<template>
  <div class="feature-phone-image-manage">
    <el-card shadow="hover" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>报价图片管理</span>
          <div class="header-actions">
            <el-button @click="loadData">刷新</el-button>
          </div>
        </div>
      </template>

      <div class="card-grid">
        <el-card
          v-for="card in cards"
          :key="card.type"
          shadow="hover"
          class="feature-card"
        >
          <template #header>
            <div class="sub-card-header">
              <div class="title-wrap">
                <span class="card-title">{{ card.title }}</span>
                <span class="card-subtitle">type={{ card.type }}</span>
              </div>
            </div>
          </template>

          <div class="image-wrapper">
            <el-image
              v-if="card.image"
              :src="card.image"
              fit="cover"
              style="width: 100%; max-height: 400px"
              :preview-src-list="[card.image]"
              hide-on-click-modal
            />
            <div v-else class="image-placeholder">暂未配置图片</div>
          </div>

          <div class="meta">
            <span>更新时间：{{ formatDate(card.updatedAt) }}</span>
          </div>

          <div class="actions">
            <el-upload
              :http-request="(opts) => handleUpload(card.type, opts)"
              :before-upload="beforeImageUpload"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png,.webp"
            >
              <el-button type="primary" :loading="uploading[card.type]">
                上传图片
              </el-button>
            </el-upload>
            <el-button
              v-if="card.image"
              type="danger"
              :loading="uploading[card.type]"
              @click="handleDelete(card.type)"
            >
              删除图片
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFeaturePhoneImages,
  updateFeaturePhoneImage,
  deleteFeaturePhoneImage,
  uploadFile
} from '@/api'

const cards = ref([
  { type: 'oldMan', title: '热门老年机', image: '', updatedAt: null },
  { type: 'dianrong', title: '智能机/电容屏', image: '', updatedAt: null }
])
const loading = ref(false)
const uploading = ref({ oldMan: false, dianrong: false })

const formatDate = (dateStr) => {
  if (!dateStr) return '尚未更新'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '尚未更新'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getFeaturePhoneImages()
    const list = res?.data?.list || []
    list.forEach((item) => {
      const target = cards.value.find((c) => c.type === item.type)
      if (target) {
        target.image = item.image || ''
        target.updatedAt = item.updatedAt || null
      }
    })
  } catch (error) {
    console.error('加载报价图片失败:', error)
    ElMessage.error(error?.message || '加载报价图片失败，请重试')
  } finally {
    loading.value = false
  }
}

const beforeImageUpload = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只允许上传 jpeg/png/gif/webp 格式的图片')
    return false
  }
  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const handleUpload = async (type, options) => {
  uploading.value[type] = true
  try {
    const fd = new FormData()
    fd.append('file', options.file)
    const uploadRes = await uploadFile(fd)
    const url = uploadRes?.data?.url
    if (!url) throw new Error('上传返回为空')

    const updateRes = await updateFeaturePhoneImage(type, { image: url })
    const target = cards.value.find((c) => c.type === type)
    if (target) {
      target.image = updateRes?.data?.image || url
      target.updatedAt = updateRes?.data?.updatedAt || new Date().toISOString()
    }
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(error?.message || '上传失败')
  } finally {
    uploading.value[type] = false
  }
}

const handleDelete = async (type) => {
  try {
    await ElMessageBox.confirm('确定删除该类型的图片？', '提示', { type: 'warning' })
  } catch (error) {
    if (error === 'cancel') return
    return
  }
  try {
    await deleteFeaturePhoneImage(type)
    const target = cards.value.find((c) => c.type === type)
    if (target) {
      target.image = ''
      target.updatedAt = null
    }
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error(error?.message || '删除失败，请重试')
  }
}

onMounted(() => {
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
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.feature-card {
  width: 100%;
}
.sub-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.card-subtitle {
  color: #909399;
  font-size: 13px;
}
.image-wrapper {
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}
.image-placeholder {
  color: #909399;
  font-size: 14px;
  padding: 60px 0;
}
.meta {
  color: #606266;
  font-size: 13px;
  margin-bottom: 12px;
}
.actions {
  display: flex;
  gap: 12px;
}
@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>