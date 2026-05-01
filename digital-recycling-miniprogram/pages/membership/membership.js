const { membershipApi, userApi } = require('../../utils/api-modules')

Page({
  data: {
    plans: [],
    memberStatus: null,
    userInfo: null,
    loading: true
  },

  onLoad() {
    this.loadPlans()
    this.loadMemberStatus()
  },

  loadPlans() {
    this.setData({ loading: true })
    membershipApi.getPlans().then((res) => {
      this.setData({ plans: res.data || [], loading: false })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },

  loadMemberStatus() {
    membershipApi.getStatus().then((res) => {
      this.setData({ memberStatus: res.data })
    }).catch(() => {})

    userApi.getProfile().then((res) => {
      this.setData({ userInfo: res.data })
    }).catch(() => {})
  },

  purchasePlan(e) {
    const planId = e.currentTarget.dataset.id
    const plan = this.data.plans.find(p => p.id === planId)
    if (!plan) return

    wx.showModal({
      title: '确认购买',
      content: `确定购买「${plan.name}」套餐，价格 ¥${plan.price}？`,
      success: (res) => {
        if (res.confirm) {
          membershipApi.purchase(planId).then((res) => {
            wx.showToast({ title: '订单创建成功', icon: 'success' })
            setTimeout(() => {
              membershipApi.payCallback(res.data.orderNo).then(() => {
                wx.showToast({ title: '会员开通成功', icon: 'success' })
                this.loadMemberStatus()
              }).catch(() => {
                wx.showToast({ title: '支付失败', icon: 'none' })
              })
            }, 1000)
          }).catch(() => {
            wx.showToast({ title: '购买失败', icon: 'none' })
          })
        }
      }
    })
  },

  onShareAppMessage() {
    return { title: '数码回收网 - 会员中心', path: '/pages/membership/membership' }
  }
})
