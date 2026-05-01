<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo-area">
        <div class="logo-icon">♻️</div>
        <h1 class="app-name">数码回收网</h1>
        <p class="app-desc">专业数码产品回收平台</p>
      </div>
    </div>
    <div class="login-form">
      <div class="form-group">
        <div class="input-wrapper">
          <span class="input-prefix">+86</span>
          <input
            v-model="phone"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
            class="phone-input"
            @keyup.enter="handleLogin"
          />
        </div>
      </div>
      <button
        class="login-btn"
        :disabled="!isValid || loading"
        @click="handleLogin"
      >
        <span v-if="loading" class="loading-spinner"></span>
        <span v-else>登 录</span>
      </button>
      <p class="login-tip">登录即表示同意《用户协议》和《隐私政策》</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()

const phone = ref('')
const loading = ref(false)

const isValid = computed(() => /^1[3-9]\d{9}$/.test(phone.value))

async function handleLogin() {
  if (!isValid.value || loading.value) return
  loading.value = true
  try {
    await userStore.login(phone.value)
    await cartStore.fetchCart()
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e74c3c 0%, #c0392b 40%, #f5f5f5 40%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;
}

.login-header {
  padding-top: 80px;
  padding-bottom: 60px;
  text-align: center;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.app-name {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.app-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 24px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #e74c3c;
}

.input-prefix {
  padding: 14px 12px;
  color: #666;
  font-size: 16px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
  white-space: nowrap;
}

.phone-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: 16px;
  color: #333;
  background: transparent;
}

.phone-input::placeholder {
  color: #bbb;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn:not(:disabled):active {
  opacity: 0.8;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-tip {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 20px;
  line-height: 1.6;
}
</style>
