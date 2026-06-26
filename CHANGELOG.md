# 项目变更日志

> 本文件记录项目根目录 `c:\Users\17798\Desktop\陈峰\数码回收` 下所有需求的变更留痕。
> 时间统一使用 UTC+8（Asia/Shanghai）。

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
