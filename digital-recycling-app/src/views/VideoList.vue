<template>
  <div class="video-list-page">
    <div class="nav-bar">
      <div class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </div>
      <div class="title">手机回收教程</div>
      <div class="placeholder"></div>
    </div>

    <div class="video-tabs">
      <div
        v-for="(tab, index) in videoTabs"
        :key="index"
        :class="['video-tab', { active: activeTab === index }]"
        @click="switchTab(index)"
      >
        {{ tab }}
      </div>
    </div>

    <div class="video-grid" v-if="videos.length > 0">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-item"
        @click="goToPlay(video)"
      >
        <div class="video-thumb">
          <img v-if="video.cover_image" :src="video.cover_image" alt="" />
          <span v-else class="default-icon">📱</span>
          <div class="play-btn">▶</div>
          <span class="duration-tag" v-if="video.duration">{{ formatDuration(video.duration) }}</span>
        </div>
        <div class="video-title">{{ video.title }}</div>
      </div>
    </div>

    <div class="empty-state" v-else-if="!loading">
      <div class="empty-icon">📺</div>
      <p>暂无视频教程</p>
    </div>

    <div class="loading-state" v-if="loading">
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { videoApi } from '../api'

const router = useRouter()

const videoTabs = ['查看报价', '实用功能', '下单相关', '收入相关']
const activeTab = ref(0)
const videos = ref<any[]>([])
const loading = ref(false)

function formatDuration(seconds: number) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function switchTab(index: number) {
  activeTab.value = index
  fetchVideos()
}

async function fetchVideos() {
  loading.value = true
  try {
    const category = videoTabs[activeTab.value]
    const res = await videoApi.getList({ category })
    const data = (res as any)?.data || []
    videos.value = data.map((v: any) => ({
      id: v.id,
      title: v.title || v.name,
      cover_image: v.cover_image || '',
      video_url: v.video_url || v.url,
      category: v.category || '',
      duration: v.duration || 0
    }))
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function goToPlay(video: any) {
  router.push(`/video-play/${video.id}`)
}

onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.video-list-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 20px;
}

.nav-bar {
  background: #ff2d4a;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-bar .back-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-bar .title {
  color: #fff;
  font-size: 17px;
  font-weight: 500;
}

.nav-bar .placeholder {
  width: 30px;
}

.video-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
}

.video-tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}

.video-tab.active {
  color: #ff2d4a;
  font-weight: 600;
}

.video-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #ff2d4a;
  border-radius: 2px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 12px;
}

.video-item {
  cursor: pointer;
}

.video-item:active {
  opacity: 0.8;
}

.video-thumb {
  width: 100%;
  aspect-ratio: 16/9;
  background: #f0f0f0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumb .default-icon {
  font-size: 30px;
}

.video-thumb .play-btn {
  position: absolute;
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.video-thumb .duration-tag {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}

.video-title {
  font-size: 13px;
  color: #333;
  margin-top: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #999;
}
</style>
