# 数码回收网微信小程序

## 项目概述

本项目是将原有的 Vue3 + Vite 网页应用重构为微信小程序，保持核心业务逻辑不变，同时适配微信小程序的技术架构和交互习惯。

## 技术架构

- **框架**: 微信小程序原生框架
- **样式**: WXSS (微信小程序样式表)
- **逻辑**: JavaScript (ES6+)
- **配置**: JSON

## 项目结构

```
digital-recycling-app/
├── app.js                 # 小程序入口逻辑
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── sitemap.json           # 站点地图配置
├── project.config.json    # 项目配置文件
├── pages/                 # 页面目录
│   ├── index/             # 首页
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   ├── index.js
│   │   └── index.json
│   ├── brand-list/        # 品牌列表页
│   │   ├── brand-list.wxml
│   │   ├── brand-list.wxss
│   │   ├── brand-list.js
│   │   └── brand-list.json
│   ├── price-quote/       # 报价单页
│   │   ├── price-quote.wxml
│   │   ├── price-quote.wxss
│   │   ├── price-quote.js
│   │   └── price-quote.json
│   ├── membership/        # 会员中心页
│   │   ├── membership.wxml
│   │   ├── membership.wxss
│   │   ├── membership.js
│   │   └── membership.json
│   ├── profile/           # 个人中心页
│   │   ├── profile.wxml
│   │   ├── profile.wxss
│   │   ├── profile.js
│   │   └── profile.json
│   ├── shopping/          # 回收车页
│   │   ├── shopping.wxml
│   │   ├── shopping.wxss
│   │   ├── shopping.js
│   │   └── shopping.json
│   └── scan-price/        # 拍照查价页
│       ├── scan-price.wxml
│       ├── scan-price.wxss
│       ├── scan-price.js
│       └── scan-price.json
├── images/                # 图片资源目录
│   ├── tabbar/            # TabBar图标
│   ├── icons/             # 通用图标
│   └── examples/          # 示例图片
└── utils/                 # 工具函数目录
    └── util.js
```

## 页面说明

### 1. 首页 (pages/index/index)
- Banner轮播展示
- 功能入口网格（快速查价、拍照查价、邀请好友）
- 公告栏
- 附近门店信息
- 搜索栏
- 分类Tab切换
- 品牌网格展示（废旧手机、内配、电子产品、疑难机型、靓机、名酒）
- 手机回收教程视频
- 服务流程展示
- 底部CTA按钮

### 2. 品牌列表页 (pages/brand-list/brand-list)
- 搜索功能
- 分类Tab切换
- 左侧品牌导航
- 右侧产品列表
- 产品详情弹窗（底部弹出）
- 数量选择器
- 回收车悬浮按钮

### 3. 报价单页 (pages/price-quote/price-quote)
- 报价信息头部
- 左右滑动价格表格
- 多种价格状态展示（开机屏好、开机大屏好、开机小屏好、开机屏坏、不开机、废板整机等）
- 价格颜色标识（高价绿色、中价蓝色、低价紫色）

### 4. 会员中心页 (pages/membership/membership)
- 用户信息卡片
- 会员专属特权展示
- 会员套餐选择
- 规则说明
- 底部购买按钮
- 右侧悬浮客服

### 5. 个人中心页 (pages/profile/profile)
- 用户信息展示
- VIP卡片
- 快捷入口（钱包、卡券、红包、公告）
- 积分活动
- 常用功能网格
- 会员功能网格
- 底部联系栏

### 6. 回收车页 (pages/shopping/shopping)
- 商品统计信息
- 商品列表展示
- 数量增减控制
- 选择/全选功能
- 价格计算
- 删除确认弹窗
- 清空确认弹窗
- 空状态展示

### 7. 拍照查价页 (pages/scan-price/scan-price)
- 积分和剩余次数展示
- 拍照按钮（支持相机和相册）
- 拍摄示例对比
- 底部功能按钮

## TabBar 配置

底部导航栏包含5个标签：
1. 首页
2. 报价单
3. 扫码报价（中间突出按钮）
4. 回收车
5. 我的

## 适配优化

### 1. 响应式适配
- 使用 rpx 单位实现屏幕适配
- 针对不同屏幕尺寸进行优化

### 2. 性能优化
- 图片懒加载
- 列表分页加载
- 组件按需加载

### 3. 交互优化
- 下拉刷新
- 上拉加载更多
- 返回顶部按钮
- 触摸反馈效果

### 4. 安全区域适配
- 适配刘海屏
- 适配底部安全区域

## 开发规范

### 命名规范
- 页面文件：小写，使用连字符分隔
- 组件文件：小写，使用连字符分隔
- 变量命名：驼峰命名法
- 常量命名：全大写，下划线分隔

### 样式规范
- 使用 BEM 命名规范
- 避免使用 ID 选择器
- 合理使用 Flex 布局
- 统一使用 rpx 单位

### 代码规范
- 使用 ES6+ 语法
- 合理使用 async/await
- 错误处理完善
- 注释清晰

## 运行环境

- 微信客户端版本：8.0.0 及以上
- 基础库版本：2.32.0 及以上
- 开发者工具：最新版本

## 开发工具

1. 微信开发者工具
2. VS Code + 微信小程序插件

## 部署流程

1. 使用微信开发者工具打开项目
2. 填写 AppID
3. 上传代码
4. 提交审核
5. 发布上线

## 注意事项

1. 图片资源需要替换为小程序支持的格式
2. 网络请求需要使用 wx.request
3. 存储使用 wx.setStorageSync
4. 分享功能需要配置 onShareAppMessage
5. 支付功能需要接入微信支付

## 后续优化方向

1. 接入微信支付
2. 添加用户登录授权
3. 实现数据缓存
4. 添加埋点统计
5. 优化首屏加载速度
6. 添加骨架屏
7. 实现下拉刷新和上拉加载
