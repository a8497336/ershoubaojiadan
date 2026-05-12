/**
 * @openapi
 * tags:
 *   - name: 管理端-产品管理
 *     description: 产品(机型)CRUD管理接口
 */

/**
 * @openapi
 * /api/admin/products:
 *   get:
 *     tags: [管理端-产品管理]
 *     summary: 获取产品列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand_id
 *         schema: { type: integer }
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 成功
 *   post:
 *     tags: [管理端-产品管理]
 *     summary: 创建产品
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 创建成功
 */

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [管理端-产品管理]
 *     summary: 更新产品
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     tags: [管理端-产品管理]
 *     summary: 删除产品(软删除)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 删除成功
 */

const router = require('express').Router()
const multer = require('multer')
const XLSX = require('xlsx')
const path = require('path')
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound, paginate, error } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

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

const SERIES_INFER_MAP = {
  'One': 'One系列',
  'M9': 'M系列',
  'M8': 'M系列',
  'E9': 'M系列',
  'Desire': 'Desire系列',
  'D830': 'Desire系列',
  'D728': 'Desire系列',
  'D626': 'Desire系列',
  'D530': 'Desire系列',
  '826': '8系列',
  '820': '8系列',
  '816': '8系列',
  '803': '8系列',
  '802': '8系列',
  '8088': '8系列'
}

function inferSeriesName(productName) {
  if (!productName) return null
  for (const prefix of Object.keys(SERIES_INFER_MAP)) {
    if (productName.toLowerCase().startsWith(prefix.toLowerCase())) {
      return SERIES_INFER_MAP[prefix]
    }
  }
  return null
}

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true)
    } else {
      cb(new Error('仅支持 .xlsx 格式的Excel文件'))
    }
  }
})

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
      if (val === '网络型号') { hasModelCode = true; modelCodeColIndex = i }
      continue
    }
    if (i === 0) {
      seriesName = NO_SERIES_MARKERS.includes(val) ? null : val
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
    category_id: 1, name: brandName, code: brandName.toLowerCase(),
    icon_text: style.icon_text, bg_color: style.bg_color,
    has_update: 1, sort_order: sortOrder, status: 1
  })
  return brand
}

async function getOrCreateCondition(conditionName, sortOrder) {
  let condition = await db.ProductCondition.findOne({ where: { name: conditionName } })
  if (condition) return condition
  const code = 'cond_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  condition = await db.ProductCondition.create({ name: conditionName, code, sort_order: sortOrder })
  return condition
}

async function upsertPrice(productId, conditionId, priceVal, effectiveDate) {
  const existing = await db.Price.findOne({
    where: { product_id: productId, condition_id: conditionId, effective_date: effectiveDate }
  })
  if (existing) {
    if (existing.price !== priceVal) await existing.update({ price: priceVal })
  } else {
    await db.Price.create({
      product_id: productId, condition_id: conditionId,
      price: priceVal, is_available: 1, effective_date: effectiveDate
    })
  }
}

router.get('/', adminAuth, async (req, res, next) => {
  try {
    const { brand_id, category_id, keyword, page = 1, pageSize = 20 } = req.query
    const where = { status: 1 }
    if (brand_id) where.brand_id = brand_id
    if (category_id) where.category_id = category_id
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { model_code: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const { offset, limit } = paginate(page, pageSize)
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [
        { model: db.Brand, as: 'Brand', attributes: ['id', 'name'] },
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] }
      ],
      order: [['sort_order', 'ASC']],
      offset, limit
    })
    return success(res, {
      list: rows,
      pagination: { total: count, page: parseInt(page), pageSize: parseInt(pageSize), totalPages: Math.ceil(count / parseInt(pageSize)) }
    })
  } catch (err) { next(err) }
})

router.post('/', adminAuth, async (req, res, next) => {
  try {
    const product = await db.Product.create(req.body)
    return success(res, product, '创建成功')
  } catch (err) { next(err) }
})

router.put('/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id)
    if (!product) return notFound(res, '产品不存在')
    await product.update(req.body)
    return success(res, product, '更新成功')
  } catch (err) { next(err) }
})

router.delete('/:id', adminAuth, async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id)
    if (!product) return notFound(res, '产品不存在')
    await product.update({ status: 0 })
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

router.post('/import', adminAuth, importUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, '请选择文件', 422, 422)
    }

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })

    if (data.length < 8) {
      return error(res, '文件中未找到有效数据（数据行不足）', 422, 422)
    }

    const brandName = extractBrandName(req.file.originalname)
    const effectiveDate = new Date().toISOString().split('T')[0]

    const brand = await getOrCreateBrand(brandName, 0)

    const stats = { brands: 1, products: 0, conditions: 0, prices: 0 }

    let currentSeries = null
    let currentConditions = []
    let hasModelCode = false
    let modelCodeColIndex = -1
    let productSortOrder = 0
    let conditionSortOrder = 0
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

      // Skip description text rows (long text without model-like format)
      if (productName.length > 20 || /[\u4e00-\u9fa5]{6,}/.test(productName)) {
        console.log(`  Skipping description text: ${productName.substring(0, 40)}`)
        continue
      }

      productSortOrder++

      let product = await db.Product.findOne({
        where: { brand_id: brand.id, name: productName }
      })

      const inferredSeries = currentSeries || inferSeriesName(productName)

      if (!product) {
        product = await db.Product.create({
          brand_id: brand.id,
          category_id: 1,
          name: productName,
          model_code: modelCode || productName,
          series_name: inferredSeries,
          sort_order: productSortOrder,
          status: 1
        })
        stats.products++
      } else if (!product.series_name && inferredSeries) {
        await product.update({ series_name: inferredSeries })
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

    if (stats.products === 0) {
      return error(res, '文件中未找到有效产品数据', 422, 422)
    }

    return success(res, {
      brandName: brandName,
      brands: stats.brands,
      products: stats.products,
      conditions: stats.conditions,
      prices: stats.prices
    }, '导入成功')
  } catch (err) {
    if (err.message && err.message.includes('仅支持')) {
      return error(res, err.message, 422, 422)
    }
    next(err)
  }
})

module.exports = router
