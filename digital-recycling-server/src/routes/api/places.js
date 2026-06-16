/**
 * @openapi
 * tags:
 *   - name: 小程序-地点
 *     description: 腾讯地图代理接口（小程序不直连腾讯地图）
 */

/**
 * @openapi
 * /api/places/nearby:
 *   get:
 *     tags: [小程序-地点]
 *     summary: 根据当前位置搜索附近门店（单关键字）
 *     description: 后端代理腾讯地图 place/v1/search WebService API
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: keyword
 *         schema: { type: string, default: 回收 }
 *       - in: query
 *         name: radius
 *         schema: { type: integer, default: 5000 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 成功
 */

/**
 * @openapi
 * /api/places/nearby-by-stores:
 *   post:
 *     tags: [小程序-地点]
 *     summary: 用后台门店名搜腾讯地图附近门店
 */

/**
 * @openapi
 * /api/places/nearest-store:
 *   get:
 *     tags: [小程序-地点]
 *     summary: 根据用户位置计算后台门店中最近的那个（驾车距离）
 *     description: 后端从 stores 表读取所有有效门店的经纬度，调用腾讯地图 distance/v1/matrix 计算驾车距离，按距离升序返回最近门店
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: mode
 *         schema: { type: string, default: driving, enum: [driving, walking, bicycling] }
 *     responses:
 *       200:
 *         description: 成功
 */

const router = require('express').Router()
const { success, error } = require('../../utils/response')
const { Op } = require('sequelize')
const db = require('../../models')
const { searchNearby, searchNearbyByKeywords, distanceMatrix, geocodeStore, geocode } = require('../../utils/qqmap')

router.get('/nearby', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat)
    const lng = parseFloat(req.query.lng)
    if (isNaN(lat) || isNaN(lng)) {
      return error(res, 'lat 和 lng 必须为合法数字', 422, 422)
    }

    const keyword = (req.query.keyword || '回收').toString().slice(0, 50)
    const radius = Math.min(Math.max(parseInt(req.query.radius) || 5000, 100), 50000)
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50)

    const result = await searchNearby({ lat, lng, keyword, radius, limit })

    return success(res, {
      list: result.list,
      source: result.source,
      query: { lat, lng, keyword, radius, limit }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/nearby-by-stores', async (req, res, next) => {
  try {
    const lat = parseFloat(req.body && req.body.lat)
    const lng = parseFloat(req.body && req.body.lng)
    if (isNaN(lat) || isNaN(lng)) {
      return error(res, 'lat 和 lng 必须为合法数字', 422, 422)
    }

    const stores = Array.isArray(req.body && req.body.stores) ? req.body.stores : []
    const radius = Math.min(Math.max(parseInt(req.body && req.body.radius) || 5000, 100), 50000)
    const limit = Math.min(Math.max(parseInt(req.body && req.body.limit) || 20, 1), 50)

    const keywords = stores
      .map(s => s && (s.name || s.title))
      .filter(Boolean)
      .map(k => String(k).trim())
      .filter(Boolean)

    const result = await searchNearbyByKeywords({ lat, lng, keywords, radius, limit })

    return success(res, {
      list: result.list,
      source: result.source,
      query: { lat, lng, keywords, radius, limit, storeCount: stores.length }
    })
  } catch (err) {
    next(err)
  }
})

router.get('/nearest-store', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat)
    const lng = parseFloat(req.query.lng)
    if (isNaN(lat) || isNaN(lng)) {
      return error(res, 'lat 和 lng 必须为合法数字', 422, 422)
    }
    const mode = (req.query.mode || 'driving').toString()
    const validModes = ['driving', 'walking', 'bicycling']
    const safeMode = validModes.includes(mode) ? mode : 'driving'

    const stores = await db.Store.findAll({
      where: {
        status: 1,
        latitude: { [Op.not]: null },
        longitude: { [Op.not]: null }
      },
      order: [['sort_order', 'ASC']]
    })

    if (stores.length === 0) {
      return success(res, {
        list: [],
        source: 'stores:empty',
        query: { lat, lng, mode: safeMode }
      })
    }

    const toList = stores.map(s => ({
      id: s.id,
      lat: parseFloat(s.latitude),
      lng: parseFloat(s.longitude)
    })).filter(t => Number.isFinite(t.lat) && Number.isFinite(t.lng))

    if (toList.length === 0) {
      return success(res, {
        list: [],
        source: 'stores:no-coords',
        query: { lat, lng, mode: safeMode }
      })
    }

    const distances = await distanceMatrix({
      from: { lat, lng },
      toList,
      mode: safeMode
    })

    const distanceMap = new Map()
    distances.forEach(d => distanceMap.set(d.id, d))

    const list = stores.map(s => {
      const d = distanceMap.get(s.id)
      return {
        id: s.id,
        name: s.name,
        title: s.name,
        address: [s.province, s.city, s.district, s.address].filter(Boolean).join(''),
        province: s.province,
        city: s.city,
        district: s.district,
        tel: s.contact_phone,
        phone: s.contact_phone,
        contact_name: s.contact_name,
        wechat: s.wechat,
        latitude: parseFloat(s.latitude),
        longitude: parseFloat(s.longitude),
        distance: d ? d.distance : null,
        distanceRaw: d ? d.distance : null,
        duration: d ? d.duration : null
      }
    }).sort((a, b) => {
      const da = typeof a.distance === 'number' ? a.distance : Number.MAX_SAFE_INTEGER
      const db = typeof b.distance === 'number' ? b.distance : Number.MAX_SAFE_INTEGER
      return da - db
    })

    return success(res, {
      list,
      source: distances.length > 0 ? 'qqmap:matrix' : 'stores:no-matrix',
      query: { lat, lng, mode: safeMode, storeCount: stores.length }
    })
  } catch (err) {
    next(err)
  }
})

router.post('/geocode', async (req, res, next) => {
  try {
    const body = req.body || {}
    const address = (body.address || '').toString().trim()
    if (!address) {
      return error(res, 'address 必填', 422, 10001)
    }
    const store = {
      province: (body.province || '').toString().trim(),
      city: (body.city || '').toString().trim(),
      district: (body.district || '').toString().trim(),
      address
    }
    const result = await geocodeStore(store)
    if (result && Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
      return success(res, {
        lat: result.lat,
        lng: result.lng,
        formatted: result.formatted || '',
        source: 'qqmap:geocoder'
      })
    }
    return error(res, '地址解析失败', 404, 10001)
  } catch (err) {
    next(err)
  }
})

module.exports = router
