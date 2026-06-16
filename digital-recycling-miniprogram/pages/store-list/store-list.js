const app = getApp()
const { contentApi } = require('../../utils/api-modules')
const { haversineDistance } = require('../../utils/distance')

Page({
  data: {
    list: [],
    loading: true,
    loadError: false
  },

  onLoad() {
    this.loadStores()
    this.fetchLocation()
  },

  onPullDownRefresh() {
    this.loadStores().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadStores() {
    this.setData({ loading: true, loadError: false })
    return contentApi.getStores().then(res => {
      const raw = (res && res.data) || res || []
      const list = Array.isArray(raw) ? raw : []
      this.setData({ list, loading: false, loadError: false })
      this._applyDistancesAndSort()
    }).catch(() => {
      this.setData({ list: [], loading: false, loadError: true })
    })
  },

  fetchLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const lat = Number(res.latitude)
        const lng = Number(res.longitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          this._userLat = lat
          this._userLng = lng
          this._applyDistancesAndSort()
        }
      },
      fail: () => {
        // 定位失败不阻塞，列表保持原序
      }
    })
  },

  _applyDistancesAndSort() {
    const list = (this.data.list || []).slice()
    const lat = this._userLat
    const lng = this._userLng
    const hasLocation = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)

    const hasCoord = list.filter(s => s && s.latitude != null && s.longitude != null && s.latitude !== '' && s.longitude !== '')
    const noCoord = list.filter(s => !(s && s.latitude != null && s.longitude != null && s.latitude !== '' && s.longitude !== ''))

    let sorted
    if (hasLocation) {
      sorted = hasCoord
        .map(s => {
          const d = haversineDistance(lat, lng, Number(s.latitude), Number(s.longitude))
          return Object.assign({}, s, { distance: d.toFixed(2) })
        })
        .sort((a, b) => Number(a.distance) - Number(b.distance))
    } else {
      sorted = hasCoord.map(s => Object.assign({}, s, { distance: undefined }))
    }
    const tail = noCoord.map(s => Object.assign({}, s, { distance: undefined }))

    this.setData({ list: sorted.concat(tail) })
  },

  onItemTap(e) {
    const index = e.currentTarget.dataset.index
    const item = (this.data.list || [])[index]
    if (!item) return
    if (item.latitude != null && item.longitude != null && item.latitude !== '' && item.longitude !== '') {
      wx.openLocation({
        latitude: Number(item.latitude),
        longitude: Number(item.longitude),
        name: item.name || item.title || '门店',
        address: item.address || ''
      })
    } else {
      wx.showToast({ title: '门店坐标未设置，暂时无法导航', icon: 'none' })
    }
  },

  onRetry() {
    this.loadStores()
  }
})