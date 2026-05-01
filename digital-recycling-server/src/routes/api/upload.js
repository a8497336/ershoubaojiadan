/**
 * @openapi
 * tags:
 *   - name: 小程序-上传
 *     description: 文件上传相关接口
 */

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags: [小程序-上传]
 *     summary: 文件上传
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 上传的文件
 *     responses:
 *       200:
 *         description: 上传成功
 */

const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { success, error } = require('../../utils/response')
const uploadConfig = require('../../config/upload')

const getBaseUrl = (req) => {
  const apiBaseUrl = process.env.API_BASE_URL
  if (apiBaseUrl) return apiBaseUrl
  const protocol = req.protocol
  const host = req.get('host')
  return `${protocol}://${host}`
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowed = [...uploadConfig.allowedImageTypes, ...uploadConfig.allowedFileTypes]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  }
})

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, '请选择文件', 422, 422)
    }
    const baseUrl = getBaseUrl(req)
    const url = `${baseUrl}/uploads/${req.file.filename}`
    return success(res, { url, filename: req.file.originalname, size: req.file.size }, '上传成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
