# 项目变更日志

> 本文件记录项目根目录 `c:\Users\17798\Desktop\陈峰\数码回收` 下所有需求的变更留痕。
> 时间统一使用 UTC+8（Asia/Shanghai）。

## 2026-06-26（会员中心接入微信支付 V2）

### 背景
- 小程序「会员中心」页 `立即开通` 原走微信小程序虚拟支付（`wx.requestVirtualPayment`），因虚拟支付仅适用于虚拟商品场景且商户号受限，改为接入真实微信支付 V2（JSAPI 支付）。
- 商户资料（脱敏）：商户号 `1747398587`，APIv2 密钥 `abcdefghijklmnopqrstuvwxyz123456`，回调地址 `https://your-domain.com/api/membership/pay-notify`（占位，需在商户平台正式配置）。

### 后端
- **Task 1 - 新增 XML 工具**（`digital-recycling-server/src/utils/xml.js`）
  - `parseXml(xmlString)`：解析微信 V2 回调顶层 `<xml>...</xml>` 格式，支持 `<KEY>VALUE</KEY>` 与 `<KEY><![CDATA[VALUE]]></KEY>` 两种写法。
  - `buildXml(obj)`：将对象序列化为微信 V2 XML，值含 `<`/`>`/`&` 时自动 CDATA 包裹。
  - 纯字符串处理，未引入 `xml2js` 等新依赖。
- **Task 2 - 新增微信支付服务**（`digital-recycling-server/src/services/wechatPay.js`）
  - `signV2(params, key, signType='MD5')`：按字段名 ASCII 升序 → `k1=v1&k2=v2&...&key=KEY` → MD5 或 HMAC-SHA256 大写。
  - `unifiedOrder({ orderNo, amount, openid, body, attach })`：POST 到 `https://api.mch.weixin.qq.com/pay/unifiedorder`，使用 Node 内置 `https` 模块，5s 超时，返回 `{ prepay_id, return_code, result_code, ... }`，失败抛出含 `return_msg` 的异常。
  - `verifyNotify(xmlString)`：解析回调 XML → 校验 `sign`（用 `crypto.timingSafeEqual` 恒等时间比较，防时序攻击）→ 校验 `return_code==='SUCCESS'`。
  - `orderquery(orderNo)`：POST 到 `https://api.mch.weixin.qq.com/pay/orderquery`，用于主动查单补单。
- **Task 3 - 改造配置**（`digital-recycling-server/src/config/wechat.js`）
  - 在原 `wxAppId` / `wxSecret` 基础上新增 `mchId` / `apiKey` / `payNotifyUrl` 三个字段，向后兼容。
- **Task 4 - 改造环境变量示例**（`digital-recycling-server/.env.example`）
  - 末尾追加 `WX_MCH_ID=1747398587` / `WX_API_KEY=abcdefghijklmnopqrstuvwxyz123456` / `WX_PAY_NOTIFY_URL=https://your-domain.com/api/membership/pay-notify`，顶部加注释说明三项需在商户平台核对。
- **Task 5 - 改造订单模型**（`digital-recycling-server/src/models/MembershipOrder.js`）
  - 在 `transaction_id` 之后新增 `prepay_id` 字段（`STRING(64), allowNull: true, comment: '微信支付预支付会话 ID(unifiedorder 返回,用于查单)'`）。
- **Task 6 - 新增数据库迁移**（`digital-recycling-server/migrations/20260626-add-membership-prepay-id.js`）
  - `up` → `queryInterface.addColumn('membership_orders', 'prepay_id', ...)`。
  - `down` → `queryInterface.removeColumn('membership_orders', 'prepay_id')`（可回滚）。
  - **已通过 mysql MCP 在测试环境执行** `ALTER TABLE membership_orders ADD COLUMN prepay_id VARCHAR(64) NULL COMMENT '微信支付预支付会话 ID(unifiedorder 返回,用于查单)' AFTER transaction_id`（2026-06-26）。
  - 项目实际用 `sequelize.sync()` 同步模型而非 sequelize-cli 迁移管理（无 `SequelizeMeta` 表），故不存在迁移记录不一致问题。
- **Task 7 - 改造 `/purchase` 接口**（`digital-recycling-server/src/routes/api/membership.js`）
  - 删除原虚拟支付 `signVirtualPayParams` 调用。
  - 校验 `wxPayConfig.mchId / apiKey / payNotifyUrl` 缺失 → `error 10010`；`user.openid` 缺失 → `error 10011`。
  - 创建订单 `pay_method='wxpay'`, `pay_status=0`。
  - 调 `wechatPay.unifiedOrder({ orderNo, amount, openid, body: '会员套餐-' + plan.name, attach: orderNo })`，保存 `prepay_id` 到订单。
  - 生成 JSAPI 二次签名 `signV2({ appId, timeStamp, nonceStr, package: 'prepay_id=' + prepay_id }, apiKey, 'MD5')`。
  - 返回 `{ orderNo, amount, planName, timeStamp, nonceStr, package, signType: 'MD5', paySign }`。
  - 全程 try/catch + 详细日志（request XML / response XML）。
- **Task 8 - 新增 `/pay-notify` 回调接口**（`digital-recycling-server/src/routes/api/membership.js` + `src/app.js`）
  - `app.js` 在 `/api` 路由前为 `/api/membership/pay-notify` 单独挂 `express.text({ type: 'text/xml', limit: '5mb' })` 中间件（V2 回调以 `text/xml` POST，`express.json` 不会解析）。
  - `/pay-notify` 接 `req.body`（字符串）→ `verifyNotify(xmlString)` 验签 → 用 `out_trade_no` 找订单 → 幂等（`pay_status===1` 直接 SUCCESS）→ 校验 `total_fee === Math.round(amount*100)` → `sequelize.transaction` 内更新 Order + User + increment Plan → 返回 SUCCESS XML。
  - 异常时返回 FAIL XML（不 `next(err)`，否则 errorHandler 返回 JSON 让微信无法识别）。
  - **不**走 `auth` 中间件（微信回调无需登录态）。
  - 抽取 `activateMembership(order, { transaction_id, prepay_id })` 辅助函数，被 `/pay-notify` 与 `/payment-status` 补单复用。
- **Task 9 - 新增 `/payment-status/:orderNo` 主动查单接口**（`digital-recycling-server/src/routes/api/membership.js`）
  - GET 接口，走 `auth` 中间件。
  - 本地 `pay_status===1` → 直接返回 `{ status: 'paid', paidAt }`。
  - 本地 `pay_status===0` → 调 `wechatPay.orderquery(orderNo)`：`trade_state==='SUCCESS'` → 按回调逻辑补单 → 返回 `paid`；其他 → 返回 `pending`。

### 小程序端
- **Task 10 - 改造按钮文案**（`digital-recycling-miniprogram/pages/membership/membership.wxml` 第 32 行）
  - `立即开通(功能开发中)` → `立即开通`（删除"功能开发中"占位文字）。
  - 第 30 行 `立刻续期`、第 31 行 `已开通` 保持不变。
- **Task 11 - 改造 API 模块**（`digital-recycling-miniprogram/utils/api-modules.js`）
  - `membershipApi` 新增 `queryPaymentStatus: (orderNo) => request({ url: '/membership/payment-status/' + orderNo })`。
  - 保留 `getPlans` / `getStatus` / `purchase` 不动。
- **Task 12 - 改造支付流程**（`digital-recycling-miniprogram/pages/membership/membership.js` `doPurchase`）
  - 删除 `typeof wx.requestVirtualPayment !== 'function'` 守卫。
  - 删除 `wx.requestVirtualPayment({ signData, mode, ... })` 调用。
  - 改用 `wx.requestPayment({ timeStamp, nonceStr, package, signType, paySign })`，参数从 `/purchase` 返回值取。
  - success → 「支付成功」toast + `this.loadUserInfo()`。
  - fail → `errMsg.includes('cancel')` 单独提示「已取消」不弹错误；其他弹错误 toast。
  - **新增三层兜底**：success / fail / complete 三个回调都补 `membershipApi.queryPaymentStatus(orderNo)` 主动查单，应对微信回调延迟或丢失。

### 行为变化
- 小程序「会员中心」点击 `立即开通` 不再调用虚拟支付，而是调起微信支付面板（JSAPI）。
- 支付成功后由微信服务端回调 `/api/membership/pay-notify` 触发入账，小程序前端同步通过 `/payment-status/:orderNo` 主动查单兜底。
- 会员套餐购买后写入字段：`MembershipOrder.pay_status=1` / `transaction_id`（微信支付订单号）/ `prepay_id`；用户字段 `membership_id` / `membership_expire` / `scan_remaining=9999` / `quote_remaining=9999`；`MembershipPlan.subscriber_count` +1。

### 数据模型 / 迁移
- `MembershipOrder` 模型新增 `prepay_id`（STRING(64), allowNull: true）。
- 迁移文件：`digital-recycling-server/migrations/20260626-add-membership-prepay-id.js`（已生成，已通过 mysql MCP 在测试环境执行 `ALTER TABLE`，生产环境待运维执行）。
- 字段变更由迁移文件管理，可通过 `db:migrate:undo` 回滚。

### 调试日志增强（2026-06-26 11:16+）
为定位「真机调试 `requestPayment:fail access denied`」根因，全链路加入详细日志：
- 后端 [routes/api/membership.js](file:///c:/Users/17798/Desktop/陈峰/数码回收/digital-recycling-server/src/routes/api/membership.js) `/purchase`：入参 / 套餐详情 / 微信支付配置 / 用户 openid / 订单创建 / `unifiedOrder` 响应全字段（return_code / result_code / prepay_id / err_code / err_code_des）/ JSAPI 二次签名全字段。
- 小程序 [pages/membership/membership.js](file:///c:/Users/17798/Desktop/陈峰/数码回收/digital-recycling-miniprogram/pages/membership/membership.js) `doPurchase`：doPurchase 入口 / purchase 接口完整返回 / wx.requestPayment 入参 / success/fail/complete 三回调完整 dump。
- 前端 vConsole 真机调试时可直接查看所有日志，后端日志可通过 `pm2 logs` / `tail -f logs/*.log` 查看。

### 兼容性
- 保留现有虚拟支付相关代码（`config/virtualPay.js` / `routes/api/virtualPay.js` / `/virtual-pay-notify` 路由）**不删除**，便于回滚或参考。
- 原 `MembershipPlan.product_id` / `MembershipOrder.transaction_id` 字段保留，未触动其他会员 / 订单 / 支付相关代码。
- `membership.wxss` UI 风格不变，仅按钮文字改 1 处。

### 前置条件（需大表哥在商户平台 + 公众平台配置完成后联调）
1. **商户平台**（pay.weixin.qq.com）：
   - 商户号 `1747398587` 已开通「JSAPI 支付」产品权限。
   - APIv2 密钥已设置为 `abcdefghijklmnopqrstuvwxyz123456`（32 位，与 `.env` 一致）。
   - AppID 账号管理中已绑定小程序 AppID 与商户号（关联子商户号）。
   - 回调地址在商户平台或下单参数中已配置为 `https://wx.lydzhsw.com/api/membership/pay-notify`。
2. **公众平台**（mp.weixin.qq.com 小程序后台）：
   - 「开发管理 → 服务器域名 → request 合法域名」中加入 `https://wx.lydzhsw.com`。
3. **服务器侧**：
   - `.env` 中填入真实 `WX_MCH_ID=1747398587` / `WX_API_KEY=abcdefghijklmnopqrstuvwxyz123456` / `WX_PAY_NOTIFY_URL=https://wx.lydzhsw.com/api/membership/pay-notify`。
   - 已配置 ICP 备案 + HTTPS 证书。
   - ✅ 测试环境已通过 mysql MCP 执行 `ALTER TABLE` 完成 `prepay_id` 字段迁移（2026-06-26）；生产环境待运维执行。
4. **联调用例**：用 0.01 元小金额跑完整流程（创建订单 → 调起支付 → 回调 → 主动查单），共 11 项验证清单（详见 `.trae/specs/membership-wechat-pay-v2-integration/checklist.md` Task 14）。

### 影响面
- 后端新增文件：`src/utils/xml.js` / `src/services/wechatPay.js` / `migrations/20260626-add-membership-prepay-id.js`（3 个）。
- 后端修改文件：`src/config/wechat.js` / `.env.example` / `src/models/MembershipOrder.js` / `src/routes/api/membership.js` / `src/app.js`（5 个）。
- 小程序修改文件：`pages/membership/membership.wxml` / `utils/api-modules.js` / `pages/membership/membership.js`（3 个）。
- 不影响其他会员 / 订单 / 支付相关代码、admin / app 子项目。
- 数据库字段变更由迁移文件管理，可回滚。

---

## 2026-06-26

### 小程序端
- **问题7 - 首页公告点击展示公告内容**（`digital-recycling-miniprogram/pages/index`）
  - `index.wxml`：公告栏增加 `bindtap="onNoticeTap"` 与 `data-id`，并在页面底部新增公告详情弹窗 `notice-mask` / `notice-modal`，含标题、时间、正文滚动区、关闭按钮。
  - `index.js`：缓存原始公告数据到 `_announcementsCache`，新增 `onNoticeTap` / `onNoticeDetailClose`，打开弹窗时暂停公告轮播、关闭后恢复。
  - `index.wxss`：新增 `.notice-arrow`、`.notice-bar:active`，以及 `.notice-mask` / `.notice-modal` 等弹窗样式（圆角、阴影、可滚动正文、安全区适配）。
  - **优化 - 公告弹窗内容右侧超出**：`.notice-modal-body` 加 `box-sizing: border-box; width: 100%; overflow: auto`，`.notice-modal-content` 由 `<text>` 改为 `<view>` 块级，使用 `white-space: pre-wrap` + `word-break/word-wrap/overflow-wrap: break-word` 强制长串换行，避免长 URL/不间断字符串撑出右侧。
- **问题5 - 回收车顶部状态栏固定**（`digital-recycling-miniprogram/pages/shopping`）
  - `shopping.wxss`：`.nav-bar` 由 `position: sticky` 改为 `position: fixed; top: 0; left: 0; right: 0; z-index: 1000`，新增 `.cart-page` 顶部占位 `padding-top: var(--nav-h, 88rpx)`。
  - `shopping.js`：data 增加 `navHeightRpx` / `pageStyle`，新增 `onReady` 测量 `.nav-bar` 实际高度后写入 `--nav-h` CSS 变量。
  - `shopping.wxml`：`.cart-page` 绑定 `style="{{pageStyle}}"`，CSS 变量驱动占位。
- **问题5 - 个人中心顶部状态栏固定**（`digital-recycling-miniprogram/pages/profile`）
  - `profile.wxss`：`.profile-nav` 由 `position: relative` 改为 `position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: var(--color-primary-gradient)`；新增 `.profile-page { padding-top: var(--nav-h, 88rpx) }`；`.profile-header` 用 `padding-top: var(--status-bar-h, 0px)` 占位状态栏高度。
  - `profile.js`：onLoad 写入 `pageStyle`（含 `--status-bar-h`、`--nav-h`），新增 `onReady` 测量 `.profile-nav` 实际高度。
  - `profile.wxml`：`.profile-page` 绑定 `style="{{pageStyle}}"`。

### 数据模型 / 迁移
- 本次仅 UI 调整，未涉及数据库模型或迁移。

### 影响面
- 仅限 `digital-recycling-miniprogram/pages/index`、`pages/shopping`、`pages/profile` 三个页面。
- 不涉及后端 `digital-recycling-server`、模型、迁移、测试文件。

---

## 2026-06-26（后端 Task 1-4：报价图片管理）

### 后端
- **Task 1 - 新增 FeaturePhoneImage 模型**（`digital-recycling-server/src/models`）
  - `FeaturePhoneImage.js`：定义 Sequelize 模型 `feature_phone_images`，字段 `id(BIGINT PK)` / `type(STRING(20) UNIQUE NOT NULL, 枚举 oldMan/dianrong)` / `image(STRING(500) NULL)`，时间戳 `created_at` / `updated_at`。
  - `models/index.js`：在 `db.Banner` 与 `db.Announcement` 之间注册 `db.FeaturePhoneImage = require('./FeaturePhoneImage')(sequelize, Sequelize)`。
- **Task 2 - 新增数据库迁移**（`digital-recycling-server/migrations`）
  - `20260626-add-feature-phone-image.js`：`up` 使用 `queryInterface.createTable('feature_phone_images', ...)` 建表，`type` 字段带 UNIQUE 索引，附带 `created_at` / `updated_at` 默认 `CURRENT_TIMESTAMP`；`down` `dropTable` 回滚。文件顶部标注 `npx sequelize-cli db:migrate` / `:undo` 命令。
- **Task 3 - 小程序端公开 API**（`digital-recycling-server/src/routes`）
  - `feature-phone-image.js`：`GET /`（实际路径 `/api/feature-phone-image`），强制校验 `type ∈ {oldMan, dianrong}`，否则 `error(res, '无效的报价类型，仅支持 oldMan/dianrong', 400, 400)`；`findOne` 命中且 image 非空返回 `{ type, image, updatedAt, found: true }`，未命中或 image 为空返回 `{ type, image: '', updatedAt: null, found: false }`；顶部带 JSDoc `@openapi` 注释。
  - `routes/api/index.js`：在 `/prices` 之后挂载 `router.use('/feature-phone-image', require('./feature-phone-image'))`。
- **Task 4 - 管理端 CRUD API**（`digital-recycling-server/src/routes/admin`）
  - `feature-phone-image-manage.js`：
    - `GET /`（`/api/admin/feature-phone-images`）：`adminAuth` 保护，`findAll()` 后强制返回 2 条 `oldMan` / `dianrong` 记录，缺失以 `{ image: '', updatedAt: null }` 兜底，结构 `{ list: [...] }`。
    - `PUT /:type`（`/api/admin/feature-phone-images/:type`）：`adminAuth` 保护，校验 `type` 必须为 `oldMan` / `dianrong`，校验 `image` 必须为非空字符串且长度 ≤ 500，否则分别返回 `error 400` / `validateError 422`；使用 `db.FeaturePhoneImage.upsert({ type, image })` 写入，返回 `{ type, image, updatedAt }` + 消息 `更新成功`。
    - `DELETE /:type`（`/api/admin/feature-phone-images/:type`）：`adminAuth` 保护，校验 `type`，将 `image` 置空字符串保存（不删除行），返回消息 `已清空图片`。
    - 顶部带 JSDoc `@openapi` 注释。
  - `routes/admin/index.js`：在 `/settings` 与 `/upload` 之间挂载 `router.use('/feature-phone-images', require('./feature-phone-image-manage'))`。

### 数据模型 / 迁移
- 新增表 `feature_phone_images`（BIGINT PK / STRING(20) UNIQUE NOT NULL / STRING(500) NULL / DATETIME × 2）。
- 迁移文件：`digital-recycling-server/migrations/20260626-add-feature-phone-image.js`（已生成，**未执行** `db:migrate`，待大表哥确认后再手动执行）。

### 影响面
- 仅限 `digital-recycling-server/src/models/FeaturePhoneImage.js`、`src/models/index.js`、`migrations/20260626-add-feature-phone-image.js`、`src/routes/feature-phone-image.js`、`src/routes/feature-phone-image-manage.js`、`src/routes/api/index.js`、`src/routes/admin/index.js` 共 7 个文件。
- 不涉及小程序端 `digital-recycling-miniprogram`、现有模型字段、其他路由或其他后端模块。
- 管理端全部 3 个接口均使用 `adminAuth` 中间件保护，公开 API 不需要鉴权（与 `banner.js` 风格一致）。

---

## 2026-06-26（小程序端交互修复：feature-phone-image / price-trend）

### 小程序端
- **feature-phone-image - 会员/剩余次数渲染顺序修复**（`pages/feature-phone-image`）
  - `feature-phone-image.js`：`data` 新增 `quotaLoaded: false`，`loadUserQuota` 成功 / 失败分支均 `setData({ quotaLoaded: true })`，避免永久 loading。
  - `feature-phone-image.wxml`：`header-quota` 改为三态 `加载中…` / `会员无限查看` / `今日剩余：{{quoteDailyRemaining}} 次`，避免会员用户进入页面时先看到错误的"今日剩余：0 次"。
- **feature-phone-image - 非会员次数用完仍能看到图片的权限漏洞修复**（`pages/feature-phone-image`）
  - `feature-phone-image.js`：`data` 新增 `accessGranted: false`，`loadUserQuota` 成功分支按 `hasAccess = isVip || quoteRemaining > 0 || quoteDailyRemaining > 0` 设置；catch `403/10007` 分支仅 `setData({ quotaLoaded: true })`、保持 `accessGranted=false`；catch 其他异常兜底 `accessGranted: true` 防止永久黑屏。
  - `feature-phone-image.wxml`：`image-section` 改为三态渲染，`accessGranted && image` 显示图片，`!accessGranted` 显示"加载中…"占位，否则"暂无可展示内容"，彻底封堵非会员次数用完仍能看到图的漏洞。
- **price-trend - 图例点击切换折线显示/隐藏**（`pages/price-trend`）
  - `price-trend.js`：`data` 新增 `hiddenConditions: []`；新增 `toggleCondition(e)` 方法（**单选模式**：点击某颜色 → 单选聚焦到该颜色（隐藏其他所有有数据成色）；若 idx 已是当前唯一显示的颜色则再次点击恢复全部），并 `setData` 后调用 `drawChart()`；`drawChart` 遍历 `trendData.trendData` 时若 `hiddenConditions.indexOf(lineIndex) >= 0` 则跳过该成色折线绘制；`_handleChartTouch` 命中点循环同样跳过隐藏成色的点（避免点击看不见的线上的点）。
  - `price-trend.wxml`：`legend-item` 增加 `bindtap="toggleCondition"` / `data-condition-index="{{index}}"` / 条件 class `legend-hidden` / `hover-class="legend-item-hover"` 反馈。
  - `price-trend.wxss`：新增 `.legend-item` padding + `transition`，`.legend-item-hover` 点击态，`.legend-hidden` 透明度 0.4 + 删除线。

### 数据模型 / 迁移
- 本次仅 UI 交互调整，未涉及数据库模型或迁移。

### 影响面
- 仅限 `digital-recycling-miniprogram/pages/feature-phone-image`、`pages/price-trend` 两个页面（JS/WXML/WXSS 共 6 个文件）。
- 不涉及后端 `digital-recycling-server`、模型、迁移、测试文件。
