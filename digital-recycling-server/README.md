# 数码回收网 - 后端服务部署文档

## 环境要求

- Node.js 18+
- MySQL 8.0+
- Redis 6.0+（可选，用于缓存）
- npm 或 yarn

## 安装步骤

### 1. 克隆项目

```bash
cd digital-recycling-server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，修改以下配置：

```env
# 服务端口
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=digital_recycling
DB_USER=root
DB_PASSWORD=123456

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# 微信小程序配置
WX_APPID=your-appid
WX_SECRET=your-secret

# 上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 3. 初始化数据库

创建 MySQL 数据库：

```sql
CREATE DATABASE digital_recycling DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

首次启动服务时，Sequelize 会自动同步所有表结构并初始化种子数据。

### 4. 启动服务

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

## 生产部署

### PM2 部署

```bash
npm install -g pm2
pm2 start src/app.js --name digital-recycling-api
pm2 save
pm2 startup
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /path/to/digital-recycling-server/uploads/;
        expires 30d;
    }
}
```

### SSL 配置

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

## API 文档

启动服务后访问：`http://localhost:3000/api/docs`

## 默认管理员账号

- 用户名：`admin`
- 密码：`admin123456`

## 常见问题

### 数据库连接失败

1. 检查 MySQL 服务是否启动
2. 检查 `.env` 中的数据库配置是否正确
3. 检查 MySQL 用户权限

### 端口被占用

修改 `.env` 中的 `PORT` 配置，或使用以下命令查找并关闭占用端口的进程：

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### 文件上传失败

1. 确保 `uploads` 目录存在且有写入权限
2. 检查 `.env` 中的 `MAX_FILE_SIZE` 配置
