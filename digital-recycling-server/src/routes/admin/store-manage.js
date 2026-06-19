const { storeManage } = require('./crud-factory')
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, validateError } = require('../../utils/response')
const { geocodeStore } = require('../../utils/qqmap')
const logger = require('../../utils/logger')
const qs = require('qs')

/**
 * 解析 store-manage 自己的 query 字符串，兼容嵌套对象。
 *
 * 重要：项目使用 Express 5，Express 5 默认 `query parser: 'simple'`
 * （原生 querystring），**不支持嵌套对象**。当前端 axios 用
 * `params: { address: { address, province, city, district } }` 序列化
 * 出的 `?address[address]=...&address[province]=...` 在 Express 5 下
 * 会被解析成扁平 key `address[address]=...`，导致 `req.query.address`
 * 为 `undefined`。
 *
 * 本函数用 `qs` 库手动解析原始 query 段，**仅限本路由**，不改全局
 * `app.set('query parser', ...)`，避免影响其它 admin 路由行为。
 */
const parseQuery = (req) => {
  // req.originalUrl = '/admin/stores/geocode?address%5Baddress%5D=...&_t=...'
  const idx = (req.originalUrl || req.url || '').indexOf('?')
  const queryStr = idx >= 0 ? (req.originalUrl || req.url).slice(idx + 1) : ''
  if (!queryStr) return req.query || {}
  // 合并：qs 解析结果优先，缺失字段回退到 req.query
  const parsed = qs.parse(queryStr)
  return { ...(req.query || {}), ...parsed }
}

/**
 * 归一化地址参数：兼容两种入参形态
 *   - 嵌套：?address[address]=...&address[province]=...&address[city]=...&address[district]=...
 *   - 扁平：?address=...&province=...&city=...&district=...
 */
const normalizeAddressParam = (raw) => {
  const empty = { address: '', province: '', city: '', district: '' }
  if (raw === null || raw === undefined) return empty
  if (typeof raw === 'string') {
    return { ...empty, address: raw.trim() }
  }
  if (typeof raw === 'object') {
    return {
      address: (raw.address || '').toString().trim(),
      province: (raw.province || '').toString().trim(),
      city: (raw.city || '').toString().trim(),
      district: (raw.district || '').toString().trim()
    }
  }
  return empty
}

/**
 * GET /api/admin/stores/geocode
 * 根据地址调用腾讯地图解析，返回 { lat, lng, address, formatted }
 */
storeManage.get('/geocode', adminAuth, async (req, res, next) => {
  try {
    const query = parseQuery(req)
    const payload = normalizeAddressParam(query.address)
    if (!payload.address) {
      return validateError(res, '请提供门店地址')
    }
    const coords = await geocodeStore(payload)
    if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      logger.warn('[admin/stores/geocode] geocode failed', { payload })
      return validateError(res, '地址解析失败，请检查地址是否准确')
    }
    return success(res, {
      lat: coords.lat,
      lng: coords.lng,
      address: payload.address,
      formatted: coords.formatted || ''
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = storeManage
