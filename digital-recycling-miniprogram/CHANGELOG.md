# 项目变更日志 (CHANGELOG)

> 记录本项目所有需求/功能/缺陷的变更与留痕。
> - **时区**：所有日期与时间统一使用 **UTC+8**（北京时间）。
> - **写入规范**：每次需求修改完成后第一时间追加条目；如涉及数据库模型字段变更，需同步在 `docs/` 下生成或更新迁移说明文件。

---

## [Unreleased] - 2026-06-29

### Fixed
- **消息未读计数接口 `/api/messages/unread-count` 改为查询真实数据**
  - 文件：`digital-recycling-server/src/routes/api/message.js`、`digital-recycling-server/src/models/UserMessageRead.js`（新增）、`digital-recycling-server/src/models/index.js`
  - **根因**：广播消息的 `is_read` 是全局字段，用户 A 标记广播消息已读后，用户 B 也会看到已读，导致未读计数不准确。
  - **方案**：新增 `user_message_reads` 表，独立追踪每个用户对广播消息的已读状态。`/unread-count` 接口分开计算个人未读消息 + 广播消息中当前用户未读的数量。
  - **影响接口**：
    - `GET /api/messages/unread-count`：个人未读 + 广播未读（排除用户已读的广播消息）
    - `GET /api/messages`：返回的广播消息 is_read 根据 user_message_reads 表修正
    - `PUT /api/messages/:id/read`：广播消息写入 user_message_reads 表，不再修改全局 is_read
    - `PUT /api/messages/read-all`：同时标记广播消息已读
  - **数据库迁移**：新增 `user_message_reads` 表（user_id + message_id 唯一索引）

## [Unreleased] - 2026-06-24

### Fixed
- **登录页顶部导航栏「返回」行为修复（重做）**
  - 文件：`pages/login/login.json`、`pages/login/login.js`、`pages/login/login.wxml`、`pages/login/login.wxss`
  - **根因**：原实现尝试使用 Page 生命周期 `onBackPress` 拦截原生导航栏返回按钮。验证后确认 **`onBackPress` 不是原生微信小程序的官方 API**（仅 uniapp 框架提供，原生 Page 对象上无此方法），因此原生 navigationBar 的左上角返回按钮点击不会触发。
  - **新方案**：在 `login.json` 中启用 `"navigationStyle": "custom"`，自绘顶部导航栏，左上角返回箭头通过 `onNavBack` 方法调用 `wx.switchTab({ url: '/pages/index/index' })` 跳转到首页。
  - **影响**：原生 navigationBar 被替换为自定义导航栏（红底 + 白色左箭头 + 居中标题"登录"），UI 风格与首页 `nav-bar` 保持一致；页面顶部 padding-top 通过 `statusBarHeight` 动态适配。
  - 入口：首页 / 品牌列表 / 会员中心 / token 过期自动跳转 等所有 `wx.navigateTo` 打开登录页的路径，点左上角返回箭头均回到首页。
  - **未覆盖**：Android 物理返回键和 iOS 左滑返回仍走系统默认 `navigateBack`（用户原话"顶部导航栏"未包含这两者；如需拦截，需另用 `page-container` 等方案）。
