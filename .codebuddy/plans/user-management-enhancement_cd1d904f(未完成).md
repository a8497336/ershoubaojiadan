---
name: user-management-enhancement
overview: 后台管理：用户列表增加推荐人/手机号/加入时间筛选，支持数据导出CSV。小程序端：完善微信用户信息获取（昵称/头像/手机号）。数据库新增referrer相关字段。
todos:
  - id: add-referrer-field
    content: 数据库新增 referrer 推荐人字段：修改 User.js 模型、创建迁移文件、运行 sync
    status: pending
  - id: enhance-admin-api
    content: 增强后端用户管理接口：列表接口新增 phone/date_from/date_to 筛选参数，新增 GET /export 导出接口（xlsx生成Excel）
    status: pending
    dependencies:
      - add-referrer-field
  - id: update-admin-frontend
    content: 更新管理后台用户页面：搜索栏新增手机号输入框和日期范围选择器，表格新增推荐人列，新增导出按钮并接入API
    status: pending
    dependencies:
      - enhance-admin-api
  - id: overhaul-login-page
    content: 重做小程序登录页：新增 chooseAvatar 按钮、type="nickname" 输入框、getPhoneNumber 按钮，头像上传后登录，样式还原原有设计
    status: pending
  - id: overhaul-profile-page
    content: 重做小程序个人中心：头像改用 chooseAvatar、昵称改用 type="nickname" 可编辑 input、新增 getPhoneNumber 手机号绑定按钮
    status: pending
    dependencies:
      - overhaul-login-page
---

## 用户需求

### 一、平台管理后台 - 用户管理增强

1. **用户列表新增筛选分类**：推荐人、手机号独立筛选框、加入时间日期范围筛选
2. **用户信息一键导出**：导出全部或筛选后的用户数据为 Excel 文件到本地
3. **表格新增推荐人列**：在用户列表表格中展示推荐人信息

### 二、小程序端 - 完善微信用户信息获取

1. **用户昵称获取**：使用微信最新 `<input type="nickname">` 组件，让用户输入/选择微信昵称
2. **用户头像获取**：使用微信最新 `<button open-type="chooseAvatar">` 组件，让用户选择微信头像
3. **用户手机号获取**：使用微信最新 `<button open-type="getPhoneNumber">` 组件，获取微信绑定手机号

## 技术栈

- **后端**：Node.js + Express + Sequelize + MySQL
- **管理后台前端**：Vue 3 + Element Plus + Vite
- **小程序端**：原生微信小程序（符合微信2024最新API规范）
- **导出**：xlsx 库（已存在于 package.json dependencies 中）

## 实现方案

### 整体架构

```
管理后台(admin) → /api/admin/users (筛选/导出) → 后端 user-manage.js → User Model → MySQL
小程序(login/profile) → /api/auth/wx-login (昵称/头像) | /api/auth/phone-bind (手机号) → 后端 auth.js → User Model
```

### 数据库变更

- User 表新增 `referrer` VARCHAR(20) 字段（推荐人），允许为空
- 通过 Sequelize sync({alter:true}) 自动同步，同时创建迁移文件记录

### 后端管理接口增强

- GET /admin/users：新增 phone、date_from、date_to 查询参数，独立处理每个筛选条件
- GET /admin/users/export：复用列表查询逻辑，使用 xlsx 库生成 Excel 文件并返回下载流

### 管理后台前端

- 搜索栏：新增手机号输入框、加入时间日期范围选择器
- 表格：新增推荐人(referrer)列
- 导出按钮：调用 export 接口下载 Excel

### 小程序端微信API适配

- **登录页**：新增 chooseAvatar 按钮、nickname 输入框、getPhoneNumber 按钮；头像临时文件先上传再登录
- **个人中心**：头像改用 chooseAvatar、昵称改用 type="nickname" input、新增 getPhoneNumber 手机号绑定按钮
- **后端对接**：auth.js 的 wx-login 接口已兼容 nickName/avatarUrl 字段；phone-bind 接口已可用 getPhoneNumber 对接

## 实现细节

### 性能关注

- 导出接口流式生成 Excel，避免大数据量内存溢出
- 日期筛选使用 created_at 索引提升查询效率

### 代码复用

- 用户列表查询逻辑抽取为独立函数，列表接口和导出接口共享
- 管理后台搜索栏样式复用 content 页面的 header-actions 模式
- 小程序端复用已有的 uploadAvatar API，上传 chooseAvatar 获取的临时文件

### 安全考虑

- 导出接口使用 adminAuth 中间件鉴权
- 手机号筛选仅允许管理员使用
- 小程序 phone-bind 需要登录状态（auth 中间件）

## Agent Extensions

### SubAgent

- **code-explorer**
- 用途：在实施过程中验证文件路径、检查现有代码模式、确认修改前后的一致性
- 预期结果：确保所有文件修改准确无误，避免引入语法错误或破坏现有功能