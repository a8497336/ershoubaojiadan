const path = require('path')
const fs = require('fs')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const https = require('https')
const { Sequelize, Op } = require('sequelize')

const config = require('../src/config/database')
const dbConfig = config.development

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    timezone: dbConfig.timezone,
    define: dbConfig.define
  }
)

const BRAND_KEYWORDS = {
  '苹果': ['iphone', '苹果', 'apple', 'ipad', 'macbook', 'airpods', 'watch', 'app', 'iph'],
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

function getBaiduAccessToken(apiKey, secretKey) {
  return new Promise((resolve) => {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.access_token) {
            console.log('  ✓ 百度 access_token 获取成功')
            resolve(result.access_token)
          } else {
            console.log('  ✗ access_token 获取失败:', JSON.stringify(result))
            resolve(null)
          }
        } catch (e) {
          console.log('  ✗ access_token 解析失败:', e.message)
          resolve(null)
        }
      })
    }).on('error', (e) => {
      console.log('  ✗ access_token 请求失败:', e.message)
      resolve(null)
    })
  })
}

function baiduOcrRecognize(base64Image) {
  return new Promise(async (resolve) => {
    const apiKey = process.env.BAIDU_OCR_API_KEY
    const secretKey = process.env.BAIDU_OCR_SECRET_KEY

    if (!apiKey || !secretKey) {
      console.log('  ✗ 未配置 BAIDU_OCR_API_KEY / BAIDU_OCR_SECRET_KEY')
      resolve(null)
      return
    }

    const accessToken = await getBaiduAccessToken(apiKey, secretKey)
    if (!accessToken) {
      resolve(null)
      return
    }

    const postData = new URLSearchParams({
      image: base64Image,
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
          console.log('  OCR API 原始响应:', JSON.stringify(result, null, 2))
          if (result.error_code && result.error_code !== 0) {
            console.log('  ✗ OCR 识别失败: error_code=' + result.error_code + ', error_msg=' + result.error_msg)
            resolve(null)
            return
          }
          const words = (result.words_result || []).map(item => item.words).join(' ')
          console.log('  ✓ OCR 识别成功，文字: ' + words)
          resolve(words)
        } catch (e) {
          console.log('  ✗ OCR 响应解析失败:', e.message)
          resolve(null)
        }
      })
    })
    req.on('error', (e) => {
      console.log('  ✗ OCR 请求失败:', e.message)
      resolve(null)
    })
    req.write(postData)
    req.end()
  })
}

async function matchProducts(keywords, Product, Brand, Category, Price, ProductCondition) {
  if (!keywords.length) return []

  const brandKeywords = keywords.filter(k => k.type === 'brand')
  const modelKeywords = keywords.filter(k => k.type === 'model')
  const productKeywords = keywords.filter(k => k.type === 'product')

  const where = { status: 1 }
  const orConditions = []

  if (brandKeywords.length) {
    const brandNames = [...new Set(brandKeywords.map(k => k.value))]
    const brands = await Brand.findAll({
      where: { name: { [Op.in]: brandNames }, status: 1 },
      attributes: ['id', 'name']
    })
    if (brands.length) {
      where.brand_id = { [Op.in]: brands.map(b => b.id) }
      console.log('  匹配到品牌:', brands.map(b => b.name).join(', '))
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
  const products = await Product.findAll({
    where,
    include: [
      { model: Brand, as: 'Brand', attributes: ['id', 'name', 'bg_color'] },
      { model: Category, as: 'Category', attributes: ['id', 'name', 'code'] },
      {
        model: Price,
        as: 'Prices',
        attributes: ['price', 'condition_id', 'effective_date'],
        include: [{ model: ProductCondition, as: 'Condition', attributes: ['id', 'name', 'code'] }],
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
      id: json.id,
      name: json.name,
      model_code: json.model_code,
      series_name: json.series_name,
      brand: json.Brand ? json.Brand.name : '-',
      maxPrice,
      minPrice,
      priceCount: prices.length
    }
  })
}

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

async function main() {
  const imagePath = process.argv[2]
  if (!imagePath) {
    console.log('用法: node scripts/test-ocr.js <图片路径>')
    process.exit(1)
  }

  const absPath = path.resolve(imagePath)
  if (!fs.existsSync(absPath)) {
    console.log('图片不存在:', absPath)
    process.exit(1)
  }

  console.log('═══════════════════════════════════════')
  console.log('  百度 OCR 识别测试')
  console.log('═══════════════════════════════════════')
  console.log('图片:', absPath)
  console.log('')

  console.log('[1] 读取图片并转 base64...')
  const imageBuffer = fs.readFileSync(absPath)
  const base64Image = imageBuffer.toString('base64')
  console.log('  文件大小:', (imageBuffer.length / 1024).toFixed(2), 'KB')
  console.log('')

  console.log('[2] 调用百度 OCR...')
  const ocrText = await baiduOcrRecognize(base64Image)
  if (!ocrText) {
    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('  结果: OCR 识别失败（无文字或API错误）')
    console.log('═══════════════════════════════════════')
    process.exit(0)
  }
  console.log('')

  console.log('[3] 提取 OCR 关键词...')
  const keywords = extractKeywords(ocrText)
  console.log('  OCR关键词列表:')
  keywords.forEach(k => console.log('    - [' + k.type + '] ' + k.value + ' (匹配: ' + k.keyword + ')'))

  console.log('')
  console.log('[3.1] 提取文件名关键词...')
  const fileKeywords = extractFilenameKeywords(absPath)
  if (fileKeywords.length > 0) {
    console.log('  文件名关键词列表:')
    fileKeywords.forEach(k => console.log('    - [' + k.type + '] ' + k.value))
    keywords.push(...fileKeywords)
  } else {
    console.log('  未从文件名提取到关键词')
  }

  if (keywords.length === 0) {
    console.log('  ✗ 未提取到任何关键词')
    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('  结果: 关键词提取失败')
    console.log('  建议: 在 scan.js 的 BRAND_KEYWORDS 或 modelPatterns 中补充相关关键词')
    console.log('═══════════════════════════════════════')
    process.exit(0)
  }
  console.log('')
  console.log('  合并后关键词总数: ' + keywords.length)
  console.log('')

  console.log('[4] 连接数据库...')
  const db = require('../src/models/index')
  console.log('  ✓ 数据库已连接')
  console.log('')

  console.log('[5] 匹配产品...')
  const products = await matchProducts(
    keywords,
    db.Product, db.Brand, db.Category, db.Price, db.ProductCondition
  )
  console.log('')

  console.log('═══════════════════════════════════════')
  console.log('  测试结果')
  console.log('═══════════════════════════════════════')
  console.log('OCR 文字:', ocrText)
  console.log('匹配产品数:', products.length)
  console.log('')
  if (products.length > 0) {
    console.log('产品列表:')
    console.log('┌──────┬──────────────────────┬──────────┬──────────┬──────────┐')
    console.log('│ 序号 │ 产品名称             │ 品牌     │ 型号     │ 回收价   │')
    console.log('├──────┼──────────────────────┼──────────┼──────────┼──────────┤')
    products.forEach((p, i) => {
      const name = (p.name || '-').substring(0, 20).padEnd(20)
      const brand = (p.brand || '-').substring(0, 8).padEnd(8)
      const model = (p.model_code || '-').substring(0, 8).padEnd(8)
      const price = p.maxPrice > 0 ? '¥' + p.maxPrice : '-'
      console.log(`│ ${String(i + 1).padEnd(4)} │ ${name} │ ${brand} │ ${model} │ ${price.padEnd(8)} │`)
    })
    console.log('└──────┴──────────────────────┴──────────┴──────────┴──────────┘')
  } else {
    console.log('未匹配到任何产品')
    console.log('')
    console.log('建议:')
    console.log('  1. 检查数据库中是否有包含关键词的产品')
    console.log('  2. 检查 model_code / name 字段是否匹配 OCR 识别的文字')
  }

  await sequelize.close()
  process.exit(0)
}

main().catch(err => {
  console.error('测试脚本错误:', err)
  process.exit(1)
})