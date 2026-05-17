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
 *     summary: 删除产品(硬删除)
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
const JSZip = require('jszip')
const path = require('path')
const { adminAuth } = require('../../middlewares/adminAuth')
const { success, notFound, paginate, error } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')
const iconv = require('iconv-lite')

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

function fixGarbledFilename(garbledStr) {
  try {
    const utf8String = Buffer.from(garbledStr, 'latin1').toString('utf8')
    if (hasValidChinese(utf8String)) {
      console.log(`  ✓ 从乱码恢复文件名(UTF-8): "${utf8String}"`)
      return utf8String
    }
  } catch (e) {
    console.log(`  Latin-1→UTF-8解码失败: ${e.message}`)
  }
  try {
    const latin1Buffer = Buffer.from(garbledStr, 'latin1')
    const gbkString = iconv.decode(latin1Buffer, 'gbk')
    if (hasValidChinese(gbkString)) {
      console.log(`  ✓ 从乱码恢复文件名(GBK): "${gbkString}"`)
      return gbkString
    }
  } catch (e) {
    console.log(`  Latin-1→GBK解码失败: ${e.message}`)
  }
  try {
    const gbkString = iconv.decode(Buffer.from(garbledStr, 'binary'), 'gbk')
    if (hasValidChinese(gbkString)) {
      console.log(`  ✓ 从binary恢复文件名(GBK): "${gbkString}"`)
      return gbkString
    }
  } catch (e) {
    console.log(`  binary→GBK解码失败: ${e.message}`)
  }
  try {
    const utf16leString = Buffer.from(garbledStr, 'latin1').toString('utf16le')
    if (hasValidChinese(utf16leString)) {
      console.log(`  ✓ 从乱码恢复文件名(UTF-16LE): "${utf16leString}"`)
      return utf16leString
    }
  } catch (e) {
    console.log(`  Latin-1→UTF-16LE解码失败: ${e.message}`)
  }
  try {
    const latin1Buffer = Buffer.from(garbledStr, 'latin1')
    const big5String = iconv.decode(latin1Buffer, 'big5')
    if (hasValidChinese(big5String)) {
      console.log(`  ✓ 从乱码恢复文件名(Big5): "${big5String}"`)
      return big5String
    }
  } catch (e) {
    console.log(`  Latin-1→Big5解码失败: ${e.message}`)
  }
  try {
    const gbkString = iconv.decode(Buffer.from(garbledStr), 'gbk')
    if (hasValidChinese(gbkString)) {
      console.log(`  ✓ 从乱码恢复文件名(直接GBK): "${gbkString}"`)
      return gbkString
    }
  } catch (e) {
    console.log(`  直接GBK解码失败: ${e.message}`)
  }
  try {
    const extracted = garbledStr.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim()
    if (extracted && hasValidChinese(extracted)) {
      console.log(`  ✓ 从乱码中提取有效字符: "${extracted}"`)
      return extracted
    }
  } catch (e) {
    console.log(`  字符提取失败: ${e.message}`)
  }
  return null
}

function extractBrandName(filename) {
  let name = filename
    .replace(/\.xlsx$/i, '')
    .trim()
  
  if (!name) return ''
  
  if (hasValidChinese(name)) {
    return cleanBrandName(name)
  }
  
  if (/^[a-zA-Z0-9]+$/.test(name)) {
    return cleanBrandName(name)
  }
  
  if (isGarbledText(name)) {
    console.log('  ⚠️ 检测到文件名包含乱码，尝试编码修复...')
    const recovered = fixGarbledFilename(name)
    if (recovered) {
      console.log(`  ✓ 编码修复成功，清理后缀...`)
      return cleanBrandName(recovered)
    }
    console.log('  ⚠️ 编码修复失败，返回空触发Excel回退')
    return ''
  }
  
  return cleanBrandName(name)
}

function cleanBrandName(name) {
  name = name
    .replace(/报价单/g, '')
    .replace(/手机/g, '')
    .replace(/回收/g, '')
    .trim()
  
  if (/^\d+$/.test(name)) {
    return name
  }
  
  return name.replace(/\d+$/g, '').trim()
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
  const cleanedName = cleanGarbledData(brandName)
  if (!cleanedName) {
    console.log(`  ⚠️ 跳过乱码品牌名: ${brandName}`)
    return null
  }
  
  if (!hasValidChinese(cleanedName)) {
    console.log(`  ⚠️ 跳过不包含有效中文的品牌名: ${cleanedName}`)
    return null
  }
  
  brandName = cleanedName
  const style = BRAND_STYLE_MAP[brandName] || { icon_text: brandName.substring(0, 2), bg_color: 'bg-default' }
  const [brand, created] = await db.Brand.findOrCreate({
    where: { name: brandName },
    defaults: {
      category_id: 1,
      code: brandName.toLowerCase(),
      icon_text: style.icon_text,
      bg_color: style.bg_color,
      has_update: 1,
      sort_order: sortOrder,
      status: 1
    }
  })
  if (created) {
    console.log(`  ✓ 新建品牌: "${brandName}"`)
  }
  return brand
}

async function getOrCreateCondition(conditionName, sortOrder) {
  const code = 'cond_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  const [condition] = await db.ProductCondition.findOrCreate({
    where: { name: conditionName },
    defaults: { name: conditionName, code, sort_order: sortOrder }
  })
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
    await product.destroy()
    return success(res, null, '删除成功')
  } catch (err) { next(err) }
})

router.post('/import', adminAuth, importUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, '请选择文件', 422, 422)
    }

    console.log('正在检测文件编码...')
    const originalBuffer = req.file.buffer
    
    let wb
    try {
      wb = XLSX.read(originalBuffer, { type: 'buffer' })
    } catch (xlsxErr) {
      console.log(`  ⚠️ XLSX标准解析失败: ${xlsxErr.message}`)
      console.log('  ⚠️ 文件非标准XLSX，尝试转换格式...')
      const converted = await convertToStandardXLSX(originalBuffer)
      if (converted) {
        try {
          wb = XLSX.read(converted, { type: 'buffer' })
          console.log('  ✓ 转换后解析成功')
        } catch (e2) {
          return error(res, '文件格式无效或已损坏，请重新保存为标准Excel文件后重试', 422, 422)
        }
      } else {
        return error(res, '文件格式无效或已损坏，请重新保存为标准Excel文件后重试', 422, 422)
      }
    }
    const ws = wb.Sheets[wb.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })

    if (data.length < 8) {
      return error(res, '文件中未找到有效数据（数据行不足）', 422, 422)
    }

    let brandName = extractBrandName(req.file.originalname)

    if (!brandName) {
      console.log('  ⚠️ 从文件名无法提取品牌名，尝试从Excel内容匹配...')
      brandName = extractBrandFromExcelContent(data)
      if (brandName) {
        console.log(`  ✓ 从Excel内容匹配到品牌: "${brandName}"`)
      }
    }

    if (brandName && !BRAND_STYLE_MAP[brandName]) {
      console.log(`  ⚠️ 品牌名 "${brandName}" 不在预定义列表中，尝试从Excel内容校正...`)
      const correctedName = extractBrandFromExcelContent(data)
      if (correctedName && BRAND_STYLE_MAP[correctedName]) {
        console.log(`  ✓ 从Excel内容校正品牌: "${brandName}" → "${correctedName}"`)
        brandName = correctedName
      }
    }

    const effectiveDate = new Date().toISOString().split('T')[0]

    const brand = await getOrCreateBrand(brandName, 0)
    if (!brand) {
      console.log(`  ⚠️ 跳过乱码品牌: ${brandName}`)
      if (!brandName) {
        return error(res, '无法从文件名或Excel内容中识别品牌，请检查文件格式', 400, 400)
      }
      return error(res, `品牌名 "${brandName}" 为乱码或无效，已跳过导入`, 400, 400)
    }

    const stats = { brands: 1, products: 0, productsUpdated: 0, conditions: 0, prices: 0, skippedRows: 0 }

    // ===== Phase 1: 批量预加载现有产品和价格 =====
    const existingProducts = await db.Product.findAll({ where: { brand_id: brand.id } })
    const productMap = new Map(existingProducts.map(p => [p.name, p]))
    const productIds = existingProducts.map(p => p.id)

    const existingPrices = productIds.length > 0
      ? await db.Price.findAll({ where: { product_id: { [Op.in]: productIds }, effective_date: effectiveDate } })
      : []
    const priceMap = new Map()
    for (const p of existingPrices) {
      priceMap.set(`${p.product_id}:${p.condition_id}`, p)
    }

    // ===== Phase 2: 解析所有行（纯内存操作，零DB查询） =====
    const newProductsMap = new Map()       // key: productName -> tempIdx (插入顺序)
    const newProductsArr = []              // 按顺序存储产品，供 bulkCreate 使用
    const newPricesMap = new Map()         // key: `${product_id}:${condition_id}:${effective_date}` -> priceData（去重）
    const newProductPricesData = []        // { tempIdx, ... } 暂存新产品的价格
    const pricesToUpdate = []
    const seriesMap = new Map()            // key: product.id -> series_name（去重）

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

      if (!isValidProductName(productName)) {
        console.log(`  跳过无效的产品名: ${productName}`)
        stats.skippedRows++
        continue
      }

      const descriptionKeywords = [
        '所有', '备注', '提示', '须知', '注意', '说明', '声明', '联系', '免责',
        '欢迎', '免责声明', '温馨提示', '特别提示', '平台', '公司', '倡议', '坚持', '统一',
        '愿各位', '早日突围', '突围', '打造', '共同', '回收', '兄弟们', '一起', '套路', '公平', '公正', '公开',
        '炸弹机', '芯片', '缺失', '更换', '外观', '正常', '价格', '不满意', '货物', '交易',
        '远离', '核算', '深圳', '行情', '一机一价', '参考', '让我们', '回收价格', '报价参考',
        '诚信', '经营', '合作', '共赢'
      ]
      const hasKeyword = descriptionKeywords.some(kw => productName.includes(kw))
      const pureChineseOnly = /^[\u4e00-\u9fa5]+$/.test(productName)
      const isTooLongPureChinese = pureChineseOnly && productName.length > 6

      if (hasKeyword || isTooLongPureChinese) {
        console.log(`  Skipping description text: ${productName.substring(0, 40)}`)
        continue
      }

      productSortOrder++
      const inferredSeries = currentSeries || inferSeriesName(productName)

      // 确保条件已缓存（仅4个条件，首次创建后缓存）
      for (const cond of currentConditions) {
        if (!conditionCache[cond.name]) {
          conditionCache[cond.name] = await getOrCreateCondition(cond.name, conditionSortOrder++)
          stats.conditions++
        }
      }

      if (productMap.has(productName)) {
        const product = productMap.get(productName)
        stats.productsUpdated++
        if (!product.series_name && inferredSeries) {
          seriesMap.set(product.id, { id: product.id, series_name: inferredSeries })
        }

        for (const cond of currentConditions) {
          const rawVal = row[cond.colIndex]
          const priceVal = parsePrice(rawVal)
          if (priceVal === null) continue

          const condObj = conditionCache[cond.name]
          const key = `${product.id}:${condObj.id}`
          if (priceMap.has(key)) {
            const existingPrice = priceMap.get(key)
            if (existingPrice.price !== priceVal) {
              pricesToUpdate.push({ id: existingPrice.id, price: priceVal })
            }
          } else {
            const priceKey = `${product.id}:${condObj.id}:${effectiveDate}`
            if (!newPricesMap.has(priceKey)) {
              newPricesMap.set(priceKey, {
                product_id: product.id, condition_id: condObj.id,
                price: priceVal, is_available: 1, effective_date: effectiveDate
              })
              stats.prices++
            }
          }
        }
        continue
      }

      if (!newProductsMap.has(productName)) {
        const tempIdx = newProductsArr.length
        newProductsMap.set(productName, tempIdx)
        newProductsArr.push({
          brand_id: brand.id, category_id: 1, name: productName,
          model_code: modelCode || productName, series_name: inferredSeries,
          sort_order: productSortOrder, status: 1
        })
        stats.products++
      }

      const tempIdx = newProductsMap.get(productName)
      for (const cond of currentConditions) {
        const rawVal = row[cond.colIndex]
        const priceVal = parsePrice(rawVal)
        if (priceVal === null) continue

        const condObj = conditionCache[cond.name]
        newProductPricesData.push({
          tempIdx, condition_id: condObj.id,
          price: priceVal, is_available: 1, effective_date: effectiveDate
        })
        // Note: stats.prices 在 Phase 3 newPricesMap 去重後才準確計數
      }
    }

    // ===== Phase 3: 批量写入 =====
    const createdProducts = newProductsArr.length > 0
      ? await db.Product.bulkCreate(newProductsArr)
      : []

    // 将新产品价格中的 tempIdx 映射为真实 product.id，并去重
    for (const np of newProductPricesData) {
      const priceKey = `${createdProducts[np.tempIdx].id}:${np.condition_id}:${np.effective_date}`
      if (!newPricesMap.has(priceKey)) {
        newPricesMap.set(priceKey, {
          product_id: createdProducts[np.tempIdx].id,
          condition_id: np.condition_id,
          price: np.price,
          is_available: 1,
          effective_date: np.effective_date
        })
        stats.prices++
      }
    }

    // 批量创建新价格（已去重）
    if (newPricesMap.size > 0) {
      await db.Price.bulkCreate(Array.from(newPricesMap.values()))
    }

    // 并行更新现有价格 + series_name（已去重）
    if (pricesToUpdate.length > 0 || seriesMap.size > 0) {
      await Promise.all([
        ...pricesToUpdate.map(p =>
          db.Price.update({ price: p.price }, { where: { id: p.id } })
        ),
        ...Array.from(seriesMap.values()).map(p =>
          db.Product.update({ series_name: p.series_name }, { where: { id: p.id } })
        )
      ])
    }

    if (stats.products === 0 && stats.productsUpdated === 0) {
      return error(res, '文件中未找到有效产品数据', 422, 422)
    }

    return success(res, {
      brandName: brandName,
      brands: stats.brands,
      products: stats.products,
      productsUpdated: stats.productsUpdated,
      conditions: stats.conditions,
      prices: stats.prices,
      skippedRows: stats.skippedRows
    }, '导入成功')
  } catch (err) {
    if (err.message && err.message.includes('仅支持')) {
      return error(res, err.message, 422, 422)
    }
    next(err)
  }
})

function isGarbledText(text) {
  if (!text) return false
  if (/^[a-zA-Z0-9]+$/.test(text)) return false
  return !hasValidChinese(text) && /[\x80-\xFF]/.test(text)
}

function hasValidChinese(text) {
  if (!text) return false
  
  // 如果只包含数字和字母（如"360"、"TCL"），认为是有效的
  if (/^[a-zA-Z0-9]+$/.test(text)) {
    return true
  }
  
  // 检查是否包含有效中文
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const totalChars = text.replace(/[\x00-\u1F]/g, '').length
  return totalChars > 0 && chineseChars / totalChars > 0.1
}

function isValidProductName(productName) {
  if (!productName) return false
  
  // 如果只包含字母、数字、空格、括号、连字符（如"N6 Pro"、"N7 Lite"、"Q30"），认为是有效的
  if (/^[a-zA-Z0-9\s\(\)\-\/\.]+$/.test(productName)) {
    return true
  }
  
  const chineseChars = (productName.match(/[\u4e00-\u9fa5]/g) || []).length
  const totalChars = productName.replace(/[\x00-\u1F]/g, '').length
  return totalChars > 0 && chineseChars / totalChars > 0.1
}

function cleanGarbledData(data) {
  if (!data) return null
  if (isGarbledText(data)) {
    console.log(`  ⚠️ 检测到乱码数据: ${data.substring(0, 50)}`)
    return null
  }
  return data
}

function extractBrandFromExcelContent(data) {
  if (!data || data.length === 0) return null
  const brandNames = Object.keys(BRAND_STYLE_MAP)
  const seenTexts = new Set()
  
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i]
    if (!row) continue
    for (const cell of row) {
      const text = String(cell || '').trim()
      if (!text || seenTexts.has(text)) continue
      seenTexts.add(text)
      
      for (const brandName of brandNames) {
        if (text.includes(brandName)) {
          return brandName
        }
      }
    }
  }
  return null
}

async function cleanupGarbageBrands() {
  try {
    const allBrands = await db.Brand.findAll()
    const garbageIds = []
    
    for (const brand of allBrands) {
      if (isGarbledText(brand.name) || !hasValidChinese(brand.name)) {
        garbageIds.push(brand.id)
        console.log(`  发现乱码品牌: ID=${brand.id}, name=${brand.name}`)
      }
    }
    
    if (garbageIds.length > 0) {
      await db.Brand.destroy({ where: { id: garbageIds } })
      console.log(`✓ 已清理 ${garbageIds.length} 条乱码品牌数据`)
      return garbageIds.length
    } else {
      console.log('✓ 未发现乱码品牌数据')
      return 0
    }
  } catch (error) {
    console.error('清理品牌数据失败:', error.message)
    throw error
  }
}

async function cleanupGarbageProducts() {
  try {
    const allProducts = await db.Product.findAll()
    const garbageIds = []
    
    for (const product of allProducts) {
      if (isGarbledText(product.name) || !hasValidChinese(product.name)) {
        garbageIds.push(product.id)
        console.log(`  发现乱码产品: ID=${product.id}, name=${product.name}`)
      }
    }
    
    if (garbageIds.length > 0) {
      await db.Product.destroy({ where: { id: garbageIds } })
      console.log(`✓ 已清理 ${garbageIds.length} 条乱码产品数据`)
      return garbageIds.length
    } else {
      console.log('✓ 未发现乱码产品数据')
      return 0
    }
  } catch (error) {
    console.error('清理产品数据失败:', error.message)
    throw error
  }
}

async function cleanupAllGarbageData() {
  console.log('开始清理乱码数据...')
  console.log('='.repeat(50))
  
  const brandsDeleted = await cleanupGarbageBrands()
  const productsDeleted = await cleanupGarbageProducts()
  
  console.log('='.repeat(50))
  console.log('清理完成!')
  console.log(`  - 清理品牌数: ${brandsDeleted}`)
  console.log(`  - 清理产品数: ${productsDeleted}`)
  
  return { brandsDeleted, productsDeleted }
}

function isValidXLSX(buffer) {
  if (!buffer || buffer.length < 4) return false
  const pkHeader = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04
  if (!pkHeader) return false
  if (buffer.length > 10 * 1024 * 1024) return false
  return true
}

async function convertToStandardXLSX(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer)
    const stdZip = new JSZip()
    const promises = []
    zip.forEach((relativePath, file) => {
      if (file.dir) return
      promises.push(file.async('nodebuffer').then(content => {
        stdZip.file(relativePath, content)
      }))
    })
    await Promise.all(promises)
    const stdBuffer = await stdZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    console.log('  ✓ 成功转换为标准XLSX格式')
    return stdBuffer
  } catch (e) {
    console.log(`  ✗ JSZip解析失败，无法转换: ${e.message}`)
    return null
  }
}

function detectAndConvertEncoding(buffer) {
  try {
    const utf8String = buffer.toString('utf8')
    
    if (isGarbledText(utf8String)) {
      console.log('  ⚠️ 检测到可能的编码问题，尝试GBK解码...')
      
      try {
        const gbkBuffer = Buffer.from(utf8String, 'latin1')
        const gbkString = iconv.decode(gbkBuffer, 'gbk')
        
        if (hasValidChinese(gbkString)) {
          console.log('  ✓ 成功转换GBK编码')
          return Buffer.from(gbkString, 'utf8')
        }
      } catch (e) {
        console.log('  ✗ GBK解码失败:', e.message)
      }
    }
    
    return buffer
  } catch (e) {
    console.log('  ⚠️ 编码检测异常，使用原始数据:', e.message)
    return buffer
  }
}

module.exports = router
