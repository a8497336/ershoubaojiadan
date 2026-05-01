<template>
  <Transition name="slide-down">
    <div v-if="visible" class="error-toast" :class="`type-${type}`">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
      <button class="toast-close" @click="close">×</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'success'].includes(value)
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 3000
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = ref(false)
let timer = null

const iconMap = {
  error: '✕',
  warning: '⚠',
  success: '✓'
}

const icon = iconMap[props.type] || iconMap.error

const close = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    visible.value = true
    startTimer()
  } else {
    visible.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
})

onMounted(() => {
  if (props.modelValue) {
    visible.value = true
    startTimer()
  }
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 200px;
  max-width: 80%;
}

.type-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.type-warning {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #faad14;
}

.type-success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-message {
  font-size: 14px;
  flex: 1;
  word-break: break-all;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s;
  color: inherit;
}

.toast-close:hover {
  opacity: 1;
}

/* 滑入动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateX(-50%) translateY(-100%);
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}
</style>
