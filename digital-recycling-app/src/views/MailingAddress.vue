<template>
  <div class="mailing-address-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">邮寄地址</div>
      <div class="nav-right">
        <div class="nav-action" @click="showAddForm = true">+ 添加</div>
      </div>
    </div>

    <!-- 地址列表 -->
    <div class="address-list">
      <div 
        v-for="(address, index) in addresses" 
        :key="index"
        :class="['address-card', { default: address.isDefault }]"
      >
        <div class="address-header">
          <div class="user-info">
            <span class="user-name">{{ address.name }}</span>
            <span class="user-phone">{{ address.phone }}</span>
          </div>
          <div v-if="address.isDefault" class="default-tag">默认</div>
        </div>
        <div class="address-detail">{{ address.detail }}</div>
        <div class="address-actions">
          <div class="action-left">
            <div 
              class="set-default"
              :class="{ active: address.isDefault }"
              @click="setDefault(index)"
            >
              <span class="radio"></span>
              <span>{{ address.isDefault ? '默认地址' : '设为默认' }}</span>
            </div>
          </div>
          <div class="action-right">
            <div class="action-btn" @click="editAddress(index)">&#9998; 编辑</div>
            <div class="action-btn delete" @click="deleteAddress(index)">&#128465; 删除</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="addresses.length === 0" class="empty-state">
      <div class="empty-icon">&#127968;</div>
      <div class="empty-text">暂无邮寄地址</div>
      <button class="empty-btn" @click="showAddForm = true">添加地址</button>
    </div>

    <!-- 添加/编辑地址弹窗 -->
    <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title">{{ editingIndex >= 0 ? '编辑地址' : '添加地址' }}</div>
          <div class="modal-close" @click="showAddForm = false">&#10005;</div>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label>收件人</label>
            <input v-model="form.name" type="text" placeholder="请输入收件人姓名">
          </div>
          <div class="form-item">
            <label>手机号</label>
            <input v-model="form.phone" type="tel" placeholder="请输入手机号码">
          </div>
          <div class="form-item">
            <label>详细地址</label>
            <textarea v-model="form.detail" rows="3" placeholder="请输入详细地址（省市区街道门牌号）"></textarea>
          </div>
          <div class="form-item checkbox">
            <label class="checkbox-label">
              <input v-model="form.isDefault" type="checkbox">
              <span>设为默认地址</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddForm = false">取消</button>
          <button class="btn-confirm" @click="saveAddress">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../api'

const router = useRouter()

interface Address {
  id: number
  name: string
  phone: string
  detail: string
  isDefault: boolean
}

const addresses = ref<Address[]>([])
const showAddForm = ref(false)
const editingIndex = ref(-1)

const form = reactive({
  name: '',
  phone: '',
  detail: '',
  isDefault: false,
})

const resetForm = () => {
  form.name = ''
  form.phone = ''
  form.detail = ''
  form.isDefault = false
  editingIndex.value = -1
}

const fetchAddresses = async () => {
  try {
    const res: any = await userApi.getAddresses()
    addresses.value = (res.data?.list || res.data || []).map((item: any) => ({
      id: item.id,
      name: item.name || item.receiver_name,
      phone: item.phone,
      detail: item.detail || item.address,
      isDefault: item.isDefault || item.is_default || false,
    }))
  } catch (e) {
    // ignore
  }
}

const setDefault = async (index: number) => {
  const addr = addresses.value[index]
  if (addr.isDefault) return
  try {
    await userApi.updateAddress(addr.id, { ...addr, isDefault: true })
    addresses.value.forEach((a, i) => { a.isDefault = i === index })
  } catch (e: any) {
    alert(e.message || '设置默认地址失败')
  }
}

const editAddress = (index: number) => {
  editingIndex.value = index
  const addr = addresses.value[index]
  form.name = addr.name
  form.phone = addr.phone
  form.detail = addr.detail
  form.isDefault = addr.isDefault
  showAddForm.value = true
}

const deleteAddress = async (index: number) => {
  if (confirm('确定要删除该地址吗？')) {
    const addr = addresses.value[index]
    try {
      await userApi.deleteAddress(addr.id)
      addresses.value.splice(index, 1)
    } catch (e: any) {
      alert(e.message || '删除地址失败')
    }
  }
}

const saveAddress = async () => {
  if (!form.name || !form.phone || !form.detail) {
    alert('请填写完整信息')
    return
  }

  try {
    if (editingIndex.value >= 0) {
      const addr = addresses.value[editingIndex.value]
      await userApi.updateAddress(addr.id, { ...form })
    } else {
      await userApi.addAddress({ ...form })
    }
    showAddForm.value = false
    resetForm()
    await fetchAddresses()
  } catch (e: any) {
    alert(e.message || '保存地址失败')
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.mailing-address-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* 顶部导航 */
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  color: #fff;
}

.nav-back {
  font-size: 28px;
  cursor: pointer;
  width: 30px;
  line-height: 44px;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-action {
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

/* 地址列表 */
.address-list {
  padding: 12px;
}

.address-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.address-card.default {
  border: 1px solid #ff4d4f;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-phone {
  font-size: 14px;
  color: #666;
}

.default-tag {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.address-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.set-default {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
}

.set-default.active {
  color: #ff4d4f;
}

.radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.set-default.active .radio {
  border-color: #ff4d4f;
  background: #ff4d4f;
}

.action-right {
  display: flex;
  gap: 16px;
}

.action-btn {
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.action-btn.delete {
  color: #ff4d4f;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 15px;
  color: #999;
  margin-bottom: 20px;
}

.empty-btn {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border: none;
  padding: 10px 32px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  font-size: 20px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.form-item input:focus,
.form-item textarea:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.form-item.checkbox {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #ff4d4f;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
}

@media (max-width: 375px) {
  .address-card {
    padding: 14px;
  }
  
  .user-name {
    font-size: 15px;
  }
  
  .address-detail {
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .address-list {
    padding: 8px;
  }
  
  .address-card {
    padding: 12px;
  }
  
  .user-name {
    font-size: 14px;
  }
  
  .user-phone {
    font-size: 13px;
  }
  
  .address-detail {
    font-size: 12px;
  }
}
</style>
