import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAdminInfo } from '@/api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref(null)
  const permissions = ref([])

  const setToken = (val) => {
    token.value = val
    localStorage.setItem('admin_token', val)
  }

  const getUserInfo = async () => {
    const res = await getAdminInfo()
    userInfo.value = res.data
    permissions.value = res.data.permissions || []
    return res.data
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    permissions.value = []
    localStorage.removeItem('admin_token')
  }

  const hasPermission = (code) => {
    if (userInfo.value?.role?.code === 'super_admin') return true
    return permissions.value.includes(code)
  }

  return { token, userInfo, permissions, setToken, getUserInfo, logout, hasPermission }
})
