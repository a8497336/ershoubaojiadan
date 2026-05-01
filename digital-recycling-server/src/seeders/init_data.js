module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    await queryInterface.bulkInsert('categories', [
      { name: '环保手机报价', code: 'phone', sort_order: 1, status: 1, created_at: now, updated_at: now },
      { name: '废旧手机内配回收报价', code: 'internal', sort_order: 2, status: 1, created_at: now, updated_at: now },
      { name: '电子产品杂货铺报价', code: 'electronics', sort_order: 3, status: 1, created_at: now, updated_at: now },
      { name: '疑难机型查看', code: 'difficult', sort_order: 4, status: 1, created_at: now, updated_at: now },
      { name: '靓机回收报价', code: 'goodPhone', sort_order: 5, status: 1, created_at: now, updated_at: now },
      { name: '名酒回收报价', code: 'liquor', sort_order: 6, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('product_conditions', [
      { name: '开机屏好', code: 'screen_good', description: '开机且屏幕完好', sort_order: 1 },
      { name: '开机大屏好', code: 'big_screen_good', description: '开机且大屏完好', sort_order: 2 },
      { name: '开机小屏好', code: 'small_screen_good', description: '开机且小屏完好', sort_order: 3 },
      { name: '开机屏坏', code: 'screen_broken', description: '开机但屏幕损坏', sort_order: 4 },
      { name: '不开机', code: 'no_power', description: '无法开机', sort_order: 5 },
      { name: '废板整机', code: 'dead_board', description: '主板损坏无法开机的完整机器', sort_order: 6 },
      { name: '开机屏好外屏碎', code: 'screen_good_outer_cracked', description: '开机屏好但外屏碎裂', sort_order: 7 },
      { name: '开机坏未拆标', code: 'broken_no_tamper', description: '开机坏且未拆标', sort_order: 8 }
    ], {})

    const phoneBrands = [
      { name: '热门老年机', icon_text: '老年', bg_color: 'bg-xiaomi', sort_order: 1 },
      { name: '智能机/电容屏', icon_text: '智能', bg_color: 'bg-apple', sort_order: 2 },
      { name: '手机拆机件', icon_text: '拆机', bg_color: 'bg-huawei', sort_order: 3 },
      { name: '电池', icon_text: '电池', bg_color: 'bg-blackberry', sort_order: 4 },
      { name: 'OPPO', icon_text: 'OP', bg_color: 'bg-oppo', sort_order: 5 },
      { name: 'VIVO', icon_text: 'V', bg_color: 'bg-vivo', sort_order: 6 },
      { name: '小米', icon_text: 'mi', bg_color: 'bg-xiaomi', sort_order: 7 },
      { name: '华为OK板', icon_text: 'HW', bg_color: 'bg-huawei', sort_order: 8 },
      { name: '华为', icon_text: 'HW', bg_color: 'bg-huawei', sort_order: 9 },
      { name: '三星', icon_text: 'S', bg_color: 'bg-samsung', sort_order: 10 },
      { name: '苹果', icon_text: '苹果', bg_color: 'bg-apple', sort_order: 11 },
      { name: '高仿苹果', icon_text: '高仿', bg_color: 'bg-apple', sort_order: 12 },
      { name: '金立', icon_text: 'G', bg_color: 'bg-jinli', sort_order: 13 },
      { name: '联想', icon_text: 'L', bg_color: 'bg-lenovo', sort_order: 14 },
      { name: '酷派/ivvi', icon_text: 'cool', bg_color: 'bg-coolpad', sort_order: 15 },
      { name: '魅族', icon_text: 'M', bg_color: 'bg-meizu', sort_order: 16 },
      { name: '锤子', icon_text: 'T', bg_color: 'bg-smartisan', sort_order: 17 },
      { name: '360', icon_text: '+', bg_color: 'bg-360', sort_order: 18 },
      { name: 'HTC', icon_text: 'htc', bg_color: 'bg-htc', sort_order: 19 },
      { name: '黑莓', icon_text: '黑莓', bg_color: 'bg-blackberry', sort_order: 20 },
      { name: '一加', icon_text: '1+', bg_color: 'bg-oneplus', sort_order: 21 },
      { name: '真我/realme', icon_text: 'R', bg_color: 'bg-realme', sort_order: 22 },
      { name: '诺基亚', icon_text: 'N', bg_color: 'bg-nokia', sort_order: 23 },
      { name: '美图', icon_text: 'M', bg_color: 'bg-meitu', sort_order: 24 },
      { name: '乐视', icon_text: 'L', bg_color: 'bg-leeco', sort_order: 25 },
      { name: '努比亚', icon_text: 'n', bg_color: 'bg-nubia', sort_order: 26 },
      { name: '中国移动', icon_text: '移动', bg_color: 'bg-chinamobile', sort_order: 27 },
      { name: 'TCL', icon_text: 'T', bg_color: 'bg-tcl', sort_order: 28 },
      { name: '中兴', icon_text: 'Z', bg_color: 'bg-zte', sort_order: 29 },
      { name: '8848', icon_text: '8848', bg_color: 'bg-8848', sort_order: 30 },
      { name: '糖果/国美', icon_text: 'GOME', bg_color: 'bg-sugar', sort_order: 31 },
      { name: '步步高', icon_text: '步步', bg_color: 'bg-bbk', sort_order: 32 },
      { name: '海信', icon_text: 'H', bg_color: 'bg-hisense', sort_order: 33 },
      { name: '朵唯', icon_text: 'D', bg_color: 'bg-doov', sort_order: 34 },
      { name: '格力', icon_text: 'G', bg_color: 'bg-gree', sort_order: 35 },
      { name: '摩托罗拉', icon_text: 'M', bg_color: 'bg-moto', sort_order: 36 },
      { name: '华硕', icon_text: 'A', bg_color: 'bg-asus', sort_order: 37 },
      { name: '柔宇', icon_text: '柔', bg_color: 'bg-royole', sort_order: 38 },
      { name: '谷歌Google', icon_text: 'G', bg_color: 'bg-google', sort_order: 39 }
    ]

    const brandsData = phoneBrands.map((b, i) => ({
      category_id: 1,
      name: b.name,
      code: b.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_'),
      icon_text: b.icon_text,
      bg_color: b.bg_color,
      has_update: 1,
      sort_order: b.sort_order,
      status: 1,
      created_at: now,
      updated_at: now
    }))

    const otherBrands = [
      { category_id: 2, name: '电池回收', code: 'dianchi', icon_text: '电池', bg_color: 'bg-blackberry', has_update: 0, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { category_id: 2, name: '主板回收', code: 'zhuban', icon_text: '主板', bg_color: 'bg-huawei', has_update: 0, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { category_id: 2, name: '屏幕回收', code: 'pingmu', icon_text: '屏幕', bg_color: 'bg-vivo', has_update: 0, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { category_id: 2, name: '摄像头回收', code: 'shexiangtou', icon_text: '摄像', bg_color: 'bg-oppo', has_update: 0, sort_order: 4, status: 1, created_at: now, updated_at: now },
      { category_id: 2, name: '配件回收', code: 'peijian', icon_text: '配件', bg_color: 'bg-xiaomi', has_update: 0, sort_order: 5, status: 1, created_at: now, updated_at: now },
      { category_id: 3, name: '平板电脑', code: 'pingban', icon_text: '平板', bg_color: 'bg-apple', has_update: 0, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { category_id: 3, name: '笔记本', code: 'bijiben', icon_text: '笔记', bg_color: 'bg-lenovo', has_update: 0, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { category_id: 3, name: '智能手表', code: 'shoubiao', icon_text: '手表', bg_color: 'bg-samsung', has_update: 0, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { category_id: 3, name: '耳机', code: 'erji', icon_text: '耳机', bg_color: 'bg-oneplus', has_update: 0, sort_order: 4, status: 1, created_at: now, updated_at: now },
      { category_id: 3, name: '充电宝', code: 'chongdianbao', icon_text: '充电', bg_color: 'bg-xiaomi', has_update: 0, sort_order: 5, status: 1, created_at: now, updated_at: now },
      { category_id: 4, name: '进水机', code: 'jinshui', icon_text: '进水', bg_color: 'bg-vivo', has_update: 0, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { category_id: 4, name: 'ID锁机', code: 'idsuo', icon_text: 'ID锁', bg_color: 'bg-apple', has_update: 0, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { category_id: 4, name: '碎屏机', code: 'suiping', icon_text: '碎屏', bg_color: 'bg-huawei', has_update: 0, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { category_id: 5, name: '苹果靓机', code: 'apple_liangji', icon_text: '苹果', bg_color: 'bg-apple', has_update: 0, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { category_id: 5, name: '华为靓机', code: 'huawei_liangji', icon_text: '华为', bg_color: 'bg-huawei', has_update: 0, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { category_id: 5, name: '小米靓机', code: 'xiaomi_liangji', icon_text: '小米', bg_color: 'bg-xiaomi', has_update: 0, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { category_id: 5, name: 'OPPO靓机', code: 'oppo_liangji', icon_text: 'OPPO', bg_color: 'bg-oppo', has_update: 0, sort_order: 4, status: 1, created_at: now, updated_at: now },
      { category_id: 5, name: '三星靓机', code: 'samsung_liangji', icon_text: '三星', bg_color: 'bg-samsung', has_update: 0, sort_order: 5, status: 1, created_at: now, updated_at: now },
      { category_id: 6, name: '茅台', code: 'maotai', icon_text: '茅台', bg_color: 'bg-smartisan', has_update: 0, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { category_id: 6, name: '五粮液', code: 'wuliangye', icon_text: '五粮', bg_color: 'bg-jinli', has_update: 0, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { category_id: 6, name: '泸州老窖', code: 'luzhou', icon_text: '泸州', bg_color: 'bg-360', has_update: 0, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { category_id: 6, name: '剑南春', code: 'jiannanchun', icon_text: '剑南', bg_color: 'bg-meitu', has_update: 0, sort_order: 4, status: 1, created_at: now, updated_at: now }
    ]

    await queryInterface.bulkInsert('brands', [...brandsData, ...otherBrands], {})

    const productDefs = [
      { brand_name: '华为', category_id: 1, products: [
        { name: '华为Mate 60 Pro', model_code: 'MATE60PRO', series_name: 'Mate系列' },
        { name: '华为P60 Pro', model_code: 'P60PRO', series_name: 'P系列' },
        { name: '华为Mate 50', model_code: 'MATE50', series_name: 'Mate系列' },
        { name: '华为P50 Pro', model_code: 'P50PRO', series_name: 'P系列' },
        { name: '华为nova 11', model_code: 'NOVA11', series_name: 'nova系列' },
        { name: '华为Mate X5', model_code: 'MATEX5', series_name: '折叠屏系列' },
        { name: '华为畅享60', model_code: 'CHANGXIANG60', series_name: '畅享系列' },
        { name: '华为nova 12', model_code: 'NOVA12', series_name: 'nova系列' }
      ]},
      { brand_name: '苹果', category_id: 1, products: [
        { name: 'iPhone 15 Pro Max', model_code: 'IP15PM', series_name: 'iPhone 15系列' },
        { name: 'iPhone 15 Pro', model_code: 'IP15P', series_name: 'iPhone 15系列' },
        { name: 'iPhone 15', model_code: 'IP15', series_name: 'iPhone 15系列' },
        { name: 'iPhone 14 Pro Max', model_code: 'IP14PM', series_name: 'iPhone 14系列' },
        { name: 'iPhone 14 Pro', model_code: 'IP14P', series_name: 'iPhone 14系列' },
        { name: 'iPhone 14', model_code: 'IP14', series_name: 'iPhone 14系列' },
        { name: 'iPhone 13', model_code: 'IP13', series_name: 'iPhone 13系列' },
        { name: 'iPhone 12', model_code: 'IP12', series_name: 'iPhone 12系列' }
      ]},
      { brand_name: '小米', category_id: 1, products: [
        { name: '小米14 Pro', model_code: 'MI14PRO', series_name: '小米数字系列' },
        { name: '小米14', model_code: 'MI14', series_name: '小米数字系列' },
        { name: '小米13 Ultra', model_code: 'MI13U', series_name: '小米数字系列' },
        { name: '小米13', model_code: 'MI13', series_name: '小米数字系列' },
        { name: 'Redmi K60 Pro', model_code: 'K60PRO', series_name: 'Redmi K系列' },
        { name: 'Redmi Note 12', model_code: 'RN12', series_name: 'Redmi Note系列' },
        { name: '小米MIX Fold 3', model_code: 'MIXFOLD3', series_name: 'MIX系列' }
      ]},
      { brand_name: 'OPPO', category_id: 1, products: [
        { name: 'OPPO Find X7 Ultra', model_code: 'FX7U', series_name: 'Find X系列' },
        { name: 'OPPO Find X7', model_code: 'FX7', series_name: 'Find X系列' },
        { name: 'OPPO Reno 11 Pro', model_code: 'R11P', series_name: 'Reno系列' },
        { name: 'OPPO Reno 11', model_code: 'R11', series_name: 'Reno系列' },
        { name: 'OPPO A79', model_code: 'A79', series_name: 'A系列' },
        { name: 'OPPO Find N3', model_code: 'FN3', series_name: 'Find N系列' }
      ]},
      { brand_name: 'VIVO', category_id: 1, products: [
        { name: 'VIVO X100 Pro', model_code: 'X100P', series_name: 'X系列' },
        { name: 'VIVO X100', model_code: 'X100', series_name: 'X系列' },
        { name: 'VIVO S18 Pro', model_code: 'S18P', series_name: 'S系列' },
        { name: 'VIVO S18', model_code: 'S18', series_name: 'S系列' },
        { name: 'VIVO Y100', model_code: 'Y100', series_name: 'Y系列' },
        { name: 'VIVO X Fold 3', model_code: 'XFOLD3', series_name: 'X Fold系列' }
      ]}
    ]

    const brands = await queryInterface.sequelize.query('SELECT id, name FROM brands', { type: Sequelize.QueryTypes.SELECT })
    const brandMap = {}
    brands.forEach(b => { brandMap[b.name] = b.id })

    const productsData = []
    let productSortOrder = 1
    productDefs.forEach(def => {
      const brandId = brandMap[def.brand_name]
      if (!brandId) return
      def.products.forEach(p => {
        productsData.push({
          name: p.name,
          brand_id: brandId,
          category_id: def.category_id,
          model_code: p.model_code,
          series_name: p.series_name,
          image: null,
          status: 1,
          sort_order: productSortOrder++,
          created_at: now,
          updated_at: now
        })
      })
    })

    await queryInterface.bulkInsert('products', productsData, {})

    const products = await queryInterface.sequelize.query('SELECT id, name, brand_id FROM products', { type: Sequelize.QueryTypes.SELECT })

    const basePrices = {
      '华为Mate 60 Pro': [5200, 5000, 4900, 2800, 1600, 1400, 4200, 2400],
      '华为P60 Pro': [3800, 3600, 3500, 2000, 1200, 1000, 3100, 1700],
      '华为Mate 50': [2800, 2600, 2500, 1400, 800, 700, 2300, 1200],
      '华为P50 Pro': [2200, 2000, 1900, 1100, 600, 500, 1800, 950],
      '华为nova 11': [1200, 1100, 1050, 600, 350, 300, 1000, 520],
      '华为Mate X5': [8800, 8500, 8200, 5000, 3000, 2500, 7200, 4200],
      '华为畅享60': [400, 380, 360, 200, 120, 100, 340, 180],
      '华为nova 12': [1500, 1400, 1350, 800, 450, 380, 1250, 680],
      'iPhone 15 Pro Max': [6500, 6300, 6200, 3500, 2000, 1800, 5500, 3000],
      'iPhone 15 Pro': [5500, 5300, 5200, 3000, 1700, 1500, 4600, 2500],
      'iPhone 15': [4200, 4000, 3900, 2200, 1300, 1100, 3500, 1900],
      'iPhone 14 Pro Max': [4800, 4600, 4500, 2600, 1500, 1300, 4000, 2200],
      'iPhone 14 Pro': [4000, 3800, 3700, 2100, 1200, 1000, 3300, 1800],
      'iPhone 14': [3000, 2800, 2700, 1500, 900, 750, 2500, 1300],
      'iPhone 13': [2000, 1900, 1800, 1000, 600, 500, 1700, 850],
      'iPhone 12': [1200, 1100, 1050, 600, 350, 300, 1000, 520],
      '小米14 Pro': [3200, 3000, 2900, 1600, 900, 800, 2600, 1400],
      '小米14': [2500, 2300, 2200, 1200, 700, 600, 2000, 1050],
      '小米13 Ultra': [3500, 3300, 3200, 1800, 1000, 900, 2900, 1550],
      '小米13': [2000, 1900, 1800, 1000, 600, 500, 1700, 850],
      'Redmi K60 Pro': [1800, 1700, 1600, 900, 500, 450, 1500, 780],
      'Redmi Note 12': [600, 550, 520, 300, 180, 150, 500, 260],
      '小米MIX Fold 3': [4500, 4300, 4200, 2400, 1400, 1200, 3700, 2000],
      'OPPO Find X7 Ultra': [3800, 3600, 3500, 2000, 1200, 1000, 3100, 1700],
      'OPPO Find X7': [3000, 2800, 2700, 1500, 900, 750, 2500, 1300],
      'OPPO Reno 11 Pro': [1800, 1700, 1600, 900, 500, 450, 1500, 780],
      'OPPO Reno 11': [1300, 1200, 1150, 650, 380, 330, 1100, 560],
      'OPPO A79': [500, 470, 450, 250, 150, 130, 420, 220],
      'OPPO Find N3': [4200, 4000, 3900, 2200, 1300, 1100, 3500, 1900],
      'VIVO X100 Pro': [3200, 3000, 2900, 1600, 900, 800, 2600, 1400],
      'VIVO X100': [2600, 2400, 2300, 1300, 750, 650, 2100, 1100],
      'VIVO S18 Pro': [1800, 1700, 1600, 900, 500, 450, 1500, 780],
      'VIVO S18': [1300, 1200, 1150, 650, 380, 330, 1100, 560],
      'VIVO Y100': [500, 470, 450, 250, 150, 130, 420, 220],
      'VIVO X Fold 3': [5000, 4800, 4700, 2700, 1600, 1400, 4100, 2300]
    }

    const pricesData = []
    products.forEach(product => {
      const priceList = basePrices[product.name]
      if (!priceList) return
      for (let i = 0; i < 8; i++) {
        pricesData.push({
          product_id: product.id,
          condition_id: i + 1,
          price: priceList[i],
          price_date: today,
          created_at: now,
          updated_at: now
        })
      }
    })

    await queryInterface.bulkInsert('prices', pricesData, {})

    await queryInterface.bulkInsert('membership_plans', [
      { key_code: 'month', name: '月度会员权限', duration_days: 30, price: 39, original_price: 99, subscriber_count: 63242, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { key_code: 'quarter', name: '季度会员权限', duration_days: 90, price: 79, original_price: 159, subscriber_count: 6703, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { key_code: 'half', name: '半年会员权限', duration_days: 180, price: 110, original_price: 299, subscriber_count: 3356, sort_order: 3, status: 1, created_at: now, updated_at: now },
      { key_code: 'two-year', name: '两年会员权限', duration_days: 730, price: 199, original_price: 399, subscriber_count: 11977, sort_order: 4, status: 1, created_at: now, updated_at: now },
      { key_code: 'three-year', name: '三年会员权限', duration_days: 1095, price: 299, original_price: 599, subscriber_count: 1080, sort_order: 5, status: 1, created_at: now, updated_at: now },
      { key_code: 'year', name: '一年会员权限', duration_days: 365, price: 119, original_price: 299, subscriber_count: 38945, sort_order: 6, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('roles', [
      { name: '超级管理员', code: 'super_admin', description: '拥有所有权限', created_at: now, updated_at: now },
      { name: '管理员', code: 'admin', description: '拥有大部分管理权限', created_at: now, updated_at: now },
      { name: '运营人员', code: 'operator', description: '拥有内容运营权限', created_at: now, updated_at: now }
    ], {})

    const bcrypt = require('bcryptjs')
    const adminPassword = bcrypt.hashSync('admin123456', 10)
    await queryInterface.bulkInsert('admins', [
      { username: 'admin', password: adminPassword, real_name: '系统管理员', role_id: 1, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('banners', [
      { title: '寻找城市合伙人', subtitle: 'BUSINESS PARTNER', link_type: 'page', link_url: '/pages/index/index', sort_order: 1, status: 1, created_at: now, updated_at: now },
      { title: '专业数码回收报价', subtitle: 'DIGITAL RECYCLING', link_type: 'page', link_url: '/pages/price-quote/price-quote', sort_order: 2, status: 1, created_at: now, updated_at: now },
      { title: '诚信服务每一位客户', subtitle: 'TRUSTED SERVICE', link_type: 'page', link_url: '/pages/index/index', sort_order: 3, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('stores', [
      { name: '安徽门店', contact_name: '范凯旋', contact_phone: '18755875222', wechat: '15361862828', province: '安徽省', city: '阜阳市', district: '颍州区', address: '安徽省阜阳市颍州区双子塔写字楼 A 座', latitude: 33.1624, longitude: 115.6218, sort_order: 1, status: 1, created_at: now, updated_at: now },
      { name: '深圳门店', contact_name: '李明', contact_phone: '13800138001', wechat: '13800138001', province: '广东省', city: '深圳市', district: '福田区', address: '广东省深圳市福田区华强北路赛格广场1楼', latitude: 22.5431, longitude: 114.0881, sort_order: 2, status: 1, created_at: now, updated_at: now },
      { name: '广州门店', contact_name: '王芳', contact_phone: '13900139001', wechat: '13900139001', province: '广东省', city: '广州市', district: '天河区', address: '广东省广州市天河区天河路385号太古汇', latitude: 23.1369, longitude: 113.3253, sort_order: 3, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('videos', [
      { title: '华为手机查询报价教程', category: '查看报价', cover_url: null, video_url: null, description: '教您如何快速查询华为手机回收报价', sort_order: 1, status: 1, created_at: now, updated_at: now },
      { title: '报价单查看教程', category: '实用功能', cover_url: null, video_url: null, description: '教您如何查看和使用报价单功能', sort_order: 2, status: 1, created_at: now, updated_at: now },
      { title: '如何下单回收手机', category: '下单相关', cover_url: null, video_url: null, description: '教您如何快速下单回收手机', sort_order: 3, status: 1, created_at: now, updated_at: now },
      { title: '回收收入提现指南', category: '收入相关', cover_url: null, video_url: null, description: '教您如何提现回收收入到微信钱包', sort_order: 4, status: 1, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('announcements', [
      { title: '数码回收网春节放假通知', content: '尊敬的用户，春节期间（1月28日-2月4日）暂停回收服务，2月5日恢复正常。期间仍可在线提交订单，节后统一处理。祝您新春快乐！', is_top: 1, status: 1, published_at: now, created_at: now, updated_at: now },
      { title: '新版报价系统上线公告', content: '尊敬的用户，我们已全面升级报价系统，新增实时报价更新、历史价格对比等功能，为您提供更精准的回收报价服务。', is_top: 0, status: 1, published_at: now, created_at: now, updated_at: now },
      { title: '会员权益升级通知', content: '尊敬的用户，即日起会员权益全面升级！月度会员可享受无限次拍照查价、专属客服通道等特权，欢迎开通体验。', is_top: 0, status: 1, published_at: now, created_at: now, updated_at: now }
    ], {})

    await queryInterface.bulkInsert('settings', [
      { key: 'receiver_name', value: '陈约', description: '收件人姓名', created_at: now, updated_at: now },
      { key: 'receiver_phone', value: '15361862828', description: '收款电话(微信同号)', created_at: now, updated_at: now },
      { key: 'receiver_address', value: '广东省深圳市福田区华强北街道深南中路2018号兴华大厦B座12楼12B', description: '收货地址', created_at: now, updated_at: now },
      { key: 'service_phone', value: '15361862828', description: '客服电话', created_at: now, updated_at: now },
      { key: 'service_wechat', value: '15361862828', description: '客服微信', created_at: now, updated_at: now },
      { key: 'membership_phone', value: '16618180111', description: '会员服务电话', created_at: now, updated_at: now },
      { key: 'free_scan_count', value: '10', description: '免费拍照查价次数', created_at: now, updated_at: now },
      { key: 'sign_points', value: '5', description: '每日签到积分', created_at: now, updated_at: now }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', null, {})
    await queryInterface.bulkDelete('announcements', null, {})
    await queryInterface.bulkDelete('videos', null, {})
    await queryInterface.bulkDelete('stores', null, {})
    await queryInterface.bulkDelete('banners', null, {})
    await queryInterface.bulkDelete('admins', null, {})
    await queryInterface.bulkDelete('roles', null, {})
    await queryInterface.bulkDelete('membership_plans', null, {})
    await queryInterface.bulkDelete('prices', null, {})
    await queryInterface.bulkDelete('products', null, {})
    await queryInterface.bulkDelete('brands', null, {})
    await queryInterface.bulkDelete('product_conditions', null, {})
    await queryInterface.bulkDelete('categories', null, {})
  }
}
