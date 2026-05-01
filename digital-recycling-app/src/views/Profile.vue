<template>
  <div class="profile-page">
    <!-- 顶部红色背景区 -->
    <div class="header-bg">
      <!-- 导航栏 -->
      <div class="nav-bar">
        <div class="nav-left">
          <div class="nav-btn">···</div>
        </div>
        <div class="nav-title">个人中心</div>
        <div class="nav-right">
          <div class="nav-btn">−</div>
          <div class="nav-btn">○</div>
        </div>
      </div>
      
      <!-- 用户信息 -->
      <div class="user-info">
        <div class="avatar-wrap">
          <div class="avatar">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div class="change-avatar">更换头像</div>
        </div>
        <div class="user-detail">
          <div class="user-id">
            用户编号：{{ userInfo.userId }}
            <div class="user-actions">
              <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </div>
          </div>
          <div class="user-phone">{{ userInfo.phone }}</div>
          <div class="user-points">积分:{{ userInfo.points }}</div>
        </div>
      </div>
      
      <!-- VIP卡片 -->
      <div class="vip-card">
        <div class="vip-left">
          <div class="vip-icon">👑</div>
          <div class="vip-text">
            <h3>报价VIP</h3>
            <p>开通VIP会员，享更多专属特权！</p>
          </div>
        </div>
        <button class="vip-btn" @click="handleVipOpen">立即开通 ></button>
      </div>
      
      <!-- <div class="wave-decoration"></div> -->
    </div>
    
    <!-- 快捷入口 -->
    <div class="quick-entry">
      <div class="entry-item" @click="handleEntryClick('wallet')">
        <div class="entry-icon orange">💰</div>
        <div class="entry-text">我的钱包</div>
      </div>
      <div class="entry-item" @click="handleEntryClick('coupons')">
        <div class="entry-icon yellow">🎫</div>
        <div class="entry-text">我的卡券</div>
      </div>
      <div class="entry-item" @click="handleEntryClick('redpackets')">
        <div class="entry-icon red">🧧</div>
        <div class="entry-text">我的红包</div>
      </div>
      <div class="entry-item" @click="handleEntryClick('announcement')">
        <div class="entry-icon blue">
          📢
          <span class="badge">{{ badgeCounts.announcement }}</span>
        </div>
        <div class="entry-text">公告中心</div>
      </div>
    </div>
    
    <!-- 我的订单 -->
    <!-- <div class="section">
      <div class="section-header">
        <div class="section-title">我的订单</div>
        <div class="section-more" @click="handleViewAll('orders')">查看全部订单 ></div>
      </div>
      <div class="grid-4">
        <div class="grid-item" @click="handleOrderStatus('ordered')">
          <div class="grid-icon">📦</div>
          <div class="grid-text">已下单</div>
        </div>
        <div class="grid-item" @click="handleOrderStatus('shipped')">
          <div class="grid-icon">🚚</div>
          <div class="grid-text">已发货</div>
        </div>
        <div class="grid-item" @click="handleOrderStatus('inspecting')">
          <div class="grid-icon">🔍</div>
          <div class="grid-text">质检中</div>
        </div>
        <div class="grid-item" @click="handleOrderStatus('pending')">
          <div class="grid-icon">⏳</div>
          <div class="grid-text">待确认</div>
        </div>
      </div>
    </div> -->
    
    <!-- 积分订单 -->
    <!-- <div class="section">
      <div class="section-header">
        <div class="section-title">积分订单</div>
        <div class="section-more" @click="handleViewAll('points-orders')">查看全部订单 ></div>
      </div>
      <div class="grid-4">
        <div class="grid-item" @click="handlePointsOrder('pending-receive')">
          <div class="grid-icon">📦</div>
          <div class="grid-text">待收货</div>
        </div>
        <div class="grid-item" @click="handlePointsOrder('received')">
          <div class="grid-icon">✅</div>
          <div class="grid-text">已收货</div>
        </div>
        <div class="grid-item" @click="handlePointsOrder('completed')">
          <div class="grid-icon">✅</div>
          <div class="grid-text">已完成</div>
        </div>
        <div class="grid-item" @click="handlePointsOrder('after-sale')">
          <div class="grid-icon">🔄</div>
          <div class="grid-text">售后</div>
        </div>
      </div>
    </div> -->
    
    <!-- 积分活动 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">积分活动</div>
      </div>
      <div class="grid-4">
        <div class="grid-item" @click="handlePointsActivity('my-points')">
          <div class="grid-icon">💰</div>
          <div class="grid-text">我的积分</div>
        </div>
        <div class="grid-item" @click="handlePointsActivity('lottery')">
          <div class="grid-icon">🎁</div>
          <div class="grid-text">积分抽奖</div>
        </div>
        <div class="grid-item" @click="handlePointsActivity('points-mall')">
          <div class="grid-icon">🏪</div>
          <div class="grid-text">积分商城</div>
        </div>
        <div class="grid-item" @click="handlePointsActivity('invite-friends')">
          <div class="grid-icon">👥</div>
          <div class="grid-text">邀请好友</div>
        </div>
      </div>
    </div>
    
    <!-- 常用功能 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">常用功能</div>
      </div>
      <div class="common-grid">
        <div class="grid-item" @click="handleCommonFeature('recycling-process')">
          <div class="grid-icon">♻️</div>
          <div class="grid-text">回收流程</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('purchase')">
          <div class="grid-icon">📥</div>
          <div class="grid-text">我要采购</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('mailing-address')">
          <div class="grid-icon">📮</div>
          <div class="grid-text">邮寄地址</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('feedback')">
          <div class="grid-icon">📝</div>
          <div class="grid-text">问题反馈</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('faq')">
          <div class="grid-icon">❓</div>
          <div class="grid-text">常见问题</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('feedback-result')">
          <div class="grid-icon">📋</div>
          <div class="grid-text">反馈结果</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('business-cooperation')">
          <div class="grid-icon">🤝</div>
          <div class="grid-text">商务合作</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('complaint')">
          <div class="grid-icon">📢</div>
          <div class="grid-text">投诉建议</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('ad-recording')">
          <div class="grid-icon">🎤</div>
          <div class="grid-text">广告录音</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('market-trend')">
          <div class="grid-icon">📈</div>
          <div class="grid-text">行情走势</div>
        </div>
        <div class="grid-item" @click="handleCommonFeature('recycling-video')">
          <div class="grid-icon">🎬</div>
          <div class="grid-text">回收教学视频</div>
        </div>
      </div>
    </div>
    
    <!-- 会员功能 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">会员功能</div>
      </div>
      <div class="grid-4">
        <div class="grid-item" @click="handleVipFeature('saved-quotes')">
          <div class="grid-icon">⭐</div>
          <div class="grid-text">收藏报价单</div>
        </div>
        <div class="grid-item" @click="handleVipFeature('quote-changes')">
          <div class="grid-icon">📝</div>
          <div class="grid-text">报价变动</div>
        </div>
        <div class="grid-item" @click="handleVipFeature('photo-check')">
          <div class="grid-icon">📷</div>
          <div class="grid-text">拍照查价</div>
        </div>
        <div class="grid-item" @click="handleVipFeature('sms-notify')">
          <div class="grid-icon">💬</div>
          <div class="grid-text">报价短信通知</div>
        </div>
      </div>
    </div>
    
    <!-- 底部联系栏 -->
    <div class="contact-bar">
      <div class="contact-item" @click="handleContact('wechat')">
        <span>💬</span> 添加微信
      </div>
      <div class="contact-item" @click="handleContact('phone')">
        <span>📞</span> 客服电话
      </div>
      <div class="contact-item" @click="handleContact('stores')">
        <span>🏪</span> 门店列表
      </div>
    </div>
    
    <div class="bottom-safe"></div>
    
    <!-- TabBar - 高级圆形设计 -->
    <AdvancedTabBar active-tab="profile" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdvancedTabBar from '@/components/AdvancedTabBar.vue'
import { useUserStore } from '../stores/user'
import { useCartStore } from '../stores/cart'
import { walletApi, pointsApi, messageApi } from '../api'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const userInfo = ref({
  userId: userStore.userInfo?.id || '',
  phone: userStore.userInfo?.phone || '',
  points: userStore.userInfo?.points || 0
})

const walletBalance = ref(0)
const badgeCounts = ref({ announcement: 0 })
const tabBadgeCount = ref(0)
const activeTab = ref('profile')

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
    try {
      const walletRes: any = await walletApi.getInfo()
      walletBalance.value = walletRes.data?.balance || 0
    } catch (e) { /* ignore */ }
    try {
      const pointsRes: any = await pointsApi.getBalance()
      userInfo.value.points = pointsRes.data?.points || 0
    } catch (e) { /* ignore */ }
    try {
      const msgRes: any = await messageApi.getUnreadCount()
      badgeCounts.value.announcement = msgRes.data?.count || 0
    } catch (e) { /* ignore */ }
    userInfo.value.userId = userStore.userInfo?.userId || ''
    userInfo.value.phone = userStore.userInfo?.phone || ''
  }
})

const handleTabNavigate = (tab: string) => {
  activeTab.value = tab
  const routeMap: Record<string, string> = {
    index: '/',
    priceList: '/',
    scanPrice: '/scan-price',
    cart: '/shopping',
    profile: '/profile'
  }
  const route = routeMap[tab]
  if (route) {
    router.push(route)
  }
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

const handleVipOpen = () => {
  router.push('/membership')
}

const handleEntryClick = (type: string) => {
  const routeMap: Record<string, string> = {
    'wallet': '/my-points',
    'coupons': '/my-points',
    'redpackets': '/my-points',
    'announcement': '/announcement',
  }
  const route = routeMap[type]
  if (route) {
    router.push(route)
  }
}

const handleViewAll = (type: string) => {
  console.log('查看全部:', type)
}

const handleOrderStatus = (status: string) => {
  console.log('订单状态:', status)
}

const handlePointsOrder = (type: string) => {
  console.log('积分订单:', type)
}

const handlePointsActivity = (type: string) => {
  const routeMap: Record<string, string> = {
    'my-points': '/my-points',
    'lottery': '/my-points',
    'points-mall': '/my-points',
    'invite-friends': '/invite-friends',
  }
  const route = routeMap[type]
  if (route) {
    router.push(route)
  }
}

const handleCommonFeature = (feature: string) => {
  const routeMap: Record<string, string> = {
    'recycling-process': '/recycling-process',
    'purchase': '/business-cooperation',
    'mailing-address': '/mailing-address',
    'feedback': '/feedback',
    'faq': '/faq',
    'feedback-result': '/feedback',
    'business-cooperation': '/business-cooperation',
    'complaint': '/feedback',
    'ad-recording': '/business-cooperation',
    'market-trend': '/faq',
    'recycling-video': '/video-list',
  }
  const route = routeMap[feature]
  if (route) {
    router.push(route)
  }
}

const handleVipFeature = (feature: string) => {
  const routeMap: Record<string, string> = {
    'saved-quotes': '/brand-list',
    'quote-changes': '/price-quote/0',
    'photo-check': '/scan-price',
    'sms-notify': '/announcement',
  }
  const route = routeMap[feature]
  if (route) {
    router.push(route)
  }
}

const handleContact = (type: string) => {
  if (type === 'wechat') {
    alert('客服微信：16618180111')
  } else if (type === 'phone') {
    alert('客服电话：16618180111')
  } else if (type === 'stores') {
    alert('门店列表功能即将上线')
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: #f5f5f5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 顶部红色背景区 */
.header-bg {
  background: linear-gradient(135deg, #ff4757 0%, #ff2e63 100%);
  padding: 10px 15px 20px;
  position: relative;
  overflow: hidden;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 16px;
  margin-bottom: 15px;
  padding-top: 5px;
}
.nav-left, .nav-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  background: rgba(255,255,255,0.1);
}
.nav-title {
  font-weight: 500;
  font-size: 17px;
}

/* 用户信息区 */
.user-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 2;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.3);
}
.avatar svg {
  width: 35px;
  height: 35px;
  fill: #999;
}
.change-avatar {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: #ff4757;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.user-detail {
  flex: 1;
  color: #fff;
}
.user-id {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-actions {
  display: flex;
  gap: 12px;
}
.action-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.user-phone {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
}
.user-points {
  font-size: 13px;
  color: #ffeaa7;
}

/* VIP卡片 */
.vip-card {
  background: linear-gradient(90deg, #2d3436 0%, #636e72 100%);
  border-radius: 12px;
  padding: 12px 15px;
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.vip-card::before {
  content: '';
  position: absolute;
  right: -20px;
  top: -20px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
}
.vip-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.vip-icon {
  font-size: 24px;
}
.vip-text h3 {
  color: #ffd700;
  font-size: 16px;
  font-style: italic;
  margin-bottom: 2px;
}
.vip-text p {
  color: #ddd;
  font-size: 11px;
}
.vip-btn {
  background: linear-gradient(90deg, #ffd700 0%, #ffaa00 100%);
  color: #333;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  z-index: 2;
}

/* 功能入口区 */
.quick-entry {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  margin-bottom: 10px;
}
.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  cursor: pointer;
}
.entry-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  position: relative;
}
.entry-icon.orange { background: #fff3e0; }
.entry-icon.yellow { background: #fff8e1; }
.entry-icon.red { background: #ffebee; }
.entry-icon.blue { background: #e3f2fd; }
.badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: #ff4757;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #fff;
}
.entry-text {
  font-size: 12px;
  color: #333;
}

/* 模块卡片 */
.section {
  background: #fff;
  margin-bottom: 10px;
  padding: 15px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.section-more {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

/* 网格布局 */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px 0;
}
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.grid-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.grid-text {
  font-size: 12px;
  color: #666;
}

/* 常用功能 - 2行4列 */
.common-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 0;
}

/* 底部联系栏 */
.contact-bar {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  margin-bottom: 10px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  padding: 0 20px;
  border-right: 1px solid #eee;
  cursor: pointer;
}
.contact-item:last-child {
  border-right: none;
}

/* 底部占位 */
.bottom-safe {
  height: 100px;
}

/* 装饰性波浪 */
.wave-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23f5f5f5' fill-opacity='1' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
  opacity: 0.3;
}
</style>
