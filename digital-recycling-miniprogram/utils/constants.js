const CONTACT = {
  WECHAT_ID: '15555962610',
  PHONE: '15555962610',
  SERVICE_PHONE: '15555962610'
}

const STORE = {
  // 定位失败时的默认门店：补齐经纬度，确保导航（wx.openLocation）可用；
  // distance 设为 null，配合 wxml 文案显示「距离暂不可用」而非「获取中…」
  DEFAULT_STORE: {
    // name: '安徽门店',
    // phone: '18755875222',
    // wechat: '18755875222',
    // contact_name: '范凯旋',
    // contact_phone: '18755875222',
    // province: '安徽省阜阳市',
    // city: '太和县',
    // address: '双浮镇双北路1号联赢电子回收网废旧手机回收中心（五星大桥南50米路）',
    // latitude: 33.03175,
    // longitude: 115.74835,
    // distance: null
  }
}

const ORDER_STATUS = {
  PENDING: { code: 0, label: '待处理', color: 'tag-warning' },
  PROCESSING: { code: 1, label: '处理中', color: 'tag-info' },
  COMPLETED: { code: 2, label: '已完成', color: 'tag-success' },
  CANCELLED: { code: 3, label: '已取消', color: 'tag-default' }
}

const PAGE_SIZE = 10

module.exports = {
  CONTACT,
  STORE,
  ORDER_STATUS,
  PAGE_SIZE
}
