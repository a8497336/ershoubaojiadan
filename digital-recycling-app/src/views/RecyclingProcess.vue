<template>
  <div class="recycling-process-page">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">回收流程</div>
      <div class="nav-right"></div>
    </div>

    <!-- 流程说明 -->
    <div class="process-intro">
      <div class="intro-title">简单4步，轻松回收</div>
      <div class="intro-desc">数码回收网为您提供便捷、安全、高效的回收服务</div>
    </div>

    <!-- 步骤时间线 -->
    <div class="timeline">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="timeline-item"
      >
        <div class="timeline-left">
          <div class="step-number">{{ index + 1 }}</div>
          <div v-if="index < steps.length - 1" class="timeline-line"></div>
        </div>
        <div class="timeline-content">
          <div class="step-card">
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-info">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
              <div class="step-tips">
                <div v-for="(tip, tipIndex) in step.tips" :key="tipIndex" class="tip-item">
                  &#10004; {{ tip }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 注意事项 -->
    <div class="notice-section">
      <div class="notice-title">&#9888; 注意事项</div>
      <div class="notice-list">
        <div class="notice-item">
          <div class="notice-dot"></div>
          <div class="notice-text">请确保设备已退出账号并清除个人数据</div>
        </div>
        <div class="notice-item">
          <div class="notice-dot"></div>
          <div class="notice-text">发货前请拍照留存，以便核对</div>
        </div>
        <div class="notice-item">
          <div class="notice-dot"></div>
          <div class="notice-text">建议使用顺丰快递，保价发货</div>
        </div>
        <div class="notice-item">
          <div class="notice-dot"></div>
          <div class="notice-text">收到货后我们将在24小时内完成检测</div>
        </div>
        <div class="notice-item">
          <div class="notice-dot"></div>
          <div class="notice-text">检测完成后将发送报价，确认后即时打款</div>
        </div>
      </div>
    </div>

    <!-- 联系客服 -->
    <div class="contact-section">
      <div class="contact-text">有任何疑问？联系客服获取帮助</div>
      <button class="contact-btn" @click="contactService">联系客服</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const steps = [
  {
    icon: '&#128269;',
    title: '查询报价',
    desc: '在报价单中查询您的设备型号，了解回收价格',
    tips: ['选择对应品牌和型号', '查看不同成色的回收价', '可收藏常用报价单方便查看'],
  },
  {
    icon: '&#128230;',
    title: '提交订单',
    desc: '确认回收价格后，填写信息提交回收订单',
    tips: ['填写设备数量和成色', '确认收货地址', '选择收款方式'],
  },
  {
    icon: '&#128666;',
    title: '发货邮寄',
    desc: '按照提供的地址将设备邮寄给我们',
    tips: ['建议使用顺丰快递', '保价发货更安全', '保留快递单号'],
  },
  {
    icon: '&#9989;',
    title: '检测收款',
    desc: '我们收到设备后检测并支付回收款项',
    tips: ['24小时内完成检测', '发送最终报价', '确认后即时打款'],
  },
]

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

.recycling-process-page {
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

/* 流程说明 */
.process-intro {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  padding: 24px 20px 30px;
  text-align: center;
  color: #fff;
}

.intro-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.intro-desc {
  font-size: 13px;
  opacity: 0.9;
}

/* 时间线 */
.timeline {
  padding: 20px 16px;
}

.timeline-item {
  display: flex;
  gap: 16px;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
  flex-shrink: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, #ff4d4f, #ffe0e0);
  margin: 4px 0;
}

.timeline-content {
  flex: 1;
  padding-bottom: 20px;
}

.step-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.step-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.step-tips {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  font-size: 12px;
  color: #999;
}

/* 注意事项 */
.notice-section {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.notice-title {
  font-size: 15px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 12px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff4d4f;
  margin-top: 6px;
  flex-shrink: 0;
}

.notice-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

/* 联系客服 */
.contact-section {
  background: #fff;
  margin: 0 16px 24px;
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
  padding: 12px 40px;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-btn:active {
  transform: scale(0.97);
}

@media (max-width: 375px) {
  .intro-title {
    font-size: 20px;
  }
  
  .step-icon {
    font-size: 28px;
  }
  
  .step-title {
    font-size: 15px;
  }
}

@media (max-width: 320px) {
  .intro-title {
    font-size: 18px;
  }
  
  .timeline {
    padding: 16px 12px;
  }
  
  .step-card {
    padding: 12px;
  }
  
  .step-icon {
    font-size: 24px;
  }
  
  .step-title {
    font-size: 14px;
  }
}
</style>
