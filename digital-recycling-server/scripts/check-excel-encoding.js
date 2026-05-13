const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const filePath = 'e:\\数码回收\\同行手机回收报价单\\360报价单.xlsx'

console.log('检查Excel文件:', filePath)
console.log('='.repeat(60))

try {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  console.log('\n工作表名称:', sheetName)
  
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  console.log('\n总行数:', data.length)
  console.log('\n前10行数据:')
  
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    console.log(`\n行 ${i + 1}:`, JSON.stringify(row, null, 2))
    
    // 检查是否有乱码
    if (row && row.length > 0) {
      const firstCell = String(row[0] || '')
      if (/[Ã¤Ã©Ã¨ÃªÃ«]/.test(firstCell)) {
        console.log('  ⚠️ 检测到可能的乱码')
      }
      if (/[\u4e00-\u9fa5]/.test(firstCell)) {
        console.log('  ✓ 包含正常中文')
      }
    }
  }
  
  // 提取品牌名
  const fileName = path.basename(filePath, '.xlsx')
  console.log('\n' + '='.repeat(60))
  console.log('文件名:', fileName)
  
  // 使用与接口相同的函数提取品牌名
  function extractBrandName(filename) {
    return filename
      .replace(/\.xlsx$/i, '')
      .replace(/报价单/g, '')
      .replace(/手机/g, '')
      .replace(/\d+$/g, '')
      .trim()
  }
  
  const extractedBrandName = extractBrandName(fileName)
  console.log('提取的品牌名:', extractedBrandName)
  
  // 检查提取的品牌名是否有乱码
  function isGarbledText(text) {
    if (!text) return false
    const garbledPatterns = [
      /Ã¤/, /Ã©/, /Ã¨/, /Ãª/, /Ã«/, /Ã¯/, /Ã®/, /Ã¼/,
      /Ã¡/, /Ã³/, /Ãº/, /Ã±/, /Ã§/, /Ã¸/,
      /â€/ , /â€"/ , /â€"/ , /â€˜/ , /â€™/ , /â€œ/ , /â€/
    ]
    return garbledPatterns.some(pattern => pattern.test(text))
  }
  
  function hasValidChinese(text) {
    if (!text) return false
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    const totalChars = text.replace(/[\x00-\x1F]/g, '').length
    return totalChars > 0 && chineseChars / totalChars > 0.1
  }
  
  console.log('\n品牌名检测:')
  console.log('- 是否为乱码:', isGarbledText(extractedBrandName))
  console.log('- 是否包含有效中文:', hasValidChinese(extractedBrandName))
  
  if (isGarbledText(extractedBrandName)) {
    console.log('\n⚠️ 品牌名被检测为乱码！')
    console.log('可能的原因:')
    console.log('1. 文件名本身包含乱码')
    console.log('2. Node.js读取文件名时编码问题')
  }
  
} catch (error) {
  console.error('读取Excel文件失败:', error.message)
  console.error(error.stack)
}
