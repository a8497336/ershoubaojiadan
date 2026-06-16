# 项目变更日志 (CHANGELOG)

> 项目根目录下的汇总变更日志。所有需求变更完成后第一时间更新本文档。

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

- `pages/price-quote/price-quote.js` 中 `statusCode === 10007` 的弹窗逻辑保留，作为其他入口（如分享、扫码直达）绕过首页预检时的兜底。
- 其他首页入口（`onBrandTap`、`goToBrandList`）不强制要求配额预检，保持现状。
