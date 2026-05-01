<template>
  <div class="price-quote-page">
    <nav class="navbar">
      <div class="nav-back" @click="router.back()">&#8249;</div>
      <div class="nav-title">数码回收网</div>
      <div class="nav-actions">
        <span>&#8942;</span>
        <span>&#8722;</span>
        <span>&#9673;</span>
      </div>
    </nav>

    <div class="header-section">
      <div class="header-meta">
        <span>浏览量：{{ quoteConfig.view_count || '61954098' }}</span>
        <span>更新时间：{{ currentTime }}</span>
      </div>
      <div class="header-title">{{ quoteConfig.page_title || '今日手机回收报价' }}</div>
      <div class="header-info">
        <div>收货地址：{{ quoteConfig.receiver_address || '广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B' }}</div>
        <div>收件人：{{ quoteConfig.receiver_name || '陈约' }}</div>
        <div>收款电话：{{ quoteConfig.receiver_phone || '15361862828' }}（微信同号同步）</div>
      </div>
      <div class="header-rules">
        <p><strong>回收标准释义：</strong></p>
        <template v-if="Array.isArray(quoteConfig.rules)">
          <p v-for="(rule, idx) in quoteConfig.rules" :key="idx">{{ rule }}</p>
        </template>
        <template v-else>
          <p>开机进系统/屏好/屏坏/不开机/废板 等机况定义说明...</p>
          <p>具体以实际检测为准，价格仅供参考</p>
        </template>
      </div>
    </div>

    <template v-if="!isEmpty">
      <div class="scroll-hint">&#8592; 左右滑动查看完整报价 &#8594;</div>
      <div class="table-container">
        <table class="price-table">
          <thead>
            <tr>
              <th class="col-index">序号</th>
              <th class="col-series">折叠系列</th>
              <th class="col-model">网络型号</th>
              <th v-for="(cond, cIdx) in conditionHeaders" :key="cIdx" class="col-price">{{ cond.name }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(series, sIndex) in seriesList" :key="sIndex">
              <template v-for="(item, iIndex) in series.items" :key="iIndex">
                <tr v-if="iIndex === 0" :class="{ 'series-divider': sIndex > 0 }">
                  <td class="index-cell" :rowspan="series.items.length">{{ series.index }}</td>
                  <td class="series-cell" :rowspan="series.items.length">{{ series.name }}</td>
                  <td class="model-cell">{{ item.model }}</td>
                  <td v-for="(pv, pIdx) in item.prices" :key="pIdx" :class="pv.cls">{{ pv.val }}</td>
                </tr>
                <tr v-else>
                  <td class="model-cell">{{ item.model }}</td>
                  <td v-for="(pv, pIdx) in item.prices" :key="pIdx" :class="pv.cls">{{ pv.val }}</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <!-- 空状态 -->
    <template v-else>
      <EmptyState
        icon="📋"
        title="暂无报价数据"
        description="该品牌暂无报价信息"
      />
    </template>

    <div class="footer-note">
      <p><strong>备注说明：</strong></p>
      <template v-if="Array.isArray(quoteConfig.footer_notes) && quoteConfig.footer_notes.length > 0">
        <p v-for="(note, idx) in quoteConfig.footer_notes" :key="idx">{{ Number(idx) + 1 }}. {{ note }}</p>
      </template>
      <template v-else>
        <p>1. 以上报价为当日回收参考价，实际价格以到货检测为准</p>
        <p>2. 绿色价格为高价回收，蓝色为中价，紫色为低价</p>
        <p>3. "/" 表示该机型此状态暂不回收或无报价</p>
        <p>4. 废板整机指主板损坏无法开机的完整机器</p>
        <p>5. 价格随市场行情波动，请以实际交易为准</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import EmptyState from '../components/EmptyState.vue'
import { brandApi, productApi, priceApi, settingsApi } from '../api'

const router = useRouter()
const route = useRoute()

const currentTime = ref(new Date().toLocaleString('zh-CN'))
const loading = ref(false)
const brandName = ref('')
const quoteConfig = ref<any>({})

interface PriceVal {
  val: string
  cls: string
}

interface PriceItem {
  model: string
  prices: PriceVal[]
}

interface Series {
  index: number
  name: string
  items: PriceItem[]
}

const seriesList = ref<Series[]>([])
const conditionHeaders = ref<any[]>([])

const isEmpty = computed(() => seriesList.value.length === 0)

function getPriceClass(price: string | number): string {
  const p = Number(price)
  if (!p || p === 0) return 'price-none'
  if (p >= 1000) return 'price-high'
  if (p >= 500) return 'price-mid'
  if (p >= 100) return 'price-normal'
  return 'price-low'
}

function formatPrice(price: string | number): string {
  const p = Number(price)
  if (!p || p === 0) return '/'
  return String(p)
}

async function fetchPriceData() {
  loading.value = true
  try {
    try {
      const settingsRes: any = await settingsApi.getQuoteConfig()
      if (settingsRes.data) {
        quoteConfig.value = { ...quoteConfig.value, ...settingsRes.data }
      }
    } catch (e) { /* ignore */ }

    const brandId = route.params.brandId
    if (brandId && brandId !== '0') {
      const brandRes: any = await brandApi.getDetail(Number(brandId))
      brandName.value = brandRes.data?.name || '手机'
      if (brandRes.data?.quote_config) {
        quoteConfig.value = brandRes.data.quote_config
      }
    }

    const params: any = {}
    if (brandId && brandId !== '0') params.brand_id = Number(brandId)

    const productRes: any = await priceApi.getToday(params)
    const products = productRes.data?.list || []

    if (products.length === 0) {
      seriesList.value = []
      return
    }

    const conditionsRes: any = await priceApi.getConditions()
    const conditions = conditionsRes.data || []
    conditionHeaders.value = conditions

    const grouped: Record<string, any[]> = {}
    products.forEach((p: any) => {
      const seriesName = p.series_name || p.Brand?.name || p.name
      if (!grouped[seriesName]) grouped[seriesName] = []
      grouped[seriesName].push(p)
    })

    const result: Series[] = []
    let idx = 1
    for (const [name, prods] of Object.entries(grouped)) {
      const items: PriceItem[] = []
      for (const prod of prods) {
        const priceMap: Record<number, string> = {}
        if (prod.Prices) {
          prod.Prices.forEach((pr: any) => {
            priceMap[pr.condition_id || pr.conditionId] = String(pr.price || 0)
          })
        }

        const prices: PriceVal[] = conditions.map((c: any) => {
          const val = priceMap[c.id] || '0'
          return { val: formatPrice(val), cls: getPriceClass(val) }
        })

        items.push({
          model: prod.model_code || prod.name,
          prices
        })
      }
      result.push({ index: idx++, name, items })
    }
    seriesList.value = result
  } catch (e) {
    seriesList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPriceData()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.price-quote-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f5f5;
  font-size: 12px;
  color: #333;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background-color: #fff;
  padding: 0 15px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
}

.nav-back {
  font-size: 20px;
  color: #333;
  width: 30px;
  cursor: pointer;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.nav-actions {
  display: flex;
  gap: 12px;
  font-size: 18px;
  color: #333;
}

.header-section {
  background: linear-gradient(135deg, #c0392b 0%, #e74c3c 100%);
  color: #fff;
  padding: 12px 15px;
}

.header-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.header-info {
  font-size: 10px;
  line-height: 1.6;
  opacity: 0.95;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.header-rules {
  font-size: 9px;
  line-height: 1.5;
  opacity: 0.9;
  max-height: 80px;
  overflow-y: auto;
}

.header-rules p {
  margin-bottom: 2px;
}

.scroll-hint {
  text-align: center;
  padding: 5px;
  font-size: 10px;
  color: #999;
  background-color: #f9f9f9;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
}

.price-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  font-size: 11px;
}

.price-table thead th {
  background-color: #c0392b;
  color: #fff;
  padding: 10px 6px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #a93226;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
}

.col-index {
  width: 30px;
  min-width: 30px;
}

.col-series {
  width: 80px;
  min-width: 80px;
}

.col-model {
  width: 70px;
  min-width: 70px;
}

.col-price {
  width: 55px;
  min-width: 55px;
}

.price-table tbody td {
  padding: 8px 4px;
  text-align: center;
  border: 1px solid #ddd;
  vertical-align: middle;
}

.series-cell {
  background-color: #fdf2f2;
  font-weight: 600;
  color: #c0392b;
  font-size: 10px;
}

.index-cell {
  background-color: #c0392b;
  color: #fff;
  font-weight: bold;
}

.model-cell {
  font-weight: 500;
  color: #333;
  font-size: 10px;
}

.price-high {
  color: #27ae60;
  font-weight: bold;
  font-size: 12px;
}

.price-mid {
  color: #2980b9;
  font-weight: bold;
  font-size: 12px;
}

.price-low {
  color: #8e44ad;
  font-weight: bold;
  font-size: 12px;
}

.price-normal {
  color: #333;
  font-size: 11px;
}

.price-none {
  color: #999;
}

.series-divider td {
  border-top: 2px solid #c0392b;
}

.footer-note {
  padding: 15px;
  font-size: 10px;
  color: #666;
  line-height: 1.6;
  background-color: #fff;
  margin-top: 10px;
}
</style>
