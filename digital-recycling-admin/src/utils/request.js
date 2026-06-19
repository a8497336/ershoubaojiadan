import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 100000,
  // 允许 2xx 与 3xx，避免 304/304 等缓存状态被当成异常
  validateStatus: (status) => status >= 200 && status < 400
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 给 GET 请求追加时间戳，避免浏览器/代理返回 304 缓存
    if ((config.method || 'get').toLowerCase() === 'get') {
      config.params = { ...(config.params || {}), _t: Date.now() }
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 兜底：空响应或非对象响应（如 304）直接放行
    if (!res || typeof res !== 'object' || res.code === undefined) {
      return res
    }
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('admin_token')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
