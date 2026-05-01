import axios from 'axios'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      const errMsg = res.message || '请求失败'
      if (typeof window !== 'undefined' && window.__showErrorToast) {
        window.__showErrorToast(errMsg)
      }
      return Promise.reject(new Error(errMsg))
    }
    return res
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      const errMsg = data?.message || '请求失败'

      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        const currentPath = router.currentRoute.value.path
        if (currentPath !== '/login') {
          router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
        }
      } else if (typeof window !== 'undefined' && window.__showErrorToast) {
        window.__showErrorToast(errMsg)
      }
      return Promise.reject(new Error(errMsg))
    }

    const msg = error.message === 'Network Error' ? '网络连接失败' : '请求超时，请重试'
    if (typeof window !== 'undefined' && window.__showErrorToast) {
      window.__showErrorToast(msg)
    }
    return Promise.reject(new Error(msg))
  }
)

export default request
