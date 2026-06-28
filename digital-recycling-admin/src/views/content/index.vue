<template>
  <div class="content-manage">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>内容管理</span>
          <div class="header-actions">
            <el-select v-model="activeTab" style="width: 140px" @change="loadData">
              <el-option label="Banner管理" value="banner" />
              <el-option label="公告管理" value="announcement" />
              <el-option label="门店管理" value="store" />
              <el-option label="视频管理" value="video" />
              <el-option label="消息推送" value="message" />
            </el-select>
            <el-button v-if="activeTab !== 'message'" type="primary" @click="handleAdd">新增</el-button>
          </div>
        </div>
      </template>

      <div v-if="activeTab !== 'message'" class="search-bar">
        <!-- Banner 查询栏 -->
        <template v-if="activeTab === 'banner'">
          <el-input v-model="queryForm.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <el-select v-model="queryForm.status" placeholder="状态" clearable style="width: 130px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </template>
        <!-- 公告 查询栏 -->
        <template v-if="activeTab === 'announcement'">
          <el-input v-model="queryForm.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <el-select v-model="queryForm.type" placeholder="类型" clearable style="width: 130px">
            <el-option label="普通" :value="1" />
            <el-option label="重要" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
          <el-select v-model="queryForm.status" placeholder="状态" clearable style="width: 130px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </template>
        <!-- 门店 查询栏 -->
        <template v-if="activeTab === 'store'">
          <el-input v-model="queryForm.keyword" placeholder="名称/联系人/电话/地址" clearable style="width: 240px" @keyup.enter="handleSearch" />
          <el-select v-model="queryForm.status" placeholder="状态" clearable style="width: 130px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </template>
        <!-- 视频 查询栏 -->
        <template v-if="activeTab === 'video'">
          <el-input v-model="queryForm.title" placeholder="请输入标题" clearable style="width: 200px" @keyup.enter="handleSearch" />
          <el-select v-model="queryForm.category" placeholder="分类" clearable style="width: 160px">
            <el-option label="查看报价" value="查看报价" />
            <el-option label="实用功能" value="实用功能" />
            <el-option label="下单相关" value="下单相关" />
            <el-option label="收入相关" value="收入相关" />
          </el-select>
          <el-select v-model="queryForm.status" placeholder="状态" clearable style="width: 130px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </template>
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>

      <template v-if="activeTab === 'banner'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="subtitle" label="副标题" />
          <el-table-column prop="link_url" label="链接" />
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'announcement'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="type" label="类型" width="80">
            <template #default="{ row }">{{ ['', '普通', '重要', '紧急'][row.type] }}</template>
          </el-table-column>
          <el-table-column prop="is_top" label="置顶" width="80">
            <template #default="{ row }"><el-tag v-if="row.is_top" type="danger" size="small">置顶</el-tag></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'store'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="name" label="门店名称" />
          <el-table-column prop="contact_name" label="联系人" width="100" />
          <el-table-column prop="contact_phone" label="电话" width="130" />
          <el-table-column prop="address" label="地址" />
          <el-table-column label="坐标" width="180">
            <template #default="{ row }">
              <span v-if="row.latitude && row.longitude">{{ row.latitude }}, {{ row.longitude }}</span>
              <span v-else style="color:#999">未设置</span>
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

      <template v-if="activeTab === 'video'">
        <el-table :data="tableData" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column label="封面" width="100">
            <template #default="{ row }">
              <el-image v-if="row.cover_image" :src="getImageUrl(row.cover_image)" style="width:80px;height:50px" fit="cover" />
              <span v-else style="color:#999;font-size:12px">无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="sort_order" label="排序" width="80" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-if="activeTab === 'message'">
        <el-form :model="msgForm" label-width="80px" style="max-width: 500px">
          <el-form-item label="消息类型">
            <el-select v-model="msgForm.type">
              <el-option label="订单消息" value="order" />
              <el-option label="价格消息" value="price" />
              <el-option label="系统消息" value="system" />
              <el-option label="活动消息" value="activity" />
            </el-select>
          </el-form-item>
          <el-form-item label="发送方式">
            <el-radio-group v-model="msgForm.isBroadcast">
              <el-radio :value="true">广播</el-radio>
              <el-radio :value="false">个人</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="!msgForm.isBroadcast" label="用户ID">
            <el-input v-model="msgForm.user_id" placeholder="输入用户ID" />
          </el-form-item>
          <el-form-item label="标题"><el-input v-model="msgForm.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="msgForm.content" type="textarea" :rows="4" /></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </el-form-item>
        </el-form>
      </template>



      <el-pagination v-if="activeTab !== 'message'" v-model:current-page="page" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" style="margin-top: 16px; justify-content: flex-end" @current-change="loadData" />
    </el-card>

    <el-dialog v-model="formVisible" :title="formId ? '编辑' : '新增'" width="600px">
      <el-form :model="formData" label-width="80px">
        <template v-if="activeTab === 'banner'">
          <el-form-item label="标题"><el-input v-model="formData.title" /></el-form-item>
          <el-form-item label="副标题"><el-input v-model="formData.subtitle" /></el-form-item>
          <el-form-item label="Banner图片" required>
            <el-upload
              class="banner-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <img v-if="formData.image" :src="getImageUrl(formData.image)" class="banner-image" />
              <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议尺寸：750x400 像素，支持 JPG、PNG 格式</div>
          </el-form-item>
          <el-form-item label="链接"><el-input v-model="formData.link_url" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="formData.sort_order" :min="0" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="formData.status" :active-value="1" :inactive-value="0" /></el-form-item>
        </template>
        <template v-if="activeTab === 'announcement'">
          <el-form-item label="标题"><el-input v-model="formData.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="formData.content" type="textarea" :rows="4" /></el-form-item>
          <el-form-item label="类型"><el-select v-model="formData.type"><el-option :value="1" label="普通" /><el-option :value="2" label="重要" /><el-option :value="3" label="紧急" /></el-select></el-form-item>
          <el-form-item label="状态"><el-switch v-model="formData.status" :active-value="1" :inactive-value="0" /></el-form-item>
        </template>
        <template v-if="activeTab === 'store'">
          <el-form-item label="名称"><el-input v-model="formData.name" /></el-form-item>
          <el-form-item label="联系人"><el-input v-model="formData.contact_name" /></el-form-item>
          <el-form-item label="电话"><el-input v-model="formData.contact_phone" /></el-form-item>
          <el-form-item label="微信"><el-input v-model="formData.wechat" /></el-form-item>
          <el-form-item label="地址">
            <el-input v-model="formData.address" placeholder="请输入门店地址（失焦后自动获取经纬度）" @blur="autoGeocodeStoreAddress" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" plain :loading="geocoding" :disabled="!formData.address" @click="autoGeocodeStoreAddress">
              📍 自动获取坐标
            </el-button>
            <span style="margin-left: 12px; color: #999; font-size: 12px;">地址失焦或点击此按钮，根据地址自动调用腾讯地图解析</span>
          </el-form-item>
          <el-form-item label="纬度">
            <el-input v-model="formData.latitude" :readonly="true" placeholder="填写地址后自动生成" />
          </el-form-item>
          <el-form-item label="经度">
            <el-input v-model="formData.longitude" :readonly="true" placeholder="填写地址后自动生成" />
          </el-form-item>
        </template>
        <template v-if="activeTab === 'video'">
          <el-form-item label="标题" required><el-input v-model="formData.title" placeholder="请输入视频标题" /></el-form-item>
          <el-form-item label="分类" required>
            <el-select v-model="formData.category" placeholder="请选择分类">
              <el-option label="查看报价" value="查看报价" />
              <el-option label="实用功能" value="实用功能" />
              <el-option label="下单相关" value="下单相关" />
              <el-option label="收入相关" value="收入相关" />
            </el-select>
          </el-form-item>
          <el-form-item label="封面图">
            <el-upload
              class="cover-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleCoverUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <img v-if="formData.cover_image" :src="getImageUrl(formData.cover_image)" class="cover-image" />
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">建议尺寸：320x180 像素，支持 JPG、PNG 格式</div>
          </el-form-item>
          <el-form-item label="视频文件">
            <el-upload
              class="video-uploader"
              :action="videoUploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleVideoUploadSuccess"
              :on-error="handleVideoUploadError"
              :before-upload="beforeVideoUpload"
              :on-progress="handleVideoProgress"
              accept="video/*"
            >
              <el-button type="primary" :loading="videoUploading">
                {{ videoUploading ? `上传中 ${videoUploadPercent}%` : '选择视频文件' }}
              </el-button>
            </el-upload>
            <el-progress v-if="videoUploading" :percentage="videoUploadPercent" :stroke-width="6" style="margin-top:8px;width:360px" />
            <div v-if="formData.video_url" class="video-preview">
              <video :src="getVideoUrl(formData.video_url)" controls style="width:360px;max-height:200px;margin-top:8px" />
              <div class="upload-tip">视频已上传，可预览播放</div>
            </div>
            <div class="upload-tip">支持 MP4、WebM、MOV 格式，最大 200MB</div>
          </el-form-item>
          <el-form-item label="排序"><el-input-number v-model="formData.sort_order" :min="0" /></el-form-item>
          <el-form-item label="状态"><el-switch v-model="formData.status" :active-value="1" :inactive-value="0" /></el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getBanners, createBanner, updateBanner, deleteBanner, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, getStores, createStore, updateStore, deleteStore, getVideos, createVideo, updateVideo, deleteVideo, broadcastMessage, sendMessage as sendMsg, geocodeAddress } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
// 查询条件（按 Tab 使用子集）
const defaultQueryForm = () => ({ title: '', keyword: '', status: '', type: '', category: '' })
const queryForm = ref(defaultQueryForm())
const activeTab = ref('banner')
const loading = ref(false)
const tableData = ref([])
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const formVisible = ref(false)
const formId = ref(null)
const formData = ref({})
const geocoding = ref(false)
const msgForm = ref({ type: 'system', isBroadcast: true, title: '', content: '', user_id: '' })

const videoUploading = ref(false)
const videoUploadPercent = ref(0)

const baseUrl = window.location.origin
const uploadUrl = '/api/admin/upload'
const videoUploadUrl = '/api/admin/upload/video'
const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://')) return path.replace('http://', 'https://')
  if (path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `/api${path}`
  return path
}

const getVideoUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://')) return path.replace('http://', 'https://')
  if (path.startsWith('https://')) return path
  if (path.startsWith('/uploads')) return `/api${path}`
  return path
}

const handleUploadSuccess = (response) => {
  if (response.code === 0) {
    formData.value.image = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleCoverUploadSuccess = (response) => {
  if (response.code === 0) {
    formData.value.cover_image = response.data.url
    ElMessage.success('封面图上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleVideoUploadSuccess = (response) => {
  videoUploading.value = false
  videoUploadPercent.value = 100
  if (response.code === 0) {
    formData.value.video_url = response.data.url
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error(response.message || '视频上传失败')
  }
}

const handleVideoUploadError = () => {
  videoUploading.value = false
  videoUploadPercent.value = 0
  ElMessage.error('视频上传失败')
}

const handleVideoProgress = (event) => {
  videoUploadPercent.value = Math.round(event.percent || 0)
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

const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt200M = file.size / 1024 / 1024 < 200

  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return false
  }
  if (!isLt200M) {
    ElMessage.error('视频大小不能超过 200MB！')
    return false
  }
  videoUploading.value = true
  videoUploadPercent.value = 0
  return true
}

const apiMap = {
  banner: { list: getBanners, create: createBanner, update: updateBanner, delete: deleteBanner },
  announcement: { list: getAnnouncements, create: createAnnouncement, update: updateAnnouncement, delete: deleteAnnouncement },
  store: { list: getStores, create: createStore, update: updateStore, delete: deleteStore },
  video: { list: getVideos, create: createVideo, update: updateVideo, delete: deleteVideo }
}

const buildListParams = () => {
  const params = { page: page.value, pageSize: pageSize.value }
  const { title, keyword, status, type, category } = queryForm.value
  // 不同 Tab 使用的查询字段集合不同，未填写的字段不发送到后端
  if (activeTab.value === 'banner') {
    if (title) params.keyword = title
    if (status !== '' && status !== null && status !== undefined) params.status = status
  } else if (activeTab.value === 'announcement') {
    if (title) params.keyword = title
    if (type !== '' && type !== null && type !== undefined) params.type = type
    if (status !== '' && status !== null && status !== undefined) params.status = status
  } else if (activeTab.value === 'store') {
    if (keyword) params.keyword = keyword
    if (status !== '' && status !== null && status !== undefined) params.status = status
  } else if (activeTab.value === 'video') {
    if (title) params.keyword = title
    if (category) params.category = category
    if (status !== '' && status !== null && status !== undefined) params.status = status
  }
  return params
}

const loadData = async () => {
  if (activeTab.value === 'message') return
  loading.value = true
  try {
    const res = await apiMap[activeTab.value].list(buildListParams())
    tableData.value = res.data.list || res.data
    total.value = res.data.pagination?.total || 0
  } catch (e) {
    ElMessage.error(e?.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const handleReset = () => {
  queryForm.value = defaultQueryForm()
  page.value = 1
  loadData()
}

const handleAdd = () => {
  formId.value = null
  formData.value = { sort_order: 0, status: 1, latitude: null, longitude: null }
  videoUploading.value = false
  videoUploadPercent.value = 0
  formVisible.value = true
}

const autoGeocodeStoreAddress = async () => {
  const address = (formData.value.address || '').toString().trim()
  if (!address) {
    ElMessage.warning('请先填写地址')
    return false
  }
  if (geocoding.value) return false
  geocoding.value = true
  try {
    const res = await geocodeAddress({
      address,
      province: formData.value.province || '',
      city: formData.value.city || '',
      district: formData.value.district || ''
    })
    const payload = (res && res.data) || res || {}
    if (payload && Number.isFinite(payload.lat) && Number.isFinite(payload.lng)) {
      formData.value.latitude = Number(payload.lat)
      formData.value.longitude = Number(payload.lng)
      ElMessage.success(`已根据地址自动生成经纬度 (${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)})`)
      return true
    }
    ElMessage.error('地址解析失败，请检查地址是否准确')
    return false
  } catch (e) {
    ElMessage.error('地址解析失败：' + (e?.message || '网络错误'))
    return false
  } finally {
    geocoding.value = false
  }
}

const handleEdit = (row) => {
  formId.value = row.id
  formData.value = { ...row }
  videoUploading.value = false
  videoUploadPercent.value = 0
  formVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
    await apiMap[activeTab.value].delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '删除失败')
    }
  }
}

const handleSave = async () => {
  if (activeTab.value === 'banner' && !formData.value.image) {
    ElMessage.warning('请上传Banner图片')
    return
  }
  if (activeTab.value === 'announcement' && (!formData.value.title || !formData.value.content)) {
    ElMessage.warning('请填写公告标题和内容')
    return
  }
  if (activeTab.value === 'video' && !formData.value.title) {
    ElMessage.warning('请输入视频标题')
    return
  }
  if (activeTab.value === 'video' && !formData.value.video_url) {
    ElMessage.warning('请上传视频文件')
    return
  }
  if (videoUploading.value) {
    ElMessage.warning('视频正在上传中，请稍候')
    return
  }
  if (activeTab.value === 'store') {
    const lat = Number(formData.value.latitude)
    const lng = Number(formData.value.longitude)
    const latLngMissing = !Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0
    if (latLngMissing) {
      if (!formData.value.address) {
        ElMessage.warning('请先填写门店地址以自动获取经纬度')
        return
      }
      const ok = await autoGeocodeStoreAddress()
      if (!ok) {
        ElMessage.error('请先填写地址或手动录入经纬度')
        return
      }
    }
  }
  try {
    const api = apiMap[activeTab.value]
    await formId.value ? api.update(formId.value, formData.value) : api.create(formData.value)
    ElMessage.success('保存成功')
    formVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const sendMessage = async () => {
  if (!msgForm.value.title || !msgForm.value.content) {
    ElMessage.warning('请填写消息标题和内容')
    return
  }
  if (!msgForm.value.isBroadcast && !msgForm.value.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  try {
    if (msgForm.value.isBroadcast) {
      await broadcastMessage(msgForm.value)
    } else {
      await sendMsg(msgForm.value)
    }
    ElMessage.success('发送成功')
    msgForm.value = { type: 'system', isBroadcast: true, title: '', content: '', user_id: '' }
  } catch (e) {
    ElMessage.error(e?.message || '发送失败')
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
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;  
}

.banner-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 360px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-uploader:hover {
  border-color: #409eff;
}

.banner-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 360px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.banner-image {
  width: 360px;
  height: 200px;
  object-fit: cover;
  display: block;
}

.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 320px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 320px;
  height: 180px;
  line-height: 180px;
  text-align: center;
}

.cover-image {
  width: 320px;
  height: 180px;
  object-fit: cover;
  display: block;
}

.video-uploader {
  width: 100%;
}

.video-preview {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  line-height: 1.4;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  /* margin-bottom: 16px; */
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 4px;
}
</style>
