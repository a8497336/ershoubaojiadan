<template>
  <div class="membership">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">‹</div>
      <div class="nav-title">会员中心</div>
      <div class="nav-capsule">
        <span>···</span>
        <span>−</span>
        <span>○</span>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">

      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-info">
          <div class="user-avatar">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div class="user-detail">
            <div class="user-name">
              微信用户
              <span class="wechat-icon">微</span>
            </div>
            <div class="user-status">暂未开通报价会员，开通立享更多特权！</div>
          </div>
        </div>
        <div class="income-bar">
          <div class="income-icon">💰</div>
          <span>李明开通月度报价会员 累计获得收益</span>
          <span class="income-num">10157</span>
          <span>元</span>
        </div>
      </div>

      <!-- 会员专属特权 -->
      <div class="privilege-section">
        <div class="section-title">会员专属特权</div>
        <div class="privilege-grid">
          <div class="privilege-item">
            <div class="privilege-icon">🏷️</div>
            <div class="privilege-text">免费查看报价</div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon">📈</div>
            <div class="privilege-text">行情抢先知道</div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon">📷</div>
            <div class="privilege-text">拍照查价不限次</div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon">⭐</div>
            <div class="privilege-text">专属收藏报价单</div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon">📱</div>
            <div class="privilege-text">报价短信通知</div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon">✅</div>
            <div class="privilege-text">专属VIP服务</div>
          </div>
        </div>
      </div>

      <!-- 选择会员套餐 -->
      <div class="plan-section">
        <div class="section-title">选择会员套餐</div>
        <div class="plan-list">
          <div 
            v-for="plan in plans" 
            :key="plan.key"
            :class="['plan-card', { active: selectedPlan.key === plan.key }]"
            @click="selectPlan(plan)"
          >
            <div v-if="selectedPlan.key === plan.key" class="check-mark"></div>
            <div class="plan-info">
              <div class="plan-name">{{ plan.name }}</div>
              <div class="plan-original">¥{{ plan.original }}</div>
            </div>
            <div class="plan-price-box">
              <div class="plan-price"><span class="plan-price-symbol">¥</span>{{ plan.price }}</div>
              <div class="plan-count">{{ plan.count }}人开通</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 规则说明 -->
      <div class="rules-section" ref="rulesSection">
        <div class="rules-header">规则说明</div>
        <div class="rules-subtitle">{{ selectedPlan.name }}</div>
        <div class="rule-item">1、会员免费无限次查看报价</div>
        <div class="rule-item">2、价格更新更及时、精准、更权威</div>
        <div class="rule-item">3、开通会员一手行情信息抢先知道</div>
        <div class="rule-item">4、拍照查价功能会员每日不限次数查询</div>
        <div class="rule-item">5、会员专属收藏报价单，常见机型添加到一起，收货更高效</div>
        <div class="rule-item">6、会员专属权益，报价变动功能，行情涨跌一目了然，更高价出货，赚的更多</div>
        <div class="rule-item">7、<span class="highlight">开通会员后不支持退款</span>，超多会员权益等你体验</div>
        <div class="rule-item">8、任何会员相关问题请联系: <span class="contact-num">16618180111</span>（微信同号）</div>
      </div>

    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="btn-text" @click="scrollToRules">会员说明</div>
      <button class="btn-primary" @click="buyNow">立即购买</button>
    </div>

    <!-- 右侧悬浮客服 -->
    <div class="float-service">
      <div class="service-item">
        <svg class="service-icon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <span>电话</span>
      </div>
      <div class="service-item">
        <svg class="service-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        <span>客服</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { membershipApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const rulesSection = ref<HTMLElement | null>(null)

interface Plan {
  key: string
  name: string
  price: number
  original: number
  count: number
  id?: number
}

const plans = ref<Plan[]>([
  { key: 'month', name: '月度会员权限', price: 39, original: 99, count: 63242 },
  { key: 'quarter', name: '季度会员权限', price: 79, original: 159, count: 6703 },
  { key: 'half', name: '半年会员权限', price: 110, original: 299, count: 3356 },
  { key: 'two-year', name: '两年会员权限', price: 199, original: 399, count: 11977 },
  { key: 'three-year', name: '三年会员权限', price: 299, original: 599, count: 1080 },
  { key: 'year', name: '一年会员权限', price: 119, original: 299, count: 38945 }
])

const selectedPlan = reactive<Plan>(plans.value[0])

const selectPlan = (plan: Plan) => {
  Object.assign(selectedPlan, plan)
}

const scrollToRules = () => {
  rulesSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const buyNow = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    await membershipApi.purchase(selectedPlan.id || 0)
    alert('购买成功！')
  } catch (e) {
    alert('购买失败，请重试')
  }
}

onMounted(async () => {
  try {
    const res: any = await membershipApi.getPlans()
    const planData = res.data?.list || res.data || []
    if (planData.length > 0) {
      plans.value = planData.map((p: any) => ({
        key: p.code || String(p.id),
        name: p.name,
        price: p.price,
        original: p.original_price || p.price * 2,
        count: p.purchase_count || 0,
        id: p.id
      }))
      Object.assign(selectedPlan, plans.value[0])
    }
  } catch (e) {
    // ignore
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.membership {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ===== 顶部导航栏 ===== */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 1000;
  color: #fff;
}

.nav-back {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-capsule {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 2px 8px;
  gap: 8px;
}

.nav-capsule span {
  font-size: 14px;
  cursor: pointer;
}

/* ===== 主内容区 ===== */
.main-content {
  padding-top: 44px;
  padding-bottom: 80px;
  background: linear-gradient(180deg, #ff4d4f 0%, #ff7875 120px, #f5f5f5 200px);
  min-height: 100vh;
}

/* ===== 用户信息卡片 ===== */
.user-card {
  margin: 12px 16px;
  background: linear-gradient(135deg, #f5e6c8 0%, #e6c88a 100%);
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 28px;
  height: 28px;
  fill: #999;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #8B4513;
  display: flex;
  align-items: center;
  gap: 4px;
}

.wechat-icon {
  width: 16px;
  height: 16px;
  background: #07C160;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
}

.user-status {
  font-size: 13px;
  color: #B8860B;
  margin-top: 4px;
}

/* 收益条 */
.income-bar {
  margin-top: 14px;
  background: rgba(255,255,255,0.6);
  border-radius: 20px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8B4513;
}

.income-icon {
  width: 20px;
  height: 20px;
  background: #FFD700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.income-num {
  color: #ff4d4f;
  font-weight: 700;
  font-size: 15px;
}

/* ===== 会员特权区 ===== */
.privilege-section {
  margin: 20px 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.privilege-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.privilege-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.privilege-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: linear-gradient(135deg, #ffe4b5 0%, #ffd700 100%);
  box-shadow: 0 2px 8px rgba(255,215,0,0.3);
}

.privilege-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* ===== 套餐选择区 ===== */
.plan-section {
  margin: 24px 16px 16px;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.plan-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.plan-card.active {
  background: linear-gradient(135deg, #fff8e7 0%, #fff0d4 100%);
  border-color: #e6a23c;
  box-shadow: 0 4px 12px rgba(230,162,60,0.15);
}

.plan-card:not(.active) {
  border: 1px solid #eee;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.plan-original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.plan-price-box {
  text-align: right;
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.plan-card.active .plan-price {
  color: #e6a23c;
}

.plan-price-symbol {
  font-size: 16px;
  margin-right: 2px;
}

.plan-count {
  font-size: 11px;
  color: #999;
  margin-top: 6px;
}

/* ===== 规则说明区 ===== */
.rules-section {
  margin: 20px 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.rules-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.rules-subtitle {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.rule-item {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  padding: 4px 0;
}

.rule-item .highlight {
  color: #ff4d4f;
  font-weight: 600;
}

.contact-num {
  color: #ff4d4f;
  font-weight: 600;
}

/* ===== 底部操作栏 ===== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  z-index: 1000;
}

.btn-text {
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  padding: 10px 8px;
  cursor: pointer;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #f5e6c8 0%, #e6c88a 100%);
  color: #8B4513;
  border: none;
  border-radius: 24px;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(230,162,60,0.3);
  transition: transform 0.2s;
}

.btn-primary:active {
  transform: scale(0.98);
}

/* ===== 右侧悬浮客服 ===== */
.float-service {
  position: fixed;
  right: 0;
  bottom: 120px;
  background: rgba(0,0,0,0.75);
  border-radius: 8px 0 0 8px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 999;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  padding: 4px;
}

.service-icon {
  width: 20px;
  height: 20px;
  fill: #fff;
}

/* ===== 选中标记 ===== */
.check-mark {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 24px 24px 0;
  border-color: transparent #e6a23c transparent transparent;
  border-top-right-radius: 10px;
}

.check-mark::after {
  content: '✓';
  position: absolute;
  top: 2px;
  right: -20px;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}
</style>
