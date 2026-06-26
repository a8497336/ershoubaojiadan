# 项目变更日志 (CHANGELOG)

> 记录本项目所有需求/功能/缺陷的变更与留痕。
> - **时区**：所有日期与时间统一使用 **UTC+8**（北京时间）。
> - **写入规范**：每次需求修改完成后第一时间追加条目；如涉及数据库模型字段变更，需同步在 `docs/` 下生成或更新迁移说明文件。

---

## [Unreleased] - 2026-06-24

### Fixed
- **登录页顶部导航栏「返回」行为修复（重做）**
  - 文件：`pages/login/login.json`、`pages/login/login.js`、`pages/login/login.wxml`、`pages/login/login.wxss`
  - **根因**：原实现尝试使用 Page 生命周期 `onBackPress` 拦截原生导航栏返回按钮。验证后确认 **`onBackPress` 不是原生微信小程序的官方 API**（仅 uniapp 框架提供，原生 Page 对象上无此方法），因此原生 navigationBar 的左上角返回按钮点击不会触发。
  - **新方案**：在 `login.json` 中启用 `"navigationStyle": "custom"`，自绘顶部导航栏，左上角返回箭头通过 `onNavBack` 方法调用 `wx.switchTab({ url: '/pages/index/index' })` 跳转到首页。
  - **影响**：原生 navigationBar 被替换为自定义导航栏（红底 + 白色左箭头 + 居中标题"登录"），UI 风格与首页 `nav-bar` 保持一致；页面顶部 padding-top 通过 `statusBarHeight` 动态适配。
  - 入口：首页 / 品牌列表 / 会员中心 / token 过期自动跳转 等所有 `wx.navigateTo` 打开登录页的路径，点左上角返回箭头均回到首页。
  - **未覆盖**：Android 物理返回键和 iOS 左滑返回仍走系统默认 `navigateBack`（用户原话"顶部导航栏"未包含这两者；如需拦截，需另用 `page-container` 等方案）。
