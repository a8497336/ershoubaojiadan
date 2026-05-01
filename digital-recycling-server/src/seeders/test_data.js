module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date()

    await queryInterface.bulkDelete('logistics_timelines', null, {})
    await queryInterface.bulkDelete('order_items', null, {})
    await queryInterface.bulkDelete('orders', null, {})
    await queryInterface.bulkDelete('carts', null, {})
    await queryInterface.bulkDelete('prices', null, {})
    await queryInterface.bulkDelete('products', null, {})
    await queryInterface.bulkDelete('points_logs', null, {})
    await queryInterface.bulkDelete('wallet_logs', null, {})
    await queryInterface.bulkDelete('membership_orders', null, {})
    await queryInterface.bulkDelete('messages', null, {})
    await queryInterface.bulkDelete('announcements', null, {})
    await queryInterface.bulkDelete('wallets', null, {})
    await queryInterface.bulkDelete('addresses', null, {})
    await queryInterface.bulkDelete('users', null, {})

    const users = []
    for (let i = 1; i <= 20; i++) {
      const timestamp = Date.now()
      users.push({
        openid: `test_openid_${i}_${timestamp}`,
        union_id: `test_union_${i}`,
        phone: `138${String(i).padStart(8, '0')}`,
        nickname: `用户${i}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        user_no: `UT${String(i).padStart(6, '0')}`,
        points: Math.floor(Math.random() * 1000) + 100,
        scan_remaining: Math.floor(Math.random() * 20) + 5,
        membership_id: i % 3 === 0 ? i : null,
        membership_expire: i % 3 === 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        total_recycled: Math.floor(Math.random() * 50) + 1,
        total_amount: Math.floor(Math.random() * 10000) + 500,
        co2_saved: Math.floor(Math.random() * 100) + 10,
        status: 1,
        last_login_at: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        updated_at: now
      })
    }

    await queryInterface.bulkInsert('users', users, {})

    const insertedUsers = await queryInterface.sequelize.query(
      'SELECT id, nickname, phone FROM users ORDER BY id',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    const provinces = ['广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '河南省', '山东省', '福建省', '安徽省']
    const cities = {
      '广东省': ['深圳市', '广州市', '东莞市', '佛山市', '珠海市'],
      '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市'],
      '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
      '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市'],
      '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'],
      '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'],
      '河南省': ['郑州市', '洛阳市', '开封市', '安阳市', '新乡市'],
      '山东省': ['济南市', '青岛市', '烟台市', '威海市', '潍坊市'],
      '福建省': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市'],
      '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市']
    }

    const addresses = []
    insertedUsers.forEach((user) => {
      const province = provinces[user.id % provinces.length]
      const city = cities[province][Math.floor(Math.random() * cities[province].length)]
      const district = ['区', '县', '市'][Math.floor(Math.random() * 3)]

      addresses.push({
        user_id: user.id,
        name: user.nickname,
        phone: user.phone,
        province: province,
        city: city,
        district: district,
        detail: `${city}${district}XX路XX号XX小区${Math.floor(Math.random() * 20) + 1}栋${Math.floor(Math.random() * 30) + 1}室`,
        is_default: 1,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000)),
        updated_at: now
      })
    })

    await queryInterface.bulkInsert('addresses', addresses, {})

    const wallets = insertedUsers.map((user) => ({
      user_id: user.id,
      balance: Math.floor(Math.random() * 2000) + 200,
      frozen: Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0,
      total_income: Math.floor(Math.random() * 5000) + 1000,
      total_withdraw: Math.floor(Math.random() * 3000) + 500,
      created_at: now,
      updated_at: now
    }))

    await queryInterface.bulkInsert('wallets', wallets, {})

    const walletLogs = []
    const walletLogTypes = [1, 2, 3, 4]
    const walletLogSources = { 1: 'recycle', 2: 'withdraw', 3: 'refund', 4: 'bonus' }
    const walletLogRemarks = { 1: '回收订单收入', 2: '提现', 3: '订单退款', 4: '活动奖励' }

    wallets.forEach((wallet) => {
      const logCount = Math.floor(Math.random() * 5) + 2
      for (let i = 0; i < logCount; i++) {
        const type = walletLogTypes[Math.floor(Math.random() * walletLogTypes.length)]
        const amount = Math.floor(Math.random() * 300) + 50
        const source = walletLogSources[type]
        const balanceAfter = Math.floor(Math.random() * 2000) + amount

        walletLogs.push({
          user_id: wallet.user_id,
          type: type,
          amount: amount,
          balance_after: balanceAfter,
          source: source,
          source_id: `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          remark: walletLogRemarks[type],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000))
        })
      }
    })

    for (let i = 0; i < walletLogs.length; i += 50) {
      await queryInterface.bulkInsert('wallet_logs', walletLogs.slice(i, i + 50), {})
    }

    const pointsLogs = []
    const pointsLogTypes = [1, 2, 3, 4]
    const pointsLogRemarks = { 1: '每日签到', 2: '回收奖励', 3: '积分兑换', 4: '活动奖励' }
    const pointsLogSources = { 1: 'sign', 2: 'recycle', 3: 'exchange', 4: 'bonus' }

    insertedUsers.forEach((user) => {
      const logCount = Math.floor(Math.random() * 4) + 1
      for (let i = 0; i < logCount; i++) {
        const type = pointsLogTypes[Math.floor(Math.random() * pointsLogTypes.length)]
        const points = Math.floor(Math.random() * 30) + 5
        const source = pointsLogSources[type]

        pointsLogs.push({
          user_id: user.id,
          type: type,
          points: points,
          balance_after: Math.floor(Math.random() * 1000) + points,
          source: source,
          source_id: `${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          remark: pointsLogRemarks[type],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000))
        })
      }
    })

    for (let i = 0; i < pointsLogs.length; i += 50) {
      await queryInterface.bulkInsert('points_logs', pointsLogs.slice(i, i + 50), {})
    }

    const brandIds = await queryInterface.sequelize.query(
      'SELECT id FROM brands WHERE category_id = 1 LIMIT 10',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    if (brandIds.length === 0) {
      console.log('No brands found, skipping product creation')
      return
    }

    const products = []
    const productNames = {
      1: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13'],
      2: ['Mate 60 Pro', 'Mate 60', 'P60 Pro', 'P50', 'nova 11', 'Mate 40 Pro'],
      3: ['Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 13 Pro', 'Redmi K70 Pro', 'Redmi Note 13 Pro'],
      4: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy S23'],
      5: ['Find X7 Ultra', 'Find X7 Pro', 'Find X6 Pro', 'Reno 11 Pro', 'Reno 11', 'Find X5 Pro'],
      6: ['X100 Pro', 'X100', 'X90 Pro+', 'X90 Pro', 'X80 Pro', 'V29 Pro'],
      7: ['Find N3', 'Find N2', 'Reno 10 Pro+', 'K11', 'A98', 'A78']
    }

    const brandMap = {}
    for (let i = 0; i < Math.min(brandIds.length, 7); i++) {
      brandMap[i + 1] = brandIds[i].id
    }

    for (const [key, names] of Object.entries(productNames)) {
      if (brandMap[key]) {
        names.forEach((name, idx) => {
          products.push({
            brand_id: brandMap[key],
            category_id: 1,
            name: name,
            model_code: `MODEL${key}${idx}`,
            series_name: name.split(' ')[0],
            image: `https://via.placeholder.com/300x300.png?text=${encodeURIComponent(name)}`,
            description: `${name}智能手机，配置先进，性能强劲`,
            sort_order: products.length + 1,
            status: 1,
            created_at: now,
            updated_at: now
          })
        })
      }
    }

    let pricesCount = 0
    if (products.length > 0) {
      await queryInterface.bulkInsert('products', products, {})

      const insertedProducts = await queryInterface.sequelize.query(
        'SELECT id, name FROM products ORDER BY id',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )

      const conditionIds = await queryInterface.sequelize.query(
        'SELECT id FROM product_conditions ORDER BY sort_order',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      )

      if (conditionIds.length > 0) {
        const prices = []
        const basePrice = 2000

        insertedProducts.forEach((product, productIdx) => {
          conditionIds.forEach((condition, conditionIdx) => {
            let price = basePrice - (conditionIdx * 200) - (productIdx * 100)
            price = Math.max(price, 50)

            prices.push({
              product_id: product.id,
              condition_id: condition.id,
              price: price,
              is_available: 1,
              effective_date: now.toISOString().split('T')[0],
              created_at: now,
              updated_at: now
            })
          })
        })

        for (let i = 0; i < prices.length; i += 50) {
          await queryInterface.bulkInsert('prices', prices.slice(i, i + 50), {})
        }
        pricesCount = prices.length
      }

      const carts = []
      for (let i = 0; i < 10; i++) {
        const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)]
        const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)]
        const conditionId = conditionIds[Math.floor(Math.random() * Math.min(conditionIds.length, 8))]

        carts.push({
          user_id: user.id,
          product_id: product.id,
          condition_id: conditionId.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          unit_price: Math.floor(Math.random() * 1500) + 200,
          is_selected: Math.random() > 0.3 ? 1 : 0,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
          updated_at: now
        })
      }

      await queryInterface.bulkInsert('carts', carts, {})

      const orders = []
      const orderItems = []
      const statuses = ['shipping', 'pending', 'completed', 'cancelled']
      const logisticsCompanies = ['顺丰速运', '中通快递', '圆通速递', '韵达快递']

      for (let i = 0; i < 15; i++) {
        const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)]
        const orderNo = `ORD${Date.now()}${String(i + 1).padStart(4, '0')}`
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const itemCount = Math.floor(Math.random() * 3) + 1
        let totalAmount = 0
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))

        const orderItemsForOrder = []
        for (let j = 0; j < itemCount; j++) {
          const product = insertedProducts[Math.floor(Math.random() * insertedProducts.length)]
          const conditionId = conditionIds[Math.floor(Math.random() * Math.min(conditionIds.length, 8))]
          const unitPrice = Math.floor(Math.random() * 1500) + 200
          const quantity = Math.floor(Math.random() * 2) + 1
          const subtotal = unitPrice * quantity

          totalAmount += subtotal

          orderItemsForOrder.push({
            product_id: product.id,
            product_name: product.name,
            condition_name: `状况${conditionId.id}`,
            quantity: quantity,
            unit_price: unitPrice,
            subtotal: subtotal,
            created_at: createdAt
          })
        }

        const userAddress = addresses.find(a => a.user_id === user.id)
        let paidAt = null
        let completedAt = null
        let cancelledAt = null

        if (status === 'completed') {
          paidAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
          completedAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
        } else if (status === 'cancelled') {
          cancelledAt = new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
        }

        const orderData = {
          order_no: orderNo,
          user_id: user.id,
          status: status,
          total_amount: totalAmount,
          actual_amount: status === 'completed' ? totalAmount * 0.95 : null,
          receiver_name: userAddress ? userAddress.name : '测试用户',
          receiver_phone: userAddress ? userAddress.phone : '13800000000',
          receiver_address: userAddress ? `${userAddress.province}${userAddress.city}${userAddress.district}${userAddress.detail}` : '测试地址',
          logistics_company: status !== 'pending' ? logisticsCompanies[Math.floor(Math.random() * logisticsCompanies.length)] : null,
          tracking_no: status !== 'pending' ? `${Date.now()}${Math.floor(Math.random() * 1000000)}` : null,
          logistics_status: status === 'completed' ? 'received' : (status === 'shipping' ? 'transit' : null),
          paid_at: paidAt,
          completed_at: completedAt,
          cancelled_at: cancelledAt,
          remark: Math.random() > 0.7 ? '用户备注：物品完好' : null,
          created_at: createdAt,
          updated_at: now,
          _items: orderItemsForOrder
        }

        orders.push(orderData)
      }

      for (const order of orders) {
        const items = order._items
        delete order._items
        await queryInterface.bulkInsert('orders', [order], {})
        
        const lastOrder = await queryInterface.sequelize.query(
          'SELECT LAST_INSERT_ID() as id',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        )
        const orderId = lastOrder[0].id

        const orderItemsData = items.map(item => ({
          ...item,
          order_id: orderId
        }))
        await queryInterface.bulkInsert('order_items', orderItemsData, {})

        if (order.status === 'shipping' || order.status === 'completed') {
          const statusTexts = ['揽收成功', '运输中', '到达深圳分拨中心', '正在派送', '已签收']
          const locations = ['深圳', '广州', '东莞', '用户当地']
          const timelineCount = Math.floor(Math.random() * 3) + 2

          for (let t = 0; t < timelineCount; t++) {
            await queryInterface.bulkInsert('logistics_timelines', [{
              order_id: orderId,
              description: statusTexts[t] || '货物正在运输中',
              happened_at: new Date(Date.now() - (timelineCount - t) * 24 * 60 * 60 * 1000),
              created_at: now
            }], {})
          }
        }
      }
    }

    const announcements = [
      {
        title: '五一假期服务通知',
        content: '尊敬的用户，五一假期期间，我们的回收服务正常进行。请您放心使用。预计发货后3-5个工作日内完成回收审核。',
        type: 1,
        is_top: 1,
        status: 1,
        publish_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: '会员权益升级公告',
        content: '为回馈广大会员用户，我们升级了会员权益。现在开通年费会员，可享受更多专属折扣和优先客服服务。',
        type: 1,
        is_top: 1,
        status: 1,
        publish_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: 'iPhone 15 系列高价回收中',
        content: '最新款 iPhone 15 系列现已支持高价回收。苹果全系列手机，我们提供市场最优价，欢迎比较。',
        type: 2,
        is_top: 0,
        status: 1,
        publish_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: '环保回收，从我做起',
        content: '每一台废旧手机的正确回收，都可以减少对环境的污染。让我们一起为绿色地球贡献力量。',
        type: 3,
        is_top: 0,
        status: 1,
        publish_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updated_at: now
      },
      {
        title: '门店地址更新通知',
        content: '深圳门店已搬迁至华强北新址，具体地址可在门店页面查看。欢迎新老用户到店回收。',
        type: 1,
        is_top: 0,
        status: 1,
        publish_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updated_at: now
      }
    ]

    await queryInterface.bulkInsert('announcements', announcements, {})

    const messages = []
    const msgTypes = ['order', 'recycle', 'membership']
    const msgContents = {
      'order': { title: '订单已发货', content: '您的订单已发货，请注意查收' },
      'recycle': { title: '回收价格已确认', content: '恭喜！您的回收订单已通过审核，款项将很快打入您的钱包' },
      'membership': { title: '会员权益提醒', content: '您的会员即将到期，为了不影响您的专属权益，请及时续费' }
    }

    insertedUsers.forEach((user) => {
      const msgCount = Math.floor(Math.random() * 4) + 1
      for (let i = 0; i < msgCount; i++) {
        const type = msgTypes[Math.floor(Math.random() * msgTypes.length)]
        const msgData = msgContents[type]

        messages.push({
          user_id: user.id,
          type: type,
          title: msgData.title,
          content: msgData.content,
          is_read: Math.random() > 0.5 ? 1 : 0,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000))
        })
      }
    })

    for (let i = 0; i < messages.length; i += 50) {
      await queryInterface.bulkInsert('messages', messages.slice(i, i + 50), {})
    }

    const membershipPlans = await queryInterface.sequelize.query(
      'SELECT id, price FROM membership_plans ORDER BY sort_order',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    const membershipOrders = []
    for (let i = 0; i < 10; i++) {
      const user = insertedUsers[Math.floor(Math.random() * insertedUsers.length)]
      const plan = membershipPlans[Math.floor(Math.random() * membershipPlans.length)]

      membershipOrders.push({
        user_id: user.id,
        plan_id: plan.id,
        order_no: `MEM${Date.now()}${String(i + 1).padStart(4, '0')}`,
        amount: plan.price,
        pay_status: 1,
        pay_method: 'wechat',
        pay_time: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        created_at: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        updated_at: now
      })
    }

    if (membershipOrders.length > 0) {
      await queryInterface.bulkInsert('membership_orders', membershipOrders, {})
    }

    const videos = [
      {
        title: 'iPhone 回收流程演示',
        video_url: 'https://example.com/videos/iphone-recycle.mp4',
        cover_image: 'https://via.placeholder.com/640x360.png?text=iPhone回收',
        duration: 180,
        sort_order: 1,
        status: 1,
        created_at: now,
        updated_at: now
      },
      {
        title: '华为手机高价回收技巧',
        video_url: 'https://example.com/videos/huawei-tips.mp4',
        cover_image: 'https://via.placeholder.com/640x360.png?text=华为回收',
        duration: 240,
        sort_order: 2,
        status: 1,
        created_at: now,
        updated_at: now
      },
      {
        title: '环保知识小课堂',
        video_url: 'https://example.com/videos/eco-class.mp4',
        cover_image: 'https://via.placeholder.com/640x360.png?text=环保知识',
        duration: 300,
        sort_order: 3,
        status: 1,
        created_at: now,
        updated_at: now
      }
    ]

    await queryInterface.bulkInsert('videos', videos, {})

    console.log('Test data seeded successfully!')
    console.log(`Created: ${insertedUsers.length} users, ${addresses.length} addresses, ${wallets.length} wallets`)
    console.log(`Created: ${products.length} products, ${pricesCount} prices`)
    console.log(`Created: ${carts.length} cart items, ${orders.length} orders`)
    console.log(`Created: ${announcements.length} announcements, ${messages.length} messages`)
    console.log(`Created: ${membershipOrders.length} membership orders, ${videos.length} videos`)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('logistics_timelines', null, {})
    await queryInterface.bulkDelete('order_items', null, {})
    await queryInterface.bulkDelete('orders', null, {})
    await queryInterface.bulkDelete('carts', null, {})
    await queryInterface.bulkDelete('prices', null, {})
    await queryInterface.bulkDelete('products', null, {})
    await queryInterface.bulkDelete('points_logs', null, {})
    await queryInterface.bulkDelete('wallet_logs', null, {})
    await queryInterface.bulkDelete('membership_orders', null, {})
    await queryInterface.bulkDelete('messages', null, {})
    await queryInterface.bulkDelete('announcements', null, {})
    await queryInterface.bulkDelete('wallets', null, {})
    await queryInterface.bulkDelete('addresses', null, {})
    await queryInterface.bulkDelete('users', null, {})
  }
}