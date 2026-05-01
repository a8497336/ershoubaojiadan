<template>
  <div class="business-cooperation-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">商务合作</div>
      <div class="nav-right"></div>
    </div>

    <!-- 合作方式介绍 -->
    <div class="cooperation-types">
      <div class="type-card">
        <div class="type-icon">&#127775;</div>
        <div class="type-title">城市合伙人</div>
        <div class="type-desc">成为当地回收站点，共享品牌资源和技术支持</div>
      </div>
      <div class="type-card">
        <div class="type-icon">&#128235;</div>
        <div class="type-title">供应商合作</div>
        <div class="type-desc">大批量供货，享受专属高价回收通道</div>
      </div>
      <div class="type-card">
        <div class="type-icon">&#128241;</div>
        <div class="type-title">渠道合作</div>
        <div class="type-desc">线上线下渠道推广，互利共赢</div>
      </div>
    </div>

    <!-- 合作优势 -->
    <div class="advantages-section">
      <div class="section-title">合作优势</div>
      <div class="advantages-list">
        <div class="advantage-item">
          <div class="advantage-icon">&#128200;</div>
          <div class="advantage-text">
            <div class="advantage-title">价格透明</div>
            <div class="advantage-desc">实时报价，行情一目了然</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">&#128178;</div>
          <div class="advantage-text">
            <div class="advantage-title">快速结算</div>
            <div class="advantage-desc">检测完成即时打款</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">&#128101;</div>
          <div class="advantage-text">
            <div class="advantage-title">专属服务</div>
            <div class="advantage-desc">一对一客户经理对接</div>
          </div>
        </div>
        <div class="advantage-item">
          <div class="advantage-icon">&#128170;</div>
          <div class="advantage-text">
            <div class="advantage-title">品牌支持</div>
            <div class="advantage-desc">十余年行业口碑保障</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 联系表单 -->
    <div class="form-section">
      <div class="section-title">合作意向登记</div>
      <div class="form-content">
        <div class="form-item">
          <label>公司名称 <span class="required">*</span></label>
          <input v-model="form.company" type="text" placeholder="请输入公司名称">
        </div>
        <div class="form-item">
          <label>联系人 <span class="required">*</span></label>
          <input v-model="form.contact" type="text" placeholder="请输入联系人姓名">
        </div>
        <div class="form-item">
          <label>联系电话 <span class="required">*</span></label>
          <input v-model="form.phone" type="tel" placeholder="请输入联系电话">
        </div>
        <div class="form-item">
          <label>合作类型 <span class="required">*</span></label>
          <div class="type-options">
            <div 
              v-for="type in cooperationTypes" 
              :key="type.value"
              :class="['type-option', { active: form.type === type.value }]"
              @click="form.type = type.value"
            >
              {{ type.label }}
            </div>
          </div>
        </div>
        <div class="form-item">
          <label>合作意向描述</label>
          <textarea v-model="form.description" rows="4" placeholder="请简要描述您的合作意向..."></textarea>
        </div>
        <button 
          class="submit-btn"
          :disabled="!canSubmit"
          @click="submitForm"
        >
          提交申请
        </button>
      </div>
    </div>

    <!-- 联系方式 -->
    <div class="contact-info">
      <div class="section-title">联系我们</div>
      <div class="contact-list">
        <div class="contact-item">
          <div class="contact-label">商务热线</div>
          <div class="contact-value">16618180111</div>
        </div>
        <div class="contact-item">
          <div class="contact-label">电子邮箱</div>
          <div class="contact-value">business@shuma.com</div>
        </div>
        <div class="contact-item">
          <div class="contact-label">公司地址</div>
          <div class="contact-value">广东省深圳市福田区华强北街道</div>
        </div>
      </div>
    </div>

    <!-- 提交成功提示 -->
    <div v-if="showSuccess" class="success-toast">
      <div class="success-icon">&#10004;</div>
      <div class="success-text">提交成功</div>
      <div class="success-sub">我们会尽快与您联系</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { messageApi } from '../api'

const router = useRouter()

const cooperationTypes = [
  { label: '城市合伙人', value: 'partner' },
  { label: '供应商合作', value: 'supplier' },
  { label: '渠道合作', value: 'channel' },
  { label: '其他合作', value: 'other' },
]

const form = reactive({
  company: '',
  contact: '',
  phone: '',
  type: '',
  description: '',
})

const showSuccess = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => {
  return form.company && form.contact && form.phone && form.type && !submitting.value
})

const submitForm = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await messageApi.submitFeedback({
      type: `商务合作-${form.type}`,
      content: `公司: ${form.company}\n联系人: ${form.contact}\n电话: ${form.phone}\n描述: ${form.description || '无'}`,
    })
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      form.company = ''
      form.contact = ''
      form.phone = ''
      form.type = ''
      form.description = ''
    }, 2000)
  } catch (e: any) {
    alert(e.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.business-cooperation-page {
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

/* 合作方式 */
.cooperation-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 12px;
}

.type-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.type-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.type-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 11px;
  color: #999;
  line-height: 1.4;
}

/* 合作优势 */
.advantages-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.advantages-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.advantage-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.advantage-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.advantage-desc {
  font-size: 12px;
  color: #999;
}

/* 表单区域 */
.form-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
}

.required {
  color: #ff4d4f;
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

.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.type-option {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-option.active {
  border-color: #ff4d4f;
  background: #fff5f5;
  color: #ff4d4f;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* 联系方式 */
.contact-info {
  background: #fff;
  margin: 0 12px 24px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-label {
  font-size: 14px;
  color: #666;
}

.contact-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 24px 40px;
  border-radius: 12px;
  text-align: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.success-icon {
  width: 48px;
  height: 48px;
  background: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
}

.success-text {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.success-sub {
  font-size: 13px;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@media (max-width: 375px) {
  .cooperation-types {
    gap: 8px;
    padding: 10px;
  }
  
  .type-card {
    padding: 14px 8px;
  }
  
  .type-icon {
    font-size: 28px;
  }
  
  .type-title {
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .cooperation-types {
    grid-template-columns: 1fr;
  }
  
  .type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    padding: 12px;
  }
  
  .type-icon {
    font-size: 28px;
    margin-bottom: 0;
  }
  
  .advantages-list {
    grid-template-columns: 1fr;
  }
  
  .type-options {
    grid-template-columns: 1fr;
  }
}
</style>
