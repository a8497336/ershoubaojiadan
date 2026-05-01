import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/brand-list',
    name: 'BrandList',
    component: () => import('../views/BrandList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/price-quote/:brandId',
    name: 'PriceQuote',
    component: () => import('../views/PriceQuote.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/membership',
    name: 'Membership',
    component: () => import('../views/Membership.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/shopping',
    name: 'Shopping',
    component: () => import('../views/shopping.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/scan-price',
    name: 'ScanPrice',
    component: () => import('../views/scanPrice.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/announcement',
    name: 'Announcement',
    component: () => import('../views/Announcement.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/my-points',
    name: 'MyPoints',
    component: () => import('../views/MyPoints.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invite-friends',
    name: 'InviteFriends',
    component: () => import('../views/InviteFriends.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/recycling-process',
    name: 'RecyclingProcess',
    component: () => import('../views/RecyclingProcess.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/mailing-address',
    name: 'MailingAddress',
    component: () => import('../views/MailingAddress.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('../views/Feedback.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/FAQ.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/business-cooperation',
    name: 'BusinessCooperation',
    component: () => import('../views/BusinessCooperation.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/video-list',
    name: 'VideoList',
    component: () => import('../views/VideoList.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/video-play/:id',
    name: 'VideoPlay',
    component: () => import('../views/VideoPlay.vue'),
    meta: { requiresAuth: false }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
