const router = require('express').Router()
const logger = require('../../utils/logger')
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')

const BRAND_KEYWORDS = {
  '苹果': ['iphone', '苹果', 'apple', 'ipad', 'macbook', 'airpods', 'watch'],
  '华为': ['华为', 'huawei', 'mate', 'p40', 'p50', 'p60', 'pura', 'nova', '荣耀', 'honor', 'hon', 'hua'],
  '小米': ['小米', 'xiaomi', 'redmi', '红米', 'mi ', 'mix', 'xia', 'red'],
  'OPPO': ['oppo', '欧珀', 'find', 'reno', 'ace', 'opp'],
  'vivo': ['vivo', 'iqoo', 'x fold', 'x flip', 'viv', 'iqo'],
  '三星': ['三星', 'samsung', 'galaxy', 'note', 'sam', 'gal'],
  '一加': ['一加', 'oneplus', 'one'],
  '魅族': ['魅族', 'meizu', 'mei'],
  '联想': ['联想', 'lenovo', 'moto', 'motorola', 'len', 'mot'],
  '中兴': ['中兴', 'zte', 'nubia', '红魔', 'zte', 'nub'],
  '真我': ['真我', 'realme', 'gt ', 'rea'],
  '索尼': ['索尼', 'sony', 'xperia', 'son'],
  'LG': ['lg '],
  '诺基亚': ['诺基亚', 'nokia', 'nok'],
  '微软': ['微软', 'microsoft', 'surface', 'mic', 'sur'],
}

const PRODUCT_KEYWORDS = [
  '手机', '平板', '笔记本', '电脑', '手表', '耳机', '音箱',
  '相机', '镜头', '游戏机', '充电器', '数据线', '键盘', '鼠标',
  '显示器', '主机', '服务器', '路由器', '硬盘', '内存', '显卡',
  'pro', 'max', 'mini', 'ultra', 'plus', 'se', 'lite', 'fe',
  'fold', 'flip', 'edge', 'slim',
  '全网通', '电信版', '移动版', '联通版', '双卡', '5G', '4G', '国行', '港版', '美版',
]

function extractKeywords(text) {
  if (!text) return []
  const lowerText = text.toLowerCase()
  const keywords = []

  for (const [brand, kws] of Object.entries(BRAND_KEYWORDS)) {
    for (const kw of kws) {
      if (lowerText.includes(kw.toLowerCase())) {
        keywords.push({ type: 'brand', value: brand, keyword: kw })
        break
      }
    }
  }

  const fragments = lowerText.match(/[a-z]{3,}/g) || []
  for (const fragment of fragments) {
    for (const [brand, kws] of Object.entries(BRAND_KEYWORDS)) {
      const alreadyMatched = keywords.some(k => k.type === 'brand' && k.value === brand)
      if (alreadyMatched) continue
      for (const kw of kws) {
        if (kw.length >= 3 && kw.toLowerCase().startsWith(fragment)) {
          keywords.push({ type: 'brand', value: brand, keyword: kw })
          break
        }
      }
      if (keywords.some(k => k.type === 'brand' && k.value === brand)) break
    }
  }

  for (const kw of PRODUCT_KEYWORDS) {
    if (lowerText.includes(kw.toLowerCase())) {
      keywords.push({ type: 'product', value: kw, keyword: kw })
    }
  }

  const modelPatterns = [
    /\b(\d{1,2}pro\d?)\b/i,
    /\b(\d{1,2}max\d?)\b/i,
    /\b(\d{1,2}mini\d?)\b/i,
    /\b(\d{1,2}ultra\d?)\b/i,
    /\b(\d{1,2}plus\d?)\b/i,
    /\b(ipad\s?\d*)\b/i,
    /\b(iphone\s?\d*\s?(?:pro|max|mini|ultra|plus|se)?)\b/i,
    /\b(mate\s?\d*\s?(?:pro|rs|x|e)?)\b/i,
    /\b(nova\s?\d*\s?(?:pro|ultra|se)?)\b/i,
    /\b(pura\s?\d*\s?(?:pro|ultra)?)\b/i,
    /\b(redmi\s?note\s?\d*\s?(?:pro|plus)?)\b/i,
    /\b(find\s?(?:x\d*|n\d*)\s?(?:pro)?)\b/i,
    /\b(reno\s?\d*\s?(?:pro|z)?)\b/i,
    /\b(galaxy\s?(?:s\d+|note\d+|z\s?(?:fold|flip)\d*)\s?(?:ultra|plus|fe)?)\b/i,
    /\b(\d{1,3}[a-zA-Z]+)\b/,
  ]

  for (const pattern of modelPatterns) {
    const match = lowerText.match(pattern)
    if (match) {
      keywords.push({ type: 'model', value: match[1], keyword: match[1] })
    }
  }

  return keywords
}

async function matchProducts(keywords) {
  if (!keywords.length) return []

  const brandKeywords = keywords.filter(k => k.type === 'brand')
  const modelKeywords = keywords.filter(k => k.type === 'model')
  const productKeywords = keywords.filter(k => k.type === 'product')

  const where = { status: 1 }
  const orConditions = []

  if (brandKeywords.length) {
    const brandNames = [...new Set(brandKeywords.map(k => k.value))]
    const brands = await db.Brand.findAll({
      where: { name: { [Op.in]: brandNames }, status: 1 },
      attributes: ['id', 'name']
    })
    if (brands.length) {
      where.brand_id = { [Op.in]: brands.map(b => b.id) }
    }
  }

  if (modelKeywords.length) {
    for (const mk of modelKeywords) {
      orConditions.push(
        { name: { [Op.like]: `%${mk.value}%` } },
        { model_code: { [Op.like]: `%${mk.value}%` } }
      )
    }
  }

  for (const pk of productKeywords) {
    orConditions.push(
      { name: { [Op.like]: `%${pk.value}%` } },
      { model_code: { [Op.like]: `%${pk.value}%` } },
      { series_name: { [Op.like]: `%${pk.value}%` } }
    )
  }

  for (const bk of brandKeywords) {
    for (const kw of BRAND_KEYWORDS[bk.value] || []) {
      orConditions.push(
        { name: { [Op.like]: `%${kw}%` } },
        { model_code: { [Op.like]: `%${kw}%` } }
      )
    }
  }

  if (orConditions.length) {
    where[Op.or] = orConditions
  }

  const today = new Date().toISOString().split('T')[0]
  const products = await db.Product.findAll({
    where,
    include: [
      { model: db.Brand, as: 'Brand', attributes: ['id', 'name', 'bg_color'] },
      { model: db.Category, as: 'Category', attributes: ['id', 'name', 'code'] },
      {
        model: db.Price,
        as: 'Prices',
        attributes: ['price', 'condition_id', 'effective_date'],
        include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
        where: { effective_date: today },
        required: false
      }
    ],
    limit: 10,
    order: [['sort_order', 'ASC']]
  })

  return products.map(p => {
    const json = p.toJSON()
    let maxPrice = 0
    let minPrice = 0
    const prices = (json.Prices || []).filter(pr => pr.price && parseFloat(pr.price) > 0)
    if (prices.length) {
      const priceValues = prices.map(pr => parseFloat(pr.price))
      maxPrice = Math.max(...priceValues)
      minPrice = Math.min(...priceValues)
    }
    return {
      ...json,
      maxPrice,
      minPrice,
      priceCount: prices.length
    }
  })
}

function downloadImage(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const tmpDir = os.tmpdir()
    const ext = path.extname(url).split('?')[0] || '.jpg'
    const filename = `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
    const filePath = path.join(tmpDir, filename)

    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        if (redirectCount >= 5) {
          reject(new Error('重定向次数超过限制'))
          return
        }
        downloadImage(response.headers.location, redirectCount + 1).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`图片下载失败，状态码: ${response.statusCode}`))
        return
      }
      const fileStream = fs.createWriteStream(filePath)
      response.pipe(fileStream)
      fileStream.on('finish', () => {
        fileStream.close()
        resolve(filePath)
      })
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {})
        reject(err)
      })
    }).on('error', reject)
  })
}

async function baiduOcrRecognize(imagePath) {
  const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY
  const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY

  if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
    return null
  }

  const accessToken = await getBaiduAccessToken(BAIDU_OCR_API_KEY, BAIDU_OCR_SECRET_KEY)
  if (!accessToken) return null

  const imageBase64 = fs.readFileSync(imagePath).toString('base64')

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      image: imageBase64,
      language_type: 'CHN_ENG',
      detect_direction: 'true'
    }).toString()

    const options = {
      hostname: 'aip.baidubce.com',
      path: `/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.error_code && result.error_code !== 0) {
            logger.warn('OCR识别失败或无结果')
            resolve(null)
            return
          }
          const words = (result.words_result || []).map(item => item.words).join(' ')
          logger.info('OCR识别成功，文字: ' + words)
          resolve(words)
        } catch (e) {
          resolve(null)
        }
      })
    })
    req.on('error', () => resolve(null))
    req.write(postData)
    req.end()
  })
}

function getBaiduAccessToken(apiKey, secretKey) {
  return new Promise((resolve) => {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
    const req = https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          resolve(result.access_token || null)
        } catch (e) {
          resolve(null)
        }
      })
    })
    req.on('error', () => resolve(null))
  })
}

function getFallbackProducts() {
  return db.Product.findAll({
    where: { status: 1 },
    include: [
      { model: db.Brand, as: 'Brand', attributes: ['id', 'name', 'bg_color'] },
      { model: db.Category, as: 'Category', attributes: ['id', 'name', 'code'] },
      {
        model: db.Price,
        as: 'Prices',
        attributes: ['price', 'condition_id', 'effective_date'],
        include: [{ model: db.ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
        where: { effective_date: new Date().toISOString().split('T')[0] },
        required: false
      }
    ],
    limit: 5,
    order: [['sort_order', 'ASC']]
  })
}

function formatProductList(products) {
  return products.map(p => {
    const json = p.toJSON ? p.toJSON() : p
    const prices = (json.Prices || []).filter(pr => pr.price && parseFloat(pr.price) > 0)
    let maxPrice = 0
    let minPrice = 0
    if (prices.length) {
      const priceValues = prices.map(pr => parseFloat(pr.price))
      maxPrice = Math.max(...priceValues)
      minPrice = Math.min(...priceValues)
    }
    return { ...json, maxPrice, minPrice, priceCount: prices.length }
  })
}

router.post('/recognize', auth, async (req, res, next) => {
  try {
    const { imageUrl, keywords: userKeywords } = req.body

    if (!imageUrl && !userKeywords) {
      return error(res, '请提供图片URL或关键词', 422, 422)
    }

    let allKeywords = []

    if (userKeywords && Array.isArray(userKeywords)) {
      userKeywords.forEach(kw => {
        allKeywords.push({ type: 'user', value: kw, keyword: kw })
      })
    }

    if (imageUrl) {
      let ocrText = ''
      try {
        const imagePath = await downloadImage(imageUrl)
        try {
          ocrText = await baiduOcrRecognize(imagePath) || ''
        } finally {
          fs.unlink(imagePath, () => {})
        }
      } catch (downloadErr) {
        logger.warn('图片下载失败: ' + downloadErr.message)
        ocrText = ''
      }

      if (ocrText && ocrText.trim()) {
        const ocrKeywords = extractKeywords(ocrText)
        allKeywords = allKeywords.concat(ocrKeywords)
      } else {
        const urlKeywords = extractKeywords(imageUrl)
        allKeywords = allKeywords.concat(urlKeywords)
      }
    }

    if (imageUrl) {
      const filenameKeywords = extractFilenameKeywords(imageUrl)
      if (filenameKeywords.length > 0) {
        logger.info('文件名关键词: ' + JSON.stringify(filenameKeywords.map(k => k.value)))
        allKeywords = allKeywords.concat(filenameKeywords)
      }
    }

    logger.info('关键词: ' + JSON.stringify(allKeywords))

    if (!allKeywords.length) {
      const fallbackProducts = await getFallbackProducts()
      const products = formatProductList(fallbackProducts)
      return success(res, {
        recognized: false,
        message: '未能识别出具体产品，为您推荐热门机型',
        keywords: [],
        products
      })
    }

    const products = await matchProducts(allKeywords)

    if (!products.length) {
      const fallbackProducts = await getFallbackProducts()
      const fallbackResult = formatProductList(fallbackProducts)
      return success(res, {
        recognized: false,
        message: '未找到匹配产品，为您推荐热门机型',
        keywords: allKeywords.map(k => k.value),
        products: fallbackResult
      })
    }

    return success(res, {
      recognized: true,
      message: '识别成功',
      keywords: allKeywords.map(k => k.value),
      products
    })
  } catch (err) {
    next(err)
  }
})

router.get('/history', auth, async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(pageSize)

    const { count, rows } = await db.Order.findAndCountAll({
      where: { user_id: req.userId },
      offset,
      limit: parseInt(pageSize),
      order: [['created_at', 'DESC']]
    })

    return success(res, {
      list: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize))
      }
    })
  } catch (err) {
    next(err)
  }
})

function extractFilenameKeywords(url) {
  if (!url) return []
  const decoded = decodeURIComponent(url)
  const filename = decoded.split('/').pop().split('?')[0].replace(/\.[^.]+$/, '')
  const keywords = []

  const chineseGroups = filename.match(/[\u4e00-\u9fa5]{2,4}/g)
  if (chineseGroups) {
    chineseGroups.forEach(cg => keywords.push({ type: 'product', value: cg, keyword: cg }))
  }

  const alphanumGroups = filename.match(/[a-zA-Z0-9]{2,}/g)
  if (alphanumGroups) {
    alphanumGroups.forEach(ag => {
      if (/[a-zA-Z]/.test(ag)) {
        keywords.push({ type: 'model', value: ag, keyword: ag })
      }
    })
  }

  return keywords
}

module.exports = router