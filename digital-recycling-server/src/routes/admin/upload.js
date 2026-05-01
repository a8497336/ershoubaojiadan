const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { success, error } = require('../../utils/response')
const uploadConfig = require('../../config/upload')
const { adminAuth } = require('../../middlewares/adminAuth')

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

const videoDir = path.join(uploadConfig.uploadDir, 'videos')
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true })
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
    cb(null, filename)
  }
})

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: uploadConfig.maxVideoFileSize },
  fileFilter: (req, file, cb) => {
    if (uploadConfig.allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的视频格式，仅支持 MP4/WebM/MOV/AVI'))
    }
  }
})

router.post('/', adminAuth, upload.single('file'), async (req, res, next) => {
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

router.post('/video', adminAuth, videoUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, '请选择视频文件', 422, 422)
    }
    const baseUrl = getBaseUrl(req)
    const url = `${baseUrl}/uploads/videos/${req.file.filename}`
    return success(res, { url, filename: req.file.originalname, size: req.file.size }, '视频上传成功')
  } catch (err) {
    next(err)
  }
})

module.exports = router
