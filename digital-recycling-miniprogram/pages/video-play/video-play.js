Page({
  data: {
    videoUrl: '',
    videoTitle: '',
    videoCategory: '',
    video: null,
    loading: false
  },

  onLoad(options) {
    const videoUrl = decodeURIComponent(options.url || '')
    const title = decodeURIComponent(options.title || '')
    const category = decodeURIComponent(options.category || '')
    this.setData({
      videoUrl,
      videoTitle: title,
      videoCategory: category,
      video: { title, category },
      loading: false
    })
    if (!videoUrl) {
      wx.showToast({ title: '视频地址无效', icon: 'none' })
    }
  },

  onVideoError() {
    wx.showToast({ title: '视频加载失败', icon: 'none' })
  }
})
