const { validationResult } = require('express-validator')
const { validateError } = require('../utils/response')

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }))
    return validateError(res, '参数校验失败', errorList)
  }
  next()
}

module.exports = validate
