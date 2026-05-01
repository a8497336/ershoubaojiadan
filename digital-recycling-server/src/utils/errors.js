class AppError extends Error {
  constructor(message, code = 500, statusCode = 500) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404, 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未认证，请先登录') {
    super(message, 401, 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = '无权限访问') {
    super(message, 403, 403)
  }
}

class ValidationError extends AppError {
  constructor(message = '参数校验失败', errors = []) {
    super(message, 422, 422)
    this.errors = errors
  }
}

class BusinessError extends AppError {
  constructor(message, code = 10000) {
    super(message, code, 400)
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  BusinessError
}
