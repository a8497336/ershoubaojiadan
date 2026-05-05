const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
const db = require('../src/models')

const EXCEL_DIR = 'C:\\Users\\17798\\Desktop\\陈峰\\数码回收\\同行手机回收报价单'

const BRAND_STYLE_MAP = {
  '热门老年机': { icon_text: '老年', bg_color: 'bg-xiaomi' },
  '智能机/电容屏': { icon_text: '智能', bg_color: 'bg-apple' },
  '手机拆机件': { icon_text: '拆机', bg_color: 'bg-huawei' },
  '电池': { icon_text: '电池', bg_color: 'bg-blackberry' },
  'OPPO': { icon_text: 'OP', bg_color: 'bg-oppo' },
  'VIVO': { icon_text: 'V', bg_color: 'bg-vivo' },
  '小米': { icon_text: 'mi', bg_color: 'bg-xiaomi' },
  '华为OK板': { icon_text: 'HW', bg_color: 'bg-huawei' },
  '华为': { icon_text: 'HW', bg_color: 'bg-huawei' },
  '三星': { icon_text: 'S', bg_color: 'bg-samsung' },
  '苹果': { icon_text: '苹果', bg_color: 'bg-apple' },
  '高仿苹果': { icon_text: '高仿', bg_color: 'bg-apple' },
  '金立': { icon_text: 'G', bg_color: 'bg-jinli' },
  '联想': { icon_text: 'L', bg_color: 'bg-lenovo' },
  '酷派/ivvi': { icon_text: 'cool', bg_color: 'bg-coolpad' },
  '酷派': { icon_text: 'cool', bg_color: 'bg-coolpad' },
  '魅族': { icon_text: 'M', bg_color: 'bg-meizu' },
  '锤子': { icon_text: 'T', bg_color: 'bg-smartisan' },
  '360': { icon_text: '+', bg_color: 'bg-360' },
  'HTC': { icon_text: 'htc', bg_color: 'bg-htc' },
  '黑莓': { icon_text: '黑莓', bg_color: 'bg-blackberry' },
  '一加': { icon_text: '1+', bg_color: 'bg-oneplus' },
  '真我/realme': { icon_text: 'R', bg_color: 'bg-realme' },
  '真我': { icon_text: 'R', bg_color: 'bg-realme' },
  '诺基亚': { icon_text: 'N', bg_color: 'bg-nokia' },
  '美图': { icon_text: 'M', bg_color: 'bg-meitu' },
  '乐视': { icon_text: 'L', bg_color: 'bg-leeco' },
  '努比亚': { icon_text: 'n', bg_color: 'bg-nubia' },
  '中国移动': { icon_text: '移动', bg_color: 'bg-chinamobile' },
  'TCL': { icon_text: 'T', bg_color: 'bg-tcl' },
  '中兴': { icon_text: 'Z', bg_color: 'bg-zte' },
  '8848': { icon_text: '8848', bg_color: 'bg-8848' },
  '糖果/国美': { icon_text: 'GOME', bg_color: 'bg-sugar' },
  '糖果': { icon_text: 'GOME', bg_color: 'bg-sugar' },
  '步步高': { icon_text: '步步', bg_color: 'bg-bbk' },
  '海信': { icon_text: 'H', bg_color: 'bg-hisense' },
  '朵唯': { icon_text: 'D', bg_color: 'bg-doov' },
  '格力': { icon_text: 'G', bg_color: 'bg-gree' },
  '摩托罗拉': { icon_text: 'M', bg_color: 'bg-moto' },
  '华硕': { icon_text: 'A', bg_color: 'bg-asus' },
  '柔宇': { icon_text: '柔', bg_color: 'bg-royole' },
  '谷歌Google': { icon_text: 'G', bg_color: 'bg-google' },
  '谷歌': { icon_text: 'G', bg_color: 'bg-google' }
}

const HEADER_KEYWORDS = ['开机屏好', '开机屏坏', '不开机', '废板']
const SKIP_COLUMNS = ['网络型号', '序号', '备注']
const NO_SERIES_MARKERS = ['型号', '序号']

function extractBrandName(filename) {
  return filename
    .replace(/\.xlsx$/i, '')
    .replace(/报价单/g, '')
    .replace(/手机/g, '')
    .replace(/\d+$/g, '')
    .trim()
}

function cleanStr(s) {
  if (s == null) return ''
  return String(s).replace(/\n/g, '').replace(/\r/g, '').trim()
}

function isHeaderRow(row) {
  if (!row || row.length === 0) return false
  const text = row.map(c => cleanStr(c)).join(' ')
  return HEADER_KEYWORDS.some(kw => text.includes(kw))
}

function parseHeaderRow(row) {
  let seriesName = null
  const conditions = []
  let hasModelCode = false
  let modelCodeColIndex = -1

  for (let i = 0; i < row.length; i++) {
    const val = cleanStr(row[i])
    if (!val) continue

    if (SKIP_COLUMNS.includes(val)) {
      if (val === '网络型号') {
        hasModelCode = true
        modelCodeColIndex = i
      }
      continue
    }

    if (i === 0) {
      if (NO_SERIES_MARKERS.includes(val)) {
        seriesName = null
      } else {
        seriesName = val
      }
      continue
    }

    conditions.push({ name: val, colIndex: i })
  }

  return { seriesName, conditions, hasModelCode, modelCodeColIndex }
}

function parsePrice(val) {
  if (val == null) return null
  const s = String(val).trim()
  if (!s || s === '/' || s === '-' || s === '—') return null
  const n = parseFloat(s)
  if (isNaN(n) || n === 0) return null
  return n
}

async function getOrCreateBrand(brandName, sortOrder) {
  let brand = await db.Brand.findOne({ where: { name: brandName } })
  if (brand) return brand

  const style = BRAND_STYLE_MAP[brandName] || { icon_text: brandName.substring(0, 2), bg_color: 'bg-default' }

  brand = await db.Brand.create({
    category_id: 1,
    name: brandName,
    code: brandName.toLowerCase(),
    icon_text: style.icon_text,
    bg_color: style.bg_color,
    has_update: 1,
    sort_order: sortOrder,
    status: 1
  })

  console.log(`  Created brand: ${brandName} (id=${brand.id})`)
  return brand
}

async function getOrCreateCondition(conditionName, sortOrder) {
  let condition = await db.ProductCondition.findOne({ where: { name: conditionName } })
  if (condition) return condition

  const code = 'cond_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)

  condition = await db.ProductCondition.create({
    name: conditionName,
    code: code,
    sort_order: sortOrder
  })

  console.log(`  Created condition: ${conditionName} (id=${condition.id})`)
  return condition
}

async function upsertPrice(productId, conditionId, priceVal, effectiveDate) {
  const existing = await db.Price.findOne({
    where: {
      product_id: productId,
      condition_id: conditionId,
      effective_date: effectiveDate
    }
  })

  if (existing) {
    if (existing.price !== priceVal) {
      await existing.update({ price: priceVal })
    }
  } else {
    await db.Price.create({
      product_id: productId,
      condition_id: conditionId,
      price: priceVal,
      is_available: 1,
      effective_date: effectiveDate
    })
  }
}

async function processFile(filePath, brandName, brandSortOrder, effectiveDate, stats) {
  console.log(`\nProcessing: ${brandName}`)

  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 })

  if (data.length < 8) {
    console.log(`  Skipping ${brandName}: not enough rows`)
    return
  }

  const brand = await getOrCreateBrand(brandName, brandSortOrder)
  stats.brands++

  let currentSeries = null
  let currentConditions = []
  let hasModelCode = false
  let modelCodeColIndex = -1
  let productSortOrder = 0
  let conditionSortOrder = stats.conditions

  const conditionCache = {}

  for (let i = 7; i < data.length; i++) {
    const row = data[i]
    if (!row || row.length === 0) continue

    if (isHeaderRow(row)) {
      const parsed = parseHeaderRow(row)
      currentSeries = parsed.seriesName
      currentConditions = parsed.conditions
      hasModelCode = parsed.hasModelCode
      modelCodeColIndex = parsed.modelCodeColIndex
      continue
    }

    if (currentConditions.length === 0) continue

    let productName = ''
    let modelCode = ''
    let nameColIndex = 0

    if (hasModelCode) {
      productName = cleanStr(row[0])
      modelCode = cleanStr(row[modelCodeColIndex])
      nameColIndex = 0
    } else {
      const firstVal = cleanStr(row[0])
      if (/^\d+$/.test(firstVal)) {
        productName = cleanStr(row[1])
        nameColIndex = 1
      } else {
        productName = firstVal
        nameColIndex = 0
      }
    }

    if (!productName) continue

    productSortOrder++

    let product = await db.Product.findOne({
      where: {
        brand_id: brand.id,
        name: productName
      }
    })

    if (!product) {
      product = await db.Product.create({
        brand_id: brand.id,
        category_id: 1,
        name: productName,
        model_code: modelCode || productName,
        series_name: currentSeries,
        sort_order: productSortOrder,
        status: 1
      })
      stats.products++
    }

    for (const cond of currentConditions) {
      const rawVal = row[cond.colIndex]
      const priceVal = parsePrice(rawVal)
      if (priceVal === null) continue

      let condition = conditionCache[cond.name]
      if (!condition) {
        condition = await getOrCreateCondition(cond.name, conditionSortOrder++)
        conditionCache[cond.name] = condition
        stats.conditions++
      }

      await upsertPrice(product.id, condition.id, priceVal, effectiveDate)
      stats.prices++
    }
  }
}

async function main() {
  console.log('Excel Import Script Starting...')
  console.log('Connecting to database...')

  try {
    await db.sequelize.authenticate()
    console.log('Database connected.')
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }

  const effectiveDate = new Date().toISOString().split('T')[0]
  console.log(`Effective date: ${effectiveDate}`)

  const files = fs.readdirSync(EXCEL_DIR)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
    .sort()

  console.log(`Found ${files.length} Excel files`)

  const stats = { brands: 0, products: 0, conditions: 0, prices: 0 }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = path.join(EXCEL_DIR, file)
    const brandName = extractBrandName(file)

    try {
      await processFile(filePath, brandName, i, effectiveDate, stats)
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message)
    }
  }

  console.log('\n========== Import Summary ==========')
  console.log(`Brands processed: ${stats.brands}`)
  console.log(`Products created: ${stats.products}`)
  console.log(`Conditions created: ${stats.conditions}`)
  console.log(`Prices upserted: ${stats.prices}`)
  console.log('====================================')

  await db.sequelize.close()
  console.log('Database connection closed.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
