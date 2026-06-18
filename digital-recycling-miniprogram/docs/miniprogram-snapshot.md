# 微信小程序項目快照

> 掃描路徑：`digital-recycling-miniprogram/`
> 掃描日期：2026-06-17
> 性質：純讀取快照，不修改任何業務源碼

## 1. 項目概述

- **項目名稱**：聯贏電子回收網微信小程序（digital-recycling-miniprogram）
- **業務領域**：數碼產品（手機、主板、屏幕、電池等）回收 / 報價 / 回收車 / 積分商城 / 商家入駐
- **後端服務**：`https://wx.lydzhsw.com/api`（生產環境），開發 / 試用環境理論上對應 `http://localhost:3000/api`（受 `utils/config.js` 環境映射 bug 影響，實際全部走生產地址）
- **聯網方式**：純前端原生小程序，無 npm 依賴、無 Vite/Webpack 構建鏈、無 TypeScript

## 2. 技術棧

| 類別 | 選型 | 來源 |
| --- | --- | --- |
| 框架 | 微信小程序原生（雙線程：邏輯層 + 渲染層） | `project.config.json: compileType: "miniprogram"` |
| 基礎庫 | `3.15.2` | `project.config.json: libVersion` / `project.private.config.json: libVersion` |
| AppID | `wxb7cf435c7b2908d2` | `project.config.json: appid` |
| 邏輯層 | ES6+ JavaScript（CommonJS 模塊系統） | `utils/*.js`、`pages/**/*.js` |
| 樣式層 | WXSS + CSS 變量（自研 design-tokens） | `app.wxss`、`styles/design-tokens.wxss` |
| 標記層 | WXML（`wx:if` / `wx:for` / `block` / 自定義組件） | `pages/**/*.wxml` |
| 狀態管理 | `getApp().globalData` + `wx.storage` | `app.js`、`utils/common.js` |
| 網絡層 | `wx.request` + `wx.uploadFile` 包裝 | `utils/api.js` |
| 自定義 TabBar | custom-component 方式（非微信官方 `custom-tab-bar/` 路徑） | `components/custom-tabbar/*` |
| 隱私合規 | `__usePrivacyCheck__: true` + `wx.requirePrivacyAuthorize` | `app.json`、`app.js` |

## 3. 目錄結構

```
digital-recycling-miniprogram/
├── app.js / app.json / app.wxss          # 全局入口
├── sitemap.json                          # 站點地圖（默認 allow 全部）
├── project.config.json                   # 開發者工具項目配置
├── project.private.config.json           # 個人配置
├── pages/                                # 35 個頁面
├── components/
│   ├── common/                           # 4 個通用組件
│   └── custom-tabbar/                    # 自定義 TabBar
├── images/
│   ├── icons/                            # 通用 SVG 圖標
│   ├── tabbar/                           # TabBar 圖標（SVG + PNG 兩套）
│   └── examples/                         # 示例圖
├── styles/
│   └── design-tokens.wxss                # 設計變量（CSS 變量）
├── utils/                                # 5 個工具模塊
└── docs/                                 # 項目文檔（本快照所在目錄）
```

## 4. 頁面清單

> 35 個頁面，與 `app.json` 中 `pages` 數組一一對應。

| # | 路徑 | 名稱 / 用途 | TabBar 歸屬 |
| --- | --- | --- | --- |
| 1 | `pages/index/index` | 首頁（Banner、公告、附近門店、品牌網格、視頻、流程） | ✓ Tab 1（home） |
| 2 | `pages/login/login` | 登錄（協議確認 + 微信授權） | — |
| 3 | `pages/brand-list/brand-list` | 品牌 / 產品列表 | ✓ Tab 2（priceList） |
| 4 | `pages/product-search/product-search` | 產品搜索結果 | — |
| 5 | `pages/price-quote/price-quote` | 報價單（多狀態價格表） | — |
| 6 | `pages/price-trend/price-trend` | 價格走勢 | — |
| 7 | `pages/price-changes/price-changes` | 報價變動（VIP 專屬） | — |
| 8 | `pages/my-stock/my-stock` | 我的庫存 | — |
| 9 | `pages/membership/membership` | 會員中心 / 套餐購買 | — |
| 10 | `pages/profile/profile` | 個人中心 | ✓ Tab 5（profile） |
| 11 | `pages/shopping/shopping` | 回收車 | ✓ Tab 4（shopping） |
| 12 | `pages/scan-price/scan-price` | 拍照查價 | ✓ Tab 3（scanPrice） |
| 13 | `pages/order-list/order-list` | 訂單列表 | — |
| 14 | `pages/order-detail/order-detail` | 訂單詳情 | — |
| 15 | `pages/message-center/message-center` | 消息中心 | — |
| 16 | `pages/announcement/announcement` | 公告列表 | — |
| 17 | `pages/my-points/my-points` | 我的積分 | — |
| 18 | `pages/invite-friends/invite-friends` | 邀請好友 | — |
| 19 | `pages/recycling-process/recycling-process` | 回收流程說明 | — |
| 20 | `pages/mailing-address/mailing-address` | 郵寄地址管理 | — |
| 21 | `pages/feedback/feedback` | 問題反饋提交 | — |
| 22 | `pages/feedback-result/feedback-result` | 反饋結果頁 | — |
| 23 | `pages/faq/faq` | 常見問題 | — |
| 24 | `pages/business-cooperation/business-cooperation` | 商務合作 | — |
| 25 | `pages/video-list/video-list` | 視頻列表 | — |
| 26 | `pages/video-play/video-play` | 視頻播放 | — |
| 27 | `pages/wallet/wallet` | 錢包 | — |
| 28 | `pages/coupons/coupons` | 卡券 | — |
| 29 | `pages/red-packet/red-packet` | 紅包 | — |
| 30 | `pages/points-lottery/points-lottery` | 積分抽獎 | — |
| 31 | `pages/points-mall/points-mall` | 積分商城 | — |
| 32 | `pages/ad-recording/ad-recording` | 廣告錄音 | — |
| 33 | `pages/my-favorites/my-favorites` | 我的收藏 | — |
| 34 | `pages/sms-notify/sms-notify` | 報價短信通知 | — |
| 35 | `pages/store-list/store-list` | 門店列表 | — |

## 5. 組件清單

### 通用組件（`components/common/`）

| 組件 | Props | 用途 |
| --- | --- | --- |
| `empty-state` | `type / size / title / desc / imageUrl / showBtn / btnText` | 空態展示 |
| `error-toast` | `type / message / duration / visible` | 錯誤提示浮層（內含定時器管理） |
| `loading-skeleton` | `type / rowCount / showAvatar / multipleLines / animate / colCount` | 骨架屏（list / card / detail / table） |
| `loading-spinner` | `size / color / text` | 加載旋轉指示器 |

### 業務組件（`components/custom-tabbar/`）

| 組件 | Props | 用途 |
| --- | --- | --- |
| `custom-tabbar` | `activeTab / badgeCount / showNewBadge / showDotBadge` | 自定義底部導航（5 項，中間"掃碼報價"凸起） |

## 6. utils 工具模塊

| 模塊 | 導出 | 說明 |
| --- | --- | --- |
| `utils/api.js` | `request / uploadFile / checkApiHealth / BASE_URL` | 網絡請求底層封裝，含 token 注入、401 處理、上傳進度（未實現） |
| `utils/api-modules.js` | `authApi / userApi / categoryApi / brandApi / productApi / priceApi / cartApi / orderApi / membershipApi / walletApi / pointsApi / messageApi / feedbackApi / contentApi / searchApi / scanApi / userStockApi / placesApi / settingsApi / uploadFile` | 業務 API 分模塊聚合（共 20 個） |
| `utils/common.js` | `showToast / showModal / showLoading / hideLoading / navigateTo / redirectTo / makePhoneCall / copyToClipboard / formatDate / formatPrice / debounce / throttle / setStorage / getStorage / removeStorage / request / getSystemInfo / logger / getDebugInfo / checkLogin / clearAllData` | 通用工具：UI 提示、格式化、存儲、日誌、登錄守衛、調試信息 |
| `utils/config.js` | `ENV_CONFIG / getConfig / getImageUrl / CURRENT_CONFIG` | 環境配置（dev / test / production） |
| `utils/constants.js` | `CONTACT / STORE / ORDER_STATUS / PAGE_SIZE` | 業務常量（聯繫方式、門店、訂單狀態、分頁大小） |

## 7. API 模塊清單

> 全部來自 `utils/api-modules.js`，base url 取自 `utils/config.js` 的 `CURRENT_CONFIG.apiBase`。

| 模塊 | 端點 | 方法 |
| --- | --- | --- |
| **authApi** | `/auth/wx-login` / `/auth/phone-bind` / `/auth/phone-bind-nologin` / `/auth/check-token` | POST / POST / POST / GET |
| **userApi** | `/user/profile` / `/user/profile` / `/user/stats` / `/user/addresses` / `/user/addresses/{id}` / `/user/addresses/{id}` / `/wallet/info` / `/points/balance` / `/coupons` / `/red-packets` / `/user/recordings` / `/user/favorites` | GET / PUT / GET / GET / POST / PUT / DELETE / GET / GET / GET / GET / GET / GET |
| **userApi（upload）** | `/user/avatar` | uploadFile |
| **categoryApi** | `/categories` / `/categories/{id}/brands` | GET / GET |
| **brandApi** | `/brands` / `/brands/{id}` / `/brands/{id}/products` | GET / GET / GET |
| **productApi** | `/products` / `/products/{id}` | GET / GET |
| **priceApi** | `/prices/today` / `/prices/conditions` / `/prices/history/{productId}` / `/prices/trend/{productId}` / `/prices/changes` | GET / GET / GET / GET / GET |
| **cartApi** | `/cart` / `/cart/{id}` / `/cart/select-all` / `/cart/clear` | GET / POST / PUT / DELETE |
| **orderApi** | `/orders` / `/orders/{id}` / `/orders/{id}/cancel` | POST / GET / PUT |
| **membershipApi** | `/membership/plans` / `/membership/status` / `/membership/purchase` / `/membership/pay-callback` | GET / GET / POST / POST |
| **walletApi** | `/wallet/info` / `/wallet/logs` / `/wallet/withdraw` | GET / GET / POST |
| **pointsApi** | `/points/balance` / `/points/logs` / `/points/lottery-records` / `/points/products` / `/points/exchange` / `/points/sign` | GET / GET / GET / GET / POST / POST |
| **messageApi** | `/messages` / `/messages/{id}/read` / `/messages/read-all` / `/messages/unread-count` / `/messages/feedback` | GET / PUT / PUT / GET / POST |
| **feedbackApi** | `/feedback` | GET |
| **contentApi** | `/banners` / `/announcements` / `/stores` / `/videos` / `/prices/hot` | GET |
| **searchApi** | `/search` / `/search/hot` | GET |
| **scanApi** | `/scan/recognize` | POST |
| **userStockApi** | `/user-stock` / `/user-stock/{id}` / `/user-stock/{id}/sell` / `/user-stock/stats` | GET / POST / PUT / DELETE / POST / GET |
| **placesApi** | `/places/nearby` / `/places/nearby-by-stores` / `/places/nearest-store` | GET / POST / GET |
| **settingsApi** | `/settings/quote` / `/settings/contact` | GET |

## 8. 全局配置摘要

### `app.json` 關鍵字段

```json
{
  "window": {
    "backgroundTextStyle": "light",
    "enableShareAppMessage": "true",
    "navigationBarBackgroundColor": "#ff2d4a",
    "navigationBarTitleText": "联赢电子回收网",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "custom": true,
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/brand-list/brand-list", "text": "产品列表" },
      { "pagePath": "pages/scan-price/scan-price", "text": "扫码报价" },
      { "pagePath": "pages/shopping/shopping", "text": "回收车" },
      { "pagePath": "pages/profile/profile", "text": "我的" }
    ]
  },
  "__usePrivacyCheck__": true,
  "permission": { "scope.userLocation": { "desc": "用于获取您的位置以展示最近的门店信息" } },
  "requiredPrivateInfos": ["getLocation", "startLocationUpdate", "onLocationChange"],
  "lazyCodeLoading": "requiredComponents"
}
```

### `project.config.json` 關鍵字段

- `compileType: "miniprogram"`
- `libVersion: "3.15.2"`
- `appid: "wxb7cf435c7b2908d2"`
- `setting.es6: true`、`setting.minifyWXSS: true`、`setting.minifyWXML: true`
- `setting.useApiHook: true`、`setting.useApiHostProcess: true`

### `sitemap.json`

- `action: "allow"`、`page: "*"` —— 全部頁面允許被索引

## 9. 設計系統

- 色彩：主色 `#ff2d4a`（紅）、輔色 `#ff6b6b`，價格色（高 `#27ae60` / 中 `#2980b9` / 低 `#8e44ad`）
- 字號：xs 20rpx → 4xl 64rpx 共 7 級
- 間距：8rpx → 96rpx 共 9 級
- 圓角：sm 8rpx → full 9999rpx
- 陰影：sm / md / lg / xl + primary 主色陰影
- 全部以 CSS 變量形式定義於 `styles/design-tokens.wxss`，在 `app.wxss` 中 `@import` 引入

## 10. 模塊依賴關係（簡化）

```
app.js
  └─ utils/api-modules
       └─ utils/api
            └─ utils/config
  └─ utils/api  (checkApiHealth)
  └─ utils/common (checkLogin 等)

pages/index/index.js
  └─ utils/api-modules
  └─ utils/distance        ← ⚠ 缺失模塊（Critical Bug）
  └─ utils/constants
```

## 11. 已知關鍵發現（具體見 bug 報告）

- `utils/api.js:30` 調用 `getApp().ensureLogin()`，但 `app.js` 未定義此方法
- `pages/index/index.js` 與 `pages/store-list/store-list.js` 引用 `utils/distance.js`，但該文件不存在
- `utils/config.js` 環境映射未走 `ENV_MAP`，硬編碼 `production`
- `utils/api.js` 與 `utils/common.js` 雙重導出 `request` 函數
- `pages/price-quote/price-quote.js` 自定義 TabBar 屬性名錯用（`selected` 應為 `activeTab`）
- `pages/shopping/shopping.js` 提交訂單使用空負載 `orderApi.createOrder({})`
- `app.js` 網絡錯誤與 token 失效未區分，會誤清 token
- 自定義 TabBar 位置在 `components/custom-tabbar/`，與微信官方 `custom-tab-bar/` 規範路徑不一致

完整 bug 清單見 [`miniprogram-bug-report.md`](./miniprogram-bug-report.md)。
