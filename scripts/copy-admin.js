const fs = require('fs')
const path = require('path')

const src = path.resolve(__dirname, '..', 'digital-recycling-admin', 'dist')
const dest = path.resolve(__dirname, '..', 'digital-recycling-server', 'public', 'admin')

if (!fs.existsSync(src)) {
  console.error('Admin dist目录不存在，请先执行 build')
  process.exit(1)
}

function copyRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true })
  }
  const entries = fs.readdirSync(source, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(source, entry.name)
    const destPath = path.join(target, entry.name)
    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function removeRecursiveSync(dir) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      removeRecursiveSync(fullPath)
    } else {
      fs.unlinkSync(fullPath)
    }
  }
  fs.rmdirSync(dir)
}

if (fs.existsSync(dest)) {
  removeRecursiveSync(dest)
}

copyRecursiveSync(src, dest)
console.log('Admin已复制到 server/public/admin')
