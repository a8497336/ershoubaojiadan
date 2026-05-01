<template>
  <div class="statistics">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-radio-group v-model="userTrendDays" size="small" @change="loadUserTrend">
                <el-radio-button :value="7">7天</el-radio-button>
                <el-radio-button :value="30">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="userChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <el-radio-group v-model="orderTrendDays" size="small" @change="loadOrderTrend">
                <el-radio-button :value="7">7天</el-radio-button>
                <el-radio-button :value="30">30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="orderChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>品类分布</span></template>
          <div ref="categoryChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span>品牌回收排行</span></template>
          <div ref="brandChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getUserTrend, getOrderTrend, getCategoryDistribution, getBrandRanking } from '@/api'
import * as echarts from 'echarts'

const userTrendDays = ref(30)
const orderTrendDays = ref(30)
const userChartRef = ref(null)
const orderChartRef = ref(null)
const categoryChartRef = ref(null)
const brandChartRef = ref(null)

let userChart, orderChart, categoryChart, brandChart

const loadUserTrend = async () => {
  const res = await getUserTrend({ days: userTrendDays.value })
  await nextTick()
  if (!userChart && userChartRef.value) userChart = echarts.init(userChartRef.value)
  if (userChart) {
    userChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: res.data.map(i => i.date) },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: res.data.map(i => i.count), smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#1890ff' } }]
    })
  }
}

const loadOrderTrend = async () => {
  const res = await getOrderTrend({ days: orderTrendDays.value })
  await nextTick()
  if (!orderChart && orderChartRef.value) orderChart = echarts.init(orderChartRef.value)
  if (orderChart) {
    orderChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单数', '收入'] },
      xAxis: { type: 'category', data: res.data.map(i => i.date) },
      yAxis: [{ type: 'value' }, { type: 'value' }],
      series: [
        { name: '订单数', type: 'bar', data: res.data.map(i => i.count), itemStyle: { color: '#1890ff' } },
        { name: '收入', type: 'line', yAxisIndex: 1, data: res.data.map(i => i.revenue), smooth: true, itemStyle: { color: '#52c41a' } }
      ]
    })
  }
}

const loadCategoryDist = async () => {
  const res = await getCategoryDistribution()
  await nextTick()
  if (!categoryChart && categoryChartRef.value) categoryChart = echarts.init(categoryChartRef.value)
  if (categoryChart) {
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{ type: 'pie', radius: ['35%', '65%'], data: res.data, itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 } }]
    })
  }
}

const loadBrandRank = async () => {
  const res = await getBrandRanking({ limit: 10 })
  await nextTick()
  if (!brandChart && brandChartRef.value) brandChart = echarts.init(brandChartRef.value)
  if (brandChart) {
    brandChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: res.data.map(i => i.name).reverse() },
      series: [{ type: 'bar', data: res.data.map(i => i.value).reverse(), itemStyle: { color: '#1890ff', borderRadius: [0, 4, 4, 0] } }]
    })
  }
}

onMounted(async () => {
  await loadUserTrend()
  await loadOrderTrend()
  await loadCategoryDist()
  await loadBrandRank()
  window.addEventListener('resize', () => {
    userChart?.resize()
    orderChart?.resize()
    categoryChart?.resize()
    brandChart?.resize()
  })
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
