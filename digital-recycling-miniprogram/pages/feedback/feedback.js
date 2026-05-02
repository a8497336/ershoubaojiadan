const { messageApi } = require('../../utils/api-modules')

Page({
  data: {
    typeIndex: 0,
    typeList: ['功能建议', '问题反馈', '投诉建议', '其他'],
    content: '',
    contact: '',
    submitting: false
  },

  onTypeChange(e) {
    this.setData({ typeIndex: Number(e.detail.value) })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value })
  },

  async handleSubmit() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    if (this.data.submitting) return
    this.setData({ submitting: true })
    try {
      await messageApi.submitFeedback({
        type: this.data.typeList[this.data.typeIndex],
        content: this.data.content,
        contact: this.data.contact
      })
      wx.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      wx.showToast({ title: err.message || '提交失败', icon: 'none' })
    } finally {
      this.setData({ submitting: false })
    }
  }
})
