<template>
  <div class="advanced-tabbar-wrapper">
    <div class="tabbar">
      <div
        :class="['tabbar-item', { active: activeTab === 'home' }]"
        @click="handleTabClick('home')"
      >
        <div class="tab-indicator"></div>
        <div class="tabbar-icon">
          <i class="fas fa-home"></i>
        </div>
        <p>首页</p>
      </div>

      <div
        :class="['tabbar-item', { active: activeTab === 'cart' }]"
        @click="handleTabClick('cart')"
      >
        <div class="tab-indicator"></div>
        <div class="tabbar-icon">
          <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <p>报价单</p>
      </div>

      <div
        :class="['tabbar-item', 'center-tab', { active: activeTab === 'scanPrice' }]"
        @click="handleTabClick('scanPrice')"
      >
        <div class="center-button-container">
          <div class="center-button-outer"></div>
          <div class="center-button-main">
            <div class="center-button-highlight"></div>
            <div class="center-button-icon">
              <i class="fas fa-qrcode"></i>
            </div>
          </div>
          <div v-if="showNewBadge" class="center-badge">NEW</div>
        </div>
        <p class="center-text">扫码报价</p>
      </div>

      <div
        :class="['tabbar-item', { active: activeTab === 'shopping' }]"
        @click="handleTabClick('shopping')"
      >
        <div class="tab-indicator"></div>
        <div class="tabbar-icon">
          <i class="fas fa-shopping-cart"></i>
          <div v-if="badgeCount > 0" class="tab-badge">{{ badgeCount }}</div>
        </div>
        <p>回收车</p>
      </div>

      <div
        :class="['tabbar-item', { active: activeTab === 'profile' }]"
        @click="handleTabClick('profile')"
      >
        <div class="tab-indicator"></div>
        <div class="tabbar-icon">
          <i class="fas fa-user"></i>
          <div v-if="showDotBadge" class="tab-badge dot"></div>
        </div>
        <p>我的</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import router from '../router'

interface Props {
  activeTab: string
  badgeCount?: number
  showNewBadge?: boolean
  showDotBadge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  badgeCount: 0,
  showNewBadge: true,
  showDotBadge: false
})

const emit = defineEmits<{
  (e: 'tab-change', tab: string): void
}>()

const handleTabClick = (tab: string) => {
  emit('tab-change', tab)
  switchTab(tab)
}
function switchTab(tab: string) {
  // activeTab.value = tab
  if (tab === 'home') {
        router.push('/')
    // stay on current page
  } else if (tab === 'priceList') {
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
</script>

<style scoped>
/* ===== 底部TabBar - 高级圆形设计 ===== */
.advanced-tabbar-wrapper {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  z-index: 100;
}

.tabbar {
  position: relative;
  width: 100%;
  height: 85px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.tabbar-item.active {
  color: #e64340;
}

.tabbar-item:not(.active) {
  color: #999;
}

.tab-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 4px;
  background-color: #e64340;
  border-radius: 0 0 2px 2px;
  opacity: 0;
}

.tabbar-item.active:not(.center-tab) .tab-indicator {
  opacity: 1;
}

.tabbar-icon {
  font-size: 22px;
  margin-bottom: 5px;
  position: relative;
}

.tabbar-item p {
  font-size: 11px;
  font-weight: 500;
  margin: 0;
}

.center-tab {
  margin-top: -30px;
}

.center-button-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 5px;
}

.center-button-outer {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(230, 67, 64, 0.15) 0%, transparent 70%);
  animation: pulse 2s infinite ease-in-out;
}

.center-button-main {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e64340, #ff4757);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 25px rgba(230, 67, 64, 0.4),
    0 5px 10px rgba(230, 67, 64, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.center-button-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 50% 50% 0 0;
}

.center-button-icon {
  font-size: 24px;
  position: relative;
  z-index: 2;
}

.center-tab.active .center-button-main {
  transform: translateY(-8px) scale(1.1);
  box-shadow: 
    0 15px 35px rgba(230, 67, 64, 0.5),
    0 8px 20px rgba(230, 67, 64, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.center-tab .center-text {
  margin-top: 8px;
  font-weight: 600;
  font-size: 12px;
  color: #e64340;
  position: relative;
}

.center-tab .center-text::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(to right, #e64340, #ff4757);
  border-radius: 1px;
  transition: width 0.3s ease;
}

.center-tab.active .center-text::before {
  width: 100%;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.center-badge {
  position: absolute;
  top: -2px;
  right: -4px;
  background: linear-gradient(135deg, #e64340, #ff4757);
  color: white;
  font-size: 9px;
  font-weight: bold;
  padding: 1px 5px;
  border-radius: 8px;
  z-index: 10;
}

.tab-badge {
  position: absolute;
  top: 8px;
  right: 50%;
  transform: translateX(20px);
  background: linear-gradient(135deg, #e64340, #ff4757);
  color: white;
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
  font-weight: 600;
  box-shadow: 0 3px 6px rgba(230, 67, 64, 0.3);
  z-index: 10;
}

.tab-badge.dot {
  min-width: 10px;
  width: 10px;
  height: 10px;
  padding: 0;
}

/* 适配安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .tabbar {
    padding-bottom: calc(6px + env(safe-area-inset-bottom));
  }
}
</style>
