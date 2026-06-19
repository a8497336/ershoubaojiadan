# 定位测试 Demo

独立的小程序调试项目，用于复现并诊断 `wx.getFuzzyLocation` 定位问题。
参数严格对齐主项目 [`digital-recycling-miniprogram`](../digital-recycling-miniprogram/)：同 appid、同隐私配置、同权限文案。

## 如何运行

1. 打开微信开发者工具
2. 选择「导入项目」
3. 项目目录指向 `c:\Users\17798\Desktop\陈峰\数码回收\dom`
4. AppID 会自动识别为 `wxb7cf435c7b2908d2`（已预填）
5. 点击「导入」即可运行

## 5 个调试按钮

| 按钮 | 调用 API | 用途 |
|---|---|---|
| [1] 检测隐私设置 | `wx.getPrivacySetting` | 查询当前是否需要用户授权（`needAuthorization`） |
| [2] 申请隐私授权 | `wx.requirePrivacyAuthorize` | 弹出**原生隐私声明弹窗**（带「同意 / 拒绝」按钮） |
| [3] 获取模糊位置 | `wx.getFuzzyLocation` | 直接调用定位接口，返回 lat/lng/accuracy |
| [4] 一键完整流程 | 串联 [1]→[2]→[3] | 完整复现生产环境的标准流程 |
| [5] 清除定位缓存 | `wx.removeStorageSync` | 清除 `privacy_agreed` 等本地缓存，便于复测 |

**额外**：长按 [3] 按钮可把最近定位的 `lat,lng` 复制到剪贴板。

## 错误码速查表

| errMsg | 含义 | 处理 |
|---|---|---|
| `system permission denied` | 系统未授权微信位置权限（iOS） | 引导用户去【设置】→【微信】→【位置】 |
| `ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF` | 系统定位服务关闭 | 引导用户开启系统定位服务 |
| `fail authorize` / `auth deny` | 用户拒绝授权 | 引导用户重新授权 |
| `fuzzyLocation:fail` | 模糊位置接口调用失败 | 检查微信公众平台隐私协议配置 |
| `getPrivacySetting:fail` | 隐私查询失败（基础库过旧） | 升级基础库到 ≥ 2.32.3 |

## API 兼容性

| API | 最低 SDKVersion |
|---|---|
| `wx.getPrivacySetting` | 2.32.3 |
| `wx.requirePrivacyAuthorize` | 3.0.0 |
| `wx.getFuzzyLocation` | 2.25.0 |
| `wx.onNeedPrivacyAuthorization` | 2.32.3 |

打开页面后会在「系统信息」卡片显示当前 SDKVersion，并在底部「API 兼容性」区给出最低要求对照。

## 与主项目对照

| 维度 | 主项目 | 本 Demo |
|---|---|---|
| appid | `wxb7cf435c7b2908d2` | `wxb7cf435c7b2908d2` ✅ |
| `__usePrivacyCheck__` | `true` | `true` ✅ |
| `requiredPrivateInfos` | `["getFuzzyLocation"]` | `["getFuzzyLocation"]` ✅ |
| `permission.scope.userFuzzyLocation.desc` | 用于获取您的模糊位置以展示最近的门店信息 | 同上 ✅ |
| `wx.getFuzzyLocation` 参数 | `{ type: 'gcj02' }` | `{ type: 'gcj02' }` ✅ |
| 错误处理逻辑 | 见 `pages/index/index.js#L715-L738` | 同源（见 `pages/index/index.js` `_showErrorHint`） ✅ |

## 与主项目的差异（保持独立）

- ❌ 不调用后端 API（`https://wx.lydzhsw.com/api`）
- ❌ 不集成门店列表 / 距离计算
- ❌ 不修改 `digital-recycling-miniprogram` 任何文件
- ❌ 不触发业务逻辑（不写入 `app.globalData`、不污染 `storeInfo`）

## 调试建议

1. **先按 [1]**：查看当前 `needAuthorization` 状态
2. **再按 [2]**：测试原生隐私弹窗是否正常弹出
3. **再按 [3]**：直接调用 `getFuzzyLocation`，看返回
4. **最后按 [4]**：跑完整流程（与生产一致）
5. **遇到 [3] 失败**时，看「Console 日志」区最后一行 + 「定位失败」弹窗内容，能直接定位是「隐私未同意 / 系统权限未开 / API 不支持」中的哪一种