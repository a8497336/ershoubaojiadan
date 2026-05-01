const { AppError } = require('../utils/errors')
const { error } = require('../utils/response')
const logger = require('../utils/logger')

const errorHandler = (err, req, res, _next) => {
  logger.error(`[${req.method}] ${req.url} - Error: ${err.message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query
  })

  if (err.isOperational) {
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
      code: err.code || statusCode,
      message: err.message,
      data: err.errors || null,
      timestamp: Date.now()
    })
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }))
    return res.status(422).json({
      code: 422,
      message: '数据验证失败',
      data: errors,
      timestamp: Date.now()
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      code: 409,
      message: '数据已存在',
      data: null,
      timestamp: Date.now()
    })
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在',
      data: null,
      timestamp: Date.now()
    })
  }

  return res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
    timestamp: Date.now()
  })
}

module.exports = errorHandler
