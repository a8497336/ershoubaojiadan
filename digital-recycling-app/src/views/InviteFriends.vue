<template>
  <div class="invite-friends-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">邀请好友</div>
      <div class="nav-right"></div>
    </div>

    <!-- 邀请奖励卡片 -->
    <div class="reward-card">
      <div class="reward-title">邀请好友赚积分</div>
      <div class="reward-desc">每成功邀请1位好友，您和好友各得50积分</div>
      <div class="reward-stats">
        <div class="stat-item">
          <div class="stat-value">{{ invitedCount }}</div>
          <div class="stat-label">已邀请(人)</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ rewardPoints }}</div>
          <div class="stat-label">累计奖励(积分)</div>
        </div>
      </div>
    </div>

    <!-- 邀请码区域 -->
    <div class="code-section">
      <div class="code-label">我的邀请码</div>
      <div class="code-value">{{ inviteCode }}</div>
      <button class="copy-btn" @click="copyCode">
        <span v-if="!copied">&#128203; 复制邀请码</span>
        <span v-else>&#10004; 已复制</span>
      </button>
    </div>

    <!-- 分享方式 -->
    <div class="share-section">
      <div class="share-title">分享给好友</div>
      <div class="share-buttons">
        <div class="share-btn wechat" @click="share('wechat')">
          <div class="share-icon">&#128172;</div>
          <div class="share-text">微信好友</div>
        </div>
        <div class="share-btn moment" @click="share('moment')">
          <div class="share-icon">&#127758;</div>
          <div class="share-text">朋友圈</div>
        </div>
        <div class="share-btn link" @click="share('link')">
          <div class="share-icon">&#128279;</div>
          <div class="share-text">复制链接</div>
        </div>
      </div>
    </div>

    <!-- 邀请记录 -->
    <div class="record-section">
      <div class="record-header">
        <div class="record-title">邀请记录</div>
        <div class="record-count">共{{ invitedCount }}人</div>
      </div>
      <div class="record-list">
        <div 
          v-for="(item, index) in inviteRecords" 
          :key="index"
          class="record-item"
        >
          <div class="record-avatar">{{ item.name[0] }}</div>
          <div class="record-info">
            <div class="record-name">{{ item.name }}</div>
            <div class="record-time">{{ item.time }}</div>
          </div>
          <div class="record-reward">+{{ item.reward }}积分</div>
        </div>
      </div>
    </div>

    <!-- 规则说明 -->
    <div class="rules-section">
      <div class="rules-title">&#128161; 邀请规则</div>
      <div class="rules-list">
        <div class="rule-item">1. 好友通过您的邀请码注册，即算邀请成功</div>
        <div class="rule-item">2. 邀请成功后，您和好友各获得50积分奖励</div>
        <div class="rule-item">3. 积分可用于兑换会员、礼品或抵扣现金</div>
        <div class="rule-item">4. 严禁恶意刷量，一经发现将取消奖励资格</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const inviteCode = computed(() => userStore.userInfo?.inviteCode || userStore.userInfo?.invite_code || 'SHUMA2026')
const invitedCount = computed(() => userStore.userInfo?.invitedCount || userStore.userInfo?.invited_count || 0)
const rewardPoints = computed(() => invitedCount.value * 50)
const copied = ref(false)

const inviteRecords = ref<any[]>([])

const fetchInviteData = async () => {
  try {
    await userStore.fetchProfile()
  } catch (e) {
    // ignore
  }
}

const copyCode = () => {
  navigator.clipboard.writeText(inviteCode.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }).catch(() => {
    const input = document.createElement('input')
    input.value = inviteCode.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

const share = (type: string) => {
  if (type === 'wechat') {
    alert('请使用微信分享功能')
  } else if (type === 'moment') {
    alert('请使用朋友圈分享功能')
  } else if (type === 'link') {
    navigator.clipboard.writeText(`https://shuma.com/invite?code=${inviteCode.value}`).then(() => {
      alert('链接已复制到剪贴板')
    })
  }
}

onMounted(() => {
  fetchInviteData()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.invite-friends-page {
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

/* 奖励卡片 */
.reward-card {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  padding: 24px 20px;
  text-align: center;
  color: #fff;
}

.reward-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.reward-desc {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 20px;
}

.reward-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* 邀请码区域 */
.code-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.code-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.code-value {
  font-size: 36px;
  font-weight: 700;
  color: #ff4d4f;
  letter-spacing: 4px;
  margin-bottom: 16px;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border: none;
  padding: 10px 32px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:active {
  transform: scale(0.97);
}

/* 分享区域 */
.share-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.share-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.share-buttons {
  display: flex;
  justify-content: space-around;
}

.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.share-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.share-btn.wechat .share-icon {
  background: #e8f5e9;
}

.share-btn.moment .share-icon {
  background: #fff3e0;
}

.share-btn.link .share-icon {
  background: #e3f2fd;
}

.share-text {
  font-size: 12px;
  color: #666;
}

/* 邀请记录 */
.record-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.record-count {
  font-size: 13px;
  color: #999;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.record-info {
  flex: 1;
}

.record-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-reward {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 600;
}

/* 规则说明 */
.rules-section {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  gap: 8px;
}

.rule-item {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

@media (max-width: 375px) {
  .code-value {
    font-size: 32px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .share-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}

@media (max-width: 320px) {
  .code-value {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .reward-title {
    font-size: 18px;
  }
  
  .stat-value {
    font-size: 22px;
  }
  
  .share-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }
}
</style>
