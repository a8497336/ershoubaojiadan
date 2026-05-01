<template>
  <div class="order-detail" v-loading="loading">
    <el-page-header @back="$router.back()" title="返回" :content="`订单 ${order.order_no}`" />

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header><span>订单信息</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ order.order_no }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusMap[order.status]?.type">{{ statusMap[order.status]?.label }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总金额">¥{{ Number(order.total_amount).toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="实际金额">{{ order.actual_amount ? '¥' + Number(order.actual_amount).toLocaleString() : '-' }}</el-descriptions-item>
            <el-descriptions-item label="快递公司">{{ order.logistics_company || '-' }}</el-descriptions-item>
            <el-descriptions-item label="运单号">{{ order.tracking_no || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ order.created_at }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ order.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card shadow="hover" style="margin-top: 20px">
          <template #header><span>商品清单</span></template>
          <el-table :data="order.Items" stripe>
            <el-table-column prop="product_name" label="产品名称" />
            <el-table-column prop="condition_name" label="等级" width="140" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="unit_price" label="单价" width="100">
              <template #default="{ row }">¥{{ row.unit_price }}</template>
            </el-table-column>
            <el-table-column prop="subtotal" label="小计" width="100">
              <template #default="{ row }">¥{{ row.subtotal }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header><span>物流时间轴</span></template>
          <el-timeline v-if="order.Timelines && order.Timelines.length">
            <el-timeline-item v-for="item in order.Timelines" :key="item.id" :timestamp="item.happened_at" placement="top">
              {{ item.description }}
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无物流信息" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderDetail } from '@/api'

const route = useRoute()
const loading = ref(false)
const order = ref({})

const statusMap = {
  shipping: { label: '待发货', type: 'info' },
  transit: { label: '运输中', type: '' },
  inspecting: { label: '质检中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
