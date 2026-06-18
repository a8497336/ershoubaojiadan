# 小程序 Bug 掃描報告

> 掃描路徑：`digital-recycling-miniprogram/`
> 掃描日期：2026-06-17
> 掃描方式：純靜態分析（讀取源碼、`require` 路徑解析、`getApp().*` 一致性、API 規範、定時器生命週期、調試遺留物）
> 等級：Critical（阻斷 / 必崩） · Major（功能異常） · Minor（健壯性） · Suggestion（優化建議）

## 摘要

| 等級 | 數量 | 修復狀態（截至 2026-06-17） |
| --- | --- | --- |
| Critical | 4 | **4/4 已修復**（見 `fix-miniprogram-bugs` spec） |
| Major | 6 | **6/6 已修復**（見 `fix-miniprogram-bugs` spec） |
| Minor | 5 | 0/5（不在本輪範圍） |
| Suggestion | 3 | 0/3（不在本輪範圍） |
| **合計** | **18** | **10/18 已修復** |

---

## 1. Critical（4 條）

### C-1 全局方法 `ensureLogin` 不存在（401 處理鏈路斷裂）

- **文件**：`utils/api.js:30`
- **問題**：`getApp().ensureLogin()` 會在收到 HTTP 401 時被調用，但 `app.js` 中從未定義 `ensureLogin` 方法。當前 `getApp()` 返回的全局對象上沒有此屬性，調用會拋 `TypeError: getApp().ensureLogin is not a function`，導致後續 `reject(res.data)` 也不會執行，Promise 鏈路卡死。
- **觸發場景**：任意需要登錄的接口 token 過期。
- **建議**：在 `app.js` 中實現 `ensureLogin()` 方法，或在 `utils/api.js` 內做兜底（移除調用、改用 `wx.removeStorageSync('token')` + `wx.showToast` 提示跳轉登錄）。

### C-2 缺失模塊 `utils/distance.js`（首頁 / 門店列表會白屏）

- **文件**：
  - `pages/index/index.js:3` `const { haversineDistance } = require('../../utils/distance')`
  - `pages/store-list/store-list.js:3` 同上
- **問題**：`utils/` 目錄下不存在 `distance.js` 文件（僅有 `api.js / api-modules.js / common.js / config.js / constants.js`）。`require` 在小程序環境中若路徑無效會導致頁面 JS 執行失敗，整個頁面渲染為空白。
- **觸發場景**：進入首頁 / 點擊「門店列表」Tab。
- **建議**：新增 `utils/distance.js` 並導出 `haversineDistance(lat1, lng1, lat2, lng2)`（直線距離 km）。參考實現（半正矢公式）：
  ```js
  module.exports = {
    haversineDistance(lat1, lng1, lat2, lng2) {
      const R = 6371
      const toRad = d => d * Math.PI / 180
      const dLat = toRad(lat2 - lat1)
      const dLng = toRad(lng2 - lng1)
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2
      return 2 * R * Math.asin(Math.sqrt(a))
    }
  }
  ```

### C-3 自定義 TabBar 路徑不規範（高風險 / 行為不可預期）

- **文件**：
  - `app.json:48` `"tabBar": { "custom": true, ... }`
  - `components/custom-tabbar/custom-tabbar.{js,wxml,wxss}` 實際組件位置
  - `pages/index/index.json:7` `usingComponents: { "custom-tabbar": "/components/custom-tabbar/custom-tabbar" }`
- **問題**：微信官方自定義 TabBar 的標準要求是組件位於**項目根目錄的 `custom-tab-bar/index.js`**，並在 `app.json` 中 `tabBar.custom: true` 自動掛載。當前組件位於 `components/custom-tabbar/`，需每個頁面在 WXML 裡手動引入並通過 `this.getTabBar()` 設置狀態。如果某個 TabBar 頁忘記在 WXML 中放置 `<custom-tabbar>` 組件、或忘記在 `onShow` 中設置 `activeTab`，底部導航就會缺失。`pages/price-quote/price-quote.js:50` 就是此類遺漏（見 M-1）。
- **建議**：將 `components/custom-tabbar/` 移至根目錄 `custom-tab-bar/`，命名為 `index.js / index.json / index.wxml / index.wxss`，並刪除各頁面 json 中的 `usingComponents` 注入。

### C-4 訂單提交使用空負載（後端必拒）

- **文件**：`pages/shopping/shopping.js:201`
- **問題**：`orderApi.createOrder({})` 沒有傳遞任何訂單字段。訂單至少需要包含 `items`、`address_id`、`contact` 等字段。即使後端從 session 推測用戶，也大概率會因為缺少 `items` 而失敗。對比 `utils/api-modules.js:74` 中 `createOrder: (data) => request({ url: '/orders', method: 'POST', data })` 顯然期望 `data.items`。
- **觸發場景**：回收車 → 選中商品 → 點擊提交訂單。
- **建議**：傳遞 `items: cartItems.filter(i => i.selected).map(...)` 以及 `address_id`、`contact_phone` 等必要字段。

---

## 2. Major（6 條）

### M-1 自定義 TabBar 屬性名錯誤

- **文件**：`pages/price-quote/price-quote.js:50`
- **問題**：`this.getTabBar().setData({ selected: 1 })`，但 `custom-tabbar` 組件定義的屬性是 `activeTab`（類型 String，枚舉為 `home / priceList / scanPrice / shopping / profile`）。當前寫法完全無效，「報價單」頁永遠不會高亮底部 Tab。
- **建議**：改為 `this.getTabBar().setData({ activeTab: 'priceList' })`，與其他 TabBar 頁保持一致。

### M-2 環境配置未走 `ENV_MAP`，全部硬編碼為 `production`

- **文件**：`utils/config.js:25-33`
- **問題**：
  ```js
  const envVersion = wx.getAccountInfoSync().miniProgram.envVersion
  const env = 'production'   // ← 硬編碼，未使用 ENV_MAP
  return ENV_CONFIG[env]
  ```
  不論開發者工具版本（`develop` / `trial` / `release`）都返回生產環境地址，導致開發 / 試用環境仍請求 `https://wx.lydzhsw.com/api`，本地調試完全失效。
- **建議**：
  ```js
  const envVersion = wx.getAccountInfoSync().miniProgram.envVersion
  const env = ENV_MAP[envVersion] || 'production'
  return ENV_CONFIG[env]
  ```

### M-3 `checkLoginStatus` 無區分網絡錯誤與 token 失效

- **文件**：`app.js:120-136`
- **問題**：`authApi.checkToken()` 失敗時（reject）一律清空 token、用戶信息。但網絡抖動 / 後端 5xx 也會走 reject，會把好端端的登錄態誤清空，造成用戶被「莫名」登出。
- **建議**：在 `checkApiHealth()` 之後再校驗 token；或區分 `err.statusCode`（網絡錯 vs 401/403）再決定是否清空。

### M-4 全局 `globalData` 未聲明 `latitude / longitude` 字段

- **文件**：
  - `app.js:177-187` `globalData` 缺少 `latitude / longitude`
  - `pages/index/index.js:270-271, 279-280, 980-981` 讀寫 `app.globalData.latitude / longitude`
- **問題**：在 `app.js` 的 `globalData` 初始化中只聲明了 9 個字段，但首頁代碼頻繁讀寫 `app.globalData.latitude / longitude`。初始值為 `undefined`，雖然首頁有 `typeof x === 'number'` 的防御判斷避免崩潰，但仍然會讓 `_fetchNearbyStores` 不被調用，門店距離永遠不展示。
- **建議**：在 `app.js` `globalData` 中補上 `latitude: null, longitude: null`，或定義 getter / setter。

### M-5 `wx.requirePrivacyAuthorize` 在 `onLaunch` 同步調用

- **文件**：`app.js:24, 27-34`
- **問題**：微信官方建議 `wx.requirePrivacyAuthorize` 在用戶首次觸發敏感 API 時調用，且需要在「使用到對應隱私 API 之前」。在 `onLaunch` 直接調用會在用戶未感知的情況下觸發隱私彈窗，違反用戶體驗最佳實踐，也可能導致「未同意但已使用 API」的反向失敗。
- **建議**：移除 `onLaunch` 中的 `requestPrivacyAuthorization()`，改為在 `pages/index/index.js` 的 `requestLocationPermission` 內、用戶明確點擊「同意」時再調用。

### M-6 自定義 TabBar 中間按鈕引用的 PNG 資源缺失風險

- **文件**：
  - `components/custom-tabbar/custom-tabbar.wxml:14` `image src="/images/tabbar/{{item.icon}}{{item.key === activeTab ? '-selected' : ''}}.png"`
  - `images/tabbar/` 內 PNG 資源齊全（已通過 `LS` 確認），但中間按鈕 wxml line 30 使用 `image src="/images/tabbar/{{item.icon}}.png"`（無 selected 後綴）
- **問題**：中間按鈕永遠使用未選中態的 `qrcode.png`，不論用戶是否在掃碼頁。
- **建議**：移除自定義 TabBar 的中間按鈕固定 PNG 引用，或在組件中追加 `qrcode-active.png` 切換邏輯。

---

## 3. Minor（5 條）

### m-1 `request` 函數在 `utils/api.js` 與 `utils/common.js` 重複導出

- **文件**：`utils/api.js:104-108`、`utils/common.js:131-145, 240-262`
- **問題**：兩個文件都導出 `request`，行為不一致：
  - `api.js` 的 `request` 處理 `code === 0` 業務碼、401 清理 token
  - `common.js` 的 `request` 僅按 HTTP 2xx 判斷，不處理業務碼
  若有人 `require('../../utils/common').request` 會得到不同行為，極易踩坑。
- **建議**：將 `common.js` 的 `request` 重命名為 `rawRequest` 或移除，統一從 `api.js` 導入。

### m-2 `utils/api.js` 的 `uploadFile` 在工具層執行 `wx.showToast`

- **文件**：`utils/api.js:92-99`
- **問題**：通用上傳工具不應耦合 UI 提示。`success` 內部 `wx.showToast({ title: data.message })`、`fail` 內 `wx.showToast({ title: '上传失败' })` 會讓呼叫方（如 `pages/scan-price/scan-price.js`）的錯誤處理被雙重覆蓋（業務頁面自己也 `wx.showToast`）。
- **建議**：移除工具層的 toast，統一由呼叫方處理 UI 反饋；或新增 `{ silent: true }` 選項。

### m-3 `pages/scan-price/scan-price.js` `onShow` 登錄守衛失效

- **文件**：`pages/scan-price/scan-price.js:21-26`
- **問題**：
  ```js
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) { ... }
    if (!checkLogin('/pages/scan-price/scan-price')) return
  }
  ```
  `checkLogin` 返回 `false` 後只是「不再執行後續同步代碼」，但 `loadUserInfo / loadScanHistory` 在 `onLoad` 中已執行（或將在後續任何依賴中觸發）。如果用戶在拍照頁面後登錄態過期，仍會看到歷史緩存。
- **建議**：在 `onShow` 內集中守衛，必要時主動 `setData({ loading: true })` 並重新拉取。

### m-4 `pages/login/login.js` 的 `TAB_BAR_PAGES` 判斷可能誤判

- **文件**：`pages/login/login.js:4-10, 80`
- **問題**：
  ```js
  const TAB_BAR_PAGES = ['/pages/index/index', ...]
  const isTabBar = TAB_BAR_PAGES.some(p => redirectUrl.startsWith(p))
  ```
  雖然當前 TabBar 路徑沒有前綴衝突，但 `startsWith` 在以下場景會誤判：未來新增 `/pages/index/index2/` 時。應改用精確等值或正則錨定。
- **建議**：
  ```js
  const isTabBar = TAB_BAR_PAGES.some(p => redirectUrl === p || redirectUrl.startsWith(p + '?'))
  ```

### m-5 `points-lottery` 動畫 timer 無 `onUnload` 兜底清理

- **文件**：`pages/points-lottery/points-lottery.js:43-60`
- **問題**：動畫用 `setInterval` 在完成時通過 `clearInterval` 清理，但若用戶在動畫過程中直接 `wx.navigateBack` 或切換 Tab，頁面銷毀後定時器仍可能在閉包中觸發 `setData`，拋 `Cannot read property 'setData' of undefined`。
- **建議**：在 `onUnload` 中 `if (this._lotteryTimer) { clearInterval(this._lotteryTimer); this._lotteryTimer = null }`，並用 `this._lotteryTimer = timer` 替換局部變量。

---

## 4. Suggestion（3 條）

### S-1 殘留 `console.log` 調試日誌

- **文件 / 行**：
  - `pages/index/index.js:399, 428, 432, 441, 572, 608, 619`
  - `pages/wallet/wallet.js:94`
- **問題**：開發測試期間的 `console.log('[home] nearby ->', ...)`、`console.log('交易详情:', log)` 等會在生產環境向 vConsole 暴露業務細節，並產生無意義的 IO。
- **建議**：用 `utils/common.js` 中已封裝的 `logger.debug / info`，並在生產環境下通過 `__DEV__` 標記或環境變量開關。

### S-2 使用已被標記廢棄的同步 API

- **文件**：
  - `app.js:19` `wx.getSystemInfoSync()`
  - `pages/price-trend/price-trend.js:51` `wx.getSystemInfoSync().pixelRatio`
  - `pages/index/index.js:963-964` `wx.openSetting()` 回退
- **問題**：從基礎庫 2.20.1 起 `wx.getSystemInfoSync` 被標記為即將廢棄，官方推薦 `wx.getDeviceInfo / wx.getWindowInfo / wx.getAppBaseInfo` 等拆分 API。`wx.openSetting` 已被 `wx.openAppAuthorizeSetting` 取代。
- **建議**：分別替換為對應新 API。

### S-3 自定義 TabBar `pages` 屬性缺失導致首次點擊無高亮

- **文件**：`components/custom-tabbar/custom-tabbar.js:33-44`
- **問題**：`handleTabClick` 通過 `wx.switchTab` 跳轉，但跳轉前若用戶已在當前 Tab 重複點擊，代碼會主動 `return`，但用戶首次進入 TabBar 頁時沒有任何頁面主動觸發 `setData({ activeTab })`，可能導致短暫延遲才正確高亮。
- **建議**：在 TabBar 組件的 `attached` / `ready` 生命週期中，根據當前頁面 route 自動推導 `activeTab`。

---

## 5. 已預掃描候選清單核對

| 序號 | 候選 Bug | 報告編號 | 狀態 |
| --- | --- | --- | --- |
| 1 | `getApp().ensureLogin()` 缺失 | C-1 | ✅ 確認 |
| 2 | `utils/distance.js` 缺失 | C-2 | ✅ 確認 |
| 3 | `getConfig` 環境映射未走 `ENV_MAP` | M-2 | ✅ 確認 |
| 4 | `request` 雙重導出 | m-1 | ✅ 確認 |
| 5 | `uploadFile` 副作用 | m-2 | ✅ 確認 |
| 6 | `orderApi.createOrder({})` 空負載 | C-4 | ✅ 確認 |
| 7 | `checkLogin` 後頁面繼續加載 | m-3 | ✅ 確認 |
| 8 | `checkLoginStatus` 網絡錯誤誤清 token | M-3 | ✅ 確認 |
| 9 | `TAB_BAR_PAGES.startsWith` 誤判 | m-4 | ✅ 確認 |
| 10 | `console.log` 調試日誌 | S-1 | ✅ 確認 |
| - | 自定義 TabBar 屬性名 `selected` 錯用 | M-1 | ➕ 額外發現 |
| - | 自定義 TabBar 路徑不規範 | C-3 | ➕ 額外發現 |
| - | `globalData` 缺少 `latitude / longitude` | M-4 | ➕ 額外發現 |
| - | 隱私協議在 `onLaunch` 同步調用 | M-5 | ➕ 額外發現 |
| - | TabBar 中間按鈕永遠未選中態 | M-6 | ➕ 額外發現 |
| - | `points-lottery` 動畫 timer 無卸載清理 | m-5 | ➕ 額外發現 |
| - | 廢棄 API 仍在使用 | S-2 | ➕ 額外發現 |
| - | TabBar 首次進入未自動高亮 | S-3 | ➕ 額外發現 |

---

## 6. 掃描方法說明

1. **依賴完整性**：遍歷所有 `.js` 文件的 `require()` 字符串，與 `utils / components / pages` 實際文件做集合差集。
2. **`getApp().*` 一致性**：收集所有 `getApp().xxx` 與 `app.globalData.xxx` 訪問，與 `app.js` 對照，找出未定義屬性 / 方法。
3. **`getTabBar().setData({...})` 規範性**：對比組件 `properties` 與調用方 `setData` 的 key，識別拼寫 / 大小寫錯誤。
4. **定時器生命週期**：掃描 `setInterval / setTimeout` 與 `clearInterval / clearTimeout` 的配對，識別無卸載清理的場景。
5. **副作用**：`utils` 中是否調用 `wx.showToast / wx.showModal / wx.navigateTo` 等 UI API。
6. **API 兼容性**：以 `project.config.json` 的 `libVersion: 3.15.2` 為基準，對照官方「廢棄 API」清單。

## 7. 後續處置建議

### P0（立即修復，1 個工作日內） ✅ 已完成
- 修復 C-1、C-2、C-4（會直接造成白屏 / 必崩 / 訂單失敗）。**全部已修復**。

### P1（近期修復，1 週內） ✅ 已完成
- 修復 C-3 自定義 TabBar 路徑規範化（涉及多文件改動，建議排期）。**已修復**。
- 修復 M-1 ~ M-6 全部 Major 級別。**全部已修復**。

### P2（迭代優化）
- 清理 m-1 ~ m-5、s-1 ~ s-3，隨下一次重構一併處理。

### 本輪修復交付清單
- `app.js`：新增 `ensureLogin()`、`checkLoginStatus` 區分錯誤、globalData 補 `latitude/longitude`、移除 `onLaunch` 中的 `wx.requirePrivacyAuthorize` 同步調用
- `utils/api.js`：所有 `reject()` 帶上 `statusCode` 以支援 401 區分
- `utils/config.js`：`getConfig()` 走 `ENV_MAP` 映射
- `utils/distance.js`：新增 `haversineDistance(lat1, lng1, lat2, lng2)`
- `custom-tab-bar/index.{js,json,wxml,wxss}`：新增（符合微信官方規範路徑），中間按鈕在 `scanPrice` Tab 顯示選中態（`qrcode-selected.png` + active 樣式）
- 6 個頁面 `index.json / brand-list.json / scan-price.json / shopping.json / profile.json` 刪除 `usingComponents.custom-tabbar`
- 6 個頁面 `index.wxml / brand-list.wxml / price-quote.wxml / scan-price.wxml / shopping.wxml / profile.wxml` 刪除 `<custom-tabbar />` 標籤
- `pages/shopping/shopping.js`：`createOrder` 攜帶 `items / contact / address_id / source`
- `pages/price-quote/price-quote.js`：`getTabBar().setData({ activeTab: 'priceList' })`
- `components/custom-tabbar/`：已刪除

### 建議增加的工程化措施
- 引入 ESLint 自定義規則，禁止在 `utils/*` 中調用 UI API。
- 在 CI 流程中加入 `require` 路徑解析檢查腳本，自動發現缺失模塊。
- 將 `app.js` 全局方法抽離到獨立文件並提供 TypeScript 風格的 `.d.ts` 描述，提升 IDE 智能感知。
