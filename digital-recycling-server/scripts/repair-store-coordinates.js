/**
 * 一次性数据修复脚本：对 stores 表所有门店调用腾讯地图 geocoder/v1 重新生成经纬度
 * 用法：node scripts/repair-store-coordinates.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const db = require('../src/models')
const { geocodeStore } = require('../src/utils/qqmap')
const logger = require('../src/utils/logger')

const DELAY_MS = 250

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const run = async () => {
  try {
    await db.sequelize.authenticate()
    logger.info('[repair] 数据库连接成功')

    const stores = await db.Store.findAll({ order: [['sort_order', 'ASC']] })
    logger.info(`[repair] 共找到 ${stores.length} 条门店记录`)

    let updated = 0
    let failed = 0

    for (const store of stores) {
      const id = store.id
      const name = store.name
      const address = store.address
      const fullAddress = [store.province, store.city, store.district, address].filter(Boolean).join('')
      try {
        const coords = await geocodeStore(store)
        if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
          await store.update({
            latitude: coords.lat,
            longitude: coords.lng,
            autoGeocode: false
          }, { autoGeocode: false })
          logger.info(`[repair] store id=${id} name="${name}" address="${fullAddress}" → lat=${coords.lat} lng=${coords.lng}`)
          updated++
        } else {
          logger.warn(`[repair] store id=${id} name="${name}" address="${fullAddress}" → geocode 失败`)
          failed++
        }
      } catch (err) {
        logger.error(`[repair] store id=${id} name="${name}" → ${err.message}`)
        failed++
      }
      await sleep(DELAY_MS)
    }

    logger.info(`[repair] 完成：updated=${updated}, failed=${failed}, total=${stores.length}`)
    await db.sequelize.close()
    process.exit(0)
  } catch (err) {
    logger.error('[repair] 脚本异常', { message: err.message, stack: err.stack })
    try { await db.sequelize.close() } catch (_) {}
    process.exit(1)
  }
}

run()
