const success = (res, data = null, message = 'success', code = 0) => {
  return res.json({
    code,
    message,
    data,
    timestamp: Date.now()
  })
}

const paginate = (page = 1, pageSize = 10) => {
  const offset = (parseInt(page) - 1) * parseInt(pageSize)
  const limit = parseInt(pageSize)
  return { offset, limit }
}

const paginateResponse = (res, data, total, page, pageSize, message = 'success') => {
  return res.json({
    code: 0,
    message,
    data: {
      list: data,
      pagination: {
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(total / pageSize)
      }
    },
    timestamp: Date.now()
  })
}

const error = (res, message = 'Internal Server Error', code = 500, statusCode = 500) => {
  return res.status(statusCode).json({
    code,
    message,
    data: null,
    timestamp: Date.now()
  })
}

const unauthorized = (res, message = '未认证，请先登录') => {
  return res.status(401).json({
    code: 401,
    message,
    data: null,
    timestamp: Date.now()
  })
}

const forbidden = (res, message = '无权限访问') => {
  return res.status(403).json({
    code: 403,
    message,
    data: null,
    timestamp: Date.now()
  })
}

const notFound = (res, message = '资源不存在') => {
  return res.status(404).json({
    code: 404,
    message,
    data: null,
    timestamp: Date.now()
  })
}

const validateError = (res, message = '参数校验失败', errors = []) => {
  return res.status(422).json({
    code: 422,
    message,
    data: errors,
    timestamp: Date.now()
  })
}

module.exports = {
  success,
  paginate,
  error,
  unauthorized,
  forbidden,
  notFound,
  validateError
}
