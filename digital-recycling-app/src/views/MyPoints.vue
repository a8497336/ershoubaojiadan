<template>
  <div class="my-points-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">我的积分</div>
      <div class="nav-right"></div>
    </div>

    <!-- 积分余额卡片 -->
    <div class="points-card">
      <div class="points-label">积分余额</div>
      <div class="points-value">{{ totalPoints }}</div>
      <div class="points-actions">
        <div class="action-btn" @click="handleAction('earn')">
          <div class="action-icon">&#128176;</div>
          <div class="action-text">赚积分</div>
        </div>
        <div class="action-btn" @click="handleAction('use')">
          <div class="action-icon">&#127873;</div>
          <div class="action-text">积分商城</div>
        </div>
        <div class="action-btn" @click="handleAction('record')">
          <div class="action-icon">&#128203;</div>
          <div class="action-text">积分记录</div>
        </div>
      </div>
    </div>

    <!-- 积分明细 -->
    <div class="detail-section">
      <div class="section-header">
        <div class="section-title">积分明细</div>
        <div class="filter-tabs">
          <div 
            v-for="tab in filterTabs" 
            :key="tab.value"
            :class="['filter-tab', { active: activeFilter === tab.value }]"
            @click="activeFilter = tab.value"
          >
            {{ tab.label }}
          </div>
        </div>
      </div>
      
      <div class="detail-list">
        <div 
          v-for="(item, index) in filteredRecords" 
          :key="index"
          class="detail-item"
        >
          <div class="item-left">
            <div class="item-type">{{ item.type }}</div>
            <div class="item-time">{{ item.time }}</div>
          </div>
          <div class="item-right" :class="{ income: item.amount > 0, expense: item.amount < 0 }">
            {{ item.amount > 0 ? '+' : '' }}{{ item.amount }}
          </div>
        </div>
      </div>
    </div>

    <!-- 积分规则 -->
    <div class="rules-section">
      <div class="rules-title">&#128161; 积分规则</div>
      <div class="rules-list">
        <div class="rule-item">1. 每日签到可获得10积分</div>
        <div class="rule-item">2. 完成回收订单可获得订单金额10%的积分</div>
        <div class="rule-item">3. 邀请好友注册可获得50积分</div>
        <div class="rule-item">4. 积分可用于兑换会员、礼品或抵扣现金</div>
        <div class="rule-item">5. 积分有效期为获得之日起12个月</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pointsApi } from '../api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const totalPoints = ref(0)
const activeFilter = ref('all')
const signing = ref(false)

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' },
]

const records = ref<any[]>([])

const fetchPointsData = async () => {
  try {
    const [balanceRes, logsRes]: any[] = await Promise.all([
      pointsApi.getBalance(),
      pointsApi.getLogs(),
    ])
    totalPoints.value = balanceRes.data?.points || 0
    records.value = (logsRes.data?.list || logsRes.data || []).map((item: any) => ({
      type: item.type || item.desc || item.description,
      time: item.time || item.created_at,
      amount: item.amount || item.change || 0,
    }))
  } catch (e) {
    // ignore
  }
}

const handleSignIn = async () => {
  if (signing.value) return
  signing.value = true
  try {
    await pointsApi.sign()
    alert('签到成功，获得10积分')
    await fetchPointsData()
    userStore.fetchPoints()
  } catch (e: any) {
    alert(e.message || '签到失败')
  } finally {
    signing.value = false
  }
}

const filteredRecords = computed(() => {
  if (activeFilter.value === 'all') return records.value
  if (activeFilter.value === 'income') return records.value.filter(r => r.amount > 0)
  if (activeFilter.value === 'expense') return records.value.filter(r => r.amount < 0)
  return records.value
})

const handleAction = (type: string) => {
  if (type === 'earn') {
    handleSignIn()
  } else if (type === 'use') {
    alert('积分商城功能即将上线')
  } else if (type === 'record') {
    activeFilter.value = 'all'
  }
}

onMounted(() => {
  fetchPointsData()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.my-points-page {
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

/* 积分卡片 */
.points-card {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  padding: 30px 20px 20px;
  text-align: center;
  color: #fff;
}

.points-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.points-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.points-actions {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px 0;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.action-icon {
  font-size: 24px;
}

.action-text {
  font-size: 12px;
}

/* 积分明细 */
.detail-section {
  background: #fff;
  margin-top: 10px;
}

.section-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
}

.filter-tab {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background: #ff4d4f;
  color: #fff;
}

.detail-list {
  padding: 0 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-left {
  flex: 1;
}

.item-type {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.item-time {
  font-size: 12px;
  color: #999;
}

.item-right {
  font-size: 16px;
  font-weight: 600;
}

.item-right.income {
  color: #ff4d4f;
}

.item-right.expense {
  color: #333;
}

/* 积分规则 */
.rules-section {
  background: #fff;
  margin-top: 10px;
  padding: 16px;
}

.rules-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 375px) {
  .points-value {
    font-size: 40px;
  }
  
  .points-actions {
    padding: 12px 0;
  }
  
  .action-icon {
    font-size: 20px;
  }
  
  .action-text {
    font-size: 11px;
  }
}

@media (max-width: 320px) {
  .points-value {
    font-size: 36px;
  }
  
  .points-card {
    padding: 20px 16px 16px;
  }
  
  .filter-tab {
    padding: 5px 12px;
    font-size: 12px;
  }
  
  .item-type {
    font-size: 13px;
  }
  
  .item-right {
    font-size: 14px;
  }
}
</style>
