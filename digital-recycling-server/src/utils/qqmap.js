/**
 * 腾讯地图 WebService API 封装
 * 文档：https://lbs.qq.com/service/webService/webServiceGuide/webServiceOverview
 */

const axios = require('axios')
const logger = require('./logger')

const API_KEY = process.env.QQMAP_API_KEY || 'EU4BZ-MVYCU-SY2VT-G2PWS-N34N3-ZPFRF'
const BASE_URL = 'https://apis.map.qq.com'

const parseDistance = (raw) => {
  if (raw === null || raw === undefined) return null
  const num = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(num)) return null
  return Math.round(num)
}

const request = async (path, params = {}, timeout = 5000) => {
  const queryKeys = Object.keys(params || {}).filter(k => k !== 'key')
  try {
    const res = await axios.get(BASE_URL + path, {
      params: { key: API_KEY, ...params },
      timeout
    })
    if (res.status !== 200 || !res.data) {
      logger.warn('[qqmap] 非 200 响应', { path, status: res.status, queryKeys })
      return null
    }
    if (res.data.status !== 0) {
      logger.warn('[qqmap] 业务错误', { path, message: res.data.message, status: res.data.status, queryKeys })
      return null
    }
    const count = Array.isArray(res.data.data) ? res.data.data.length : (res.data.result ? 1 : 0)
    logger.info('[qqmap] 调用成功', { path, queryKeys, count })
    return res.data
  } catch (err) {
    logger.error('[qqmap] 请求失败', { path, message: err.message, queryKeys })
    return null
  }
}

const normalize = (data) => {
  if (!data || !Array.isArray(data.data)) return []
  return data.data.map(item => ({
    id: item.id,
    title: item.title,
    address: item.address,
    tel: item.tel || '',
    category: item.category || '',
    latitude: item.location && item.location.lat,
    longitude: item.location && item.location.lng,
    distance: parseDistance(item._distance)
  }))
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 周边搜索（单关键字）
 */
const searchNearby = async ({ lat, lng, keyword, radius = 5000, limit = 20 } = {}) => {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return { list: [], source: 'qqmap:invalid' }
  }
  if (!keyword) {
    return { list: [], source: 'qqmap:empty-keyword' }
  }
  const data = await request('/ws/place/v1/search', {
    keyword,
    boundary: `nearby(${lat},${lng},${radius})`,
    orderby: '_distance',
    page_size: Math.min(Math.max(parseInt(limit) || 20, 1), 50),
    page_index: 1,
    output: 'json'
  })
  const list = normalize(data)
  return { list, source: `qqmap:${keyword}` }
}

/**
 * 多关键字周边搜索
 */
const searchNearbyByKeywords = async ({ lat, lng, keywords = [], radius = 5000, limit = 20 } = {}) => {
  const emptyResult = { list: [], source: 'qqmap:multi-empty' }
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return emptyResult
  }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return emptyResult
  }
  const validKeywords = keywords.filter(Boolean).map(k => String(k).trim()).filter(Boolean)
  if (validKeywords.length === 0) return emptyResult

  const seen = new Map()
  const orderByKeyword = []

  for (const kw of validKeywords) {
    const { list } = await searchNearby({ lat, lng, keyword: kw, radius, limit })
    if (!list || list.length === 0) continue
    orderByKeyword.push(kw)
    for (const item of list) {
      if (!item.id) continue
      if (!seen.has(item.id)) {
        seen.set(item.id, { ...item, sourceKeyword: kw })
      }
    }
    if (seen.size > 0) {
      logger.info('[qqmap] 多关键字命中', { keyword: kw, merged: seen.size })
      break
    }
  }

  if (seen.size === 0) {
    logger.warn('[qqmap] 多关键字均无匹配', { tried: validKeywords })
    return { list: [], source: 'qqmap:multi-none' }
  }

  const list = Array.from(seen.values()).sort((a, b) => {
    const da = typeof a.distance === 'number' ? a.distance : Number.MAX_SAFE_INTEGER
    const db = typeof b.distance === 'number' ? b.distance : Number.MAX_SAFE_INTEGER
    return da - db
  })

  const source = orderByKeyword.length === 1 ? `qqmap:${orderByKeyword[0]}` : `qqmap:multi`
  return { list, source }
}

/**
 * 拼接完整地址
 * 支持三种调用方式：
 *   geocode('北京市故宫')
 *   geocode({ province, city, district, address })
 */
const buildAddress = (input) => {
  if (typeof input === 'string') return input.trim()
  if (input && typeof input === 'object') {
    const seen = new Set()
    const parts = []
    ;['province', 'city', 'district', 'address'].forEach(key => {
      const v = input[key]
      if (!v) return
      const s = String(v).trim()
      if (!s) return
      if (seen.has(s)) return
      seen.add(s)
      if (parts.some(p => p.includes(s) || s.includes(p))) return
      parts.push(s)
    })
    return parts.join('')
  }
  return ''
}

/**
 * 地址解析（地理编码）：geocoder/v1
 */
const geocode = async (input) => {
  const address = buildAddress(input)
  if (!address) return null
  const data = await request('/ws/geocoder/v1', { address, output: 'json' })
  if (!data || !data.result || !data.result.location) return null
  return {
    lat: data.result.location.lat,
    lng: data.result.location.lng,
    formatted: data.result.formatted_addresses ? data.result.formatted_addresses.recommend || '' : '',
    address
  }
}

/**
 * 门店专用 geocode：拼接地址 + fallback 到 address
 * @param {Object} store { province, city, district, address }
 * @returns {Promise<{lat:number,lng:number}|null>}
 */
const geocodeStore = async (store) => {
  if (!store) return null
  const province = (store.province || '').trim()
  const city = (store.city || '').trim()
  const district = (store.district || '').trim()
  const address = (store.address || '').trim()
  if (!address) return null

  const fullAddress = [province, city, district, address].filter(Boolean).join('')
  if (fullAddress && fullAddress !== address) {
    const r1 = await geocode(fullAddress)
    if (r1 && Number.isFinite(r1.lat) && Number.isFinite(r1.lng)) {
      logger.info('[qqmap] geocodeStore 拼接命中', { fullAddress, lat: r1.lat, lng: r1.lng })
      return { lat: r1.lat, lng: r1.lng }
    }
  }
  const r2 = await geocode(address)
  if (r2 && Number.isFinite(r2.lat) && Number.isFinite(r2.lng)) {
    logger.info('[qqmap] geocodeStore fallback 命中', { address, lat: r2.lat, lng: r2.lng })
    return { lat: r2.lat, lng: r2.lng }
  }
  logger.warn('[qqmap] geocodeStore 失败', { province, city, district, address })
  return null
}

/**
 * 距离矩阵：distance/v1/matrix
 * @param {Object} options
 * @param {{lat:number,lng:number}} options.from 起点（用户位置）
 * @param {Array<{id,lat,lng}>} options.toList 终点列表
 * @param {string} options.mode driving / walking / bicycling
 * @returns {Promise<Array<{id,distance}>>}
 */
const distanceMatrix = async ({ from, toList = [], mode = 'driving' } = {}) => {
  if (!from || typeof from.lat !== 'number' || typeof from.lng !== 'number') {
    logger.warn('[qqmap] distanceMatrix from 无效', { from })
    return []
  }
  if (!Array.isArray(toList) || toList.length === 0) {
    return []
  }
  const valid = toList.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number' && !isNaN(t.lat) && !isNaN(t.lng))
  if (valid.length === 0) return []

  const fromParam = `${from.lat},${from.lng}`
  const toParam = valid.map(t => `${t.lat},${t.lng}`).join(';')

  const data = await request('/ws/distance/v1/matrix', {
    mode,
    from: fromParam,
    to: toParam,
    output: 'json'
  })
  if (!data || !data.result || !Array.isArray(data.result.rows)) {
    logger.warn('[qqmap] distanceMatrix 返回无效', { mode, fromParam, toCount: valid.length })
    return []
  }

  const result = []
  // 腾讯地图 distance/v1/matrix 返回结构：
  //   rows[].elements[]  每个 row 对应一个 from，每个 elements 对应一个 to
  // 通常 N 个 from × M 个 to 时返回 N 个 row，每个 row 含 M 个 elements
  data.result.rows.forEach((row, fromIdx) => {
    if (!row.elements || !Array.isArray(row.elements)) return
    row.elements.forEach((el, toIdx) => {
      const target = valid[toIdx]
      if (!target || !el || typeof el.distance === 'undefined') return
      const distance = parseDistance(el.distance)
      if (distance === null) return
      result.push({ id: target.id, distance, duration: el.duration, fromIdx, toIdx })
    })
  })

  result.sort((a, b) => a.distance - b.distance)
  logger.info('[qqmap] distanceMatrix 完成', { mode, fromParam, requested: valid.length, returned: result.length })
  return result
}

module.exports = {
  searchNearby,
  searchNearbyByKeywords,
  geocode,
  geocodeStore,
  distanceMatrix,
  parseDistance,
  sleep
}
