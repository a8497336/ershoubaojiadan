<template>
  <div class="price-trend-container">
    <nav class="navbar">
      <div class="nav-back" @click="goBack"></div>
      <div class="nav-title">价格趋势</div>
      <div class="nav-right"></div>
    </nav>

    <div class="page-content" v-if="!loading">
      <div class="product-header" v-if="trendData && trendData.trendData && trendData.trendData.length > 0">
        <div class="product-brand">{{ trendData.product?.Brand?.name || '' }}</div>
        <div class="product-model">{{ modelName }}</div>
        <div class="price-summary">
          <div class="price-range">
            <span class="price-label">最高价</span>
            <span class="price-value high">¥{{ trendData.summary?.maxPrice != null ? trendData.summary.maxPrice : '--' }}</span>
          </div>
          <div class="price-divider"></div>
          <div class="price-range">
            <span class="price-label">最低价</span>
            <span class="price-value low">¥{{ trendData.summary?.minPrice != null ? trendData.summary.minPrice : '--' }}</span>
          </div>
        </div>
        <div class="price-change" v-if="trendData.summary">
          <span class="change-label">较昨日</span>
          <span :class="['change-value', priceChangeClass]">
            {{ priceChangeText }}
          </span>
        </div>
      </div>

      <div class="time-selector" v-if="trendData && trendData.trendData && trendData.trendData.length > 0">
        <div
          v-for="opt in timeOptions"
          :key="opt.value"
          :class="['time-option', { active: activeTime === opt.value }]"
          @click="selectTime(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>

      <div class="chart-section" v-if="chartLines.length > 0">
        <div class="chart-wrapper">
          <svg class="chart-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="xMidYMid meet">
            <line
              v-for="i in 5"
              :key="'grid-' + i"
              :x1="chartPaddingLeft"
              :y1="chartPaddingTop + (i - 1) * gridStepY"
              :x2="chartWidth - chartPaddingRight"
              :y2="chartPaddingTop + (i - 1) * gridStepY"
              stroke="#f0f0f0"
              stroke-width="1"
            />
            <text
              v-for="(label, idx) in yAxisLabels"
              :key="'y-' + idx"
              :x="chartPaddingLeft - 8"
              :y="label.y + 4"
              text-anchor="end"
              fill="#999"
              font-size="10"
            >{{ label.text }}</text>
            <text
              v-for="(label, idx) in xAxisLabels"
              :key="'x-' + idx"
              :x="label.x"
              :y="chartHeight - 4"
              text-anchor="middle"
              fill="#999"
              font-size="10"
            >{{ label.text }}</text>
            <template v-for="(line, lineIdx) in chartLines" :key="'line-' + lineIdx">
              <polyline
                :points="line.points"
                fill="none"
                :stroke="lineColors[lineIdx % lineColors.length]"
                stroke-width="2"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <circle
                v-for="(pt, ptIdx) in line.dots"
                :key="'dot-' + lineIdx + '-' + ptIdx"
                :cx="pt.x"
                :cy="pt.y"
                r="3"
                :fill="lineColors[lineIdx % lineColors.length]"
              />
            </template>
          </svg>
        </div>
        <div class="chart-legend" v-if="chartLines.length > 1">
          <div
            v-for="(line, idx) in chartLines"
            :key="'legend-' + idx"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: lineColors[idx % lineColors.length] }"></span>
            <span class="legend-text">{{ line.name }}</span>
          </div>
        </div>
      </div>

      <div class="empty-chart" v-else-if="!loading">
        <div class="empty-icon">📊</div>
        <div class="empty-text">暂无价格趋势数据</div>
      </div>

      <div class="condition-list" v-if="trendData?.currentPrices?.length">
        <div class="section-title">各成色当前价格</div>
        <div
          v-for="(item, idx) in trendData.currentPrices"
          :key="idx"
          class="condition-item"
        >
          <div class="condition-name">{{ item.Condition?.name || '默认' }}</div>
          <div class="condition-price">¥{{ item.price }}</div>
        </div>
      </div>

      <div class="bottom-actions" v-if="trendData && trendData.trendData && trendData.trendData.length > 0">
        <button class="btn btn-outline" @click="addToStock">加入压货</button>
        <button class="btn btn-primary" @click="goRecycle">立即回收</button>
      </div>
    </div>

    <div class="loading-state" v-else>
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <transition name="toast">
      <div class="toast" v-if="toastVisible">{{ toastMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { priceApi } from '../api'
import { useCartStore } from '../stores/cart'
import { userStockApi } from '../api'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

const loading = ref(false)
const trendData = ref<any>(null)
const activeTime = ref(7)
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

const lineColors = ['#ff2442', '#ff9800', '#4caf50', '#2196f3', '#9c27b0']

const timeOptions = [
  { label: '7天', value: 7 },
  { label: '15天', value: 15 },
  { label: '30天', value: 30 },
]

const productId = computed(() => Number(route.params.productId))
const modelName = computed(() => decodeURIComponent((route.query.model as string) || ''))

const priceChangeClass = computed(() => {
  const change = trendData.value?.summary?.priceChange
  if (change > 0) return 'up'
  if (change < 0) return 'down'
  return 'flat'
})

const priceChangeText = computed(() => {
  const summary = trendData.value?.summary
  if (!summary) return '--'
  const change = summary.priceChange || 0
  const percent = summary.priceChangePercent || 0
  if (change > 0) return `+¥${change} (+${percent}%)`
  if (change < 0) return `-¥${Math.abs(change)} (${percent}%)`
  return '持平'
})

const chartWidth = 350
const chartHeight = 200
const chartPaddingLeft = 45
const chartPaddingRight = 15
const chartPaddingTop = 15
const chartPaddingBottom = 25
const gridStepY = (chartHeight - chartPaddingTop - chartPaddingBottom) / 4

const chartLines = computed(() => {
  if (!trendData.value?.trendData?.length) return []

  const allPrices: number[] = []
  trendData.value.trendData.forEach((line: any) => {
    (line.data || []).forEach((d: any) => {
      if (d.price != null) allPrices.push(d.price)
    })
  })
  if (allPrices.length === 0) return []

  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  const range = maxP - minP || 1
  const drawWidth = chartWidth - chartPaddingLeft - chartPaddingRight
  const drawHeight = chartHeight - chartPaddingTop - chartPaddingBottom

  return trendData.value.trendData.map((line: any) => {
    const data = line.data || []
    const count = data.length
    const points = data.map((d: any, i: number) => {
      const x = count <= 1 ? chartPaddingLeft + drawWidth / 2 : chartPaddingLeft + (i / (count - 1)) * drawWidth
      const y = chartPaddingTop + drawHeight - ((d.price - minP) / range) * drawHeight
      return { x, y, price: d.price }
    })
    return {
      name: line.name || line.code || '',
      points: points.map(p => `${p.x},${p.y}`).join(' '),
      dots: points,
    }
  })
})

const yAxisLabels = computed(() => {
  if (!trendData.value?.trendData?.length) return []
  const allPrices: number[] = []
  trendData.value.trendData.forEach((line: any) => {
    (line.data || []).forEach((d: any) => {
      if (d.price != null) allPrices.push(d.price)
    })
  })
  if (allPrices.length === 0) return []
  const minP = Math.min(...allPrices)
  const maxP = Math.max(...allPrices)
  const range = maxP - minP || 1
  const drawHeight = chartHeight - chartPaddingTop - chartPaddingBottom
  const labels = []
  for (let i = 0; i < 5; i++) {
    const val = minP + (range * (4 - i)) / 4
    const y = chartPaddingTop + i * gridStepY
    labels.push({ text: Math.round(val), y })
  }
  return labels
})

const xAxisLabels = computed(() => {
  if (!trendData.value?.trendData?.length) return []
  const firstLine = trendData.value.trendData[0]
  const data = firstLine?.data || []
  if (data.length === 0) return []
  const drawWidth = chartWidth - chartPaddingLeft - chartPaddingRight
  const count = data.length
  const step = count <= 6 ? 1 : Math.ceil(count / 6)
  const labels = []
  for (let i = 0; i < count; i += step) {
    const x = count <= 1 ? chartPaddingLeft + drawWidth / 2 : chartPaddingLeft + (i / (count - 1)) * drawWidth
    const dateStr = data[i].date || ''
    const parts = dateStr.split('-')
    const text = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : dateStr
    labels.push({ x, text })
  }
  return labels
})

function goBack() {
  router.back()
}

async function fetchTrend() {
  if (!productId.value) return
  loading.value = true
  try {
    const res: any = await priceApi.getTrend(productId.value, { days: activeTime.value })
    trendData.value = res.data || null
  } catch (e) {
    showToast('获取价格趋势失败')
  } finally {
    loading.value = false
  }
}

function selectTime(days: number) {
  activeTime.value = days
  fetchTrend()
}

async function addToStock() {
  if (!productId.value) return
  try {
    await userStockApi.addItem({ product_id: productId.value })
    showToast('已加入压货')
  } catch (e) {
    showToast('加入压货失败')
  }
}

function goRecycle() {
  router.push('/brand-list')
}

function showToast(message: string) {
  if (toastTimer) { clearTimeout(toastTimer) }
  toastMessage.value = message
  toastVisible.value = true
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    toastTimer = null
  }, 2000)
}

onMounted(() => {
  fetchTrend()
})
</script>

<style scoped>
.price-trend-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.nav-back {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back::after {
  content: '';
  width: 10px;
  height: 10px;
  border-left: 2px solid #333;
  border-bottom: 2px solid #333;
  transform: rotate(45deg);
}

.nav-title {
  font-size: 17px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-right {
  width: 24px;
}

.page-content {
  padding-top: 44px;
  padding-bottom: 80px;
}

.product-header {
  background: #fff;
  padding: 20px 15px;
  margin-bottom: 10px;
}

.product-brand {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.product-model {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.price-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-label {
  font-size: 12px;
  color: #999;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
}

.price-value.high {
  color: #ff2442;
}

.price-value.low {
  color: #4caf50;
}

.price-divider {
  width: 1px;
  height: 36px;
  background: #eee;
}

.price-change {
  display: flex;
  align-items: center;
  gap: 6px;
}

.change-label {
  font-size: 13px;
  color: #999;
}

.change-value {
  font-size: 14px;
  font-weight: 600;
}

.change-value.up {
  color: #ff2442;
}

.change-value.down {
  color: #4caf50;
}

.change-value.flat {
  color: #999;
}

.time-selector {
  background: #fff;
  display: flex;
  padding: 12px 15px;
  gap: 10px;
  margin-bottom: 10px;
}

.time-option {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-option.active {
  background: #ff2442;
  color: #fff;
  font-weight: 500;
}

.chart-section {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.chart-wrapper {
  width: 100%;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

.empty-chart {
  background: #fff;
  padding: 60px 15px;
  text-align: center;
  margin-bottom: 10px;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.condition-list {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 14px;
  background: #ff2442;
  border-radius: 2px;
}

.condition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.condition-item:last-child {
  border-bottom: none;
}

.condition-name {
  font-size: 14px;
  color: #333;
}

.condition-price {
  font-size: 16px;
  color: #ff2442;
  font-weight: 600;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 10px;
  padding: 10px 15px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  z-index: 90;
}

.btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-outline {
  background: #fff;
  color: #ff2442;
  border: 1px solid #ff2442;
}

.btn-primary {
  background: #ff2442;
  color: #fff;
}

.loading-state {
  padding-top: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
}

.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -40%);
}

.toast-enter-to {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.toast-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -40%);
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-actions {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
}
</style>
