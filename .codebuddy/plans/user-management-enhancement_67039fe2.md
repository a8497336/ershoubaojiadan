---
name: user-management-enhancement
overview: 后台管理：用户列表增加推荐人/手机号/加入时间筛选，支持数据导出CSV。小程序端：仅改造个人中心页面完善微信用户信息（昵称/头像/手机号），登录后检测缺失信息自动提示引导。
todos:
  - id: add-referrer-field
    content: 数据库新增 referrer 推荐人字段：修改 User.js 模型、创建迁移文件
    status: completed
  - id: enhance-admin-api
    content: 增强后端用户管理接口：抽取 buildUserWhere 函数，新增 phone/date_from/date_to/referrer 筛选，新增 GET /export 导出接口（xlsx 生成 Excel）
    status: completed
    dependencies:
      - add-referrer-field
  - id: update-admin-frontend
    content: 更新管理后台用户页面：搜索栏新增手机号/日期范围/推荐人筛选框，表格新增推荐人列，新增导出按钮及 API 对接
    status: completed
    dependencies:
      - enhance-admin-api
  - id: refactor-profile-page
    content: 重做小程序个人中心：新增信息完善引导提示条，头像改用 chooseAvatar，昵称改用 type="nickname" input，手机号改用 getPhoneNumber 按钮
    status: completed
---

## 用户需求

### 一、平台管理后台 - 用户管理增强

1. **用户列表新增筛选分类**：推荐人、手机号独立筛选框、加入时间日期范围筛选
2. **用户信息一键导出**：导出全部或筛选后的用户数据为 Excel 文件到本地
3. **表格新增推荐人列**：在用户列表表格中展示推荐人信息

### 二、小程序端 - 完善微信用户信息获取

1. **不修改登录页面**，保持现有 wx.login 流程不变
2. **个人信息完善引导**：登录后在个人中心顶部，若头像为默认图 或 手机号为空，显示引导提示条，提示用户去完善
3. **用户头像**：使用微信原生 `<button open-type="chooseAvatar">` 组件选择头像
4. **用户昵称**：使用微信原生 `<input type="nickname">` 组件输入/选择昵称
5. **用户手机号**：使用微信原生 `<button open-type="getPhoneNumber">` 组件获取手机号

## 技术栈

- **后端**：Node.js + Express + Sequelize + MySQL
- **管理后台前端**：Vue 3 + Element Plus + Vite
- **小程序端**：原生微信小程序（符合2024+微信API规范）
- **导出**：xlsx 库（已存在于 admin package.json dependencies 中）

## 实现方案

### 整体架构

```
管理后台(admin) → /api/admin/users (筛选+导出) → user-manage.js → User Model → MySQL
小程序(profile)  → chooseAvatar / type="nickname" / getPhoneNumber → uploadAvatar / updateProfile / phone-bind → 后端
```

### 数据库变更

- User 表新增 `referrer` VARCHAR(20) 字段，允许为空
- 通过 Sequelize `sync({ alter: true })` 自动同步，同时创建迁移文件记录本次 DDL

### 后端管理接口增强

**`GET /admin/users`**（现有接口增强）：

- 新增 `phone` 参数：独立手机号模糊筛选
- 新增 `date_from` / `date_to` 参数：按 created_at 日期范围筛选
- 新增 `referrer` 参数：推荐人模糊筛选
- keyword 保持不变，各筛选条件独立叠加（AND 关系）

**`GET /admin/users/export`**（新增导出接口）：

- 复用列表查询逻辑（抽取为 `buildUserWhere()` 公共函数）
- 不分页，查询全部符合筛选条件的数据
- 使用 xlsx 库生成 Excel 工作簿
- 设置 `Content-Disposition: attachment` 响应头，返回文件流

### 管理后台前端 (`digital-recycling-admin/src/views/user/index.vue`)

**搜索栏改造**（header-actions 区域）：

- 新增 `el-input` 手机号筛选框，`@keyup.enter` 触发搜索
- 新增 `el-date-picker`（type="daterange"）日期范围选择器
- 新增 `el-input` 推荐人筛选框
- 新增 `el-button` 导出按钮，`@click="handleExport"`

**表格新增列**：

- `el-table-column prop="referrer" label="推荐人" width="100"`

**导出逻辑 `handleExport()`**：

- 组装当前筛选参数调用 `get('/admin/users/export')`
- 接收 Blob 流，创建临时 URL 触发浏览器下载

**API 层新增**（`src/api/index.js`）：

- `exportUsers(params)` → `GET /admin/users/export`，`responseType: 'blob'`

### 小程序个人中心改造 (`digital-recycling-miniprogram/pages/profile/`)

**核心原则**：登录页完全不动。个人中心成为用户完善信息的唯一入口。

#### 1. 引导提示条（新增）

在 `user-info-area` 上方新增条件显示的引导条：

```
条件：用户头像URL === '/images/icons/avatar.svg' 或 手机号为空
显示：浅蓝背景 + ℹ️ 图标 + "完善个人信息，享受更多服务" + 箭头 →
点击：滚动到用户信息编辑区
```

data 新增 `showInfoGuide: false`，在 `loadUserInfo()` 中计算：

```js
const defaultAvatar = '/images/icons/avatar.svg'
const needGuide = (data.avatar === defaultAvatar || !data.phone)
this.setData({ showInfoGuide: needGuide })
```

#### 2. 头像改造

原 `<view class="user-avatar" bindtap="changeAvatar">` 改为：

```html
<button class="user-avatar-btn" open-type="chooseAvatar" bindchooseavatar="onChooseAvatar">
  <image src="{{userInfo.avatar}}" mode="aspectFill" />
  <view class="avatar-edit-tag">更换头像</view>
</button>
```

- `onChooseAvatar(e)` 获取 `e.detail.avatarUrl` 临时路径
- 调用已有的 `userApi.uploadAvatar(tempPath)` 上传
- 成功后更新本地 data 和 `app.globalData.userInfo`

#### 3. 昵称改造

原静态 `<view class="u-name">{{userInfo.nickname}}</view>` 改为：

```html
<input class="u-name-input" type="nickname" 
  value="{{userInfo.nickname}}" 
  bind:blur="onNicknameBlur"
  placeholder="请输入昵称" />
```

- `onNicknameBlur(e)` 获取 `e.detail.value`
- 调用 `userApi.updateProfile({ nickname: value })` 保存
- 更新本地和全局数据

#### 4. 手机号改造

原 `<view class="u-phone" wx:if="{{userInfo.phone}}">` 显示区改为：

```html
<view class="u-phone" wx:if="{{userInfo.phone}}">
  <text class="u-phone-icon">📞</text>
  <text>{{userInfo.phone}}</text>
</view>
<button wx:else class="phone-bind-btn" open-type="getPhoneNumber" 
  bindgetphonenumber="onGetPhoneNumber">
  绑定手机号
</button>
```

- `onGetPhoneNumber(e)` 获取 `e.detail.code`
- 调用已有 `authApi.bindPhone(code)`（POST /api/auth/phone-bind）
- 成功后更新本地数据，隐藏引导提示条

#### 5. profile.js 新增方法

| 方法 | 触发 | 作用 |
| --- | --- | --- |
| `onChooseAvatar(e)` | chooseAvatar 回调 | 上传头像并更新 |
| `onNicknameBlur(e)` | nickname input 失焦 | 保存昵称 |
| `onGetPhoneNumber(e)` | getPhoneNumber 回调 | 绑定手机号 |
| `onGuideTap()` | 点击引导条 | 滚动到编辑区 |


### 后端接口（已存在，无需修改）

- `PUT /api/user/profile`：接收 `{ nickname, avatar }`
- `POST /api/user/avatar`：上传头像文件
- `POST /api/auth/phone-bind`：接收 `{ code }` 返回 `{ phone }`

## 实现细节

### 性能

- 导出接口使用 `stream.Writable` 配合 xlsx 流式写入，避免大数据量内存溢出
- 日期筛选利用 Sequelize `Op.between` + created_at 索引提升效率
- 小程序 avatar 上传使用 `wx.compressImage` 压缩后再上传

### 代码复用

- 后端 `buildUserWhere(req.query)` 函数被列表和导出接口共享，消除重复
- 管理后台搜索栏样式沿用现有 `header-actions` flex 布局
- 小程序复用已有 `userApi.uploadAvatar`、`userApi.updateProfile`、`authApi.bindPhone`

### 安全

- `/admin/users/export` 使用 `adminAuth` 中间件
- 小程序 phone-bind 使用 `auth` 中间件（已登录才能绑定）

### 向后兼容

- 新增字段 `referrer` 默认 NULL，不影响现有数据
- 新增筛选参数为可选，不传时行为与原有接口一致
- 小程序 profile 结构保持原有区块顺序不变