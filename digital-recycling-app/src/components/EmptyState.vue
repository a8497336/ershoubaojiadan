<template>
  <div class="empty-state">
    <div class="empty-icon">
      <img v-if="isImage" :src="icon" alt="empty" />
      <span v-else class="icon-emoji">{{ icon }}</span>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>
    <button v-if="showAction" class="empty-action" @click="handleAction">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: '📭'
  },
  title: {
    type: String,
    default: '暂无数据'
  },
  description: {
    type: String,
    default: '当前列表为空，请稍后再试'
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: '去逛逛'
  }
})

const emit = defineEmits(['action'])

const isImage = computed(() => {
  return props.icon && (props.icon.startsWith('http') || props.icon.startsWith('/'))
})

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.icon-emoji {
  font-size: 64px;
  line-height: 1;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #999999;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.empty-action {
  padding: 8px 24px;
  background-color: #ff3344;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.empty-action:hover {
  background-color: #e62e3d;
}
</style>
