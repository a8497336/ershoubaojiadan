<template>
  <div class="video-play-page">
    <div class="nav-bar">
      <div class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </div>
      <div class="title">{{ videoInfo.title || '视频播放' }}</div>
      <div class="placeholder"></div>
    </div>

    <div class="video-player-wrap" v-if="videoInfo.video_url">
      <video
        ref="videoEl"
        class="video-player"
        :src="videoInfo.video_url"
        :poster="videoInfo.cover_image || ''"
        controls
        playsinline
        webkit-playsinline
        x5-playsinline
        preload="metadata"
        @loadedmetadata="onVideoLoaded"
      ></video>
    </div>

    <div class="video-info" v-if="videoInfo.title">
      <h2 class="video-title">{{ videoInfo.title }}</h2>
      <div class="video-meta">
        <span class="category-tag" v-if="videoInfo.category">{{ videoInfo.category }}</span>
        <span class="duration" v-if="videoInfo.duration">{{ formatDuration(videoInfo.duration) }}</span>
      </div>
    </div>

    <div class="related-section" v-if="relatedVideos.length > 0">
      <h3 class="section-title">相关视频</h3>
      <div class="related-list">
        <div
          v-for="item in relatedVideos"
          :key="item.id"
          class="related-item"
          @click="switchVideo(item)"
        >
          <div class="related-thumb">
            <img v-if="item.cover_image" :src="item.cover_image" alt="" />
            <span v-else class="default-icon">📱</span>
            <div class="play-icon">▶</div>
          </div>
          <div class="related-info">
            <p class="related-title">{{ item.title }}</p>
            <span class="related-category" v-if="item.category">{{ item.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { videoApi } from '../api'

const router = useRouter()
const route = useRoute()
const videoEl = ref<HTMLVideoElement | null>(null)

const videoInfo = ref<any>({})
const relatedVideos = ref<any[]>([])

function formatDuration(seconds: number) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function onVideoLoaded() {
  // video element loaded
}

async function fetchVideoDetail() {
  try {
    const id = route.params.id
    const res = await videoApi.getDetail(id as string)
    const data = (res as any)?.data
    if (data) {
      videoInfo.value = data
      if (data.category) {
        fetchRelatedVideos(data.category)
      }
    }
  } catch (e) {
    // ignore
  }
}

async function fetchRelatedVideos(category: string) {
  try {
    const res = await videoApi.getList({ category })
    const list = (res as any)?.data || []
    relatedVideos.value = list.filter((v: any) => v.id !== videoInfo.value.id)
  } catch (e) {
    // ignore
  }
}

function switchVideo(item: any) {
  videoInfo.value = item
  relatedVideos.value = relatedVideos.value.filter((v: any) => v.id !== item.id)
  if (videoEl.value) {
    videoEl.value.load()
    videoEl.value.play()
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchVideoDetail()
})
</script>

<style scoped>
.video-play-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
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
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-bar .placeholder {
  width: 30px;
}

.video-player-wrap {
  width: 100%;
  background: #000;
}

.video-player {
  width: 100%;
  max-height: 240px;
  display: block;
}

.video-info {
  background: #fff;
  padding: 16px 12px;
}

.video-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.category-tag {
  background: #fff0f0;
  color: #ff2d4a;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.duration {
  font-size: 12px;
  color: #999;
}

.related-section {
  margin-top: 8px;
  background: #fff;
  padding: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.related-item:active {
  opacity: 0.8;
}

.related-thumb {
  width: 120px;
  height: 75px;
  background: #f0f0f0;
  border-radius: 6px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-thumb .default-icon {
  font-size: 24px;
}

.related-thumb .play-icon {
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
}

.related-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.related-title {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-category {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
