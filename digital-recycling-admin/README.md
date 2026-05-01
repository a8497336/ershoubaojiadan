# 数码回收网 - 后台管理系统部署文档

## 环境要求

- Node.js 18+
- npm 或 yarn

## 安装步骤

### 1. 安装依赖

```bash
cd digital-recycling-admin
npm install
```

### 2. 开发模式启动

```bash
npm run dev
```

访问 `http://localhost:5173/` 即可进入后台管理系统。

### 3. 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录下。

## 生产部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;
    root /path/to/digital-recycling-admin/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### SSL 配置

```bash
sudo certbot --nginx -d admin.your-domain.com
```

## 环境变量

开发环境下，API 代理配置在 `vite.config.js` 中：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

生产环境需在 Nginx 中配置 API 代理。

## 默认登录账号

- 用户名：`admin`
- 密码：`admin123456`

## 功能模块

| 模块 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | /dashboard | 数据统计概览、趋势图表 |
| 用户管理 | /user | 用户列表、详情、状态管理 |
| 产品管理 | /product | 分类/品牌/产品CRUD |
| 报价管理 | /price | 报价表编辑、批量更新、历史查询 |
| 订单管理 | /order | 订单列表、发货、质检、打款 |
| 会员管理 | /member | 套餐管理、会员列表、订单 |
| 内容管理 | /content | Banner/公告/门店/视频/消息 |
| 数据统计 | /statistics | 用户/订单趋势、分布图 |
| 系统设置 | /system | 配置/管理员/角色/日志 |
