# 数码回收网 - 小程序对接说明

## API 基础地址

| 环境 | 地址 |
|------|------|
| 开发环境 | `http://localhost:3000/api` |
| 生产环境 | `https://api.your-domain.com/api` |

配置位置：`utils/api.js` 中的 `BASE_URL`

## 登录流程

1. 小程序启动时调用 `wx.login()` 获取 code
2. 将 code 发送到后端 `POST /api/auth/wx-login`
3. 后端通过微信 code2Session 接口获取 openid
4. 后端创建/查找用户，返回 JWT Token
5. 小程序将 Token 存储到 Storage，后续请求自动携带

```
wx.login() → code → POST /api/auth/wx-login → Token → Storage
```

## 各页面API调用对照表

| 页面 | API模块 | 调用接口 |
|------|---------|----------|
| 首页 index | categoryApi, contentApi | getCategories, getBanners, getVideos |
| 品牌列表 brand-list | brandApi, productApi, priceApi, cartApi, searchApi | getBrands, getProducts, getConditions, addToCart, search |
| 报价单 price-quote | priceApi | getTodayPrices |
| 拍照查价 scan-price | userApi, uploadFile | getProfile, uploadFile |
| 回收车 shopping | cartApi, orderApi | getCart, updateCartItem, selectAll, createOrder |
| 个人中心 profile | userApi, walletApi, messageApi | getProfile, getStats, getInfo, getUnreadCount |
| 订单列表 order-list | orderApi | getOrders |
| 订单详情 order-detail | orderApi | getOrderDetail, cancelOrder |
| 会员中心 membership | membershipApi, userApi | getPlans, getStatus, purchase, payCallback |
| 消息中心 message-center | messageApi | getMessages, markRead, markAllRead |

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1714200000000
}
```

## 注意事项

1. 微信小程序正式版需要配置合法域名（服务器域名需在微信公众平台配置）
2. 开发阶段可在微信开发者工具中勾选"不校验合法域名"
3. Token 有效期为 24 小时，过期后需重新登录
4. 文件上传接口使用 `multipart/form-data` 格式
5. 所有需要认证的接口需在 Header 中携带 `Authorization: Bearer <token>`
