const XLSX = require('xlsx')

const filePath = 'e:\\数码回收\\同行手机回收报价单\\360报价单.xlsx'

console.log('检查哪些产品会被跳过\n')

const workbook = XLSX.readFile(filePath)
const worksheet = workbook.Sheets[workbook.SheetNames[0]]
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

const productNames = []
for (let i = 8; i < data.length; i++) {
  const row = data[i]
  if (!row || row.length === 0) continue
  
  let productName = ''
  const firstVal = String(row[0] || '').trim()
  
  if (/^\d+$/.test(firstVal)) {
    productName = String(row[1] || '').trim()
  } else {
    productName = firstVal
  }
  
  if (productName) {
    productNames.push(productName)
  }
}

console.log(`总产品数: ${productNames.length}\n`)

let passed = 0
let skippedByLength = 0
let skippedByChinese = 0
let passedValidation = 0

console.log('逐个检查：\n')

productNames.forEach((name, index) => {
  console.log(`产品 ${index + 1}: "${name}"`)
  
  // 检查 isValidProductName
  const alphanumericWithSpace = /^[a-zA-Z0-9\s\(\)\-]+$/.test(name)
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)
  const chineseChars = (name.match(/[\u4e00-\u9fa5]/g) || []).length
  const totalChars = name.replace(/[\x00-\u1F]/g, '').length
  const chineseRatio = hasChinese ? chineseChars / totalChars : 0
  
  let isValid = false
  if (alphanumericWithSpace) {
    isValid = true
  } else if (hasChinese && chineseRatio > 0.1) {
    isValid = true
  }
  
  // 检查是否被跳过
  const skippedByLengthCheck = name.length > 20
  const skippedByChineseCheck = /[\u4e00-\u9fa5]{6,}/.test(name)
  
  console.log(`  - 长度: ${name.length} ${skippedByLengthCheck ? '❌ 超过20' : '✅'}`)
  console.log(`  - 6+连续中文: ${skippedByChineseCheck ? '❌ 是' : '✅'}`)
  console.log(`  - 有效: ${isValid ? '✅' : '❌'}`)
  
  if (skippedByLengthCheck) {
    skippedByLength++
    console.log(`  → 会被跳过（长度超过20）`)
  } else if (skippedByChineseCheck) {
    skippedByChinese++
    console.log(`  → 会被跳过（包含6+连续中文）`)
  } else if (isValid) {
    passedValidation++
    console.log(`  → 会通过验证`)
  } else {
    console.log(`  → 无效`)
  }
  
  console.log()
})

console.log('='.repeat(60))
console.log('统计：')
console.log(`总产品数: ${productNames.length}`)
console.log(`会通过验证: ${passedValidation}`)
console.log(`被长度跳过: ${skippedByLength}`)
console.log(`被中文跳过: ${skippedByChinese}`)
console.log(`总计跳过: ${skippedByLength + skippedByChinese}`)
console.log('='.repeat(60))
