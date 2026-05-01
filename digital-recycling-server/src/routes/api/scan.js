const router = require('express').Router()
const { auth } = require('../../middlewares/auth')
const { success, error } = require('../../utils/response')
const db = require('../../models')
const { Op } = require('sequelize')

const BRAND_KEYWORDS = {
  '苹果': ['iphone', '苹果', 'apple', 'ipad', 'macbook', 'airpods', 'watch'],
  '华为': ['华为', 'huawei', 'mate', 'p40', 'p50', 'p60', 'pura', 'nova', '荣耀', 'honor'],
  '小米': ['小米', 'xiaomi', 'redmi', '红米', 'mi ', 'mix'],
  'OPPO': ['oppo', '欧珀', 'find', 'reno', 'ace'],
  'vivo': ['vivo', 'iqoo', 'x fold', 'x flip'],
  '三星': ['三星', 'samsung', 'galaxy', 'note'],
  '一加': ['一加', 'oneplus'],
  '魅族': ['魅族', 'meizu'],
  '联想': ['联想', 'lenovo', 'moto', 'motorola'],
  '中兴': ['中兴', 'zte', 'nubia', '红魔'],
  '真我': ['真我', 'realme', 'gt '],
  '索尼': ['索尼', 'sony', 'xperia'],
  'LG': ['lg '],
  '诺基亚': ['诺基亚', 'nokia'],
  '微软': ['微软', 'microsoft', 'surface'],
}

const PRODUCT_KEYWORDS = [
  '手机', '平板', '笔记本', '电脑', '手表', '耳机', '音箱',
  '相机', '镜头', '游戏机', '充电器', '数据线', '键盘', '鼠标',
  '显示器', '主机', '服务器', '路由器', '硬盘', '内存', '显卡',
  'pro', 'max', 'mini', 'ultra', 'plus', 'se', 'lite', 'fe',
  'fold', 'flip', 'edge', 'slim',
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
      const urlKeywords = extractKeywords(imageUrl)
      allKeywords = allKeywords.concat(urlKeywords)
    }

    if (!allKeywords.length) {
      const fallbackProducts = await db.Product.findAll({
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

      const products = fallbackProducts.map(p => {
        const json = p.toJSON()
        let maxPrice = 0
        let minPrice = 0
        const prices = (json.Prices || []).filter(pr => pr.price && parseFloat(pr.price) > 0)
        if (prices.length) {
          const priceValues = prices.map(pr => parseFloat(pr.price))
          maxPrice = Math.max(...priceValues)
          minPrice = Math.min(...priceValues)
        }
        return { ...json, maxPrice, minPrice, priceCount: prices.length }
      })

      return success(res, {
        recognized: false,
        message: '未能识别出具体产品，为您推荐热门机型',
        keywords: [],
        products
      })
    }

    const products = await matchProducts(allKeywords)

    if (!products.length) {
      const fallbackProducts = await db.Product.findAll({
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

      const fallbackResult = fallbackProducts.map(p => {
        const json = p.toJSON()
        let maxPrice = 0
        let minPrice = 0
        const prices = (json.Prices || []).filter(pr => pr.price && parseFloat(pr.price) > 0)
        if (prices.length) {
          const priceValues = prices.map(pr => parseFloat(pr.price))
          maxPrice = Math.max(...priceValues)
          minPrice = Math.min(...priceValues)
        }
        return { ...json, maxPrice, minPrice, priceCount: prices.length }
      })

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

module.exports = router
