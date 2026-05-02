Component({
  properties: {
    type: {
      type: String,
      value: 'error'
    },
    message: {
      type: String,
      value: ''
    },
    duration: {
      type: Number,
      value: 3000
    },
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    show: false,
    icon: '✕',
    timer: null
  },

  observers: {
    'visible'(val) {
      if (val) {
        this.showToast()
      } else {
        this.hideToast()
      }
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        icon: this.getIcon(this.data.type)
      })
      if (this.data.visible) {
        this.showToast()
      }
    },
    detached() {
      this.clearTimer()
    }
  },

  methods: {
    getIcon(type) {
      const map = { error: '✕', warning: '⚠', success: '✓' }
      return map[type] || map.error
    },

    showToast() {
      this.clearTimer()
      this.setData({ show: true })
      if (this.data.duration > 0) {
        this.data.timer = setTimeout(() => {
          this.hideToast()
        }, this.data.duration)
      }
    },

    hideToast() {
      this.clearTimer()
      this.setData({ show: false })
      this.triggerEvent('close')
    },

    clearTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer)
        this.data.timer = null
      }
    },

    onClose() {
      this.hideToast()
    }
  }
})
