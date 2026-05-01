<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="item in statCards" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-info">
              <p class="stat-title">{{ item.title }}</p>
              <p class="stat-value">{{ item.value }}</p>
              <p class="stat-desc">{{ item.desc }}</p>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.color + '20', color: item.color }">
              <el-icon :size="28"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <el-radio-group v-model="trendDays" size="small" @change="loadTrend">
                <el-radio-button :value="7">近7天</el-radio-button>
                <el-radio-button :value="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>品类分布</span></template>
          <div ref="pieChartRef" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { getDashboardOverview, getDashboardTrend, getCategoryDistribution } from '@/api'
import * as echarts from 'echarts'

const statCards = ref([])
const trendDays = ref(7)
const trendChartRef = ref(null)
const pieChartRef = ref(null)

let trendChart = null
let pieChart = null

const loadOverview = async () => {
  const res = await getDashboardOverview()
  const d = res.data
  statCards.value = [
    { title: '总用户数', value: d.totalUsers, desc: `今日新增 ${d.todayUsers}`, icon: 'User', color: '#1890ff' },
    { title: '总订单数', value: d.totalOrders, desc: `今日新增 ${d.todayOrders}`, icon: 'Document', color: '#52c41a' },
    { title: '总交易额', value: `¥${Number(d.totalRevenue).toLocaleString()}`, desc: `今日 ¥${Number(d.todayRevenue).toLocaleString()}`, icon: 'Wallet', color: '#faad14' },
    { title: '会员数', value: d.totalMembers, desc: `待发货 ${d.pendingOrders}`, icon: 'Star', color: '#722ed1' }
  ]
}

const loadTrend = async () => {
  const res = await getDashboardTrend({ days: trendDays.value })
  const data = res.data
  await nextTick()
  if (!trendChart && trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (trendChart) {
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单数', '收入', '新增用户'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.map(i => i.date) },
      yAxis: [
        { type: 'value', name: '数量' },
        { type: 'value', name: '金额(元)' }
      ],
      series: [
        { name: '订单数', type: 'bar', data: data.map(i => i.orderCount), itemStyle: { color: '#1890ff' } },
        { name: '收入', type: 'line', yAxisIndex: 1, data: data.map(i => i.revenue), smooth: true, itemStyle: { color: '#52c41a' } },
        { name: '新增用户', type: 'line', data: data.map(i => i.userCount), smooth: true, itemStyle: { color: '#faad14' } }
      ]
    })
  }
}

const loadPie = async () => {
  const res = await getCategoryDistribution()
  await nextTick()
  if (!pieChart && pieChartRef.value) {
    pieChart = echarts.init(pieChartRef.value)
  }
  if (pieChart) {
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        data: res.data
      }]
    })
  }
}

onMounted(async () => {
  await loadOverview()
  await loadTrend()
  await loadPie()
  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
  })
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 8px 0;
}

.stat-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
