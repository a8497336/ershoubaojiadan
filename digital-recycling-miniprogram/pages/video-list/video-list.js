const { contentApi } = require('../../utils/api-modules')

Page({
  data: {
    videoTabs: ['查看报价', '实用功能', '下单相关', '收入相关'],
    activeTab: 0,
    videos: [],
    loading: true
  },

  onLoad() {
    this.fetchVideos()
  },

  onTabTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.fetchVideos()
  },

  async fetchVideos() {
    this.setData({ loading: true })
    try {
      const category = this.data.videoTabs[this.data.activeTab]
      const res = await contentApi.getVideos(category)
      const list = res.data || res || []
      this.setData({ videos: list, loading: false })
    } catch (err) {
      console.error('获取视频列表失败:', err)
      this.setData({ loading: false })
    }
  },

  onVideoTap(e) {
    const { index } = e.currentTarget.dataset
    const video = this.data.videos[index]
    if (video && video.id) {
      wx.navigateTo({
        url: `/pages/video-play/video-play?id=${video.id}`
      })
    } else {
      wx.showToast({ title: '视频暂无法播放', icon: 'none' })
    }
  }
})
