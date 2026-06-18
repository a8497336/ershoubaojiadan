/**
 * 地理距离工具
 * 提供基于半正矢公式（Haversine formula）的大圆距离计算
 */

const EARTH_RADIUS_KM = 6371

const toRadians = (degree) => degree * Math.PI / 180

/**
 * 计算两个经纬度坐标之间的大圆距离（公里）
 * @param {number} lat1  起点纬度（十进制度数）
 * @param {number} lng1  起点经度（十进制度数）
 * @param {number} lat2  终点纬度（十进制度数）
 * @param {number} lng2  终点经度（十进制度数）
 * @returns {number} 距离（公里）
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  if (
    typeof lat1 !== 'number' || typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lng2 !== 'number' ||
    isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)
  ) {
    return 0
  }
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)))
  return Number((EARTH_RADIUS_KM * c).toFixed(3))
}

module.exports = {
  haversineDistance,
  EARTH_RADIUS_KM
}
