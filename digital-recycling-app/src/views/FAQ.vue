<template>
  <div class="faq-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">常见问题</div>
      <div class="nav-right"></div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-box">
        <span class="search-icon">&#128269;</span>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索问题关键词..."
        >
      </div>
    </div>

    <!-- 分类Tab -->
    <div class="category-tabs">
      <div 
        v-for="cat in categories" 
        :key="cat.value"
        :class="['category-tab', { active: activeCategory === cat.value }]"
        @click="activeCategory = cat.value"
      >
        {{ cat.label }}
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="faq-list">
      <div 
        v-for="(item, index) in filteredFAQs" 
        :key="index"
        class="faq-item"
      >
        <div class="faq-question" @click="toggleItem(index)">
          <div class="q-mark">Q</div>
          <div class="question-text">{{ item.question }}</div>
          <div class="expand-icon" :class="{ expanded: item.isExpanded }">&#9662;</div>
        </div>
        <div v-if="item.isExpanded" class="faq-answer">
          <div class="a-mark">A</div>
          <div class="answer-text">{{ item.answer }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredFAQs.length === 0" class="empty-state">
      <div class="empty-icon">&#128172;</div>
      <div class="empty-text">未找到相关问题</div>
      <div class="empty-sub">请尝试其他关键词</div>
    </div>

    <!-- 联系客服 -->
    <div class="contact-section">
      <div class="contact-text">没找到答案？联系客服获取帮助</div>
      <button class="contact-btn" @click="contactService">联系客服</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref('')
const activeCategory = ref('all')

const categories = [
  { label: '全部', value: 'all' },
  { label: '回收相关', value: 'recycling' },
  { label: '账户相关', value: 'account' },
  { label: '积分相关', value: 'points' },
  { label: '会员相关', value: 'membership' },
]

interface FAQItem {
  category: string
  question: string
  answer: string
  isExpanded: boolean
}

const faqs = ref<FAQItem[]>([
  {
    category: 'recycling',
    question: '如何查询我的设备回收价格？',
    answer: '您可以在首页点击"快速查价"或在报价单中选择对应的品牌和型号，系统会显示该设备不同成色的回收价格。报价每日更新，确保您获得最新的回收价格。',
    isExpanded: false,
  },
  {
    category: 'recycling',
    question: '回收流程是怎样的？',
    answer: '回收流程分为4步：1.查询报价 2.提交订单 3.发货邮寄 4.检测收款。您可以在"回收流程"页面查看详细的步骤说明。',
    isExpanded: false,
  },
  {
    category: 'recycling',
    question: '发货后多久能收到款项？',
    answer: '我们收到设备后会在24小时内完成检测，检测完成后会发送最终报价给您确认。确认报价后，款项将在1-3个工作日内到账。',
    isExpanded: false,
  },
  {
    category: 'recycling',
    question: '设备成色如何判定？',
    answer: '设备成色分为：开机屏好、开机大屏好、开机小屏好、开机屏坏、不开机、废板-整机等。具体判定标准请参考报价单中的等级说明。',
    isExpanded: false,
  },
  {
    category: 'account',
    question: '如何修改个人信息？',
    answer: '您可以在"我的"页面点击头像或用户编号进入个人信息页面，修改您的昵称、头像等信息。',
    isExpanded: false,
  },
  {
    category: 'account',
    question: '忘记密码怎么办？',
    answer: '由于我们使用微信授权登录，无需密码。如果您遇到登录问题，请尝试重新授权或联系客服。',
    isExpanded: false,
  },
  {
    category: 'points',
    question: '如何获得积分？',
    answer: '您可以通过以下方式获得积分：每日签到（10积分）、完成回收订单（订单金额10%）、邀请好友注册（50积分/人）、参与活动等。',
    isExpanded: false,
  },
  {
    category: 'points',
    question: '积分有什么用途？',
    answer: '积分可用于：兑换会员服务、在积分商城兑换礼品、参与积分抽奖、抵扣现金等。积分有效期为获得之日起12个月。',
    isExpanded: false,
  },
  {
    category: 'membership',
    question: '会员有什么特权？',
    answer: '会员可享受以下特权：免费无限次查看报价、行情抢先知道、拍照查价不限次、专属收藏报价单、报价短信通知、专属VIP服务等。',
    isExpanded: false,
  },
  {
    category: 'membership',
    question: '如何开通会员？',
    answer: '您可以在"我的"页面点击VIP卡片，或在"会员中心"选择适合您的套餐进行购买。支持月度、季度、半年、一年、两年、三年等多种套餐。',
    isExpanded: false,
  },
])

const filteredFAQs = computed(() => {
  let result = faqs.value

  // 按分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(item => item.category === activeCategory.value)
  }

  // 按搜索关键词筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    )
  }

  return result
})

const toggleItem = (index: number) => {
  const item = filteredFAQs.value[index]
  if (item) {
    item.isExpanded = !item.isExpanded
  }
}

const contactService = () => {
  alert('客服电话：16618180111')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.faq-page {
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

/* 搜索栏 */
.search-section {
  background: #fff;
  padding: 12px 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 14px;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
  color: #999;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-box input::placeholder {
  color: #999;
}

/* 分类Tab */
.category-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.category-tab {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-tab.active {
  background: #ff4d4f;
  color: #fff;
}

/* FAQ列表 */
.faq-list {
  padding: 12px;
}

.faq-item {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
}

.q-mark {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.question-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.expand-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  display: flex;
  gap: 10px;
  padding: 0 16px 14px;
  border-top: 1px solid #f5f5f5;
  margin-top: 0;
  padding-top: 14px;
}

.a-mark {
  width: 24px;
  height: 24px;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.answer-text {
  flex: 1;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: #999;
  margin-bottom: 4px;
}

.empty-sub {
  font-size: 13px;
  color: #ccc;
}

/* 联系客服 */
.contact-section {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.contact-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.contact-btn {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  border: none;
  padding: 10px 32px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 375px) {
  .faq-question {
    padding: 12px 14px;
  }
  
  .question-text {
    font-size: 13px;
  }
  
  .answer-text {
    font-size: 12px;
  }
}

@media (max-width: 320px) {
  .category-tab {
    padding: 5px 12px;
    font-size: 12px;
  }
  
  .faq-question {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .q-mark,
  .a-mark {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
  
  .question-text {
    font-size: 12px;
  }
  
  .answer-text {
    font-size: 11px;
  }
}
</style>
