<template>
  <div class="loading-spinner" :class="[`size-${size}`, `color-${color}`]">
    <div class="spinner"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'white', 'gray'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.size-small .spinner {
  width: 20px;
  height: 20px;
}

.size-medium .spinner {
  width: 40px;
  height: 40px;
}

.size-large .spinner {
  width: 60px;
  height: 60px;
}

.color-primary .spinner {
  border-color: #ff3344;
  border-top-color: transparent;
}

.color-white .spinner {
  border-color: #ffffff;
  border-top-color: transparent;
}

.color-gray .spinner {
  border-color: #999999;
  border-top-color: transparent;
}

.spinner-text {
  font-size: 14px;
  color: #666666;
}

.color-primary .spinner-text {
  color: #ff3344;
}

.color-white .spinner-text {
  color: #ffffff;
}

.color-gray .spinner-text {
  color: #999999;
}
</style>
