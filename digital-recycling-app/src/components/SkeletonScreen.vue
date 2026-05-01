<template>
  <div class="skeleton-screen" :class="`type-${type}`">
    <!-- 列表骨架屏 -->
    <template v-if="type === 'list'">
      <div v-for="i in rows" :key="`list-${i}`" class="skeleton-list-item">
        <div class="skeleton-avatar shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-title shimmer"></div>
          <div class="skeleton-line shimmer"></div>
        </div>
      </div>
    </template>

    <!-- 卡片骨架屏 -->
    <template v-if="type === 'card'">
      <div v-for="i in rows" :key="`card-${i}`" class="skeleton-card">
        <div class="skeleton-image shimmer"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-title shimmer"></div>
          <div class="skeleton-line shimmer"></div>
          <div class="skeleton-line short shimmer"></div>
        </div>
      </div>
    </template>

    <!-- 表格骨架屏 -->
    <template v-if="type === 'table'">
      <div class="skeleton-table">
        <div class="skeleton-row header">
          <div v-for="j in 4" :key="`header-${j}`" class="skeleton-cell shimmer"></div>
        </div>
        <div v-for="i in rows" :key="`row-${i}`" class="skeleton-row">
          <div v-for="j in 4" :key="`cell-${i}-${j}`" class="skeleton-cell shimmer"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'list',
    validator: (value) => ['list', 'card', 'table'].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  }
})
</script>

<style scoped>
.skeleton-screen {
  width: 100%;
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 列表样式 */
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 16px;
  width: 40%;
}

.skeleton-line {
  height: 14px;
  width: 80%;
}

/* 卡片样式 */
.type-card {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.skeleton-card {
  flex: 1;
  min-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.skeleton-image {
  width: 100%;
  height: 120px;
}

.skeleton-card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line.short {
  width: 50%;
}

/* 表格样式 */
.skeleton-table {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 4px;
}

.skeleton-row {
  display: flex;
  padding: 12px;
  gap: 16px;
  border-bottom: 1px solid #eee;
}

.skeleton-row:last-child {
  border-bottom: none;
}

.skeleton-row.header .skeleton-cell {
  height: 18px;
  background: #e8e8e8;
}

.skeleton-cell {
  flex: 1;
  height: 16px;
}
</style>
