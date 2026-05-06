const { pointsApi } = require('../../utils/api-modules')
Page({
  data: {
    points: 0,
    lotteryList: [
      { name: '100积分', icon: 'points' },
      { name: '5元红包', icon: 'redpacket' },
      { name: '10积分', icon: 'points' },
      { name: '谢谢参与', icon: 'empty' },
      { name: '50积分', icon: 'points' },
      { name: '1元红包', icon: 'redpacket' },
      { name: '200积分', icon: 'points' },
      { name: '20元红包', icon: 'redpacket' }
    ],
    records: [],
    isSpinning: false,
    resultIndex: -1,
    loading: false
  },
  onLoad() { this.loadPoints(); this.loadRecords() },
  loadPoints() {
    pointsApi.getBalance().then(res => {
      this.setData({ points: res.data?.points || res.data?.balance || 0 })
    }).catch(() => {})
  },
  loadRecords() {
    this.setData({ loading: true })
    pointsApi.getLotteryRecords().then(res => {
      this.setData({ records: res.data?.list || res.data || [], loading: false })
    }).catch(() => { this.setData({ loading: false }) })
  },
  onStartLottery() {
    if (this.data.isSpinning) return
    if (this.data.points < 10) {
      wx.showToast({ title: '积分不足(需要10积分)', icon: 'none' })
      return
    }
    this.setData({ isSpinning: true, resultIndex: -1 })
    const targetIndex = Math.floor(Math.random() * this.data.lotteryList.length)
    const totalSteps = this.data.lotteryList.length * 4 + targetIndex
    let currentStep = 0
    const interval = 80
    const timer = setInterval(() => {
      currentStep++
      this.setData({ resultIndex: currentStep % this.data.lotteryList.length })
      if (currentStep >= totalSteps) {
        clearInterval(timer)
        setTimeout(() => {
          const prize = this.data.lotteryList[targetIndex]
          this.setData({ isSpinning: false })
          if (prize.name === '谢谢参与') {
            wx.showToast({ title: '谢谢参与', icon: 'none' })
          } else {
            wx.showToast({ title: `恭喜获得${prize.name}！`, icon: 'success' })
          }
          this.loadPoints()
          this.loadRecords()
        }, 500)
      }
    }, interval)
  },
  onPrizeTap(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ resultIndex: idx })
  }
})
