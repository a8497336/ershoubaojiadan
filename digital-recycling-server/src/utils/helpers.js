const generateOrderNo = (prefix = 'ORD') => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${random}`
}

const generateUserNo = () => {
  const random = String(Math.floor(Math.random() * 10000000)).padStart(7, '0')
  return random
}

const formatPrice = (price) => {
  if (price === undefined || price === null || price === '') return '-'
  const num = parseFloat(price)
  if (isNaN(num)) return price
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const paginate = (page = 1, pageSize = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const limit = parseInt(pageSize)
  return { offset, limit }
}

const calcDistance = (lat1, lng1, lat2, lng2) => {
  const radLat1 = lat1 * Math.PI / 180
  const radLat2 = lat2 * Math.PI / 180
  const a = radLat1 - radLat2
  const b = lng1 * Math.PI / 180 - lng2 * Math.PI / 180
  let distance = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  distance = distance * 6378.137
  distance = Math.round(distance * 10000) / 10000
  return distance
}

module.exports = {
  generateOrderNo,
  generateUserNo,
  formatPrice,
  paginate,
  calcDistance
}
