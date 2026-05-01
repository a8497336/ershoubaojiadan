<template>
  <div class="feedback-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">问题反馈</div>
      <div class="nav-right"></div>
    </div>

    <!-- 反馈类型 -->
    <div class="type-section">
      <div class="section-label">反馈类型</div>
      <div class="type-grid">
        <div 
          v-for="type in feedbackTypes" 
          :key="type.value"
          :class="['type-item', { active: selectedType === type.value }]"
          @click="selectedType = type.value"
        >
          {{ type.label }}
        </div>
      </div>
    </div>

    <!-- 反馈内容 -->
    <div class="content-section">
      <div class="section-label">反馈内容</div>
      <textarea 
        v-model="feedbackContent"
        class="content-input"
        rows="6"
        placeholder="请详细描述您遇到的问题或建议，我们会尽快处理..."
      ></textarea>
      <div class="content-count">{{ feedbackContent.length }}/500</div>
    </div>

    <!-- 联系方式 -->
    <div class="contact-section">
      <div class="section-label">联系方式（选填）</div>
      <input 
        v-model="contactInfo"
        type="text"
        class="contact-input"
        placeholder="请留下您的手机号或微信，方便我们联系您"
      >
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <button 
        class="submit-btn"
        :disabled="!canSubmit"
        @click="submitFeedback"
      >
        提交反馈
      </button>
      <div class="submit-hint">您的反馈对我们非常重要，我们会认真阅读每一条建议</div>
    </div>

    <!-- 提交成功提示 -->
    <div v-if="showSuccess" class="success-toast">
      <div class="success-icon">&#10004;</div>
      <div class="success-text">反馈提交成功</div>
      <div class="success-sub">感谢您的宝贵建议</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { messageApi } from '../api'

const router = useRouter()

const feedbackTypes = [
  { label: '功能建议', value: 'feature' },
  { label: 'BUG反馈', value: 'bug' },
  { label: '投诉建议', value: 'complaint' },
  { label: '其他问题', value: 'other' },
]

const selectedType = ref('')
const feedbackContent = ref('')
const contactInfo = ref('')
const showSuccess = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => {
  return selectedType.value && feedbackContent.value.trim().length > 0 && !submitting.value
})

const submitFeedback = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await messageApi.submitFeedback({
      type: selectedType.value,
      content: feedbackContent.value,
      contact: contactInfo.value
    })
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      selectedType.value = ''
      feedbackContent.value = ''
      contactInfo.value = ''
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

.feedback-page {
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

/* 反馈类型 */
.type-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.type-item {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-item.active {
  border-color: #ff4d4f;
  background: #fff5f5;
  color: #ff4d4f;
  font-weight: 500;
}

/* 反馈内容 */
.content-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.content-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  resize: none;
  transition: all 0.3s ease;
  font-family: inherit;
}

.content-input:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.content-input::placeholder {
  color: #999;
}

.content-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

/* 联系方式 */
.contact-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.contact-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
}

.contact-input:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

.contact-input::placeholder {
  color: #999;
}

/* 提交按钮 */
.submit-section {
  padding: 20px 16px;
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

.submit-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
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
  .type-grid {
    gap: 8px;
  }
  
  .type-item {
    padding: 10px;
    font-size: 13px;
  }
}

@media (max-width: 320px) {
  .type-grid {
    grid-template-columns: 1fr;
  }
  
  .section-label {
    font-size: 14px;
  }
  
  .content-input,
  .contact-input {
    font-size: 13px;
  }
}
</style>
