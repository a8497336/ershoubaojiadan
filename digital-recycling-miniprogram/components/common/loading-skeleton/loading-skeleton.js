Component({
  properties: {
    type: { type: String, value: 'list' },
    rowCount: { type: Number, value: 5 },
    showAvatar: { type: Boolean, value: true },
    multipleLines: { type: Boolean, value: true },
    animate: { type: Boolean, value: true },
    colCount: { type: Number, value: 4 }
  },

  data: {
    typeList: ['list', 'card', 'detail', 'table']
  }
})
