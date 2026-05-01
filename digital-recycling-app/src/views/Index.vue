<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="more-btn">●●●</div>
      <div class="title">数码回收网报价单</div>
      <div class="capsule">
        <span>―</span>
        <span>○</span>
      </div>
    </div>

    <!-- Banner轮播 -->
    <div class="banner" v-if="banners.length > 0">
      <div class="banner-content" v-if="banners[currentBanner]">
        <img
          v-if="banners[currentBanner].image"
          :src="banners[currentBanner].image"
          class="banner-image"
          alt="banner"
        />
        <div v-else class="banner-text">
          <div style="font-size: 14px; opacity: 0.9; letter-spacing: 2px;">{{ banners[currentBanner].subtitle || 'BUSINESS PARTNER' }}</div>
          <div style="font-size: 13px; margin: 4px 0;">SEARCH</div>
          <h2>{{ banners[currentBanner].title || '寻找城市合伙人' }}</h2>
        </div>
      </div>
      <div class="banner-dots">
        <span v-for="(_, i) in banners" :key="i" :class="{ active: currentBanner === i }"></span>
      </div>
    </div>
    <div class="banner" v-else>
      <div class="banner-content">
        <div class="banner-text">
          <div style="font-size: 14px; opacity: 0.9; letter-spacing: 2px;">BUSINESS PARTNER</div>
          <div style="font-size: 13px; margin: 4px 0;">SEARCH</div>
          <h2>寻找城市合伙人</h2>
        </div>
      </div>
      <div class="banner-dots">
        <span :class="{ active: currentBanner === 0 }"></span>
        <span :class="{ active: currentBanner === 1 }"></span>
        <span :class="{ active: currentBanner === 2 }"></span>
      </div>
    </div>

    <!-- 功能入口网格 -->
    <div class="func-grid">
      <!-- <div class="func-item">
        <h3>一键下单</h3>
        <p>免估价 更便捷</p>
        <div class="go-btn">GO ></div>
        <div class="icon">📱</div>
      </div> -->
      <div @click="jumpUrl('/brand-list')" class="func-item">
        <h3>快速查价</h3>
        <p>先估价 再下单</p>
        <div class="go-btn">GO ></div>
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
        </div>
      </div>
      <!-- <div class="func-item">
        <h3>限时特惠</h3>
        <p>赠送测机拆解工</p>
        <div class="go-btn">GO ></div>
        <div class="icon">🎁</div>
      </div> -->
      <div @click="jumpUrl('/scan-price')"  class="func-item">
        <h3>拍照查价</h3>
        <p>拍照片 查价格</p>
        <div class="go-btn">GO ></div>
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
        </div>
      </div>
      <!-- <div class="func-item">
        <h3>保修查询</h3>
        <p>查苹果 查安卓</p>
        <div class="go-btn">GO ></div>
        <div class="icon">🔍</div>
      </div> -->
      <div @click="jumpUrl('/invite-friends')" class="func-item">
        <h3>邀请好友</h3>
        <p>邀好友 分佣金</p>
        <div class="go-btn">GO ></div>
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>
    </div>

    <!-- 公告栏 -->
    <div class="notice-bar">
      <div class="notice-tag">📢 公告</div>
      <div class="notice-scroll-wrapper">
        <div
          class="notice-scroll-inner"
          :class="{ 'scroll-animate': announcements.length > 1 }"
          :style="announcements.length > 1 ? { transform: `translateY(-${currentAnnouncementIndex * 20}px)` } : {}"
        >
          <div class="notice-scroll-item" v-for="(item, index) in displayAnnouncements" :key="index">
            <span class="notice-text">{{ item.title }}</span>
            <span class="notice-time">{{ item.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 附近门店 -->
    <div class="store-card" v-if="nearestStore">
      <div class="store-header">
        <span class="store-tag">附近门店</span>
        <span class="store-name">{{ nearestStore.name }}</span>
        <span class="store-distance" v-if="nearestStore.distance">{{ nearestStore.distance }}km</span>
      </div>
      <div class="store-info-row" @click="callPhone(nearestStore.contact_phone)">
        <div class="label">📞 {{ nearestStore.contact_name }} {{ nearestStore.contact_phone }}</div>
        <div class="action">拨打 ></div>
      </div>
      <div class="store-info-row" v-if="nearestStore.wechat" @click="copyText(nearestStore.wechat, '微信号已复制')">
        <div class="label">💬 {{ nearestStore.wechat }}</div>
        <div class="action">复制 ></div>
      </div>
      <div class="store-address" @click="openNavigation(nearestStore)">
        <div class="label" style="flex:1;">📍 {{ nearestStore.province }}{{ nearestStore.city }}{{ nearestStore.district }}{{ nearestStore.address }}</div>
        <div class="action" style="white-space:nowrap; margin-left:8px;">导航 ></div>
      </div>
    </div>
    <div class="store-card" v-else>
      <div class="store-header">
        <span class="store-tag">附近门店</span>
        <span class="store-name">安徽门店</span>
        <span class="store-distance">52.11km</span>
      </div>
      <div class="store-info-row" @click="callPhone('18755875222')">
        <div class="label">📞 范凯旋 18755875222</div>
        <div class="action">拨打 ></div>
      </div>
      <div class="store-info-row" @click="copyText('18755875222', '微信号已复制')">
        <div class="label">💬 18755875222</div>
        <div class="action">复制 ></div>
      </div>
      <div class="store-address" @click="openNavigation(null)">
        <div class="label" style="flex:1;">📍 安徽省阜阳市太和县双浮镇双北路1号数码回收网废旧手机回收中心（五星大桥南50米路）</div>
        <div class="action" style="white-space:nowrap; margin-left:8px;">导航 ></div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" v-model="searchKeyword" placeholder="查找您想要看的机型报价" @keyup.enter="handleSearch" @input="onSearchInput">
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="category-tabs">
      <div
        v-for="(tab, index) in categoryTabs"
        :key="index"
        :class="['tab-item', { active: activeCategory === index }]"
        @click="switchCategoryTab(index)"
      >
        {{ tab }}
      </div>
    </div>

    <!-- 常用报价 -->
    <div class="common-quote">
      <span class="active">常用报价</span>
      <span class="empty">暂无常用报价</span>
    </div>

    <!-- 分类品牌报价区域 -->
    <template v-if="currentCategorySection">
      <div class="section-title">{{ currentCategorySection.name }}回收报价</div>
      <div :class="['brand-grid', currentCategorySection.code === 'difficult' ? 'difficult-grid' : '']">
        <div
          v-for="(brand, bIdx) in currentBrands"
          :key="'brand-' + bIdx"
          class="brand-item"
          @click="goToBrandList(brand.id)"
        >
          <div v-if="brand.has_update" class="update-tag">今日更新</div>
          <div
            :class="['brand-icon', brand.bg_color || 'bg-apple']"
            :style="brand.icon_style ? { fontSize: brand.icon_style } : {}"
          >{{ brand.icon_text || brand.name.substring(0, 2) }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="section-title">废旧手机回收报价</div>
      <div class="brand-grid">
        <div
          v-for="(brand, index) in phoneBrands"
          :key="'phone-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]" :style="brand.iconStyle">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>

      <div class="section-title">废旧手机内配回收报价</div>
      <div class="brand-grid">
        <div
          v-for="(brand, index) in internalBrands"
          :key="'internal-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]" :style="brand.iconStyle">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>

      <div class="section-title">电子产品杂货铺报价</div>
      <div class="brand-grid">
        <div
          v-for="(brand, index) in electronicsBrands"
          :key="'electronics-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]" :style="brand.iconStyle">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>

      <div class="section-title">疑难机型查看</div>
      <div class="brand-grid difficult-grid">
        <div
          v-for="(brand, index) in difficultBrands"
          :key="'difficult-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div v-if="brand.hasUpdate" class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>

      <div class="section-title">靓机回收报价</div>
      <div class="brand-grid">
        <div
          v-for="(brand, index) in goodPhoneBrands"
          :key="'goodphone-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]" :style="brand.iconStyle">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>

      <div class="section-title">名酒回收报价</div>
      <div class="brand-grid">
        <div
          v-for="(brand, index) in liquorBrands"
          :key="'liquor-' + index"
          class="brand-item"
          @click="goToBrandList()"
        >
          <div class="update-tag">今日更新</div>
          <div :class="['brand-icon', brand.bg]" :style="brand.iconStyle">{{ brand.icon }}</div>
          <div class="brand-name">{{ brand.name }}</div>
        </div>
      </div>
    </template>

    <!-- 手机回收教程 -->
    <div class="video-section">
      <div class="video-header">
        <h3>手机回收教程</h3>
        <span class="more" @click="router.push('/video-list')">全部视频 ></span>
      </div>
      <div class="video-tabs">
        <div
          v-for="(tab, index) in videoTabs"
          :key="index"
          :class="['video-tab', { active: activeVideoTab === index }]"
          @click="switchVideoTab(index)"
        >
          {{ tab }}
        </div>
      </div>
      <div class="video-list">
        <div
          v-for="(video, index) in videos"
          :key="index"
          class="video-card"
          @click="playVideo(video)"
        >
          <div class="video-thumb">
            <img v-if="video.cover_image" :src="video.cover_image" class="video-cover" alt="" />
            <span v-else class="video-default-icon">📱</span>
            <div class="video-play-btn">▶</div>
          </div>
          <p>{{ video.title }}</p>
        </div>
      </div>
    </div>

    <!-- 服务流程 -->
    <div class="service-flow">
      <div class="flow-title">发货下单 → 到货验机 → 确认报价 → 成交收款</div>
      <div class="flow-steps">
        <div class="flow-step">
          <div class="flow-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <p>报价精准</p>
      </div>
      <div class="flow-step">
        <div class="flow-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <p>专业质检</p>
      </div>
      <div class="flow-step">
        <div class="flow-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        </div>
        <p>快速提现</p>
      </div>
      <div class="flow-step">
        <div class="flow-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <p>高质服务</p>
      </div>
      </div>
    </div>

    <!-- CTA按钮 -->
    <div @click="goToBrandList()" class="cta-btn">
      <button>回收下单</button>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <h4>数码网·真诚服务好每一位客户</h4>
      <p>耕耘十余年始终为您提供最新最可靠的回收报价</p>
      <div class="footer-actions">
        <div class="footer-action">💬 添加微信</div>
        <div class="footer-action">📞 客服电话</div>
        <div class="footer-action">🏪 门店列表</div>
      </div>
    </div>

    <!-- Toast提示 -->
    <transition name="toast-fade">
      <div class="custom-toast" v-if="toastVisible">{{ toastMessage }}</div>
    </transition>

    <!-- 返回顶部 -->
    <div
      v-show="showBackTop"
      class="back-top"
      @click="scrollToTop"
    >
      ⬆️
    </div>

    <!-- 底部TabBar - 高级圆形设计 -->
    <AdvancedTabBar active-tab="home" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedTabBar from '@/components/AdvancedTabBar.vue'
import { bannerApi, announcementApi, storeApi, videoApi, searchApi, categoryApi } from '../api'
import { useAppStore } from '../stores/app'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const appStore = useAppStore()
const cartStore = useCartStore()

const activeCategory = ref(0)
const searchKeyword = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null
const categoryTabs = ref<string[]>(['环保手机报价', '数码相机报价', '新机靓机报价'])

const activeVideoTab = ref(0)
const videoTabs = ['查看报价', '实用功能', '下单相关', '收入相关']

const videos = ref<any[]>([
  { icon: '📱', title: '华为手机查询报价' },
  { icon: '📊', title: '报价单查看教程' },
  { icon: '📊', title: '报价单统货功能机' }
])

function switchVideoTab(index: number) {
  activeVideoTab.value = index
  fetchVideos()
}

function playVideo(video: any) {
  if (video.id) {
    router.push(`/video-play/${video.id}`)
  }
}

async function fetchVideos() {
  try {
    const category = videoTabs[activeVideoTab.value]
    const res = await videoApi.getList({ category })
    const videoData = (res as any)?.data || []
    if (videoData.length > 0) {
      videos.value = videoData.map((v: any) => ({
        id: v.id,
        title: v.title || v.name,
        cover_image: v.cover_image || '',
        video_url: v.video_url || v.url,
        category: v.category || '',
        duration: v.duration || 0
      }))
    }
  } catch (e) {
    // ignore
  }
}

const activeTab = ref('home')

const currentBanner = ref(0)
const banners = ref<any[]>([])
const announcements = ref<any[]>([])
const storesData = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)

const showBackTop = ref(false)

const latestAnnouncement = computed(() => {
  return announcements.value.length > 0 ? announcements.value[0] : null
})

const currentAnnouncementIndex = ref(0)
let announcementTimer: ReturnType<typeof setInterval> | null = null

const displayAnnouncements = computed(() => {
  if (announcements.value.length > 0) {
    return announcements.value.map((a: any) => ({
      title: a.title,
      time: formatTimeAgo(a.created_at)
    }))
  }
  return [{ title: '东莞东城 冯先生 门店批量 收益8500元', time: '135分钟前' }]
})

function startAnnouncementRotation() {
  if (announcementTimer) clearInterval(announcementTimer)
  if (displayAnnouncements.value.length <= 1) return
  announcementTimer = setInterval(() => {
    currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % displayAnnouncements.value.length
  }, 3000)
}

function stopAnnouncementRotation() {
  if (announcementTimer) {
    clearInterval(announcementTimer)
    announcementTimer = null
  }
}

const userLocation = ref<{ lat: number; lng: number } | null>(null)

const nearestStore = computed(() => {
  if (storesData.value.length === 0) return null
  if (!userLocation.value) return storesData.value[0]
  const storesWithDistance = storesData.value.map((store: any) => {
    if (store.latitude && store.longitude) {
      const dist = haversineDistance(
        userLocation.value!.lat,
        userLocation.value!.lng,
        Number(store.latitude),
        Number(store.longitude)
      )
      return { ...store, distance: dist.toFixed(2) }
    }
    return store
  })
  storesWithDistance.sort((a: any, b: any) => {
    const da = a.distance ? parseFloat(a.distance) : Infinity
    const db = b.distance ? parseFloat(b.distance) : Infinity
    return da - db
  })
  return storesWithDistance[0]
})

const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string, duration = 2000) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function getUserLocation() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  )
}

function callPhone(phone: string | undefined) {
  if (!phone) {
    showToast('暂无联系电话')
    return
  }
  window.location.href = `tel:${phone}`
}

function copyText(text: string | undefined, msg = '已复制') {
  if (!text) {
    showToast('暂无内容')
    return
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg)
    }).catch(() => {
      fallbackCopy(text, msg)
    })
  } else {
    fallbackCopy(text, msg)
  }
}

function fallbackCopy(text: string, msg: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    showToast(msg)
  } catch {
    showToast('复制失败，请手动复制')
  }
  document.body.removeChild(textarea)
}

function openNavigation(store: any) {
  const lat = store?.latitude ? Number(store.latitude) : 33.1624
  const lng = store?.longitude ? Number(store.longitude) : 115.6218
  const name = store?.name || '数码回收网废旧手机回收中心'
  const address = store
    ? `${store.province || ''}${store.city || ''}${store.district || ''}${store.address || ''}`
    : '安徽省阜阳市太和县双浮镇双北路1号数码回收网废旧手机回收中心'
  const isWechat = /MicroMessenger/i.test(navigator.userAgent)
  if (isWechat) {
    window.open(
      `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=bus&callnative=1`,
      '_blank'
    )
  } else {
    if (/Android/i.test(navigator.userAgent)) {
      window.open(
        `androidamap://route?sourceApplication=digital_recycling&dlat=${lat}&dlon=${lng}&dname=${encodeURIComponent(name)}&dev=0&t=1`,
        '_blank'
      )
      setTimeout(() => {
        window.open(
          `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=bus`,
          '_blank'
        )
      }, 500)
    } else {
      window.open(
        `https://uri.amap.com/navigation?to=${lng},${lat},${encodeURIComponent(name)}&mode=bus&callnative=1`,
        '_blank'
      )
    }
  }
}

const categorySections = computed(() => {
  if (categories.value.length === 0) return []
  return categories.value.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    code: cat.code || '',
    brands: (cat.Brands || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      bg_color: b.bg_color,
      icon_text: b.icon_text,
      icon_style: b.icon_style,
      has_update: b.has_update
    }))
  })).filter((s: any) => s.brands.length > 0)
})

const currentCategorySection = computed(() => {
  const cats = categories.value
  if (cats.length === 0) return null
  const idx = activeCategory.value
  const cat = cats[idx] || cats[0]
  if (!cat) return null
  return {
    id: cat.id,
    name: cat.name,
    code: cat.code || ''
  }
})

const currentBrands = ref<any[]>([])
const brandsLoading = ref(false)

async function fetchCategoryBrands() {
  const cats = categories.value
  if (cats.length === 0) return
  const idx = activeCategory.value
  const cat = cats[idx] || cats[0]
  if (!cat) return

  brandsLoading.value = true
  try {
    const res: any = await categoryApi.getBrands(cat.id)
    const brands = (res?.data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      bg_color: b.bg_color,
      icon_text: b.icon_text,
      icon_style: b.icon_style,
      has_update: b.has_update
    }))
    currentBrands.value = brands
  } catch (e) {
    currentBrands.value = (cat.Brands || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      bg_color: b.bg_color,
      icon_text: b.icon_text,
      icon_style: b.icon_style,
      has_update: b.has_update
    }))
  } finally {
    brandsLoading.value = false
  }
}

function switchCategoryTab(index: number) {
  activeCategory.value = index
  fetchCategoryBrands()
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

const phoneBrands = [
  { bg: 'bg-xiaomi', icon: '📱', iconStyle: { fontSize: '10px' }, name: '热门老年机' },
  { bg: 'bg-apple', icon: '�', iconStyle: { fontSize: '10px' }, name: '智能机/电容屏' },
  { bg: 'bg-huawei', icon: '🔧', iconStyle: { fontSize: '10px' }, name: '手机拆机件' },
  { bg: 'bg-blackberry', icon: '🔋', iconStyle: { fontSize: '10px' }, name: '电池' },
  { bg: 'bg-oppo', icon: 'OP', name: 'OPPO' },
  { bg: 'bg-vivo', icon: 'V', name: 'VIVO' },
  { bg: 'bg-xiaomi', icon: 'mi', name: '小米' },
  { bg: 'bg-huawei', icon: 'HW', name: '华为OK板' },
  { bg: 'bg-huawei', icon: 'HW', name: '华为' },
  { bg: 'bg-samsung', icon: 'S', name: '三星' },
  { bg: 'bg-apple', icon: '🍎', name: '苹果' },
  { bg: 'bg-apple', icon: '⚠️', iconStyle: { fontSize: '9px' }, name: '高仿苹果' },
  { bg: 'bg-jinli', icon: 'G', name: '金立' },
  { bg: 'bg-lenovo', icon: 'L', name: '联想' },
  { bg: 'bg-coolpad', icon: 'cool', iconStyle: { fontSize: '9px' }, name: '酷派/ivvi' },
  { bg: 'bg-meizu', icon: 'M', name: '魅族' },
  { bg: 'bg-smartisan', icon: 'T', name: '锤子' },
  { bg: 'bg-360', icon: '+', name: '360' },
  { bg: 'bg-htc', icon: 'htc', name: 'HTC' },
  { bg: 'bg-blackberry', icon: '●●●', iconStyle: { fontSize: '9px' }, name: '黑莓' },
  { bg: 'bg-oneplus', icon: '1+', name: '一加' },
  { bg: 'bg-realme', icon: 'R', name: '真我/realme' },
  { bg: 'bg-nokia', icon: 'N', name: '诺基亚' },
  { bg: 'bg-meitu', icon: 'M', name: '美图' },
  { bg: 'bg-leeco', icon: 'L', name: '乐视' },
  { bg: 'bg-nubia', icon: 'n', name: '努比亚' },
  { bg: 'bg-chinamobile', icon: '移', name: '中国移动' },
  { bg: 'bg-tcl', icon: 'T', name: 'TCL' },
  { bg: 'bg-zte', icon: 'Z', name: '中兴' },
  { bg: 'bg-8848', icon: '8848', name: '8848' },
  { bg: 'bg-sugar', icon: 'GOME', iconStyle: { fontSize: '9px' }, name: '糖果/国美' },
  { bg: 'bg-bbk', icon: '步', name: '步步高' },
  { bg: 'bg-hisense', icon: 'H', name: '海信' },
  { bg: 'bg-doov', icon: 'D', name: '朵唯' },
  { bg: 'bg-gree', icon: 'G', name: '格力' },
  { bg: 'bg-moto', icon: 'M', name: '摩托罗拉' },
  { bg: 'bg-asus', icon: 'A', name: '华硕' },
  { bg: 'bg-royole', icon: '柔', name: '柔宇' },
  { bg: 'bg-google', icon: 'G', name: '谷歌Google' }
]

const internalBrands = [
  { bg: 'bg-blackberry', icon: '🔲', iconStyle: { fontSize: '10px' }, name: '主板芯片' },
  { bg: 'bg-apple', icon: '🍎', iconStyle: { fontSize: '10px' }, name: '苹果主板' },
  { bg: 'bg-blackberry', icon: '💾', iconStyle: { fontSize: '10px' }, name: '内存卡' },
  { bg: 'bg-apple', icon: '🖥️', iconStyle: { fontSize: '9px' }, name: '苹果高端屏' },
  { bg: 'bg-blackberry', icon: '📱', iconStyle: { fontSize: '10px' }, name: '手机屏' },
  { bg: 'bg-blackberry', icon: '⬛', iconStyle: { fontSize: '9px' }, name: '冷光屏黑白屏' },
  { bg: 'bg-apple', icon: '📲', iconStyle: { fontSize: '9px' }, name: 'IPAD内爆屏' },
  { bg: 'bg-blackberry', icon: '📷', iconStyle: { fontSize: '9px' }, name: '国产摄像头' },
  { bg: 'bg-hisense', icon: '🏭', iconStyle: { fontSize: '9px' }, name: '企业库存机' },
  { bg: 'bg-hisense', icon: '♻️', iconStyle: { fontSize: '9px' }, name: '电子废弃物' }
]

const electronicsBrands = [
  { bg: 'bg-apple', icon: '🎧', iconStyle: { fontSize: '10px' }, name: '苹果耳机' },
  { bg: 'bg-blackberry', icon: '💳', iconStyle: { fontSize: '10px' }, name: 'POS机' },
  { bg: 'bg-blackberry', icon: '📻', iconStyle: { fontSize: '9px' }, name: '对讲机' },
  { bg: 'bg-blackberry', icon: '🪪', iconStyle: { fontSize: '8px' }, name: '身份证阅读器' },
  { bg: 'bg-blackberry', icon: '📡', iconStyle: { fontSize: '9px' }, name: '方盒路由器' },
  { bg: 'bg-blackberry', icon: '📡', iconStyle: { fontSize: '9px' }, name: '路由器' },
  { bg: 'bg-hisense', icon: '🌐', iconStyle: { fontSize: '9px' }, name: '光纤猫' },
  { bg: 'bg-blackberry', icon: '📺', iconStyle: { fontSize: '8px' }, name: '4k/2k机顶盒' },
  { bg: 'bg-apple', icon: '📦', iconStyle: { fontSize: '9px' }, name: '苹果盒子' },
  { bg: 'bg-blackberry', icon: '🎮', iconStyle: { fontSize: '8px' }, name: '小游戏机' },
  { bg: 'bg-blackberry', icon: '🕹️', iconStyle: { fontSize: '8px' }, name: '大游戏机' },
  { bg: 'bg-blackberry', icon: '🗺️', iconStyle: { fontSize: '9px' }, name: '汽车导航' },
  { bg: 'bg-blackberry', icon: '🔍', iconStyle: { fontSize: '9px' }, name: '扫描枪' },
  { bg: 'bg-blackberry', icon: '📺', iconStyle: { fontSize: '9px' }, name: '户户通' },
  { bg: 'bg-blackberry', icon: '📀', iconStyle: { fontSize: '9px' }, name: 'EVD、唱戏机' },
  { bg: 'bg-apple', icon: '🎵', iconStyle: { fontSize: '9px' }, name: 'ipod系列' },
  { bg: 'bg-blackberry', icon: '🍽️', iconStyle: { fontSize: '8px' }, name: '美团点餐机' },
  { bg: 'bg-hisense', icon: '📶', iconStyle: { fontSize: '8px' }, name: '随身4Gwifi' },
  { bg: 'bg-blackberry', icon: '📖', iconStyle: { fontSize: '7px' }, name: '亚马逊电子书' },
  { bg: 'bg-blackberry', icon: '🖨️', iconStyle: { fontSize: '8px' }, name: '条码打印机' }
]

const difficultBrands = [
  { bg: 'bg-huawei', icon: '📱', name: '华为', hasUpdate: false },
  { bg: 'bg-vivo', icon: 'V', name: 'VIVO', hasUpdate: false },
  { bg: 'bg-oppo', icon: 'O', name: 'OPPO', hasUpdate: false },
  { bg: 'bg-realme', icon: 'R', name: 'realme', hasUpdate: false },
  { bg: 'bg-xiaomi', icon: 'mi', name: '小米', hasUpdate: false },
  { bg: 'bg-apple', icon: '🍎', name: '苹果', hasUpdate: false },
  { bg: 'bg-samsung', icon: 'S', name: '三星', hasUpdate: false },
  { bg: 'bg-oneplus', icon: '1+', name: '一加', hasUpdate: false },
  { bg: 'bg-nokia', icon: 'N', name: '诺基亚', hasUpdate: false },
  { bg: 'bg-jinli', icon: 'G', name: '金立', hasUpdate: false },
  { bg: 'bg-meitu', icon: 'M', name: '美图', hasUpdate: false },
  { bg: 'bg-meizu', icon: 'M', name: '魅族', hasUpdate: false },
  { bg: 'bg-nubia', icon: 'n', name: '努比亚', hasUpdate: false },
  { bg: 'bg-360', icon: '+', name: '360', hasUpdate: false },
  { bg: 'bg-smartisan', icon: 'T', name: '锤子', hasUpdate: false },
  { bg: 'bg-zte', icon: 'Z', name: '中兴', hasUpdate: false },
  { bg: 'bg-coolpad', icon: 'C', name: '酷派', hasUpdate: false },
  { bg: 'bg-lenovo', icon: 'L', name: '联想', hasUpdate: false },
  { bg: 'bg-htc', icon: 'H', name: 'HTC', hasUpdate: false },
  { bg: 'bg-blackberry', icon: '●●●', name: '黑莓', hasUpdate: false },
  { bg: 'bg-sugar', icon: 'S', name: '糖果/国美', hasUpdate: false },
  { bg: 'bg-hisense', icon: 'H', name: '海信', hasUpdate: false },
  { bg: 'bg-doov', icon: 'D', name: '朵唯', hasUpdate: true },
  { bg: 'bg-8848', icon: '8848', name: '8848', hasUpdate: false }
]

const goodPhoneBrands = [
  { bg: 'bg-apple', icon: '🍎', name: '苹果有保' },
  { bg: 'bg-apple', icon: '🍎', name: '苹果无保' },
  { bg: 'bg-huawei', icon: 'HW', name: '华为旗舰' },
  { bg: 'bg-huawei', icon: 'HW', name: '华为' },
  { bg: 'bg-realme', icon: 'R', name: '真我/realme' },
  { bg: 'bg-oppo', icon: 'OP', name: 'OPPO' },
  { bg: 'bg-vivo', icon: 'iQ', iconStyle: { fontSize: '10px' }, name: 'iQOO' },
  { bg: 'bg-vivo', icon: 'V', name: 'VIVO' }
]

const liquorBrands = [
  { bg: 'bg-sugar', icon: '茅台', iconStyle: { fontSize: '10px' }, name: '常见茅台' },
  { bg: 'bg-sugar', icon: '茅台', iconStyle: { fontSize: '10px' }, name: '历年茅台' },
  { bg: 'bg-sugar', icon: '茅台', iconStyle: { fontSize: '10px' }, name: '生肖茅台' },
  { bg: 'bg-sugar', icon: '国产', iconStyle: { fontSize: '9px' }, name: '国产名酒' },
  { bg: 'bg-sugar', icon: '洋酒', iconStyle: { fontSize: '9px' }, name: '品牌洋酒' },
  { bg: 'bg-sugar', icon: '威士忌', iconStyle: { fontSize: '8px' }, name: '洋酒威士忌' }
]

let bannerTimer: ReturnType<typeof setInterval> | null = null
const jumpUrl = (path:string) => {
  router.push(path)
}

async function fetchHomeData() {
  loading.value = true
  try {
    const [bannerRes, announceRes, storeRes, videoRes] = await Promise.allSettled([
      bannerApi.getList(),
      announcementApi.getList({ page: 1, pageSize: 5 }),
      storeApi.getList(),
      videoApi.getList()
    ])
    if (bannerRes.status === 'fulfilled') banners.value = (bannerRes.value as any)?.data || []
    if (announceRes.status === 'fulfilled') announcements.value = (announceRes.value as any)?.data?.list || (announceRes.value as any)?.data || []
    if (storeRes.status === 'fulfilled') storesData.value = (storeRes.value as any)?.data || []
    if (videoRes.status === 'fulfilled') {
      const videoData = (videoRes.value as any)?.data || []
      if (videoData.length > 0) {
        videos.value = videoData.map((v: any) => ({
          id: v.id,
          title: v.title || v.name,
          cover_image: v.cover_image || '',
          video_url: v.video_url || v.url,
          category: v.category || '',
          duration: v.duration || 0
        }))
      }
    }

    await appStore.fetchCategories()
    if (appStore.categories.length > 0) {
      categories.value = appStore.categories
      categoryTabs.value = categories.value.map((c: any) => c.name)
      await fetchCategoryBrands()
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  startBannerRotation()
  getUserLocation()
  fetchHomeData().then(() => {
    startAnnouncementRotation()
  })
  if (localStorage.getItem('token')) {
    cartStore.fetchCart()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  stopBannerRotation()
  stopAnnouncementRotation()
})

function handleScroll() {
  showBackTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function startBannerRotation() {
  bannerTimer = setInterval(() => {
    const total = banners.value.length || 3
    currentBanner.value = (currentBanner.value + 1) % total
  }, 3000)
}

function stopBannerRotation() {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

function switchTab(tab: string) {
  activeTab.value = tab
  if (tab === 'home') {
    // stay on current page
  } else if (tab === 'order') {
    router.push('/price-quote/0')
  } else if (tab === 'cart') {
    router.push('/brand-list')
  } else if (tab === 'profile') {
    router.push('/profile')
  } else if (tab === 'shopping') {
    router.push('/shopping')
  } else if (tab === 'scanPrice') {
    router.push('/scan-price')
  }
}

function handleTabChange(tab: string) {
  // switchTab(tab)
    activeTab.value = tab
}

function goToBrandList(brandId?: number) {
  if (brandId) {
    router.push(`/price-quote/${brandId}`)
  } else {
    router.push('/brand-list')
  }
}

async function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  router.push({ path: '/brand-list', query: { keyword } })
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 800)
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.page-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* ===== 顶部导航栏 ===== */
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
.nav-bar .more-btn {
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px;
}
.nav-bar .title {
  color: #fff;
  font-size: 17px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.nav-bar .capsule {
  display: flex;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 16px;
  overflow: hidden;
}
.nav-bar .capsule span {
  color: #fff;
  padding: 4px 10px;
  font-size: 14px;
  border-right: 1px solid rgba(255,255,255,0.3);
}
.nav-bar .capsule span:last-child { border-right: none; }

/* ===== Banner ===== */
.banner {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #ff2d4a 0%, #ff6b6b 100%);
  position: relative;
  overflow: hidden;
}

@media (max-width: 375px) {
  .banner {
    height: 140px;
  }
  .banner-content h2 {
    font-size: 24px;
  }
}

@media (max-width: 320px) {
  .banner {
    height: 120px;
  }
  .banner-content h2 {
    font-size: 20px;
  }
}
.banner-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;
}
.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.banner-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: #fff;
}
.banner-content h2 {
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 4px;
}
.banner-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}
.banner-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
}
.banner-dots span.active { background: #fff; width: 14px; border-radius: 3px; }

/* ===== 功能入口网格 ===== */
.func-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
}

@media (max-width: 375px) {
  .func-grid {
    gap: 6px;
    padding: 10px;
  }
  .func-item {
    padding: 10px 8px;
  }
  .func-item h3 {
    font-size: 14px;
  }
  .func-item p {
    font-size: 10px;
  }
  .func-item .go-btn {
    font-size: 10px;
    padding: 1px 6px;
    margin-top: 6px;
  }
  .func-item .icon {
    font-size: 24px;
    right: 6px;
    bottom: 6px;
  }
  .func-item .icon svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 320px) {
  .func-grid {
    gap: 4px;
    padding: 8px;
  }
  .func-item {
    padding: 8px 6px;
    border-radius: 8px;
  }
  .func-item h3 {
    font-size: 13px;
  }
  .func-item p {
    font-size: 9px;
  }
  .func-item .go-btn {
    font-size: 9px;
    padding: 1px 5px;
    margin-top: 4px;
  }
  .func-item .icon {
    font-size: 20px;
    right: 4px;
    bottom: 4px;
  }
  .func-item .icon svg {
    width: 16px;
    height: 16px;
  }
}
.func-item {
  background: #fff;
  border-radius: 10px;
  padding: 12px 10px;
  position: relative;
}
.func-item h3 { font-size: 15px; color: #333; font-weight: 600; }
.func-item p { font-size: 11px; color: #999; margin-top: 2px; line-height: 1.4; }
.func-item .go-btn {
  display: inline-flex;
  align-items: center;
  background: #ff2d4a;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 8px;
}
.func-item .icon {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 28px;
}
.func-item .icon svg {
  width: 22px;
  height: 22px;
}

/* ===== 公告栏 ===== */
.notice-bar {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;
}
.notice-bar .notice-tag {
  background: #ff2d4a;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.notice-scroll-wrapper {
  flex: 1;
  height: 20px;
  overflow: hidden;
  position: relative;
}
.notice-scroll-inner {
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.notice-scroll-item {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
}
.notice-scroll-item .notice-text {
  flex: 1;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notice-scroll-item .notice-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  margin-left: 8px;
  flex-shrink: 0;
}

/* ===== 附近门店 ===== */
.store-card {
  background: #fff;
  margin: 8px 12px;
  border-radius: 10px;
  padding: 12px;
}
.store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.store-tag {
  background: #ff2d4a;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.store-name { font-size: 15px; color: #333; font-weight: 500; flex: 1; margin-left: 8px; }
.store-distance { font-size: 13px; color: #999; }
.store-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 13px;
}
.store-info-row .label { color: #666; display: flex; align-items: center; gap: 6px; }
.store-info-row .action { color: #ff2d4a; font-size: 12px; }
.store-address {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
  line-height: 1.5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* ===== 搜索栏 ===== */
.search-bar {
  padding: 10px 12px;
}
.search-input {
  background: #fff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border: 1px solid #eee;
}
.search-input svg { width: 16px; height: 16px; color: #999; margin-right: 8px; }
.search-input input {
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  width: 100%;
  background: transparent;
  transition: all 0.2s ease;
}

.search-input input:focus {
  box-shadow: 0 0 0 3px rgba(255, 51, 68, 0.1);
  border-radius: 4px;
}

.search-input:focus-within {
  border-color: #ff3344;
  box-shadow: 0 0 0 3px rgba(255, 51, 68, 0.1);
}

.search-input input::placeholder { color: #999; }

/* ===== 分类Tab ===== */
.category-tabs {
  display: flex;
  background: #fff;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}
.tab-item.active {
  color: #ff2d4a;
  font-weight: 600;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 3px;
  background: #ff2d4a;
  border-radius: 2px;
}

/* ===== 常用报价 ===== */
.common-quote {
  background: #fff;
  padding: 12px;
  display: flex;
  gap: 20px;
  font-size: 14px;
}
.common-quote .active { color: #333; font-weight: 500; }
.common-quote .empty { color: #ff2d4a; }

/* ===== 区块标题 ===== */
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 16px 12px 10px;
  background: #fff;
  margin-top: 8px;
}

/* ===== 品牌网格 ===== */
.brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #f0f0f0;
}
.brand-item {
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 4px;
  position: relative;
  cursor: pointer;
}
.brand-item:active {
  background: #f8f8f8;
}
.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 6px;
  position: relative;
}
.brand-name { font-size: 12px; color: #333; }
.update-tag {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffd700;
  color: #ff2d4a;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: bold;
  white-space: nowrap;
  z-index: 2;
}

/* 品牌颜色 */
.bg-huawei { background: #cf0a2c; }
.bg-vivo { background: #415fff; }
.bg-oppo { background: #009b4d; }
.bg-realme { background: #ffc915; color: #333 !important; }
.bg-xiaomi { background: #ff6900; }
.bg-apple { background: #555; }
.bg-samsung { background: #1428a0; }
.bg-oneplus { background: #f50514; }
.bg-nokia { background: #124191; }
.bg-gionee { background: #e66b1a; }
.bg-meitu { background: #ff4d94; }
.bg-meizu { background: #00b4ff; }
.bg-nubia { background: #1a1a1a; }
.bg-360 { background: #4caf50; }
.bg-smartisan { background: #e02e24; }
.bg-zte { background: #00a0e9; }
.bg-coolpad { background: #00b0f0; }
.bg-lenovo { background: #e2231a; }
.bg-htc { background: #8bc34a; }
.bg-blackberry { background: #000; }
.bg-hisense { background: #00a0e9; }
.bg-doov { background: #e91e63; }
.bg-gree { background: #ff0000; }
.bg-moto { background: #000; }
.bg-asus { background: #00539b; }
.bg-royole { background: #ff6b00; }
.bg-google { background: #4285f4; }
.bg-jinli { background: #e66b1a; }
.bg-8848 { background: #1a1a1a; }
.bg-sugar { background: #ff6b6b; }
.bg-bbk { background: #ff2d4a; }
.bg-leeco { background: #2196f3; }
.bg-tcl { background: #ff0000; }
.bg-chinamobile { background: #0099cc; }

/* 疑难机型圆形 */
.difficult-grid .brand-icon {
  width: 48px;
  height: 48px;
}

/* ===== 视频教程区 ===== */
.video-section {
  background: #fff;
  padding: 0 12px 16px;
}
.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
.video-header h3 { font-size: 16px; font-weight: bold; color: #333; }
.video-header .more { font-size: 13px; color: #999; }

.video-tabs {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}
.video-tab {
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  position: relative;
}
.video-tab.active {
  color: #333;
  font-weight: 600;
}
.video-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff2d4a;
}

.video-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}
.video-card {
  min-width: 110px;
  flex-shrink: 0;
}
.video-thumb {
  width: 110px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  position: relative;
  overflow: hidden;
}
.video-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.video-default-icon {
  font-size: 30px;
}
.video-play-btn {
  position: absolute;
  width: 28px;
  height: 28px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
}
.video-card p {
  font-size: 12px;
  color: #333;
  margin-top: 6px;
  line-height: 1.3;
}

/* ===== 服务流程 ===== */
.service-flow {
  background: #fff;
  margin-top: 8px;
  padding: 16px 12px;
}
.flow-title {
  text-align: center;
  font-size: 14px;
  color: #ff2d4a;
  margin-bottom: 16px;
  font-weight: 500;
}
.flow-steps {
  display: flex;
  justify-content: space-around;
}
.flow-step {
  text-align: center;
}
.flow-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin: 0 auto 6px;
}
.flow-step p { font-size: 12px; color: #666; }

/* ===== CTA按钮 ===== */
.cta-btn {
  margin: 16px 12px;
}
.cta-btn button {
  width: 100%;
  background: #ff2d4a;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.cta-btn button:active {
  background: #e62540;
}

/* ===== 底部信息 ===== */
.footer-info {
  text-align: center;
  padding: 16px 12px;
}
.footer-info h4 {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.footer-info p {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
.footer-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.footer-action {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

/* ===== 返回顶部 ===== */
.back-top {
  position: fixed;
  bottom: 70px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-size: 18px;
  color: #ff2d4a;
  z-index: 99;
  cursor: pointer;
}
.back-top:active {
  background: #f8f8f8;
}

/* ===== Toast提示 ===== */
.custom-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
}
.toast-fade-enter-active {
  transition: opacity 0.2s ease;
}
.toast-fade-leave-active {
  transition: opacity 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

/* ===== 门店卡片交互 ===== */
.store-info-row,
.store-address {
  cursor: pointer;
}
.store-info-row:active,
.store-address:active {
  background: #f9f9f9;
  border-radius: 4px;
}

/* 隐藏滚动条但保持功能 */
.video-list::-webkit-scrollbar {
  display: none;
}

@media (max-width: 375px) {
  .nav-bar .title {
    font-size: 15px;
  }

  .brand-item {
    padding: 12px 2px;
  }

  .brand-icon {
    width: 40px;
    height: 40px;
    font-size: 10px;
  }

  .brand-name {
    font-size: 11px;
  }

  .update-tag {
    font-size: 8px;
    padding: 1px 3px;
  }

  .difficult-grid .brand-icon {
    width: 42px;
    height: 42px;
  }

  .section-title {
    font-size: 15px;
    padding: 14px 12px 8px;
  }

  .flow-icon {
    width: 40px;
    height: 40px;
  }

  .flow-step p {
    font-size: 11px;
  }

  .video-thumb {
    width: 100px;
    height: 72px;
  }

  .video-card {
    min-width: 100px;
  }

  .video-card p {
    font-size: 11px;
  }

  .store-card {
    margin: 6px 10px;
    padding: 10px;
  }

  .search-input {
    padding: 6px 12px;
  }

  .search-input input {
    font-size: 13px;
  }

  .cta-btn button {
    padding: 12px 0;
    font-size: 15px;
  }
}

@media (max-width: 320px) {
  .nav-bar .title {
    font-size: 14px;
  }

  .brand-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .brand-item {
    padding: 10px 2px;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    font-size: 9px;
  }

  .brand-name {
    font-size: 10px;
  }

  .update-tag {
    font-size: 7px;
    padding: 1px 2px;
    top: 6px;
  }

  .difficult-grid .brand-icon {
    width: 38px;
    height: 38px;
  }

  .section-title {
    font-size: 14px;
    padding: 12px 10px 8px;
  }

  .flow-icon {
    width: 36px;
    height: 36px;
  }

  .flow-step p {
    font-size: 10px;
  }

  .video-thumb {
    width: 90px;
    height: 64px;
  }

  .video-card {
    min-width: 90px;
  }

  .video-card p {
    font-size: 10px;
  }

  .store-card {
    margin: 6px 8px;
    padding: 8px;
  }

  .store-header {
    margin-bottom: 8px;
  }

  .store-name {
    font-size: 14px;
  }

  .search-input {
    padding: 6px 10px;
  }

  .search-input input {
    font-size: 12px;
  }

  .cta-btn button {
    padding: 10px 0;
    font-size: 14px;
  }

  .tab-item {
    font-size: 13px;
    padding: 10px 0;
  }

  .video-tab {
    font-size: 13px;
  }

  .notice-scroll-item .notice-text {
    font-size: 12px;
  }

  .footer-action {
    font-size: 12px;
  }
}

</style>
