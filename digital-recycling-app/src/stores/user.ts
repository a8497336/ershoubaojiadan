import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi, walletApi, pointsApi } from '../api'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)
  const walletInfo = ref<any>(null)
  const pointsBalance = ref(0)

  const isLoggedIn = computed(() => !!token.value)
  const isVip = computed(() => {
    if (!userInfo.value?.membershipExpire) return false
    return new Date(userInfo.value.membershipExpire) > new Date()
  })

  async function login(phone: string) {
    const res: any = await authApi.phoneLogin(phone)
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    userInfo.value = res.data.userInfo
    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
    return res.data
  }

  async function fetchProfile() {
    try {
      const res: any = await userApi.getProfile()
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
    } catch (e) {
      // ignore
    }
  }

  async function fetchWallet() {
    try {
      const res: any = await walletApi.getInfo()
      walletInfo.value = res.data
    } catch (e) {
      // ignore
    }
  }

  async function fetchPoints() {
    try {
      const res: any = await pointsApi.getBalance()
      pointsBalance.value = res.data.points
    } catch (e) {
      // ignore
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    walletInfo.value = null
    pointsBalance.value = 0
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  function initFromStorage() {
    const stored = localStorage.getItem('userInfo')
    if (stored) {
      try {
        userInfo.value = JSON.parse(stored)
      } catch (e) {
        // ignore
      }
    }
  }

  return {
    token,
    userInfo,
    walletInfo,
    pointsBalance,
    isLoggedIn,
    isVip,
    login,
    fetchProfile,
    fetchWallet,
    fetchPoints,
    logout,
    initFromStorage
  }
})
