# 项目变更日志 (CHANGELOG)

> 项目根目录下的汇总变更日志。所有需求变更完成后第一时间更新本文档。

## 2026-06-19

### fix-dev-test-privacy-popup — 修复开发者调试场景下原生隐私声明弹窗不弹

#### 关键问题

调试场景下点 dev-test-bar 的 [2] 申请隐私授权 / [3] 获取模糊位置 / [4] 一键完整流程,**微信原生隐私授权弹窗不弹**——`wx.requirePrivacyAuthorize` 直接 success,只显示「✓ 已同意隐私协议」日志,无任何弹窗。

#### 根因

[digital-recycling-miniprogram/app.js](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%9B%9E%E6%94%B6/digital-recycling-miniprogram/app.js) 注册了 `wx.onNeedPrivacyAuthorization` 全局监听器(`initPrivacyAuthorization`),**微信 API 行为**:一旦注册,所有 `wx.requirePrivacyAuthorize` 调用都触发 callback,**微信不再弹原生弹窗**。

旧实现 [app.js#L26-L82](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%1B%9E%E6%94%B6/digital-recycling-miniprogram/app.js#L26-L82) `resolvePrivacyAuthorization` 在首页 `resolve({ button: 'agree' })`,意图是"让原生弹窗弹"——**这是对微信 API 的误解**。`resolve agree` 会让 `requirePrivacyAuthorize` 走 success,**不弹**原生弹窗。

参考 [dom/app.js#L11-L15](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%1B%9E%E6%94%B6/dom/app.js#L11-L15) 注释明确「**故意不在此处监听 wx.onNeedPrivacyAuthorization**」——这是正确做法。

#### 修改范围（一个文件）

**删除** [digital-recycling-miniprogram/app.js](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%1B%9E%E6%94%B6/digital-recycling-miniprogram/app.js) 约 60 行:
- L23: `this.initPrivacyAuthorization()` 调用
- L26-L32: `initPrivacyAuthorization()` 方法
- L34-L82: `resolvePrivacyAuthorization()` 方法(含 `_isOnIndexPage` 内部函数)

**新增** [app.js](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%1B%9E%E6%94%B6/digital-recycling-miniprogram/app.js#L23-L25) `onLaunch` 末尾 3 行注释(对齐 dom 风格):
```js
// 注意：故意不在此处监听 wx.onNeedPrivacyAuthorization
// 原因：注册后 wx.requirePrivacyAuthorize 不再弹原生弹窗
//      保留原生行为，让 requirePrivacyAuthorize 自然弹出原生弹窗（与 dom 一致）
```

#### 行为变化

| 场景 | 修复前 | 修复后 |
|---|---|---|
| 调试 [2] 申请隐私授权 | `requirePrivacyAuthorize` → 触发 app.js 回调 → `resolve agree` → success,**无原生弹窗** | `requirePrivacyAuthorize` → 微信**弹原生授权弹窗**(与 dom 一致) |
| 调试 [3] 获取模糊位置 | 内部 `requirePrivacyAuthorize` 被全局回调拦截,跳过原生弹窗,可能因隐私未真正登记而 fail | 内部 `requirePrivacyAuthorize` 弹原生弹窗 → 用户同意 → `wx.getFuzzyLocation` 成功 |
| 调试 [4] 一键完整流程 | 同上,弹不出原生弹窗 | 弹出原生弹窗,串行执行隐私预检 → 授权 → 定位 |
| 业务「查找附近门店」 | `showLocationSheet` 自定义 sheet(不调 `requirePrivacyAuthorize`) | **无变化** |
| 业务 `onLocationAllow` | 不调 `requirePrivacyAuthorize`(`requirePrivacyAuthorize` 是 `requirePrivacyAuthorize` 的死代码引用) | **无变化** |
| 业务 `checkLocationWithPrivacy` | 当前是**死代码**(无 caller) | **无变化** |

#### 兼容性 / 限制

- **未修改** `app.json`(`__usePrivacyCheck__: true` + `requiredPrivateInfos: [getFuzzyLocation]` 不变)
- **未修改** `pages/index/index.js`(调试条 / 业务定位逻辑不变)
- **未修改** `pages/index/index.wxml`(API 兼容性行是静态展示文本)
- **未修改** `dom` 项目
- 后端 server / admin / app / 数据库 schema:**全部未触碰**

#### 验证

- `node --check digital-recycling-miniprogram/app.js` exit 0 ✅
- `grep -r 'initPrivacyAuthorization|resolvePrivacyAuthorization' digital-recycling-miniprogram/` 零匹配 ✅
- `grep -r 'onNeedPrivacyAuthorization' digital-recycling-miniprogram/` 仅剩 3 处(app.js 注释 + wxml API 兼容性行 + index.js 历史注释)✅
- GetDiagnostics 零错误 ✅
- 待真机/开发工具实测:
  - [ ] 点调试 [2] → 弹微信原生隐私授权弹窗(关键验收点)
  - [ ] 点调试 [3] → 弹原生弹窗 → 用户同意 → `wx.getFuzzyLocation` 成功
  - [ ] 点调试 [4] 一键完整流程 → 弹原生弹窗 → 用户同意 → 成功
  - [ ] 业务场景「查找附近门店」→ `showLocationSheet` 仍正常显示(无破坏)

#### 影响面

- 仅 `app.js` 一个文件
- 仅删除 60 行代码 + 3 行注释
- 无新增业务逻辑
- 数据库模型/迁移:**未修改**(不涉及 schema 变更)
- 后端 server / admin / app:**未触碰**
- 依赖:**未新增**

### integrate-dom-debug-into-index — 参考 dom 整合定位调试面板到主项目首页

#### 关键问题

主项目 [digital-recycling-miniprogram/pages/index/index.js](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%9B%9E%E6%94%B6/digital-recycling-miniprogram/pages/index/index.js) 当前的开发者调试条（`dev-test-bar`，仅 `envVersion === 'develop'` 可见）只暴露 2 个按钮（`调用 wx.getFuzzyLocation` / `清除定位缓存`）和 1 行结果摘要，遇到定位失败时排查链路（隐私预检 / 隐私授权 / 隐私回调 / 错误码分类）全部要靠 vConsole console，调试效率低且对开发同事不友好。

[dom](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%9B%9E%E6%94%B6/dom) 项目已完成独立 demo，提供完整的 5 按钮调试面板 + 系统信息 + API 兼容性 + Console 日志 + 错误码速查表。本次目标：**把 dom 的调试能力"搬运"到主项目首页的 dev-test-bar**。

#### 修改范围（三个文件）

##### 1. `digital-recycling-miniprogram/pages/index/index.js`

- **data 字段扩展**：新增 8 个字段 `systemInfo` / `sdkVersion` / `apiCheckText` / `privacyStatus` / `privacyStatusClass` / `locationResult` / `locationResultClass` / `consoleLogs`，保留 `devTestResult` / `showDevTestBar` 字段
- **新增方法**：
  - `_loadSystemInfoDevTest()` — onLoad 时加载 `wx.getSystemInfoSync()` 结果 + 检测 3 个核心 API 可用性
  - `_logDevTest(msg, level)` — 调试日志工具（同步输出 `console.log` + 写入 `consoleLogs` FIFO 10 条）
  - `onDevTestCheckPrivacy()` — [1] 检测隐私设置，调 `wx.getPrivacySetting`
  - `onDevTestRequirePrivacy()` — [2] 申请隐私授权，调 `wx.requirePrivacyAuthorize`
  - `onDevTestFullFlow()` — [4] 一键完整流程，串行执行隐私预检 → 授权 → 定位
  - `onDevTestCopyLocation()` — 长按 [3] 复制 lat,lng 到剪贴板
- **调整方法**：
  - `onDevTestGetLocation()` — 顶部加 `_logDevTest`；超时 / 隐私预检关键节点加 `_logDevTest`
  - `_devTestAfterPrivacy.fail` — 加 `_logDevTest('失败: 用户拒绝隐私协议', 'error')`
  - `_devTestDoGetLocation.showSuccessModal` — 同步写入 `locationResult` + `_logDevTest`
  - `_devTestDoGetLocation.showFailModal` — 同步写入 `locationResult` + `locationResultClass` + `_logDevTest`
  - `onDevTestClearCache()` — 顶部加 `_logDevTest`；同时清空 `privacyStatus` / `locationResult` 字段
- **onLoad** 中调用 `this._loadSystemInfoDevTest()`
- **未修改** `processStore` / `_fetchNearbyStores` / `_fallbackStoreToLocal` / `_lastUserLat/_lastUserLng` / `onFindNearbyStore` / `onLocationAllow` / `onLocationDeny` 等业务定位逻辑

##### 2. `digital-recycling-miniprogram/pages/index/index.wxml`

- **dev-test-bar 卡片化结构**（L117-L195 替换）：标题 + 7 张子卡片（系统信息 / 5 按钮 / 隐私状态 / 定位结果 / Console 日志 / API 兼容性 / 错误码速查表）
- 5 按钮按 [1] [2] [3] [4] [5] 顺序竖排
- [3] 按钮带 `bindlongtap="onDevTestCopyLocation"`
- 隐私状态 / 定位结果用 `{{privacyStatusClass}}` / `{{locationResultClass}}` 动态类
- Console 日志用 `wx:for="{{consoleLogs}}"` 列表渲染 + 空态「暂无日志」
- **store-card 末尾追加**：`<view class="store-debug-hint" wx:if="{{showDevTestBar}}">调试场景：可在下方 dev-test-bar 单独测试定位</view>`

##### 3. `digital-recycling-miniprogram/pages/index/index.wxss`

- **保留**现有 `.dev-test-bar` / `.dev-test-title` / `.dev-test-row` / `.dev-test-btn` / `.dev-test-result` / `.dev-test-hint` 基础样式
- **新增** 7 组样式：
  - `.dev-test-card` / `.dev-test-card-title` / `.dev-test-card-content` / `.dev-test-card-content.mono`（卡片化）
  - `.status-success`（绿加粗）/ `.status-error`（红加粗）
  - `.dev-test-log-list`（浅黑底 + 滚动）/ `.dev-test-log-empty` / `.dev-test-log-item` / `.log-info` / `.log-warn` / `.log-error`（级别着色）
  - `.dev-test-api-row`（API 兼容性行 + 虚线分隔）
  - `.dev-test-err-table`（错误码速查表）
  - `.dev-test-btn-secondary`（[4] 一键流程）/ `.dev-test-btn-ghost`（[5] 清除缓存）
  - `.store-debug-hint`（门店调试提示，仅 dev-test-bar 可见时显示）
- **注释掉** L1266-1294 的旧 dev-test-bar 样式（与新样式重复）

#### 行为

- **开发版首页**：dev-test-bar 完整显示，包含 7 张子卡片 + 5 按钮
  - 点 [1] → 隐私状态卡片显示 `needAuthorization=true/false | privacyContractName=...`
  - 点 [2] → 弹原生隐私授权弹窗 + 隐私状态卡片显示 `✓ 已同意隐私协议` 或 `✗ 拒绝: ...`
  - 点 [3] → 10s 超时兜底 + 定位结果卡片显示 `lat=... | lng=... | acc=...m | speed=... | altitude=...`
  - 点 [4] → 串行执行隐私预检 → 授权 → 定位，每步写入 Console 日志
  - 点 [5] → 清空 storage / globalData / 隐私状态 / 定位结果
  - 长按 [3] → 复制 lat,lng 到剪贴板
- **生产版首页**：dev-test-bar 不可见，所有调试方法虽存在但不会被触发
- **门店展示 / 距离展示**：保持现状（已由 `add-find-store-button` + `fix-store-distance-display` 覆盖，本次不修改）
- **门店卡片末尾**（开发版）：显示小字「调试场景：可在下方 dev-test-bar 单独测试定位」

#### 兼容性 / 限制

- **未修改** `app.json` / `app.js` / `utils/distance.js`
- **未修改** `index.json`（无新增组件）
- **未修改** 后端 server / admin / app / 数据库 schema
- 调试条仅 `envVersion === 'develop'` 可见（`showDevTestBar` 字段控制）
- 调试操作不污染生产 `storeInfo` / `processStore` / `app.globalData`（沿用 dom 的「只读探针」原则，[3] 定位成功仅写入 `app.globalData.lastLocation` 用于长按复制）

#### 验证

- `node --check pages/index/index.js` exit 0 ✅
- GetDiagnostics 零错误 ✅
- 待真机/开发工具实测：
  - [ ] 点 [1] → 隐私状态显示 needAuthorization
  - [ ] 点 [2] → 弹原生隐私授权弹窗
  - [ ] 点 [3] → 定位结果卡片显示 lat/lng
  - [ ] 点 [4] → 串行执行 3 步
  - [ ] 点 [5] → 清空所有缓存
  - [ ] 长按 [3] → 复制 lat,lng 到剪贴板
  - [ ] Console 日志面板随按钮更新（最多 10 条）
  - [ ] API 兼容性 / 错误码速查表正常显示
  - [ ] 门店卡片 + 距离展示未变化
  - [ ] 业务入口「查找附近门店」行为未变

#### 影响面

- 仅前端小程序 `pages/index/index.{js,wxml,wxss}` 三个文件
- 数据库模型/迁移：**未修改**（不涉及 schema 变更，不生成迁移文件）
- 后端 server / admin / app：**未触碰**
- 依赖：**未新增**

### fix-index-location-privacy-sheet — 首页「查找附近门店」隐私 sheet 不弹 + 定位失败修复

#### 关键问题

用户反馈首页（[digital-recycling-miniprogram/pages/index/index.wxml#L117-L130](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%9B%9E%E6%94%B6/digital-recycling-miniprogram/pages/index/index.wxml#L117-L130) 的开发者调试条所在的代码区域）出现两个相关 bug：

1. **自定义隐私声明弹窗（`showLocationSheet`）弹不出来**：用户点首页「查找附近门店」按钮，本应弹出带「已阅读并同意《隐私协议》」勾选项的自定义 sheet，但实际上**完全不弹**，直接走 `wx.authorize` 系统弹窗或直接 fail。
2. **定位失败**：开发者点击调试条「调用 wx.getFuzzyLocation」测试定位也失败，10s 超时后弹"可能原因"modal。

#### 根因（共享同一条链路）

- **A. `app.js` 的 `resolvePrivacyAuthorization` 在首页 `resolve({ button: 'disagree' })`**（[app.js#L34-L51](file:///c:/Users/17798/Desktop/%E9%99%88%E5%B3%B0/%E6%95%B0%E7%A0%81%E5%9B%9E%E6%94%B6/digital-recycling-miniprogram/app.js#L34-L51)）：导致 `wx.requirePrivacyAuthorize` 在首页直接 fail，调试条无法弹出原生隐私声明弹窗。
- **B. `showLocationSheet` 唯一触发点是死代码**：`pages/index/index.js` 的 `requestLocationPermission()`（L1090）只在 `checkPermissionSheets()`（L1083）中被调用，而 `checkPermissionSheets()` **从未被任何地方调用**。用户实际的入口是 `onFindNearbyStore()`（L1153）→ 直接 `wx.authorize` 系统弹窗 → **完全跳过 `showLocationSheet`**。
- **C. `wx.authorize` 二次调用不弹窗**：用户拒绝过 `scope.userFuzzyLocation` 后，再次调用 `wx.authorize` 不会弹系统弹窗，会直接 fail，且没有任何自定义 sheet 兜底。
- **D. `_devTestAfterPrivacy` fail 分支文案误导**：提示用户"先点查找附近门店同意 sheet"，与调试条应直接测试原生隐私弹窗的预期不符。

#### 修改范围（两个文件）

##### 1. `digital-recycling-miniprogram/app.js` — `resolvePrivacyAuthorization`

- 检测 `getPrivacySetting.needAuthorization` 后**按当前页面分支处理**：
  - **首页（`route === 'pages/index/index'`）**：首页 `showLocationSheet` 接管隐私同意 → 登记 `privacy_agreed` 并 `resolve({ button: 'disagree' })`，让后续 `wx.requirePrivacyAuthorize` 自然进入 fail 分支，由 `onLocationAllow` 接管
  - **非首页**：弹 `wx.showModal` 让用户明确选择（同意 / 查看详情）：
    - 同意 → 登记隐私并 `resolve agree`
    - 查看详情 → 调 `wx.openPrivacyContract`，详情页关闭后 `resolve agree`
    - 弹窗失败 / 拒绝 → `resolve disagree`
  - **`needAuthorization === false`**：直接 `resolve agree`，已同意过无需再问
- `_isOnIndexPage` 用 `getCurrentPages()` 安全获取当前页路由，含 `try/catch` 防御栈为空的情况
- 仍保留 `wx.getPrivacySetting` `fail` 兜底为 `resolve agree`（避免异常阻塞）

##### 2. `digital-recycling-miniprogram/pages/index/index.js` — 三处改动

**改动 ①（隐私预检入口）`onFindNearbyStore` 重写**：
- 入口先调 `wx.getPrivacySetting`：
  - `needAuthorization === true` → 设置 `showLocationSheet: true, locationPrompted: true`，**让首页自定义 sheet 真正弹出来**
  - `needAuthorization === false` → 直接调 `_doFindNearbyStore`
  - `getPrivacySetting` 不存在（旧版基础库）/ fail → 走 `_doFindNearbyStore`

**改动 ②（抽出复用方法）新增 `_doFindNearbyStore`**：
- 把原 `onFindNearbyStore` 主体逻辑整体抽出（保留 10s 超时兜底、onSuccess/onFail、doGetLocation、wx.getSetting + wx.authorize 链路）
- 由 `onFindNearbyStore`（隐私已同意）和 `onLocationAllow`（sheet 同意后）共用，避免逻辑分裂

**改动 ③（sheet「允许」按钮）`onLocationAllow` 简化**：
- 删除 `wx.requirePrivacyAuthorize` 链式调用（避免与 `app.js` 的 `wx.onNeedPrivacyAuthorization` 叠加成双弹窗）
- 勾选同意后直接调 `_doFindNearbyStore`，由其内部 `wx.getSetting` 判断是否需要二次授权

**改动 ④（调试条失败提示）`_devTestAfterPrivacy.fail` 分支文案更新**：
- `devTestResult` 改为：`失败: 隐私协议尚未通过业务入口同意（请先点「查找附近门店」同意隐私 sheet）`
- Modal 引导文案更新：「调试场景下请先点击首页「查找附近门店」按钮，在弹出的隐私 sheet 中勾选并同意《隐私协议》，再回来点击调试按钮即可测试定位」

#### 行为

- **用户首次点「查找附近门店」（未同意过隐私）**：
  - 触发隐私预检 → `needAuthorization=true` → 首页 sheet 弹出（含「开启位置服务」标题、隐私协议勾选、取消/允许按钮）✅
  - 勾选「已阅读并同意《隐私协议》」+ 点「允许」→ 直接进入 `_doFindNearbyStore` → `wx.getSetting` 检测 scope → 系统弹窗或直接定位
  - 点「取消」→ sheet 关闭，storeInfo 不变
- **用户曾拒绝过 scope**：
  - 点「查找附近门店」→ 隐私 sheet 再次弹出（兜底）
  - 同意 → `_doFindNearbyStore` 内部 `wx.authorize` fail → 弹 `wx.openSetting` 让用户去开启
- **用户已同意过隐私**：
  - 点「查找附近门店」→ 隐私预检直接通过 → `_doFindNearbyStore` 立即跑，sheet 不弹
- **调试场景**：用户先点「查找附近门店」同意 sheet，再点调试条 → `app.js` `resolvePrivacyAuthorization` resolve disagree，`requirePrivacyAuthorize` fail → 弹引导 modal 提示「调试场景下请先通过业务入口同意隐私」

#### 兼容性 / 限制

- **未修改** wxml / wxss / app.json（`__usePrivacyCheck__` + `requiredPrivateInfos` 配置正确）
- **未修改** `checkPermissionSheets` / `requestLocationPermission` 死代码（保守起见保留作为 sheet 触发模板参考）
- **未修改** 后端 server / admin / app / 数据库 schema（纯前端 bug）
- 其他 TabBar 页面（shopping / profile / brand-list 等）的隐私相关逻辑**未触碰**

#### 验证

- `node --check pages/index/index.js` exit 0 ✅
- `node --check app.js` exit 0 ✅
- 调用链：
  - 按钮入口：`onFindNearbyStore` → `_doFindNearbyStore` ✅
  - sheet 入口：`onLocationAllow` → `_doFindNearbyStore` ✅
  - 调试入口：`onDevTestGetLocation` → `_devTestAfterPrivacy`（fail 提示文案已更新） ✅
  - 全局回调：`app.js` 的 `wx.onNeedPrivacyAuthorization` → `resolvePrivacyAuthorization`（按页面分支） ✅
- 待真机/开发工具实测：
  - [ ] 首次点「查找附近门店」→ 自定义 sheet 弹出
  - [ ] sheet 勾选 + 允许 → 进入系统授权弹窗
  - [ ] 系统授权同意 → 成功获取定位 + 门店距离
  - [ ] 调试条点击 → 失败后引导 modal 显示正确文案

#### 影响面

- 仅前端小程序 `app.js` + `pages/index/index.js` 两个文件
- 数据库模型/迁移：**未修改**（不涉及 schema 变更，不生成迁移文件）
- 后端 server / admin / app：**未触碰**
- 依赖：**未新增**

### fix-store-geocode-api — 门店管理"自动获取坐标"接口 404 修复

#### 关键问题

管理后台「内容管理 → 门店管理 → 新增/编辑门店」时，填写门店地址失焦或点击「📍 自动获取坐标」按钮，前端调用 `GET /api/admin/stores/geocode` 无任何返回，页面提示「地址解析失败：网络错误」。

#### 根因（两层）

**根因 A**：后端 `digital-recycling-server/src/routes/admin/store-manage.js` 当前只通过 `crud-factory` 暴露 4 个 CRUD 路由，**根本没有 `/geocode` 子路由**，导致请求 404。Express 默认未匹配路由返回 `Cannot GET ...`（HTML），前端 axios 拦截器判断 `res.code === undefined` 直接放行，后续 `payload.lat` 访问失败 → 最终走 catch 报"解析错误"。

**根因 B（首次修复遗漏，2026-06-19 二次定位）**：项目使用 **Express 5.2.1**（[package.json](file:///c:/Users/17798/Desktop/陈峰/数码回收/digital-recycling-server/package.json)），Express 5 默认 `query parser: 'simple'`（原生 `querystring`），**不支持 `a[b]=c` 嵌套语法**。首次修复时直接 `req.query.address` 拿到 `undefined`，被错误地视为"地址为空"，返回 422 "请提供门店地址"。

实测对比（mini Express 5 app 真实 HTTP 请求）：
```
GET /test?address[address]=深圳市华强北&address[province]=&_t=1781845959287
- Express 4 默认 extended parser：
    req.query = { address: { address: "...", province: "", city: "", district: "" }, _t: "..." }
- Express 5 默认 simple parser（本项目实际行为）：
    req.query = { "address[address]": "...", "address[province]": "", "address[city]": "", "address[district]": "", "_t": "..." }
    req.query.address === undefined  ← 关键！
```

#### 修改范围（仅一个文件）

- **`digital-recycling-server/src/routes/admin/store-manage.js`**
  - 引入 `adminAuth`、`success/validateError`、`geocodeStore`、`logger`、`qs`（项目间接依赖 v6.15.2，未新增 npm 包）
  - 新增 `parseQuery(req)` 工具函数：提取 `req.originalUrl` 的 query 段，用 `qs.parse` 解析后合并 `req.query`，**仅限本路由内部使用，不改全局 `app.set('query parser', ...)`** 以避免影响其它 admin 路由
  - 新增 `normalizeAddressParam(raw)` 归一化函数，兼容两种入参形态：
    - 嵌套对象：`?address[address]=...&address[province]=...&address[city]=...&address[district]=...`（前端 axios 默认序列化）
    - 扁平对象：`?address=...&province=...&city=...&district=...`（向后兼容）
  - 链式追加 `storeManage.get('/geocode', adminAuth, handler)`：
    - 空地址 → HTTP 422 + `请提供门店地址`
    - 解析成功 → HTTP 200 + `{ code: 0, data: { lat, lng, address, formatted } }`
    - 解析失败（腾讯地图 status !== 0）→ HTTP 422 + `地址解析失败，请检查地址是否准确` + warn 日志
    - 异常 → `next(err)` 让全局 `errorHandler` 兜底

#### 行为

- 前端"新增/编辑门店"对话框填写地址失焦后，自动调用 `/geocode` 并填充 latitude/longitude，不再报"解析错误"或"请提供门店地址"
- 现有 CRUD（列表/新增/更新/删除门店）行为不变
- 嵌套与扁平两种参数都支持

#### 兼容性

- 不修改前端 `digital-recycling-admin` 任何文件（保持现有 axios 调用方式，零回归）
- 不修改 `utils/qqmap.js`（复用现有 `geocodeStore`，签名和返回结构已满足）
- 不修改全局 `app.set('query parser', ...)` 配置（`app.js` 未触碰，避免影响其它 admin 路由对 query 的解析语义）
- 不修改数据库 schema / models → **不生成迁移文件**
- 不修改小程序 / app / 其他 admin 页面

#### 验证

- `node --check src/routes/admin/store-manage.js` exit 0 ✅
- `node --check src/routes/admin/index.js` exit 0 ✅
- 路由表枚举：`GET /geocode` 已注册，连同原有 4 个 CRUD 共 5 个路由 ✅
- `normalizeAddressParam` 8 个单元测试全过：null / undefined / 空串 / flat 字符串 / 嵌套对象 / 完整嵌套 / whitespace trim / number ✅
- **mini Express 5 app 端到端测试 4 场景全过**（mock adminAuth + 真实 HTTP 客户端）：
  - 真实用户 URL（嵌套 + 空省市区）→ 200 + `{ code: 0, data: { lat: 22.547, lng: 114.085, address: "深圳市华强北", formatted: "..." } }` ✅
  - 嵌套完整（有 province/city/district）→ 200 + 正常 data ✅
  - 扁平参数 → 200 + 正常 data（向后兼容）✅
  - 嵌套但 `address.address` 为空 → 422 + `请提供门店地址` ✅
- Handler 链长度 = 2（`adminAuth` + 业务 handler）✅
- `qs` 库已为项目间接依赖（v6.15.2），未新增任何 npm 依赖 ✅

#### 影响面

- 仅后端 `digital-recycling-server/src/routes/admin/store-manage.js` 单一文件
- 数据库模型/迁移：**未修改**（不涉及 schema 变更，**不生成迁移文件**）
- 前端 admin / app / 小程序：**未触碰**
- 全局 `app.js` query parser 配置：**未触碰**
- 依赖：**未新增**（复用 `qs` v6.15.2 作为间接依赖）
- utils/qqmap.js：**未修改**

### fix-store-distance-display — 首页门店距离显示"距离暂不可用"修复

#### 关键问题

用户反馈：尽管微信公众平台后台已开通 `wx.getLocation` 和 `wx.getFuzzyLocation` 接口权限，首页「附近门店」卡片仍始终显示「距离暂不可用」，实际未展示用户与最近门店的距离。

#### 根因

`pages/index/index.js` 的 `_fallbackStoreToLocal()` 兜底逻辑存在缺陷。当后端 `/places/nearest-store` 接口满足以下条件时：
1. `payload.list` 非空
2. `list[i].distance` 全部为 `null`（腾讯地图驾车距离矩阵失败/未配置）
3. `list[i].latitude` / `list[i].longitude` 字段缺失或命名不一致

前端 `haversineFallback()` 走兜底 → `withCoords.length === 0` → 调用 `_fallbackStoreToLocal()`，但该方法直接用 `{ ...storesData[0] }` 覆盖了 `storeInfo`，**没有用缓存的用户 lat/lng 配合 storesData 的坐标计算 haversine 距离**，导致 `storeInfo.distance` 一直为空，wxml 第 85 行 `{{storeInfo.distance ? '距离 ' + storeInfo.distance + ' km' : '距离暂不可用'}}` 命中 else 分支。

#### 修改范围（仅一个文件）

- **`digital-recycling-miniprogram/pages/index/index.js`**
  - `onLoad`（line 179-185）：新增 `this._lastUserLat = null; this._lastUserLng = null` 初始化（非 data 字段）
  - `fetchLocationAndStores` 入口（line 1169-1178）：新增 `[home] globalLocation ->` 诊断日志（vConsole 排查用）
  - `fetchLocationAndStores.onLocationSuccess`（line 1181-1190）：在 `app.globalData.latitude/longitude` 赋值后，同步缓存到 `this._lastUserLat/_lastUserLng`（供 `_fallbackStoreToLocal` 兜底使用）
  - `_fetchNearbyStores` 入口（line 428-432）：新增 `[home] fetchNearby ->` 诊断日志
  - `processStore` 兜底分支（line 408-420）：当 `nearest === null` 时，尝试用 `stores[0].latitude/longitude` 配合 lat/lng 算 haversine 距离并赋给 `fallback.distance`；若 `stores[0]` 无坐标，保持现有 `delete fallback.distance` 行为
  - `_fallbackStoreToLocal`（line 546-589）：重写兜底逻辑，当 storesData 非空 + 用户位置缓存有效时，用 `haversineDistance` 遍历 storesData 找最近门店，赋 `distance` 字段（保留 2 位小数，km 单位，字符串），标记 `source = 'haversine:fallback-local'`；算不出有效距离时保持现有降级行为。新增 `[home] fallback-distance ->` 诊断日志。

#### 行为

- **正常情况**（用户授权 + 后端 distance 正常）：storeInfo.distance 有值 → 显示「距离 X.XX km」
- **后端 distance 全为 null + item 有坐标**：现有 `haversineFallback` 算出距离，行为不变
- **后端 distance 全为 null + item 无坐标**（核心修复）：新增的 `_fallbackStoreToLocal` 兜底逻辑生效，用 storesData + 缓存用户位置算 haversine 距离 → 显示「距离 X.XX km」✅
- **用户拒绝授权 + storesData 无坐标**：保持现有降级（distance 为 null，显示「距离暂不可用」+ 弹 modal）
- **诊断日志**：vConsole 可见 5 类日志（globalLocation / getFuzzyLocation / fetchNearby / nearest-store / fallback-distance），便于用户自助排查

#### 兼容性

- 不修改 `app.json`（`requiredPrivateInfos: ["getFuzzyLocation"]` 配置正确，不与 getLocation 互斥冲突）
- 不修改 `utils/distance.js`（复用现有 `haversineDistance`）
- 不修改 wxml / wxss / json
- 不修改后端 / admin / app / 数据库 schema

#### 验证

- `node --check pages/index/index.js` exit 0 ✅
- GetDiagnostics 零错误 ✅
- 真机验证 4 个场景：[ ] 正常 / [ ] 后端 distance 为 null + item 有坐标 / [ ] 后端 distance 为 null + item 无坐标（核心修复）/ [ ] 用户拒绝授权

#### 影响面

- 仅前端小程序 `pages/index/index.js` 单一文件
- 数据库模型/迁移：**未修改**（不涉及后端与 schema）
- 后端 server/admin/app：**未触碰**
- 依赖：**未新增**
- wxml / wxss / json：**未触碰**（wxml 第 85 行的 distance 三元判断逻辑保持不变）

## 2026-06-13

### fix-test-button-stuck-loading — 测试按钮"一直 loading"修复

#### 关键问题

用户反馈：点击首页"🧪 测试获取位置"按钮后，**loading 一直转**不消失，弹窗（结果）也没出现。

**根因**：`pages/index/index.js#L504-L543` 的 `onDevTestGetLocation` 只在 `wx.getLocation` 的 `success` / `fail` 回调里 `wx.hideLoading()`。但在小程序 `__usePrivacyCheck__: true` 已开启的情况下，**用户未接受隐私协议时 `success` / `fail` 都不会触发**，导致 `wx.showLoading` 永远等不到配对的 `wx.hideLoading()`，loading 卡死。

#### 修改范围（仅一个文件）

- **`digital-recycling-miniprogram/pages/index/index.js`**
  - `onDevTestGetLocation`（line 500-542）改造：
    1. 入口先 `clearTimeout(this._devTestTimeout)` 取消旧 timer
    2. 入口 `wx.hideLoading()` 防御性隐藏上一次的 loading
    3. 入口 `this.setData({ devTestResult: '' })` 清空旧摘要
    4. 入口 `wx.showLoading({ title: '定位中...', mask: true })` 显示新 loading
    5. 增加 `wx.requirePrivacyAuthorize` 隐私协议先检查（`typeof === 'function'` 才调用，向下兼容）
    6. 隐私协议通过后再调 `_devTestDoGetLocation`
  - 新增 `_devTestDoGetLocation` 私有方法（line 544-611）：
    1. 启动 10 秒安全超时 `setTimeout`，兜底防止 `complete` 也不触发的极端情况
    2. `wx.getLocation` 显式提供 `success` / `fail` / **`complete`** 三回调
    3. `complete` 内 `clearTimeout` + `wx.hideLoading()`，**确保** loading 一定消失
  - 新增 Page 实例字段 `_devTestTimeout`（不是 `data`），用于 timer 句柄管理
  - `success` / `fail` 内部仍保留 `setData({ devTestResult })` 摘要写入

#### 行为

- **正常情况**（用户已授权位置）：loading → 弹"位置成功"模态 + 摘要 + loading 消失
- **拒绝授权**：`fail` 触发 → 弹"位置失败" + 摘要 + loading 消失
- **关键**：未接受隐私协议 → 弹隐私协议 → 用户拒绝 → 弹"需要隐私协议"，**不**调 `wx.getLocation`，loading 立即消失
- **关键**：用户点了隐私协议但没继续操作 → 10 秒后兜底 timer 弹"位置超时" + loading 消失
- **关键**：反复点击 → 旧 timer 被 `clearTimeout` 取消，新流程启动，不出现多个 timer 打架
- 控制台日志新增 `[dev-test] requirePrivacyAuthorize fail` / `[dev-test] getLocation complete -> loading hidden` / `[dev-test] getLocation timeout -> { reason: 'no callback in 10s' }`

#### 兼容性

- `wx.getLocation.complete` 是基础库 1.4.0+ API，当前项目基础库足够新
- `wx.requirePrivacyAuthorize` 是基础库 3.0.0+ API，**只有** `typeof === 'function'` 时才调用（向下兼容）
- 旧版本（无隐私协议 API）走原 `wx.getLocation` 流程
- 测试按钮的"只读探针"性质保持不变：仍不写 `app.globalData`、不污染 `storeInfo`、不触发 `_fetchNearbyStores`

#### 覆盖关系

- 覆盖之前的 `home-add-test-get-location-button` spec 中的"点击后可能 loading 不消失"部分场景
- 增量修复，不改原有成功/失败路径的行为

#### 验证

- `node --check pages/index/index.js` 语法检查 exit 0 ✅
- 真机验证（用户实测）：[ ] 正常 / [ ] 拒绝授权 / [ ] 隐私协议拒绝 / [ ] 反复点击

#### 影响面

- 仅前端小程序 `pages/index/index.js` 单一文件
- 数据库模型/迁移：**未修改**（不涉及后端与 schema）
- 后端 server/admin/app：**未触碰**
- 依赖：**未新增**
- wxml / wxss / json：**未触碰**（按钮 UI 不变）

### home-add-test-get-location-button — 首页增加"测试获取位置"调试按钮

#### 背景

开发者调试首页距离显示时需要一个手动触发 `wx.getLocation` 的入口，验证：
- 当前手机定位是否可用
- `wx.getLocation` 返回的精度、坐标系、speed 等字段
- `app.globalData.latitude/longitude` 是否被正确写入
- 重算后的最近门店与距离

#### 修改范围（三个文件）

- **`digital-recycling-miniprogram/pages/index/index.wxml`**（+6 行）
  - 在 `store-card` 后、`<!-- 常用报价 -->` 前插入 `<view class="dev-test-bar">` 测试按钮块
  - 按钮文字"🧪 测试获取位置"，绑定 `bindtap="onDevTestGetLocation"`
  - 按钮下放 `<text class="dev-test-hint">` 显示 `devTestResult` 摘要

- **`digital-recycling-miniprogram/pages/index/index.wxss`**（+25 行）
  - `.dev-test-bar`：橙色虚线边框 + 浅黄底，圆角
  - `.dev-test-btn`：橙字白底按钮
  - `.dev-test-hint`：灰字小字摘要，word-break: break-all

- **`digital-recycling-miniprogram/pages/index/index.js`**（+1 data 字段 + 1 方法）
  - `data` 中增加 `showDevTestBar: true`、`devTestResult: ''`
  - 新增 `onDevTestGetLocation` 方法：调 `wx.getLocation({ type: 'gcj02' })`，弹 `wx.showModal` 显示 lat/lng/accuracy/errMsg，并写入 `devTestResult` 摘要；提供"复制 lat,lng"快捷按钮

#### 关键边界（只读探针）

测试按钮**不**触发以下业务流：
- `app.globalData.latitude = ...`
- `app.globalData.longitude = ...`
- `requestStoreLocation(...)`
- `_fetchNearbyStores(...)`
- `setData({ storeInfo: ... })`

**避免污染业务数据流**。

#### 行为

- 微信开发者工具 / 真机点击按钮 → 显示 `wx.showLoading` → 成功后弹窗显示完整 `wx.getLocation` 结果 + 摘要写入 `devTestResult`
- 关闭手机定位 / 拒绝授权 → 弹窗显示 `errMsg`
- 切换开发者工具 → 自定义位置后再点，验证 lat/lng 随之变化
- 点击测试按钮后，`storeInfo.distance` **不变**（不被覆盖）

#### 影响面

- 仅 `pages/index/` 三个文件
- 数据库模型/迁移：**未修改**
- 后端 server/admin/app：**未触碰**
- 依赖：**未新增**
- 按钮对所有用户可见，**不**按 dev/prod 隐藏（明确是开发调试元素）

### home-store-distance-always-show — 首页距离"始终显示"修复（升级版）

#### 关键问题

上一轮 `home-nearest-store-haversine-fallback` 在 `_fetchNearbyStores` 内部增加了 haversine 兜底，但用户实测后反馈 `storeInfo.distance` 仍然没有写入，距离数字依旧不显示。

**真正根因**：`fetchHomeData` 中 `processStore(storeRes)` 调用时**没传 lat/lng**（line 267），导致 `hasLocation = false` → `delete fallback.distance` → 同步 `setData` 时 `storeInfo.distance` 已是 undefined。后续 `_fetchNearbyStores` 是异步的，且依赖后端腾讯地图驾车矩阵（容易失败），任何一环失败都会让距离消失。

#### 修改范围（仅一个文件）

- **`digital-recycling-miniprogram/pages/index/index.js`**

  1. **`fetchHomeData`（line 265-281）**：在 `processStore(storeRes)` 调用前**先**读取 `app.globalData.latitude/longitude` 缓存到 `cachedLat, cachedLng`，再传给 `processStore(storeRes, cachedLat, cachedLng)`。这是**同步**算出最近门店 + 距离的关键修复。

  2. **`fetchLocationAndStores`（line 857-881）**：`wx.getLocation` 成功回调里，在 `requestStoreLocation(lat, lng)` 之后**主动**调用 `processStore(this.data.storesData, lat, lng)` 同步重算，确保用户首次授权定位后距离**立即**显示，不依赖后续异步后端。

  3. **`_fallbackStoreToLocal`（line 452-461）**：删除 `delete fallback.distance` 这一行，**不**清掉 `processStore` 已经写入的有效 distance。

#### 行为

- 用户进入首页（已授权过定位）：距离**同步**显示（如 `5.23km`），不依赖异步后端
- 用户在首页点击"允许"授权定位：距离**立即**显示
- 腾讯地图驾车矩阵失败：距离仍显示（前端 haversine 兜底保留）
- 腾讯地图驾车矩阵成功：距离被覆盖为驾车距离
- 与上一轮 spec `home-nearest-store-haversine-fallback` 叠加，构成深度防御

#### 验证

- `node --check pages/index/index.js` 语法检查 exit 0 ✅
- `processStore` 现有逻辑不变（已有 haversine 排序）
- `_fetchNearbyStores` 现有逻辑不变（保留 haversine 兜底作为深度防御）
- `_fallbackStoreToLocal` 改"不删 distance"是关键安全网

#### 影响面

- 仅 `pages/index/index.js` 单文件
- 数据库模型/迁移：**未修改**
- 后端 server/admin/app：**未触碰**
- 依赖：**未新增**（`haversineDistance` 已存在）

### home-nearest-store-haversine-fallback — 首页最近门店距离兜底

#### 关键问题

用户报告首页 `pages/index/index.wxml#L85` 的距离不显示，而且不是距离用户最近的门店。

**根因**：当前 `_fetchNearbyStores` 调用后端 `/api/places/nearest-store`，当腾讯地图 `distanceMatrix` 接口失败时返回 `[]`，后端在所有 `distance` 为 `null` 的情况下用 `Number.MAX_SAFE_INTEGER` 兜底排序保持原 `sort_order` 顺序——前端取 `list[0]` 拿到的是 sort_order 最小的门店（不是最近的），且 `storeInfo.distance` 为 `null`，wxml 的 `wx:if` 判断为 false，距离不显示。

#### 修改范围（仅一个文件）

- **`digital-recycling-miniprogram/pages/index/index.js`**
  - `_fetchNearbyStores` 方法（line 371-455）改造：新增 `haversineFallback` 兜底分支
  - 触发条件：`list.length > 0` 且 `list.every(item => item.distance == null || item.distance === undefined)`
  - 兜底逻辑：用 `haversineDistance` 为有坐标门店重算 km 距离（保留 2 位小数），按距离升序排序；无坐标门店排在末尾且 `distance = null`
  - 兜底后无任何有坐标门店：调用 `this._fallbackStoreToLocal()`（不走 `_fallbackToNearbyByStores`）
  - 新增调试日志：`[home] nearest-fallback -> { reason, candidateCount, nearestDistance }`
  - 复用顶部已 require 的 `haversineDistance`（line 3），无需新增依赖
  - 未触碰 `_fallbackToNearbyByStores`、`_fallbackStoreToLocal`、wxml、wxs、json 等其他文件

#### 验证

- `node --check` 语法检查 exit 0 ✅
- 文件第 3 行 `const { haversineDistance } = require('../../utils/distance')` 已在，无需新增 require
- 距离显示：wxml `wx:if` 现在能命中（`distance` 不再是 `null`），兜底后展示 km 距离
- 取舍正确：取 `list[0]` 时改用排序后的最近门店（按 haversine 距离升序），不再是 sort_order 最小

#### 影响面

- 仅前端小程序 `pages/index/index.js` 单一文件
- 数据库模型/迁移：**未修改**（不涉及后端与 schema）
- 后端 server/admin/app：**未触碰**
- 依赖：**未新增**（`haversineDistance` 已存在）
- 测试/迁移文件：**未新增**

### home-nav-button-opens-map — 首页导航按钮直接打开地图

#### 关键问题

用户反馈：首页"附近门店"卡片中点击地址行的"导航 >"按钮，跳转到了门店列表页面而不是直接打开地图，体验不流畅。

#### 修改

- **`pages/index/index.wxml`**（第 100 行）
  - `<view class="store-address" bindtap="goToStoreList">` 改为 `<view class="store-address" bindtap="openLocation">`
  - 让"导航 >"按钮直接触发 `openLocation` 方法调起原生地图

- **`pages/index/index.js`** 的 `openLocation`
  - 增加 `Number.isFinite` 检查：`lat === 0 || lng === 0` 时弹 toast 兜底，避免误调起地图到 (0,0)
  - `name` 兜底从硬编码"联赢电子回收网废旧手机回收中心"改为 `'回收门店'`，优先使用 `s.name`，其次 `s.title`
  - `address` 拼接改为 `[s.province, s.city, s.district, s.address].filter(Boolean).join('')`，避免出现 `nullundefinedundefined某地址` 这种字符串
  - 增加 `scale: 16` 参数（适合查看周边 500m 范围）
  - `latitude` / `longitude` 使用 `toFixed(6)` 保留 6 位精度，避免过长的小数位数

#### 兼容性 / 限制

- 不影响后端，不影响数据库，不生成迁移文件。
- `goToStoreList` 方法仍保留，可在其他入口调用（如首页底部"门店列表"按钮）。
- `pages/store-list/store-list` 页面仍可独立访问。
- `wx.openLocation` 不支持自定义 markers 数组，用户位置由原生地图自动显示（蓝点）。
- 原生地图（高德/腾讯等）会根据用户位置和门店位置自动计算距离并展示。

### auto-geocode-store-on-save — 新增门店自动 Geocode + 驾车距离展示

#### 关键问题

用户反馈：用户在深圳，最近门店在北京，距离应该展示深圳到北京的驾车距离（约 1800 km），但实际距离不展示。根因：

1. **stores 表经纬度不准确**：北京门店 `address="北京市故宫"` 但 `latitude=33.1624000, longitude=115.6218000`（阜阳坐标）。
2. **新增门店没有自动生成经纬度**：管理员 POST 创建门店时需手动录入 lat/lng，但大多门店 address 已经有足够定位信息。
3. **距离展示链路错位**：之前的 `getNearbyByStores` 用 stores[].name 作关键字搜腾讯地图 POI，搜到无关 POI（"名创优品"等）。

#### Part A — 腾讯地图工具增强

- **`src/utils/qqmap.js`**
  - `buildAddress(input)`：支持字符串或 `{ province, city, district, address }` 对象拼接，并去重避免重复拼接（如"安徽省阜阳市颍州区安徽省阜阳市颍州区白宫"）。
  - `geocode(input)`：通用地址解析，支持上述两种入参。
  - 新增 `geocodeStore(store)`：自动拼接 + fallback 到 address 重试。
  - 新增 `distanceMatrix({ from, toList, mode = 'driving' })`：调用腾讯地图 `/ws/distance/v1/matrix`，正确解析 `rows[].elements[]` 二维结构（修复了之前只取 `elements[0]` 的 bug，导致只返回单个距离）。

#### Part B — Store 模型自动 Geocode

- **`src/models/Store.js`**
  - 添加 `beforeCreate` hook：当 `latitude` / `longitude` 为 null 时，调用 `geocodeStore(store)` 自动填充。
  - 添加 `beforeUpdate` hook：检测 `address/province/city/district` 字段变化时，重新 geocode 更新坐标；未变化保留原坐标。
  - 通过 `options.autoGeocode = false` 可关闭自动 geocode（如数据修复脚本使用）。

#### Part C — 数据修复脚本

- **`scripts/repair-store-coordinates.js`**（新建一次性脚本）
  - 执行：`node scripts/repair-store-coordinates.js`
  - 遍历 stores 表所有记录；
  - 对每条调用 `geocodeStore`；
  - 写入更新后的 lat/lng；
  - 调用间隔 250ms 避免触发频率限制；
  - 输出 `[repair]` 日志便于追踪。
- **执行结果**：
  - 北京门店：`lat=39.908054, lng=116.39697`（北京故宫真实坐标）
  - 安徽门店：`lat=32.883591, lng=115.807108`（阜阳颍州区真实坐标）

#### Part D — 最近门店接口

- **`src/routes/api/places.js`**
  - 新增 `GET /api/places/nearest-store?lat=&lng=&mode=driving`：
    - 入参 `lat`、`lng`（必填，gcj02）；
    - `mode` 默认为 `driving`，可选 `walking` / `bicycling`；
    - 查询 `db.Store.findAll({ where: { status: 1, latitude: { [Op.not]: null }, longitude: { [Op.not]: null } } })`；
    - 调用 `distanceMatrix` 计算用户位置到每个门店的距离；
    - 按 distance 升序返回最近门店列表，每条带 `distance`（米）、`duration`（秒）。
- **自测结果**（用户深圳 lat=22.5431, lng=114.0579）：
  - 安徽门店 (阜阳)：`distance=1377590`（1377.59 km）—— 距离最近
  - 北京门店：`distance=2168241`（2168.24 km）
  - 接口正确按距离升序返回。

#### Part E — 前端切换数据源

- **`digital-recycling-miniprogram`**
  - `utils/api-modules.js`：新增 `placesApi.getNearestStore`，调用 `GET /api/places/nearest-store`。
  - `pages/index/index.js`：
    - `_fetchNearbyStores(lat, lng)` 重写：优先调 `placesApi.getNearestStore`，失败兜底到 `_fallbackToNearbyByStores`（保留旧的 nearby-by-stores / getNearby 链路）。
    - `apply` 函数兼容新返回结构（`name`、`title`、`contact_name`、`wechat`、`phone` 等）。
    - console.log 输出 `[home] nearest-store ->` 便于调试。

#### 兼容性 / 限制

- 数据库 schema 不变，未生成迁移文件。
- 数据修复脚本需手动执行（一次性操作）。
- 不影响现有 `/api/stores`、`/api/places/nearby`、`/api/places/nearby-by-stores` 接口。
- 腾讯地图 `geocoder/v1` / `distance/v1/matrix` 调用频率需注意。

### home-location-prompt-when-disabled — 首页手机定位未开启时主动提示用户

#### 关键问题

用户反馈：手机定位未开启时小程序没有任何提示。根因：

1. `onShow` 中只有 `if (!token)` 分支才调用 `requestLocationPermission()`，已登录用户完全跳过定位流程。
2. `pages/index/index.js` 中已定义 `showLocationSheet`、`locationAgreed`、`locationSheetChecked`、`onLocationDeny`、`onLocationAllow`、`toggleLocationCheck`，但 `pages/index/index.wxml` 中**完全没有对应的弹窗 UI**。
3. `wx.getLocation` fail 回调只在 `errMsg.includes('ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF')` 等关键字时才弹模态，兼容性差。
4. `location_permission_done` 一次性标记后不会再提示。

#### Part A — 定位流程重构

- **`pages/index/index.js`**
  - `data` 初始化新增：`showLocationSheet: false`、`locationAgreed: false`、`locationSheetChecked: false`、`locationPrompted: false`。
  - `onShow` 移除"未登录才请求定位"限制：通过 `wx.getStorageSync('location_prompt_done')` 控制本次会话是否已提示过；冷启动后 storage 为空，可重新提示。
  - `requestLocationPermission`：`wx.getSetting` 失败或未授权 → 设置 `showLocationSheet: true` 展示自定义隐私弹窗（不再立即 `wx.authorize`）。
  - 新增 `_showLocationServiceModal()` 辅助方法：统一弹"定位服务未开启"模态提示，确认按钮"去开启"调用 `wx.openAppAuthorizeSetting` 或 `wx.openSetting`。
  - `askForLocationPermission` / `fetchLocationAndStores` 中 fail 统一调用 `_showLocationServiceModal`；`location_prompt_done` 标记在成功 / 失败 / 取消时都写入。
  - `onLocationAllow`：检查 `locationSheetChecked`（未勾选 toast 提示"请先勾选并阅读隐私协议"），勾选后调用 `wx.authorize` 弹系统授权框。
  - `onLocationDeny`：关闭 sheet + 写入 prompt 标记 + 继续 `loadHomeData`，**不阻塞**首页加载。

#### Part B — 定位隐私授权弹窗 UI

- **`pages/index/index.wxml`** 新增弹窗结构（位于 `</block>` 之前）：
  ```xml
  <view class="location-sheet" wx:if="{{showLocationSheet}}">
    <view class="sheet-mask" bindtap="onLocationDeny"></view>
    <view class="sheet-content">
      <view class="sheet-title">开启位置服务</view>
      <view class="sheet-desc">为了展示离您最近的门店，需要获取您的位置信息。请在下方勾选并点击「允许」。</view>
      <view class="sheet-checkbox-row" bindtap="toggleLocationCheck">
        <view class="checkbox {{locationSheetChecked ? 'checked' : ''}}">{{locationSheetChecked ? '✓' : ''}}</view>
        <text class="sheet-checkbox-label">已阅读并同意《隐私协议》</text>
      </view>
      <view class="sheet-buttons">
        <view class="sheet-btn sheet-btn-cancel" bindtap="onLocationDeny">取消</view>
        <view class="sheet-btn sheet-btn-allow {{locationSheetChecked ? 'enabled' : 'disabled'}}" bindtap="onLocationAllow">允许</view>
      </view>
    </view>
  </view>
  ```

- **`pages/index/index.wxss`** 新增样式：
  - `.location-sheet` 全屏固定定位 + `z-index: 9999`
  - `.sheet-mask` 半透明黑色背景
  - `.sheet-content` 底部弹出样式（圆角 + slideUp 动画）
  - `.sheet-title` / `.sheet-desc` 标题与说明样式
  - `.checkbox` 复选框（默认边框 + 选中后绿色背景）
  - `.sheet-buttons` 双按钮并排布局
  - `.sheet-btn-allow.disabled` 灰显 + `pointer-events: none`
  - `.sheet-btn-allow.enabled` 绿色背景

#### 兼容性 / 限制

- 不修改后端，不修改数据库模型，不生成迁移文件。
- 不影响已登录用户的首页内容加载流程。
- 不影响 `pages/price-quote/price-quote.js` 的报价单流程。
- 弹窗基于自定义 sheet 实现，参考微信原生位置授权弹窗的视觉风格。
- 距离展示（基于所有门店对比离最近那个）作为后续 spec 处理，需要先确保定位开启。

### fix-home-qqmap-distance-display — 首页腾讯地图关键字改为后台门店名

#### Hotfix — 腾讯地图 WebService 接口路径修正

自测中发现腾讯地图 WebService API 周边搜索的正确路径是 **`/ws/place/v1/search`**（v1），不是 v2。原代码用 `/ws/place/v2/search` 导致腾讯地图返回 `status: 404` 错误"错误的请求路径"，接口虽然能响应但 `data.data` 始终为空，距离展示失败。

- **`digital-recycling-server/src/utils/qqmap.js`**
  - `searchNearby` 中 `request('/ws/place/v2/search', ...)` 改为 `request('/ws/place/v1/search', ...)`。
- 自测验证：
  - `GET /api/places/nearby?lat=33.1624&lng=115.6218&keyword=回收&radius=5000&limit=10` → 返回 10 个 POI，每个带 `distance`（米）和 `latitude/longitude`。
  - `POST /api/places/nearby-by-stores`（stores=["安徽门店","北京门店"]）→ 命中关键字"安徽门店"，返回 20 个 POI，最近 250 米。

#### Part A — 关键字从硬编码"数码回收"改为动态门店名

- **后端 `digital-recycling-server`**
  - `src/utils/qqmap.js`：
    - 新增 `parseDistance(raw)`，支持数字 / 字符串 / `null` 三种形式的 `_distance` 字段解析。
    - `searchNearby` 返回签名改为 `{ list, source }`，`source` 标记关键字。
    - 新增 `searchNearbyByKeywords({ lat, lng, keywords, radius, limit })`：按顺序尝试多个关键字，合并去重（按 `id`），按 `_distance` 升序返回，第一个命中关键字即返回。
    - `request` 函数：logger 输出 path、参数摘要、返回 data 数量或失败原因，便于排查关键字匹配情况。
  - `src/routes/api/places.js`：
    - `GET /api/places/nearby` 默认关键字改为 **"回收"**（前端不再依赖默认关键字）。
    - 新增 `POST /api/places/nearby-by-stores`：接收前端传入的 `stores` 数组，按 `stores[].name` 作为关键字顺序调用 `searchNearbyByKeywords`，响应带 `list` 和 `source: 'qqmap:stores'`。

- **前端 `digital-recycling-miniprogram`**
  - `utils/api-modules.js`：
    - 新增 `placesApi.getNearbyByStores({ lat, lng, stores })`，调用 `POST /api/places/nearby-by-stores`。
  - `pages/index/index.js`：
    - `_fetchNearbyStores(lat, lng)` 流程重写：
      1. 若 `storesData.length > 0`：调 `placesApi.getNearbyByStores({ lat, lng, stores: storesData })`（用每个门店的 `name` 作为关键字搜腾讯地图）；
      2. 失败 / 空时：前端循环单关键字 `_fetchNearbyStoresByKeywordList` 兜底；
      3. `storesData` 为空时：用通用关键字 **"回收"** 调 `placesApi.getNearby`；
      4. 全部失败时：`_fallbackStoreToLocal`（storesData[0] 或 `STORE.DEFAULT_STORE`，不带 distance）。
    - 米 → km 转换保留两位小数写入 `storeInfo.distance`。
    - 增加 `console.log('[home] nearby ->', { source, listLength, ... })` 调试输出，便于排查门店名匹配。
    - 新增 `_fetchNearbyStoresByKeywordList(lat, lng, keywords)` 辅助方法（前端循环）。
  - `fetchHomeData`：在 `storesData` 设置后若 `app.globalData.latitude/longitude` 已就绪，立即调用 `_fetchNearbyStores`（无论定位和门店数据谁先加载都能触发）。
  - 微信小程序定位流程保持不变：`wx.getLocation({ type: 'gcj02' })` → `requestStoreLocation` → `_fetchNearbyStores`。

#### 数据库 / 后端

- 数据库模型未变更，未生成迁移文件。
- 后端新增 `POST /api/places/nearby-by-stores` 接口（重启服务后生效）。
- 后端 `GET /api/places/nearby` 接口默认关键字从"数码回收"改为"回收"（向后兼容）。

#### 兼容性

- 门店名在腾讯地图 POI 库中存在时按距离升序展示，距离展示正常。
- 门店名都不匹配时 fallback 到 `storesData[0]` 不展示距离。
- 不需要在微信小程序后台配置 `https://apis.map.qq.com` 合法域名（后端代理）。

### refine-home-map-and-quote-gate — 首页地图定位 + 报价单配额引导

#### Part A — 首页地图定位与最近门店（采用腾讯地图 WebService API）

**实现方式调整**：原先基于后端 `stores` 表经纬度 + haversine 的方案改为调用腾讯地图 `place/v2/search` 周边搜索 API，按用户当前位置拉取附近门店。后端代理转发，前端无需配置 `https://apis.map.qq.com` 合法域名。

- **后端 `digital-recycling-server`**
  - 新增 `src/utils/qqmap.js`：封装腾讯地图 WebService API，使用 apikey `EU4BZ-MVYCU-SY2VT-G2PWS-N34N3-ZPFRF`（可通过环境变量 `QQMAP_API_KEY` 覆盖）。
    - `searchNearby({ lat, lng, keyword, radius, limit })`：调用 `https://apis.map.qq.com/ws/place/v2/search`，`boundary=nearby(lat,lng,radius)` + `orderby=_distance`，返回含 `id/title/address/tel/latitude/longitude/distance` 的标准化门店列表。
    - `geocode(address)`：调用 `https://apis.map.qq.com/ws/geocoder/v1` 地址解析（备用，本次未启用）。
  - 新增 `src/routes/api/places.js`：提供 `GET /api/places/nearby`，参数 `lat/lng/keyword(默认"数码回收")/radius(默认5000米)/limit(默认20)`，调用 `searchNearby` 并返回结果。
  - `src/routes/api/index.js`：注册 `router.use('/places', require('./places'))`。
  - `.env.example`：新增 `QQMAP_API_KEY=EU4BZ-MVYCU-SY2VT-G2PWS-N34N3-ZPFRF`。
  - 不修改数据库模型，不生成迁移文件。

- **前端 `digital-recycling-miniprogram`**
  - `utils/api-modules.js`：新增 `placesApi.getNearby`，调用 `/api/places/nearby`。
  - `pages/index/index.js`：
    - `requestStoreLocation(lat, lng)`：改为调用新增的 `_fetchNearbyStores(lat, lng)`。
    - `_fetchNearbyStores(lat, lng)`：调用 `placesApi.getNearby({ lat, lng, keyword: '数码回收', radius: 5000, limit: 20 })`，取 `list[0]` 作为最近门店并写入 `storeInfo`，字段映射：`id/title/address/tel/phone/latitude/longitude/distance`。`distance` 单位为**米**，转换为 `km`（两位小数）后写入 `storeInfo.distance`。
    - `_fallbackStoreToLocal()`：API 失败或返回空列表时，回退到 `storesData[0]`（不带 distance）或 `STORE.DEFAULT_STORE`。
    - `fetchLocationAndStores`：在 `wx.getLocation` 成功回调中无条件调用 `requestStoreLocation(lat, lng)`（不再依赖 storesData 是否加载）。
    - `openLocation`：保留之前的逻辑——门店无经纬度时 `showToast('门店坐标未设置，暂时无法导航')` 并 return。
  - `utils/constants.js`：
    - `STORE.DEFAULT_STORE` 中移除 `distance`、`latitude`、`longitude` 硬编码值（保留基础联系信息兜底字段）。前端不再依赖其经纬度。
  - `pages/index/index.wxml`：保留 `<text class="store-distance" wx:if="{{storeInfo.distance}}">{{storeInfo.distance}}km</text>` 条件渲染。

- **数据源变化**：首页"附近门店"数据源由 `/api/stores`（后端 stores 表）切换为 `/api/places/nearby`（腾讯地图 POI）。`/api/stores` 仍保留供管理后台和其他入口使用。

#### Part B — 首页跳报价单配额预检

- **`pages/index/index.js`**
  - 新增 `_precheckQuoteAndNavigate(targetUrl)`：
    1. 未登录用户走 `requireLogin(targetUrl)`，保持向后兼容；
    2. 已登录用户调用 `userApi.getProfile()` 获取 `isVip`、`quoteRemaining`、`quoteDailyRemaining`；
    3. 会员或仍有免费/每日配额时直接 `wx.navigateTo` 到报价单；
    4. 非会员且 `quoteRemaining <= 0 && quoteDailyRemaining <= 0` 时弹出 `wx.showModal`：
       - 标题 `提示`
       - 内容 `查看该报价单需要开通报价会员，您未开通会员或者会员已到期，请开通`
       - 确认按钮 `开通会员`：跳转 `/pages/membership/membership?redirect=报价单URL`
       - 取消按钮 `取消`：停留在首页
    5. `userApi.getProfile()` 失败时兜底走 `requireLogin`，不阻断用户。
  - `goToPriceQuote` 改为调用 `_precheckQuoteAndNavigate('/pages/price-quote/price-quote')`。

#### 数据库 / 后端

- 未修改数据库模型（沿用 `User.quote_remaining`、`quote_daily_count`、`quote_daily_date` 等已存在字段）。
- 未生成新的迁移文件。
- 后端接口无变更。

#### 兼容性

- `pages/price-quote/price-quote.js` 中 `statusCode === 10007` 的弹窗逻辑保留， 作为其他入口（如分享、扫码直达）绕过首页预检时的兜底。
- 其他首页入口（`onBrandTap`、`goToBrandList`）不强制要求配额预检，保持现状。

### fix-dev-test-privacy-flow — 开发者调试条点击跳到「隐私声明详情页」修复

#### 关键问题

`pages/index/index.wxml` 新增的开发者调试条（仅开发版可见，envVersion === 'develop'）点击「调用 wx.getFuzzyLocation」按钮时，若用户在微信公众平台后台尚未登记同意《用户隐私保护指引》，当前代码会调用 `wx.openPrivacyContract`，该 API 只能打开**只读**的隐私协议详情页，页面里只有「我已知晓」关闭按钮，**没有「同意」按钮**——用户找不到同意入口，体验断裂，无法完成调试定位。

#### 根因

微信小程序隐私相关 API 共三个，职责不同：

| API | 用途 | 是否有「同意」按钮 |
|---|---|---|
| `wx.getPrivacySetting` | 查询当前是否需要用户授权 | 无（只查询） |
| `wx.requirePrivacyAuthorize` | **弹原生授权弹窗**（带同意/拒绝） | ✅ 有 |
| `wx.openPrivacyContract` | 打开隐私协议详情页（只读） | ❌ 无 |

原 `onDevTestGetLocation` 在 `getPrivacySetting.needAuthorization === true` 时调用了 `wx.openPrivacyContract`，导致用户进入只读详情页找不到同意按钮。而紧随其后的 `_devTestAfterPrivacy` 已经正确处理了 `wx.requirePrivacyAuthorize`（带同意按钮），但被前置的 `openPrivacyContract` 拦截，永远走不到。

#### 修改范围（仅一个文件）

- **`digital-recycling-miniprogram/pages/index/index.js`**
  - `onDevTestGetLocation` 隐私预检分支（约 565–586 行）：删除 `wx.openPrivacyContract` 调用，让 `needAuthorization === true` 与 `false` 两条路径都直接走 `_devTestAfterPrivacy`（其内部已正确处理 `wx.requirePrivacyAuthorize`）
  - `devTestResult` 文案改为 `需先同意隐私声明（正在弹出授权框）`，让用户清楚看到当前阶段
  - `_devTestAfterPrivacy` 顶部（约 594–649 行）：新增旧版基础库 fallback 分支——若既无 `requirePrivacyAuthorize` 也无 `openPrivacyContract`，仍按原行为直接定位；若仅有 `openPrivacyContract`，弹出只读详情页并提示「旧版基础库，请在详情页确认后点击「我已知晓」」

#### 行为

- 首次点击调试按钮（未授权过隐私）→ `getPrivacySetting` 返回 `needAuthorization: true` → 走 `_devTestAfterPrivacy` → 调 `wx.requirePrivacyAuthorize` → 微信弹原生授权弹窗（含「同意 / 拒绝」按钮）
- 用户点「同意」→ 清掉 10 秒兜底 timer → 调 `wx.getFuzzyLocation` → 弹位置信息 Modal（lat/lng/accuracy/errMsg）
- 用户点「拒绝」→ 弹 Modal「请先同意《小程序用户隐私保护指引》后再测试位置」+ `devTestResult: 失败: 用户拒绝隐私协议`
- 旧版基础库（< 2.32.3 无 `requirePrivacyAuthorize`）→ fallback 到 `wx.openPrivacyContract` 详情页，提示用户在详情页底部点击「我已知晓」
- 极旧基础库（既无 `requirePrivacyAuthorize` 也无 `openPrivacyContract`）→ 直接调 `wx.getFuzzyLocation`，行为与原代码一致

#### 兼容性

- 业务入口 `onFindNearbyStore`（生产链路）行为不变（走 `wx.authorize` 系统授权弹窗，不受此 bug 影响）
- 调试条 UI / 样式 / 数据字段（`showDevTestBar`、`devTestResult`）未变更
- 已有 `_devTestAfterPrivacy` 内 `requirePrivacyAuthorize` 失败分支（用户拒绝 → Modal 提示）保留
- 已有 10 秒兜底超时 timer 清理逻辑保留
- wxml / wxss / app.json / 后端 server / admin / app：**未触碰**
- 数据库 schema / 迁移：**未修改**（不涉及 schema 变更，不生成迁移文件）

#### 验证

- `node --check pages/index/index.js` 语法检查 exit 0 ✅
- 代码审查：`onDevTestGetLocation` 已无 `wx.openPrivacyContract` 直接调用 ✅
- 代码审查：`_devTestAfterPrivacy` 三个分支齐全（requirePrivacyAuthorize → openPrivacyContract fallback → 直接定位 fallback）✅
- 待真机/开发工具实测：首次点击 → 看到带同意按钮的弹窗 → 点同意 → 弹出位置 Modal
- 待真机/开发工具实测：首次点击 → 看到带同意按钮的弹窗 → 点拒绝 → 弹出「请先同意隐私协议」Modal

#### 影响面

- 仅 `pages/index/index.js` 单文件
- 数据库模型/迁移：**未修改**（不涉及 schema 变更，不生成迁移文件）
- 后端 server / admin / app：**未触碰**
- 依赖：**未新增**（仅使用既有 `wx.requirePrivacyAuthorize` / `wx.openPrivacyContract` / `wx.getFuzzyLocation`）
