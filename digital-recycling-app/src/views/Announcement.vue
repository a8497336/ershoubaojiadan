<template>
  <div class="announcement-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">公告中心</div>
      <div class="nav-right">
        <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount }}条未读</span>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="announcement-list">
      <div
        v-for="(item, index) in announcements"
        :key="index"
        :class="['announcement-item', { unread: !item.isRead }]"
        @click="readAnnouncement(index)"
      >
        <div class="item-header">
          <div class="item-type" :class="item.type">{{ item.typeLabel }}</div>
          <div class="item-time">{{ item.time }}</div>
        </div>
        <div class="item-title">{{ item.title }}</div>
        <div class="item-content" :class="{ expanded: item.isExpanded }">
          {{ item.content }}
        </div>
        <div class="item-footer">
          <span v-if="!item.isRead" class="unread-dot"></span>
          <span class="expand-hint">{{ item.isExpanded ? '收起' : '展开' }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="announcements.length === 0" class="empty-state">
      <div class="empty-icon">&#128239;</div>
      <div class="empty-text">暂无公告</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { announcementApi, messageApi } from '../api'

const router = useRouter()

interface Announcement {
  id: number
  title: string
  content: string
  time: string
  type: string
  typeLabel: string
  isRead: boolean
  isExpanded: boolean
}

const announcements = ref<Announcement[]>([])

const fetchAnnouncements = async () => {
  try {
    const res: any = await announcementApi.getList()
    announcements.value = (res.data?.list || res.data || []).map((item: any) => {
      const typeMap: Record<string, string> = {
        1: '系统',
        2: '通知',
        3: '活动',
        4: '维护',
        5: '更新',
        system: '系统',
        notice: '通知',
        activity: '活动',
        maintenance: '维护',
        update: '更新',
      }
      return {
        id: item.id,
        title: item.title,
        content: item.content,
        time: item.time || item.created_at,
        type: item.type || 'system',
        typeLabel: typeMap[item.type] || item.type || '系统',
        isRead: item.isRead || item.is_read || false,
        isExpanded: false,
      }
    })
  } catch (e) {
    // ignore
  }
}

const unreadCount = computed(() => {
  return announcements.value.filter(item => !item.isRead).length
})

const readAnnouncement = async (index: number) => {
  const item = announcements.value[index]
  if (!item.isRead) {
    item.isRead = true
    try {
      await messageApi.markRead(item.id)
    } catch (e) {
      // ignore
    }
  }
  item.isExpanded = !item.isExpanded
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.announcement-page {
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

.nav-right {
  display: flex;
  align-items: center;
}

.nav-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

/* 公告列表 */
.announcement-list {
  padding: 12px;
}

.announcement-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
}

.announcement-item:active {
  transform: scale(0.98);
}

.announcement-item.unread {
  border-left: 3px solid #ff4d4f;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-type {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.item-type.system {
  background: #e3f2fd;
  color: #1976d2;
}

.item-type.price {
  background: #fff3e0;
  color: #f57c00;
}

.item-type.activity {
  background: #fce4ec;
  color: #c2185b;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.item-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: all 0.3s ease;
}

.item-content.expanded {
  -webkit-line-clamp: unset;
}

.item-footer {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 8px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}

.expand-hint {
  font-size: 12px;
  color: #999;
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
}

@media (max-width: 375px) {
  .announcement-item {
    padding: 14px;
  }
  
  .item-title {
    font-size: 14px;
  }
  
  .item-content {
    font-size: 12px;
  }
}

@media (max-width: 320px) {
  .announcement-list {
    padding: 8px;
  }
  
  .announcement-item {
    padding: 12px;
    margin-bottom: 8px;
  }
  
  .item-title {
    font-size: 13px;
  }
  
  .item-content {
    font-size: 11px;
  }
}
</style>
