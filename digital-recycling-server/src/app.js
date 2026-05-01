require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const logger = require('./utils/logger')
const errorHandler = require('./middlewares/errorHandler')
const db = require('./models')

const app = express()

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', require('./routes/api'))
app.use('/api/admin', require('./routes/admin'))

app.get('/', (req, res) => {
  res.json({
    name: '数码回收网 API',
    version: '1.0.0',
    status: 'running',
    timestamp: Date.now()
  })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await db.sequelize.authenticate()
    logger.info('数据库连接成功')

    await db.sequelize.sync()
    logger.info('数据库同步完成')

    const { Admin, Role } = db
    const adminCount = await Admin.count()
    if (adminCount === 0) {
      const seeder = require('./seeders/init_data')
      await seeder.up(db.sequelize.getQueryInterface(), db.Sequelize)
      logger.info('种子数据初始化完成')
    }

    app.listen(PORT, () => {
      logger.info(`服务器运行在 http://localhost:${PORT}`)
      logger.info(`API文档: http://localhost:${PORT}/api/docs`)
    })
  } catch (err) {
    logger.error('服务器启动失败:', err)
    process.exit(1)
  }
}

if (require.main === module) {
  startServer()
}

module.exports = app
