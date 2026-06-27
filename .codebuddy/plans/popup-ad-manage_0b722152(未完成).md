---
name: popup-ad-manage
overview: 在平台管理员后台添加"弹窗广告设置"功能，支持设置弹窗图片和活动跳转链接。涵盖后端模型、管理后台API、管理后台UI、小程序端API和小程序端弹窗展示。
design:
  styleKeywords:
    - 简洁高效
    - Element Plus
    - 表单布局
  fontSystem:
    fontFamily: PingFang-SC
    heading:
      size: 18px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#409EFF"
    background:
      - "#F5F7FA"
      - "#FFFFFF"
    text:
      - "#303133"
      - "#606266"
      - "#909399"
    functional:
      - "#67C23A"
      - "#E6A23C"
      - "#F56C6C"
todos:
  - id: create-model
    content: 创建弹窗广告数据库模型 PopupAd.js
    status: pending
  - id: register-model
    content: 在 models/index.js 中注册 PopupAd 模型
    status: pending
    dependencies:
      - create-model
  - id: create-migration
    content: 创建数据库迁移文件
    status: pending
    dependencies:
      - create-model
  - id: create-admin-route
    content: 创建管理端弹窗广告路由 popup-manage.js
    status: pending
    dependencies:
      - register-model
  - id: register-admin-route
    content: 在 admin/index.js 中注册弹窗广告路由
    status: pending
    dependencies:
      - create-admin-route
  - id: create-api-route
    content: 创建小程序端获取弹窗广告接口
    status: pending
    dependencies:
      - register-model
  - id: add-admin-api
    content: 在管理后台 api/index.js 添加弹窗广告 API 函数
    status: pending
  - id: modify-content-page
    content: 在内容管理页面新增弹窗广告 Tab
    status: pending
    dependencies:
      - add-admin-api
  - id: add-miniprogram-api
    content: 在小程序 api-modules.js 添加 getPopupAds 接口
    status: pending
  - id: create-popup-component
    content: 创建小程序弹窗广告展示组件
    status: pending
    dependencies:
      - add-miniprogram-api
  - id: integrate-popup
    content: 在小程序 app.js 中集成全局弹窗调用
    status: pending
    dependencies:
      - create-popup-component
---

## 需求概述

在平台管理员后台添加小程序页面弹窗广告功能，支持设置弹窗图片和活动跳转链接。

## 功能详情

基于提供的参考截图，弹窗广告需要支持以下配置项：

### 广告样式

- 局部弹窗：在页面中间显示的弹窗广告
- 全屏广告：覆盖整个页面的广告

### 广告图片

- 支持上传最多 3 张图片
- 图片支持预览和删除
- 支持配置每张图片的跳转链接

### 弹窗次数

- 每次：每次进入页面都显示弹窗
- 仅首次：仅在用户首次进入时显示

### 其他配置

- 广告标题
- 状态：启用/禁用
- 排序：控制显示优先级
- 生效时间：开始时间和结束时间

## 技术栈

- **后端**: Node.js + Express + Sequelize + MySQL
- **管理后台**: Vue 3 + Element Plus + Vite
- **小程序端**: 原生微信小程序

## 实现方案

### 整体架构

采用与现有 Banner/公告/视频管理相同的三层架构：

1. **数据层**: Sequelize 模型定义
2. **接口层**: CRUD API 路由
3. **展示层**: 管理后台页面 + 小程序组件

### 核心设计决策

#### 1. 复用现有 CRUD 工厂模式

项目已使用 `crud-factory.js` 封装通用 CRUD 操作，弹窗广告将复用此模式，保持代码一致性。

#### 2. 扩展内容管理页面

在现有的 `views/content/index.vue` 中新增 "弹窗广告" Tab，复用表格、分页、编辑弹窗等组件，减少重复代码。

#### 3. 小程序端弹窗组件设计

- 创建独立的 `popup-ad` 组件，在 `app.js` 或首页调用
- 支持本地存储记录用户已关闭的弹窗
- 根据配置项（每次/仅首次）控制显示逻辑

#### 4. 数据模型设计

参考 Banner 模型，新增以下字段：

- `popup_type`: 弹窗类型（local/fullscreen）
- `images`: JSON 格式存储多图片配置（包含图片URL和跳转链接）
- `show_frequency`: 显示频率（always/first）
- `sort_order`: 排序
- `status`: 状态
- `start_time/end_time`: 生效时间

## 目录结构

### 后端 (digital-recycling-server)

```
src/
├── models/
│   ├── PopupAd.js                    [NEW] 弹窗广告模型
│   └── index.js                      [MODIFY] 注册 PopupAd 模型
├── routes/
│   ├── admin/
│   │   ├── index.js                  [MODIFY] 添加 /popup-ads 路由
│   │   └── popup-manage.js           [NEW] 管理端弹窗广告 CRUD 路由
│   └── api/
│       └── popup-ads.js              [NEW] 小程序端获取弹窗广告接口
└── migrations/
    └── 20250627-create-popup-ads.js  [NEW] 数据库迁移文件
```

### 管理后台前端 (digital-recycling-admin)

```
src/
├── api/
│   └── index.js                      [MODIFY] 添加弹窗广告 API 函数
├── views/
│   └── content/
│       └── index.vue                 [MODIFY] 新增"弹窗广告"Tab
└── components/
    └── popup-ad-form/                [NEW] 弹窗广告表单组件（复杂配置专用）
        └── index.vue
```

### 小程序端 (digital-recycling-miniprogram)

```
├── components/
│   └── popup-ad/                     [NEW] 弹窗广告展示组件
│       ├── popup-ad.js
│       ├── popup-ad.wxml
│       ├── popup-ad.wxss
│       └── popup-ad.json
├── utils/
│   └── api-modules.js                [MODIFY] 添加 getPopupAds API
└── app.js                            [MODIFY] 全局调用弹窗组件
```

## 关键代码结构

### 1. 数据模型 (PopupAd.js)

```javascript
module.exports = (sequelize, DataTypes) => {
  const PopupAd = sequelize.define('PopupAd', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING(100),
    popup_type: { type: DataTypes.ENUM('local', 'fullscreen'), defaultValue: 'local' },
    images: { type: DataTypes.JSON, comment: '图片配置数组 [{url, link}]' },
    show_frequency: { type: DataTypes.ENUM('always', 'first'), defaultValue: 'always' },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.TINYINT, defaultValue: 1 },
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE
  }, { tableName: 'popup_ads', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
  return PopupAd
}
```

### 2. 管理端路由 (popup-manage.js)

使用 crud-factory 生成标准 CRUD 路由：

```javascript
const { createCrudRouter } = require('./crud-factory')
const db = require('../../models')
module.exports = createCrudRouter(db.PopupAd, '弹窗广告')
```

### 3. 小程序端组件关键接口

```javascript
// 获取当前生效的弹窗广告
GET /api/popup-ads/current
```

## 性能与可靠性考虑

1. **缓存策略**: 小程序端缓存弹窗配置，减少请求次数
2. **本地存储**: 使用 wx.setStorage 记录用户关闭状态
3. **图片优化**: 限制图片大小，使用压缩后的图片URL
4. **时间校验**: 后端和前端双重校验生效时间

## 设计概述

管理后台弹窗广告配置界面采用 Element Plus 组件库，参考截图中的表单布局设计。

## 页面布局

### 内容管理页面新增 Tab

在现有内容管理页面（Banner/公告/门店/视频）基础上，新增 "弹窗广告" Tab 选项。

### 表格展示列

| 列名 | 说明 |
| --- | --- |
| ID | 广告ID |
| 标题 | 广告标题 |
| 类型 | 局部弹窗/全屏广告 |
| 图片数 | 已配置的图片数量 |
| 排序 | 排序值 |
| 状态 | 启用/禁用 |
| 操作 | 编辑/删除 |


### 编辑弹窗设计

包含以下表单元素：

1. **广告标题**: el-input
2. **广告样式**: el-radio-group（局部弹窗/全屏广告）
3. **广告图片**: 动态添加的图片列表

- 每张图片包含：上传组件 + 跳转链接输入
- 支持最多 3 张图片

4. **弹窗次数**: el-radio-group（每次/仅首次）
5. **生效时间**: el-date-picker（范围选择）
6. **排序**: el-input-number
7. **状态**: el-switch

## 样式规范

- 遵循现有管理后台风格（深色侧边栏 + 浅色内容区）
- 弹窗宽度：600px
- 图片预览：左侧预览，右侧配置
- 表单标签宽度：100px

# Agent Extensions

无需使用额外扩展