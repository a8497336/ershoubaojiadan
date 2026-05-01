import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' }
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'product',
        name: 'ProductManage',
        component: () => import('@/views/product/index.vue'),
        meta: { title: '产品管理', icon: 'Goods' }
      },
      {
        path: 'price',
        name: 'PriceManage',
        component: () => import('@/views/price/index.vue'),
        meta: { title: '报价管理', icon: 'PriceTag' }
      },
      {
        path: 'order',
        name: 'OrderManage',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'Document' }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/detail.vue'),
        meta: { title: '订单详情', hidden: true }
      },
      {
        path: 'member',
        name: 'MemberManage',
        component: () => import('@/views/member/index.vue'),
        meta: { title: '会员管理', icon: 'VIP' }
      },
      {
        path: 'content',
        name: 'ContentManage',
        component: () => import('@/views/content/index.vue'),
        meta: { title: '内容管理', icon: 'PictureFilled' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '数据统计', icon: 'DataAnalysis' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = `${to.meta.title || '数码回收网'} - 后台管理`
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
