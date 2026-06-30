# 项目变更日志

> 本文件记录项目根目录 `c:\Users\17798\Desktop\陈峰\数码回收` 下所有需求的变更留痕。
> 时间统一使用 UTC+8（Asia/Shanghai）。

## 2026-06-29（报价单收藏功能）

### 新增功能
- **报价单页面收藏/取消收藏**：在 `pages/price-quote/price-quote` 页面标题旁增加收藏按钮（☆/⭐），支持收藏当前查看的品牌报价单，点击可切换收藏状态。
- **收藏报价单列表**：完善 `pages/my-favorites/my-favorites` 页面，展示用户收藏的品牌列表，支持点击跳转到对应品牌报价单，支持滑动取消收藏。
- **首页常用报价入口**：首页"常用报价 → 查看全部"改为跳转到收藏列表页面（`pages/my-favorites`），方便用户快速查看收藏的报价单。
- **我的页面收藏入口**：`pages/profile/profile` 中 VIP 特权区的「收藏报价单」入口保持跳转到收藏列表。

### 后端变更
- **新增模型** `src/models/Favorite.js`：收藏表，字段 `id`、`user_id`、`brand_id`，联合唯一索引 `(user_id, brand_id)`。
- **模型注册** `src/models/index.js`：注册 Favorite 模型，添加 User/Favorite/Brand 关联关系。
- **新增接口** `src/routes/api/user.js`：
  - `GET /api/user/favorites` - 获取收藏列表（分页，含品牌和分类信息）
  - `POST /api/user/favorites` - 添加收藏（body: `{ brand_id }`）
  - `DELETE /api/user/favorites/:id` - 按收藏ID取消收藏
  - `DELETE /api/user/favorites/brand/:brandId` - 按品牌ID取消收藏
  - `GET /api/user/favorites/check/:brandId` - 检查是否已收藏

### 前端变更
- **`utils/api-modules.js`**：userApi 新增 `addFavorite`、`removeFavorite`、`removeFavoriteByBrand`、`checkFavorite` 方法。
- **`pages/price-quote/price-quote.js`**：新增 `checkFavoriteStatus`（页面加载时检查收藏状态）、`toggleFavorite`（切换收藏/取消收藏）。
- **`pages/price-quote/price-quote.wxml`**：header-title 内增加收藏按钮，仅在有 brandId 时显示。
- **`pages/price-quote/price-quote.wxss`**：新增 `.favorite-btn` 和 `.favorite-btn.favorited` 样式。
- **`pages/my-favorites/my-favorites.js`**：重写为品牌收藏列表逻辑，新增 `onRemoveFavorite` 取消收藏方法，`onShow` 时自动刷新列表。
- **`pages/my-favorites/my-favorites.wxml`**：重写为品牌卡片布局，展示品牌图标、名称、分类，支持点击跳转和侧滑取消收藏。
- **`pages/my-favorites/my-favorites.wxss`**：重写样式，新增品牌图标渐变色类（bg-apple、bg-huawei 等）。
- **`pages/index/index.js`**：新增 `goToFavorites` 方法，跳转到收藏列表。
- **`pages/index/index.wxml`**：常用报价"查看全部"的 bindtap 从 `goToPriceQuote` 改为 `goToFavorites`。

### 数据库
- 自动创建 `favorites` 表（项目使用 `sequelize.sync()` 自动同步），无需手动执行迁移。

---

## 2026-06-29（小程序：修复海报生成失败及扫码入口）

### Bug 修复
- **`pages/invite-friends/invite-friends.js`**：旧版 Canvas（`canvas-id`）是原生组件，被 CSS 定位到屏幕外（`left: -9999px`）后不渲染，导致 `canvasToTempFilePath` 失败。改用新版 Canvas 2D API（`type="2d"`，非原生组件），使用 `canvas.createImage()` 加载图片、`wx.canvasToTempFilePath({ canvas })` 导出。
- **`pages/invite-friends/invite-friends.wxml`**：Canvas 标签从 `canvas-id="posterCanvas"` 改为 `type="2d" id="posterCanvas"`，尺寸调整为 375x600 CSS px。
- **`pages/index/index.js`**：扫海报小程序码进入时，微信通过 `options.scene` 传递参数而非 `invite_code`。`_handleInviteCode` 增加 `scene` 参数解析（`decodeURIComponent`），兼容分享链接和扫码两种入口。
- **`src/utils/wechat.js`**：`getAccessToken` 缺少错误处理和缓存，微信返回错误时 access_token 为 undefined 导致后续接口失败。增加内存缓存（提前 5 分钟刷新）和 errcode 错误抛出。

---

## 2026-06-29（小程序：修复邀请好友跳转错误及邀请链路问题）

### Bug 修复
- **`pages/profile/profile.js`**：`onPointActivityTap` 中「积分商城」已注释但 switch 仍保留旧 case 索引，导致点击「邀请好友」（index 1）错误跳转到积分商城。修正 case 1 直接跳转 `invite-friends`。
- **`pages/index/index.js`**：`_handleInviteCode` 返回 true 阻止了 `init()` 执行，导致用户从邀请链接登录后返回首页时 `_hasLoaded` 为 false，首页空白。改为不阻止首页数据加载。
- **`app.js`**：全局分享中 `inviteCode` 仅读取 `userInfo.userNo`，但 `/user/profile` 返回字段名为 `userId`，导致分享路径丢失邀请码。兼容读取 `userNo || userId`。

---

## 2026-06-29（小程序：优化邀请好友功能）

### 背景
- 小程序现有邀请页为旧版「邀好友 分佣金」设计，与新业务目标不符。
- 需要建立完整的邀请裂变链路：好友分享携带邀请码、新用户登录注册即给邀请人发放奖励、海报分享、邀请数据统计。

### 后端改动（digital-recycling-server）
- **`src/routes/api/user.js`**：
  - 优化 `/invite-stats` 接口，使用 `count`/`sum` 分离查询替代 `findOne` + 聚合函数，避免数据库严格模式下的不确定性。
- **`src/routes/admin/setting-manage.js`**：
  - 在 `/api/admin/settings` GET 接口中自动初始化 `invite_reward_times` 默认配置项（默认值 `10`，描述「邀请好友成功奖励的报价查看次数」），确保后台首次调用即可见可配。

### 前端改动（digital-recycling-miniprogram）
- **`utils/api-modules.js`**：
  - 新增 `inviteApi`：封装 `/user/invite-qr-code`、`/user/invite-stats`、`/user/invite-records`。
  - 修改 `authApi.wxLogin`：支持通过 `extra.inviteCode` 向后端传递邀请码。
- **`pages/index/index.js`**：
  - `onLoad` 解析 `options.invite_code`；未登录时跳转登录页并携带邀请码；已登录老用户直接忽略。
- **`pages/login/login.js`**：
  - `onLoad` 接收 `invite_code` 参数并写入 `data`。
  - `handleLogin` 调用 `wxLogin` 时传入 `{ inviteCode: ... }`。
- **`pages/invite-friends/invite-friends.js/wxml/wxss`**：
  - 重写邀请页：展示邀请码、成功邀请数、累计奖励次数、小程序码、最近邀请记录。
  - 新增「分享好友」（`open-type="share"`）和「保存海报」（Canvas 绘制完整海报并保存相册）功能。
  - 邀请规则更新为新用户登录即奖励、老用户无效。
- **`app.js`**：
  - 全局默认 `onShareAppMessage` 携带当前用户 `invite_code`，实现任意页面分享均可追踪邀请来源。

### 数据模型 / 迁移
- 新增 `digital-recycling-server/migrations/20260629-create-invitations.js` 迁移文件（已前置创建），用于创建 `invitations` 表。
- `users` 表 `referrer`、`quote_remaining` 字段已存在，无需额外迁移。

### 影响面
- 后端：`src/routes/api/user.js`、`src/routes/admin/setting-manage.js`。
- 前端：`utils/api-modules.js`、`pages/index/index.js`、`pages/login/login.js`、`pages/invite-friends/*`、`app.js`。
- 数据库：执行 `20260629-create-invitations.js` 迁移后新增 `invitations` 表。

---

## 2026-06-28（内容管理后台：四个列表 Tab 增加查询能力）

### 背景
- 后台管理 `digital-recycling-admin/src/views/content/index.vue` 此前仅有「分页」能力，运营在 Banner/公告/门店/视频 数据量增长后难以快速定位目标记录。
- 本次为四个列表 Tab 统一增加按字段查询与按状态/类型过滤的能力：后端 `crud-factory.js` 升级支持 `keyword` 模糊搜索，前端在卡片头与表格之间渲染查询栏。

### 后端改动（digital-recycling-server）
- **`src/routes/admin/crud-factory.js`**：
  - `createCrudRouter(model, name, options = {})` 新增第三个参数 `options.searchableFields`（数组，未传默认为空，向后兼容）。
  - `GET /` 列表 handler 增加 `keyword` 入参解析：非空时按 `searchableFields` 构造 `Op.or` 数组，每字段走 `Op.like '%keyword%'` 模糊匹配；与已有 `status` 过滤通过 `Op.and` 共存。
  - 为五个共用此工厂的 admin 路由注入各自的 `searchableFields`：
    - `bannerManage` → `['title', 'subtitle']`
    - `announcementManage` → `['title', 'content']`
    - `storeManage` → `['name', 'contact_name', 'contact_phone', 'address']`
    - `videoManage` → `['title', 'category']`
    - `popupAdManage` → `['title']`（仅后端能力同步，前端本次不动）
- **未触碰**：`models/*`、`migrations/*`、`routes/admin/index.js`、其他 admin 路由。

### 前端改动（digital-recycling-admin）
- **`src/views/content/index.vue`**：
  - 新增 `defaultQueryForm()` 与 `queryForm` ref，字段含 `title / keyword / status / type / category`（按 Tab 使用子集）。
  - 新增 `buildListParams()`，按当前 `activeTab` 拼装请求参数，未填写字段不发送。
  - `loadData()` 改用 `buildListParams()`。
  - 新增 `handleSearch()`（分页回到第 1 页后重新加载）与 `handleReset()`（清空条件 + 回到第 1 页）。
  - `watch(activeTab)` 切换 Tab 时一并重置 `queryForm` 与 `page`。
  - 模板新增 `.search-bar` 容器（仅 `activeTab !== 'message'` 渲染），按 Tab 渲染差异化查询控件（标题/关键字输入框 + 状态下拉 + 公告类型下拉 + 视频分类下拉）+ 「查询」「重置」按钮。
  - 新增 `.search-bar` 样式（浅灰底 + flex 布局 + 间距 12px）。
  - 新增 `import { Search, Refresh } from '@element-plus/icons-vue'`（按钮图标）。

### 数据模型 / 迁移
- **无 schema 变更**：四个目标 model 字段早已存在，无需 `ALTER TABLE`。
- **无迁移文件**：本次仅工厂函数能力扩展，无 DDL。

### 兼容性
- popup-ads 后端一并支持 `keyword`，但前端本次不消费（弹窗广告页保持不变），未传 `keyword` 时行为与历史完全一致。
- 其他 admin 路由（product/order/member/...）**不受影响**，它们各自有独立 router 实现。

### 影响面
- 后端：仅 `src/routes/admin/crud-factory.js` 1 个文件。
- 前端：仅 `src/views/content/index.vue` 1 个文件。
- 不涉及 `digital-recycling-miniprogram`、数据库、模型、迁移、测试文件。

---

## 2026-06-28（后台管理：会员套餐新增上线/下线功能）

### 背景
- 后台管理 `/admin/member` 套餐管理此前仅展示状态标签（启用/禁用），缺少状态切换入口，运营需进入编辑表单才能改 status 字段，操作链路较长。
- 本次在套餐列表操作列直接增加「上线/下线」按钮，复用已有 `PUT /admin/membership/plans/:id` 接口，无需后端改动。

### 后台管理改动（digital-recycling-admin）

#### 1. 套餐列表操作列新增上线/下线按钮
- **`src/views/member/index.vue`** 模板：套餐管理「操作」列在「编辑」与「删除」之间新增 `el-button`，文案与样式根据 `row.status` 动态切换：
  - `status === 1` 显示「下线」（warning 风格）
  - `status === 0` 显示「上线」（success 风格）
- 列宽由 160 调整为 220，以容纳三个按钮。

#### 2. 新增 handleTogglePlanStatus 处理函数
- **`src/views/member/index.vue`** 脚本：新增 `handleTogglePlanStatus(row)`，逻辑：
  - 计算目标 `newStatus`（1↔0 切换）
  - `ElMessageBox.confirm` 二次确认，下线操作额外提示「下线后小程序端将不再展示该套餐，已开通用户不受影响」
  - 调用 `updateMembershipPlan(row.id, { status: newStatus })`（已存在的 API 封装）
  - 成功后 `ElMessage.success` 并 `loadData()` 刷新列表

### 影响面
- **后端**：无变更。`PUT /admin/membership/plans/:id` 路由早已存在并通过 `plan.update(req.body)` 透传 status 字段；小程序端 `GET /api/membership/plans` 已按 `status: 1` 过滤，下线即时生效。
- **数据库模型 / 迁移**：无变更，MembershipPlan.status 字段早已存在。
- **小程序端**：无需改动，下线套餐自动从会员开通页隐藏；已开通会员的用户不受影响。

---

## 2026-06-28（小程序前端功能精简：移除钱包提现 + 移除积分抽奖 + 新增退出登录）

### 背景
- 本次为小程序前端功能精简变更，移除两项暂不可用/不再需要的前端功能（钱包提现、积分抽奖），并补充基础账号能力（退出登录）。
- **仅前端变更，后端路由全部保留不动**，不涉及任何服务端接口删除或修改。

### 小程序端改动（digital-recycling-miniprogram）

#### 1. 移除钱包页提现功能
- **`pages/wallet/wallet.wxml`**：删除「提现」按钮与提现规则区块，仅保留余额展示与交易记录列表。
- **`pages/wallet/wallet.js`**：删除 `onWithdraw` 方法。
- **`utils/api-modules.js`**：删除 `walletApi.withdraw` API 定义。
- 保留：余额展示、交易记录功能。

#### 2. 移除积分抽奖功能
- **删除目录** `pages/points-lottery/`（共 4 个文件：js/wxml/wxss/json）。
- **`app.json`**：从 `pages` 数组移除 `pages/points-lottery/points-lottery` 页面注册。
- **`pages/profile/profile.js`**：
  - 从 `pointActivities` 配置中移除「积分抽奖」项。
  - 调整 `onPointActivityTap` 的 case 索引（删除抽奖分支后后续 case 顺延）。
- **`utils/api-modules.js`**：删除 `pointsApi.getLotteryRecords` API 定义。

#### 3. 新增退出登录功能
- **`pages/profile/profile.wxml`**：页面底部新增「退出登录」按钮。
- **`pages/profile/profile.js`**：
  - 点击「退出登录」弹出 `wx.showModal` 二次确认。
  - 确认后调用 `clearAllData()` 清空本地缓存。
  - 重置 `app.globalData.userInfo`。
  - 通过 `wx.reLaunch` 跳转到登录页。

### 数据模型 / 迁移
- 本次仅前端变更，**无数据库模型字段变更，无迁移文件**。
- 后端所有路由（含 `/wallet/withdraw`、`/points/lottery/*` 等）保留不动，仅前端不再调用。

### 影响面
- 仅限 `digital-recycling-miniprogram` 子项目：`pages/wallet/`、`pages/points-lottery/`（整目录删除）、`pages/profile/`、`utils/api-modules.js`、`app.json`。
- 不涉及 `digital-recycling-server`、`digital-recycling-admin`、`dom` 任何文件。
- 不涉及数据库、模型、迁移、测试文件。

---

## 2026-06-28（虚拟支付前端补单接口 - 应对推送延迟/丢失）

### 背景
- iOS 真机支付成功后会员状态未更新,排查发现:
  - 服务器日志无任何 `[dom/virtual-pay/notify] 收到推送` 记录
  - 数据库 5 笔虚拟支付订单 `pay_status` 全为 0(未支付)
  - 手动 curl 测试 `/api/dom/virtual-pay/plans` 和 `/notify` 接口均返回 200 正常
- 确认根因:**微信推送未到达服务器**(MP 后台「虚拟支付 → 基础配置 → 订阅URL」未配置发货推送地址)
- 为不阻塞用户使用,新增前端补单接口:支付成功后前端主动通知后端入账,不依赖微信推送

### 后端改动(digital-recycling-server)
- **`src/routes/api/membership.js`**:
  - **新增 `POST /api/membership/virtual-pay-confirm` 接口**(JWT 鉴权):
    - 校验订单归属(只能补单自己的订单)+ 订单类型(仅虚拟支付)+ 幂等(已支付直接返回)
    - 复用 `activateMembership()` 事务入账(更新订单 pay_status/pay_time + 用户 membership_id/membership_expire + 套餐订阅数)
    - 入账依据:`wx.requestVirtualPayment` success 回调由微信原生 API 触发,用户确已支付成功(微信已扣款),可作为入账依据
- **保留**:`/payment-status` 接口逻辑不变(虚拟支付订单仍返回 pending,等待推送或前端补单)

### 前端改动(digital-recycling-miniprogram)
- **`utils/api-modules.js`**:membershipApi 新增 `virtualPayConfirm(orderNo)` 方法
- **`pages/membership/membership.js`**:
  - `wx.requestVirtualPayment` success 回调改为:**先调用 `virtualPayConfirm` 主动入账 → 入账成功则刷新用户信息 → 失败则兜底查单**
  - 入账中显示 loading,结果用 toast 提示
  - fail 回调和 complete 回调不变

### 三层入账保障
1. **第一层(主)**:前端 success 回调 → `virtual-pay-confirm` 主动入账(立即生效,不依赖推送)
2. **第二层(兜底)**:`/api/dom/virtual-pay/notify` 微信推送入账(需配置 MP 后台推送 URL)
3. **第三层(兜底)**:`/payment-status` 前端查单(虚拟支付订单返回 pending,依赖前两层)

### 根本解决(待大表哥操作)
- 配置 MP 后台「虚拟支付 → 基础配置 → 订阅URL」为 `https://wx.lydzhsw.com/api/dom/virtual-pay/notify`
- 配置后微信推送将到达服务器,第二层保障生效,订单入账更可靠

---

## 2026-06-28（iOS 虚拟支付 -15001 报错处理 + 查单通道修复）

### 背景
- iOS 真机测试虚拟支付报错:`errCode -15001`,errMsg `requestVirtualPayment:fail 当前商户尚未开启iOS支付`。
- 核对官方 iOS 接入文档(https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment/ios.html),确认根因:**MP 后台「虚拟支付 → 基础配置」未配置「小程序简称」**,导致 iOS 支付能力未开启。
- 同时日志发现 `payment-status` 接口对虚拟支付订单走了 JSAPI `wechatPay.orderquery`(通道不同查不到,无意义报错)。

### 根因分析
- 官方文档明确:iOS 支付开通条件 = 已开通虚拟支付 + **已配置小程序简称**(满足 Apple 支付 display name 要求)。
- 配置简称后 iOS 支付能力**自动开通**,无需额外开关。
- 该错误是 MP 后台运营配置问题,非代码问题,无法通过代码修复解决。

### 服务端改动(digital-recycling-server)
- **`src/routes/api/membership.js`**(`payment-status` 接口 L601-L606):虚拟支付订单跳过 JSAPI 查单
  - 新增判断:`if (order.pay_method === 'virtual')` 直接返回 `pending`,不走 `wechatPay.orderquery`。
  - 原因:虚拟支付订单在 JSAPI 通道查不到(走米大师通道),`orderquery` 返回空响应无意义,且产生误导日志。
  - 入账仍依赖 `/api/dom/virtual-pay/notify` 推送(XML 推送)。
  - JSAPI 订单(`pay_method='wxpay'`)查单逻辑不变。

### 前端改动(digital-recycling-miniprogram)
- **`pages/membership/membership.js`**:
  - **`ERR_CODE_MAP[-15001]`** 提示更新:补充"若提示尚未开启iOS支付请到MP后台配置小程序简称"。
  - **`handleVirtualPayError`** 新增 -15001 + iOS 支付未开启的特殊处理(L226-L237):
    - 检测 `errCode === -15001 && errMsg.includes('iOS支付')` 时,弹出 `wx.showModal` 明确引导:"请联系管理员到微信公众平台「虚拟支付 → 基础配置」配置小程序简称后开启 iOS 支付能力"。
    - 不再走通用 toast,避免提示不清晰。
- 零诊断错误。

### 仍需用户手动操作(根本解决)
1. **MP 后台配置小程序简称**(根本解决):
   - 登录 mp.weixin.qq.com → 虚拟支付 → 基础配置 → 配置小程序简称。
   - 配置后 iOS 支付能力自动开启,无需额外开关。
   - 参考文档:https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment/ios.html
2. **服务器重新部署**:服务端 `payment-status` 修复需重新部署 docker `ershouhuishou` 容器才生效。
3. **iOS 真机重新测试**:配置简称后重新扫码测试虚拟支付。

### 数据库与模型
- 无 schema 变更,无迁移文件。

---

## 2026-06-28（admin 后台会员套餐管理支持配置虚拟支付道具ID）

### 背景
- 主小程序会员开通已切换为微信虚拟支付,`MembershipPlan.product_id` 字段是虚拟支付链路必需参数(MP 后台「虚拟支付 → 商品管理」获取)。
- 之前 `product_id` 只能通过 SQL 直接写入数据库,管理员无法在 admin 后台界面维护,运营不便。
- 本需求在 admin 后台「会员管理 → 套餐管理」增加道具ID 的展示与编辑入口。

### 改动范围(仅前端 admin)
- **`digital-recycling-admin/src/views/member/index.vue`**:
  - **套餐列表表格**:在「开通人数」列后、「状态」列前新增「道具ID」列(已配置显示黄色 tag,未配置显示红色"未配置"提示)。
  - **新增/编辑套餐对话框**:在「原价」之后新增「道具ID」输入框(`el-input`,placeholder 提示来源 "MP后台→虚拟支付→商品管理",可清空)。
  - **`planForm` 初始值**:新增 `product_id: ''` 字段。
  - **`handleAddPlan` 重置逻辑**:同步新增 `product_id: ''`。
- **后端无改动**:`PUT /api/admin/members/plans/:id` 与 `POST /api/admin/members/plans` 原本就是 `plan.update(req.body)` / `MembershipPlan.create(req.body)`,天然支持任意字段更新。
- **API 模块无改动**:`savePlan` 直接传 `planForm.value`,product_id 自动随请求体传给后端。

### 数据库与模型
- **无 schema 变更**:`MembershipPlan.product_id` 字段早已存在([models/MembershipPlan.js#L40-L44](file:///c:/Users/17798/Desktop/陈峰/数码回收/digital-recycling-server/src/models/MembershipPlan.js#L40-L44),STRING(64),allowNull:true),数据库表也已建好(之前已通过 SQL 写入 `product_id='198'`)。
- **无迁移文件**:字段已存在,无需 `sequelize.sync()` 之外的 DDL。

### 验证
- `GetDiagnostics` 检查 `member/index.vue` 零诊断错误。
- 现有 4 处 Edit 全部成功:表格列、表单输入框、planForm 初始值、handleAddPlan 重置。

### 使用方式
1. admin 后台 → 会员管理 → 套餐管理 tab。
2. 点击「新增套餐」或「编辑」→ 在对话框「道具ID」输入框填入 MP 后台获取的道具ID(如 `198`)→ 保存。
3. 列表「道具ID」列会显示黄色 tag(已配置)或红色"未配置"提示。

---

## 2026-06-28（iOS 虚拟支付兼容性修复）

### 背景
- 主小程序会员开通切换为虚拟支付后,Android 真机可正常支付,但 iOS 真机报"参数问题"。
- 核对官方 iOS 接入文档,确认 iOS 端虚拟支付有 3 项硬性限制:**不支持沙箱(必须现网)**、**最低 1 元**、**需配置小程序简称**。
- 同时排查发现服务端 `config/virtualPay.js` 的 `env` 字段存在 JavaScript falsy 值陷阱:`parseInt('0', 10) || 1` 因 0 是 falsy 永远返回 1,导致 `.env` 设 `WX_VIRTUAL_PAY_ENV=0` 后仍走沙箱。

### 服务端改动(digital-recycling-server)
- **`src/config/virtualPay.js`**(L19):修复 `env` 读取 Bug
  - 旧代码:`parseInt(process.env.WX_VIRTUAL_PAY_ENV, 10) || 1` — `0 || 1` = `1`(0 是 falsy 被覆盖)
  - 新代码:`process.env.WX_VIRTUAL_PAY_ENV != null && process.env.WX_VIRTUAL_PAY_ENV !== '' ? parseInt(process.env.WX_VIRTUAL_PAY_ENV, 10) : 1` — 显式判空,0 不再被覆盖
- **`.env`**(L41):`WX_VIRTUAL_PAY_ENV=1` 改为 `WX_VIRTUAL_PAY_ENV=0`(切现网以支持 iOS)

### 前端改动(digital-recycling-miniprogram)
- **`pages/membership/membership.js`**(`doPurchase` L98-L153):新增 iOS 全套预检
  - **微信版本检测**:iOS + 微信 < 8.0.68 提示升级(官方硬性限制)
  - **iOS 系统版本检测**:需 iOS 15+,否则提示升级
  - **金额检测**:iOS 最低 1 元,套餐价格 < 1 元阻断并提示
  - **官方预检 API**:`wx.checkIsSupportMidasPayment`(success 检查 `res.data.allow_pay`,fail 不阻断继续走支付流程)
- 抽出 `startVirtualPay(planId)` 方法,供 iOS 预检通过后调用,逻辑更清晰。

### 数据库变更
- `membership_plans.id=1`(月度会员):`price` 由 `0.01` 改为 `1.00`,`original_price` 同步改为 `1.00`(满足 iOS 最低 1 元要求)。
  - 执行 SQL:`UPDATE membership_plans SET price = 1.00, original_price = 1.00 WHERE id = 1;`(Rows affected: 1)
- 项目使用 `sequelize.sync()` 同步,无 SequelizeMeta 表,直接 ALTER 安全,无需生成迁移文件。

### 验证结果
- 服务端重启后日志:`[virtualPay] 配置加载完成: env=现网, offerId=1450574944, appid=wxb7cf435c7b2908d2` — 确认 env=现网已生效。

### 仍需用户手动操作(无法代劳)
1. **MP 后台配置小程序简称**:mp.weixin.qq.com → 设置 → 基本设置 → 小程序简称(iOS 虚拟支付 display name 必需)。
2. **iOS 真机重新测试**:在 iOS 微信 8.0.68+ / iOS 15+ 真机扫码测试虚拟支付完整链路。

---

## 2026-06-28（主小程序会员开通切换为虚拟支付）

### 背景
- 主小程序 `digital-recycling-miniprogram` 会员开通原走 JSAPI 支付(`wx.requestPayment`),但 appid `wxb7cf435c7b2908d2` 是个人主体,真机报 `wx.requestPayment:fail access denied errno:102`,JSAPI 不可用。
- 参考 dom 项目已验证的虚拟支付链路,将会员开通切换为 `wx.requestVirtualPayment`(微信虚拟支付),复用 dom 的签名算法(HMAC-SHA256)和回调入口。

### 后端改动(digital-recycling-server)
- **`src/routes/api/membership.js`**:
  - **新增 `POST /api/membership/virtual-pay-sign` 接口**(JWT 鉴权):
    - JWT 识别用户(`req.userId` → 查 User 取 openid),`code` 即时换 `session_key`(signature 签名必需)。
    - 复用 dom 的 `buildSignData()` + `generatePaymentSign()` 生成 `signData/paySig/signature`。
    - 创建 `MembershipOrder`(`pay_method='virtual'` 区分)。
    - 返回 `{ orderNo, signData, mode:'short_series_goods', paySig, signature, env }`。
  - **依赖扩展**:require 新增 `buildSignData, generatePaymentSign` from `services/virtualPay`、`getVirtualPayConfig` from `config/virtualPay`、`wechatUtil` from `utils/wechat`。
- **回调复用**:虚拟支付推送由 `/api/dom/virtual-pay/notify` 统一接收(同 appid,MP 后台已配该 URL),主小程序订单同表同处理,无需额外回调。
- **保留旧接口**:`/purchase`(JSAPI)和 `/virtual-pay-notify`(旧版 JSON)保留不删,前端不再调用。

### 前端改动(digital-recycling-miniprogram)
- **`utils/api-modules.js`**:membershipApi 新增 `virtualPaySign(planId, code)` 方法,自动带 JWT。
- **`pages/membership/membership.js`**:
  - **`doPurchase` 完全重写**为虚拟支付链路:基础库检测 → iOS 检测 → `wx.login` 拿 code → 调 `virtualPaySign` → `wx.requestVirtualPayment` → 轮询查单。
  - **新增 `requestVirtualPaySign`**:请求签名接口 + 唤起虚拟支付。
  - **新增 `handleVirtualPayError`**:22 种虚拟支付错误码映射(区分 cancel/已知错误码/未知错误),session_key 过期(-15007)给提示。
  - **新增 `compareVersion`**:版本号比较(官方示例),用于基础库/微信版本检测。
  - **新增 `ERR_CODE_MAP` 常量**:覆盖 22 种虚拟支付错误码。
  - **iOS 兼容**:检测 iOS + 微信版本 < 8.0.68 提示升级(虚拟支付 iOS 硬性限制)。
  - **保留**:`onPurchase`、`queryPaymentStatus`、`loadUserInfo`、`loadPlans` 不变。
- **`pages/membership/membership.wxml`**:**无改动**(套餐卡片 L18-35 + 按钮三态保留)。
- **`pages/membership/membership.wxss`**:**无改动**。

### 关键决策
1. **完全替换 JSAPI**:个人主体不可用,`doPurchase` 全部改为虚拟支付,不做双通道。
2. **JWT + code 双轨**:JWT 识别用户,code 换 session_key 签名(session_key 敏感不长期存)。
3. **回调复用 dom notify**:同 appid,MP 后台回调 URL 只能配一个,已配为 `https://wx.lydzhsw.com/api/dom/virtual-pay/notify`。
4. **iOS 兼容**:前端检测 + 提示,不阻断(让用户自行决定是否升级)。

### 测试前置条件
- 服务端 `.env` 已配置 `WX_VIRTUAL_PAY_ENV=1`(沙箱)、`WX_VIRTUAL_PAY_SANDBOX_KEY`、`WX_VIRTUAL_PAY_OFFER_ID=1450574944`。
- 数据库 `membership_plans.product_id='198'`(MP 后台道具ID)。
- 用户登录后 `User.openid` 已存在(登录流程已保证)。
- 服务端需重启使新接口生效。

### 预期测试日志
```
[membership] doPurchase 开始, planId=1
[membership] wx.login 成功, code=xxxxxxxxxx...
[membership] virtual-pay-sign 返回: {"orderNo":"VIPxxx","mode":"short_series_goods","paySig":"xxxx...","signature":"xxxx...","env":1}
[membership] 调起 wx.requestVirtualPayment, orderNo=VIPxxx
[membership] wx.requestVirtualPayment success: {}
[membership] wx.requestVirtualPayment complete
```
支付成功后用户卡片显示"会员有效期至 xxx"(loadUserInfo 刷新),服务端日志出现 `[dom/virtual-pay/notify] 收到推送 event=xpay_goods_deliver_notify`。

---

## 2026-06-28（dom 虚拟支付签名算法按官方文档全面重写）

### 背景
- 之前实现的虚拟支付签名算法(MD5 + 字段升序 + &key=payKey)**与官方文档完全不符**,导致 `wx.requestVirtualPayment` 调用必然失败。
- 核对官方 API 文档(https://developers.weixin.qq.com/miniprogram/dev/api/payment/wx.requestVirtualPayment.html)与社区实战指引(https://developers.weixin.qq.com/community/develop/article/doc/00006845ce4860bedcb4d5eed61813),确认签名算法为 HMAC-SHA256,且需区分 paySig(支付签名,用 appKey)与 signature(用户态签名,用 session_key)。

### 签名算法修正(关键)
| 项 | 旧实现(错误) | 新实现(正确) |
|---|---|---|
| 算法 | MD5 + 字段升序 + &key=payKey | HMAC-SHA256 |
| paySig | ❌ 未实现 | `hex(hmac_sha256(appKey, uri + '&' + signData))` uri='requestVirtualPayment' |
| signature | ❌ 未实现 | `hex(hmac_sha256(session_key, signData))` |
| signData 字段 | appid/nonceStr/offer_id/openid/product_id/product_identity/quantity/sign_method/timeStamp | offerId/buyQuantity/env/currencyType/productId/goodsPrice/outTradeNo/attach(按官方) |
| mode 值 | 'long_series_goods'(不存在) | 'short_series_goods'(道具直购) |
| 返回字段 | sign/timeStamp/nonceStr | paySig/signature |
| session_key | ❌ 未使用 | ✅ 由 code2Session 获取并用于 signature 计算 |

### 服务端改动(digital-recycling-server)
- **`src/services/virtualPay.js`**:重写
  - 新增 `buildSignData()`:按官方字段构建 signData JSON 字符串。
  - 新增 `generatePaymentSign()`:用 HMAC-SHA256 生成 paySig + signature,根据 env 自动选择沙箱/现网 appKey。
  - 保留 `verifyNotifySignature()`(目前 xpay_goods_deliver_notify 推送无 signature 字段,验签从略)。
- **`src/config/virtualPay.js`**:加 `sandboxKey` + `env` 字段
  - `WX_VIRTUAL_PAY_KEY`:现网 AppKey。
  - `WX_VIRTUAL_PAY_SANDBOX_KEY`:沙箱 AppKey(测试用)。
  - `WX_VIRTUAL_PAY_ENV`:0=现网 1=沙箱(默认 1,避免误扣真钱)。
  - 启动校验根据 env 选择性校验对应 AppKey。
- **`src/routes/dom/virtual-pay.js#sign`**:改用新签名
  - code2Session 同时获取 `session_key`(签名必需)。
  - 构建 signData(`goodsPrice = Math.round(plan.price * 100)` 元转分)。
  - 调用 `generatePaymentSign()` 生成 paySig + signature。
  - 返回 `{ orderNo, signData, mode, paySig, signature, env }`(删除旧的 timeStamp/nonceStr/sign)。
- **`.env.example`**:新增 `WX_VIRTUAL_PAY_SANDBOX_KEY` + `WX_VIRTUAL_PAY_ENV` 两个环境变量。

### dom 端改动
- **`pages/virtual-pay/virtual-pay.js`**:
  - `wx.requestVirtualPayment` 参数改为官方的 `signData/mode/paySig/signature`(删除 timeStamp/nonceStr/sign)。
  - 新增 `ERR_CODE_MAP`:覆盖官方 22 种错误码(1001/-1/-2/-4/-15001~-15021),提供友好提示。
  - 新增 `handlePayError()`:区分用户取消/已知错误码/未知错误,对 -15007(session_key 过期)/-15002/-15012(单号问题)给出针对性建议。
  - 新增 `compareVersion()`:按官方示例判断基础库版本(≥ 2.19.2)。
  - 从后端响应读取 `env` 并展示(沙箱/现网)。
- **`pages/virtual-pay/virtual-pay.wxml`**:
  - 顶部加环境标签栏(沙箱/现网 + 提示)。
  - API 兼容性区修正基础库版本为 2.19.2,新增 paySig/signature 算法说明。
- **`pages/virtual-pay/virtual-pay.wxss`**:新增 `.env-bar`/`.env-sandbox`/`.env-prod` 样式(黄色提示条)。
- **`utils/config.js`**:注释说明 env 由服务端决定,前端不单独配置。

### 数据库与道具配置(已就绪)
- `membership_plans.id=1` 的 `product_id='198'`(MP 后台道具 ID)已写入。
- MP 后台已创建道具「月度会员权限」(0.01 元/30 天,道具ID=198)。

### 运行前置(MP 后台运营操作,非代码)
1. **基础配置**:在 MP 后台「虚拟支付 → 基础配置」确认 OfferID `1450574944`、现网/沙箱 AppKey 已记录。
2. **发货推送**:核对是否有"发货推送"配置项(文档原文是"查看发货推送配置",非强制配置)。虚拟支付推送机制可能复用小程序通用消息推送(「开发管理 → 开发设置 → 消息推送」),如有问题再排查。
3. **环境变量**:服务端 `.env` 同步 `.env.example` 中 3 个虚拟支付变量,`WX_VIRTUAL_PAY_ENV=1`(沙箱测试)。
4. **重启服务端**:使新签名代码生效。
5. **真机测试**:开发者工具预览 → 真机扫码 → 底部"虚拟支付" tab → 应看到环境标签(沙箱) + 套餐 → 点击测试支付。

### 预期测试日志
```
[xx:xx:xx] [INFO] 虚拟支付测试页加载
[xx:xx:xx] [INFO] 提示:基础库需 ≥ 2.19.2...
[xx:xx:xx] [INFO] 加载套餐成功,共 1 个
[xx:xx:xx] [INFO] 开始支付套餐: 月度会员权限(ID=1, productId=198)
[xx:xx:xx] [INFO] wx.login 成功,code=xxxxxxxxxx...
[xx:xx:xx] [INFO] 签名获取成功 orderNo=VIPxxxxxxxx env=沙箱 mode=short_series_goods
[xx:xx:xx] [INFO] paySig=xxxxxxxxxxxxxxxx... signature=xxxxxxxxxxxxxxxx...
[xx:xx:xx] [INFO] 基础库 3.x.x 支持,调用 wx.requestVirtualPayment...
[xx:xx:xx] [INFO] ✓ 虚拟支付成功
[xx:xx:xx] [INFO] ✓ 支付成功,正在确认入账...
[xx:xx:xx] [INFO] 查单[1/5] status=pending
[xx:xx:xx] [INFO] 查单[2/5] status=paid
[xx:xx:xx] [INFO] ✓ 已入账,会员开通成功
```

---

## 2026-06-28（dom 项目新增虚拟支付 Demo 页 + 服务端 dom 专用接口）

### 背景
- `dom` 项目原为 `wx.getFuzzyLocation` 定位调试 Demo,仅有 1 个页面,无支付能力。
- 主小程序 `digital-recycling-miniprogram` 因个人主体限制无法使用 JSAPI 支付,需切换虚拟支付;服务端虚拟支付服务代码已就位但 `/purchase` 仍走 V2 JSAPI,未启用。
- 本需求在 `dom` 项目新增最小化虚拟支付测试页,验证 `wx.requestVirtualPayment` 完整链路(签名 → 唤起 → 回调 → 入账 → 查单),并为后续主小程序切换虚拟支付积累经验。
- 严格约束:**不修改任何原有后端接口**;在 `digital-recycling-server` 新增 `src/routes/dom/` 文件夹专门存放 dom 专用接口。

### 推送机制改造(按最新官方文档修正)
- 核对微信虚拟支付最新文档(https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/business-capabilities/virtual-payment.html),发现原 `/notify` 设计按"普通 JSON 回调"实现,与最新文档的"消息推送(XML)"机制不符。
- **推送机制变更**:微信通过消息推送(event=xpay_goods_deliver_notify 等 4 种)向开发者服务器推送 XML 内容,响应必须 `{"ErrCode":0,"ErrMsg":"success"}`,否则微信会重试 15 次。
- **改造内容**:
  - `src/app.js`:在 `/api/dom/virtual-pay/notify` 路由前挂载 `express.text({type:'text/xml'})` 中间件(与现有 V2 回调挂载方式一致,不影响其他路由)。
  - `src/routes/dom/virtual-pay.js#notify`:重写为 XML 推送接收端,解析后按 `Event` 字段分发(道具发货/代币支付/退款/投诉 4 种),当前仅处理 `xpay_goods_deliver_notify`(道具发货 → 开通会员),其余 event 仅记录日志。即便内部异常也返回 `ErrCode:0` 避免重试轰炸。
  - 复用 `utils/xml.js#parseXml` 解析推送,`services/virtualPay.js#signVirtualPayParams` 实现**已与最新文档一致**(MD5 字段升序签名),无需改签名代码。
- **推送 URL**:在 MP 后台「基础配置 → 发货推送」中配置为 `https://wx.lydzhsw.com/api/dom/virtual-pay/notify`(由 MP 后台 → 开发者服务器,程序内部不主动用此 URL)。
- **商品管理**:按最新文档走"道具管理"路径(不走"代币配置"),在 MP 后台「道具管理」上传道具,获得 `ProductId`,填入 `MembershipPlan.product_id`。

### 服务端（digital-recycling-server）
- **新增 `src/routes/dom/index.js`**：dom 项目专用路由聚合,挂载 `/api/dom`。
- **新增 `src/routes/dom/virtual-pay.js`**：4 个独立接口
  - `GET /api/dom/virtual-pay/plans` — 获取虚拟支付可用套餐(仅返回 `status=1` 且 `product_id` 非空)。
  - `POST /api/dom/virtual-pay/sign` — 免登支付模式:接受 `{code, plan_id}`,用 `code2Session` 换 openid → 查/建 User → 创建 MembershipOrder(`pay_method='virtual'`) → 调 `signVirtualPayParams` 生成签名,返回 `wx.requestVirtualPayment` 所需参数。
  - `GET /api/dom/virtual-pay/order/:orderNo` — 查询订单状态(供前端轮询,include Plan 关联)。
  - `POST /api/dom/virtual-pay/notify` — 微信虚拟支付异步回调,验签 + 事务内开通会员(复用 `membership.js` 同款事务逻辑,独立挂载互不影响)。
- **修改 `src/app.js`**：新增 1 行 `app.use('/api/dom', require('./routes/dom'))`(L41),不改动任何现有路由/中间件/错误处理。
- **复用现有能力**(零改动):`services/virtualPay.js` / `config/virtualPay.js` / `utils/wechat.js#code2Session` / `utils/helpers.js` / `models/{User,MembershipPlan,MembershipOrder}`。
- **无模型/迁移变更**:完全复用 `20260619-add-membership-virtual-pay-fields.js` 已添加的 `product_id` / `transaction_id` 字段。

### dom 端
- **新增 `utils/config.js`**：环境配置,`apiBase` 指向 `https://wx.lydzhsw.com/api/dom`。
- **新增 `utils/api.js`**：最小化请求封装(无需 token,虚拟支付免登模式)。
- **新增 `pages/virtual-pay/` 四件套**(js/wxml/wxss/json)：虚拟支付测试页
  - 加载套餐列表 → 点击套餐 `wx.login` 拿 code → 调 `/sign` 获取签名 → `wx.requestVirtualPayment` 唤起 → 轮询 `/order` 确认入账(三层校验之主动轮询层)。
  - 沿用 `index.wxss` 卡片/按钮/日志风格(主色 `#ff2d4a`),含 API 兼容性提示与 20 条 Console 日志区。
- **修改 `app.json`**：`pages` 数组注册 `pages/virtual-pay/virtual-pay`;新增 `tabBar` 配置(首页 + 虚拟支付 2 个 tab,纯文字无图标,主色 `#ff2d4a`)。
- **修改 `app.js`**：`globalData` 扩展 `token` / `userInfo` 预留字段(不强依赖)。
- **修改 `pages/index/index.wxml` + `index.js`**：首页"调试按钮"卡片新增 `[6] 虚拟支付测试` 跳转按钮 + `onGoVirtualPay` 方法(virtual-pay 成为 tab 页后,跳转方式由 `wx.navigateTo` 改为 `wx.switchTab`)。

### 运行前置条件(MP 后台运营操作,非代码)
1. dom 项目 appid `wxb7cf435c7b2908d2` 需在 MP 后台 → "虚拟支付" → 申请能力(个人主体小程序可申请)。
2. 在 MP 后台创建虚拟支付商品,获取 `product_id`,填入对应 `MembershipPlan` 记录(通过 admin 后台 → 会员套餐管理 → 编辑)。
3. 配置虚拟支付回调地址:`https://wx.lydzhsw.com/api/dom/virtual-pay/notify`。
4. 服务端 `.env` 需配置 `WX_VIRTUAL_PAY_KEY` / `WX_VIRTUAL_PAY_OFFER_ID` / `WX_VIRTUAL_PAY_NOTIFY_URL`。
5. 基础库 ≥ 2.27.1(dom 当前 3.10.3 ✅)。

### 影响面
- 服务端仅新增 2 个文件 + 修改 app.js 1 行,不触碰 `routes/api/membership.js` / `routes/admin/*` / `models/*` / `migrations/*`。
- dom 端仅新增 6 个文件 + 修改 4 个现有文件(pages 数组/globalData/首页按钮),不影响现有定位调试功能。
- 数据库无 schema 变更,仅写入 `pay_method='virtual'` 字符串值区分订单。

## 2026-06-27（修复每日签到按钮状态与错误提示）

### 背景
- 小程序「我的积分」页签到后按钮仍显示「每日签到」且可再次点击，再次点击提示「请求错误」，但后端实际返回 `{code:10005,message:"今日已签到"}`。
- 根因 1：后端 `/api/points/balance` 仅返回 `{ points }`，未返回 `is_signed`，导致前端 `fetchPointsBalance` 永远把 `isSigned` 置为 `false`，签到成功后又被重置。
- 根因 2：前端 `utils/api.js` 对非 200 状态码（如 400）统一返回 `请求错误(statusCode)`，忽略了响应体中后端给出的 `message`，导致重复签到时看不到「今日已签到」提示。

### 后端
- **Task 1 - `/api/points/balance` 返回签到状态**（`digital-recycling-server/src/routes/api/points.js`）
  - 新增查询当日 `source='sign'` 的 `PointsLog` 记录（与 `/sign` 路由采用相同的 UTC 日期判定逻辑，保持一致）。
  - 响应体由 `{ points }` 调整为 `{ points, is_signed }`，`is_signed` 为布尔值。
  - 无模型/迁移变更。

### 小程序端
- **Task 2 - 修复请求层错误信息透传**（`digital-recycling-miniprogram/utils/api.js`）
  - 404 / 5xx / 其他非 200 状态码的 reject 对象改为 `Object.assign({ statusCode }, res.data || { message: 原默认文案 })`，优先使用后端响应体中的 `message`/`code`，后端未返回 body 时回退到原默认文案。
  - 行为更准确，不引入新依赖，不影响 `statusCode===200` 分支。
- **Task 3 - 签到防重复点击与状态兜底**（`digital-recycling-miniprogram/pages/my-points/my-points.js`）
  - `data` 新增 `signing` 标志位，`handleSignIn` 入口判断 `isSigned || signing` 拦截重复点击。
  - `try/catch` 改为 `try/catch/finally`，`finally` 中复位 `signing`。
  - catch 中识别 `err.code === 10005`（今日已签到），主动将 `isSigned` 置 `true` 并刷新余额，避免极端情况下状态卡死。
  - toast 文案优先取 `err.message`（现已能拿到后端的「今日已签到」）。

## 2026-06-26（会员中心接入微信支付 V2）+ 修复 user_stock 外键定义）

### 背景
- 执行 `npm run db:sync`（`sequelize.sync({alter:true})`）同步模型新字段到数据库，过程中遇到三类阻断问题并逐一修复。

### 数据库变更（通过 MySQL MCP 执行）
- **清理 users 表重复索引**：users 表因历史多次 `sync({alter:true})` 累积 64 个索引（达 MySQL 上限），其中 61 个为重复的 `openid_2..openid_32`、`user_no_2..user_no_31`。通过单条 `ALTER TABLE users DROP INDEX ...`（61 个 DROP）批量清理，清理后仅保留 PRIMARY、openid、user_no 三个索引。
- **清理孤立外键引用**：users 表 4 条测试数据（id 276/279/282/285）的 `membership_id` 指向不存在的 `membership_plans.id`，导致无法添加外键约束。按会员降级约定将这 4 条记录的 `membership_id`、`membership_expire` 置为 NULL。
- **新增字段同步**：
  - `users.referrer` VARCHAR(50) NULL（推荐人字段）。
  - `membership_plans.product_id` 注释更新为「微信小程序虚拟支付商品 ID」。
  - `user_stock` 表字段注释补全（购入价格/备注/是否已卖出/卖出价格/卖出时间）。

### 模型定义修复（`digital-recycling-server/src/models/index.js`）
- **UserStock 关联 NOT NULL + SET NULL 矛盾修复**：
  - 原定义：`UserStock.userId` / `productId` 为 `allowNull: false`，但关联未指定 `onDelete`，Sequelize 默认 `ON DELETE SET NULL`，与 NOT NULL 列矛盾，报错 `ER_FK_COLUMN_NOT_NULL`。
  - 修复：为 `db.User.hasMany(db.UserStock)` 与 `db.UserStock.belongsTo(db.User)`、`db.Product.hasMany(db.UserStock)` 与 `db.UserStock.belongsTo(db.Product)` 显式增加 `onDelete: 'CASCADE'`（用户/产品删除时级联删除其库存，语义正确）。
  - `conditionId` 为可空字段，保留默认 `SET NULL`，未改动。
- 影响范围：仅 user_stock 表的 user_id、product_id 外键删除行为，不影响现有数据查询逻辑。

### 验证结果
- `users.referrer` 字段已存在（varchar(50), nullable）。
- `user_stock` 外键：`user_stock_ibfk_1`(user_id→CASCADE)、`user_stock_ibfk_2`(product_id→CASCADE)、`user_stock_ibfk_3`(condition_id→SET NULL)。
- users 表索引数恢复正常（10，含 PRIMARY、openid、user_no 及外键自动索引）。
- `npm run db:sync` 退出码 0，全部表同步完成。

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
