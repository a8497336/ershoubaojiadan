Component({
  options: {
    multipleSlots: true
  },

  properties: {
    type: { type: String, value: 'default' },
    size: { type: String, value: 'normal' },
    title: { type: String, value: '暂无数据' },
    desc: { type: String, value: '' },
    imageUrl: { type: String, value: '' },
    showBtn: { type: Boolean, value: false },
    btnText: { type: String, value: '去逛逛' }
  },

  data: {
    defaultImage: '/images/icons/empty.svg'
  },

  methods: {
    onBtnTap() {
      this.triggerEvent('btnTap')
    }
  }
})
