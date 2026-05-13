const XLSX = require('xlsx')
const path = require('path')

const filePath = 'e:\\数码回收\\同行手机回收报价单\\360报价单.xlsx'

console.log('='.repeat(80))
console.log('调试Excel产品导入问题')
console.log('='.repeat(80))

try {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  console.log('\n📁 文件:', filePath)
  console.log('📊 工作表:', sheetName)
  
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  console.log(`\n📋 总行数: ${data.length}`)
  console.log('\n' + '='.repeat(80))
  console.log('前10行数据预览:')
  console.log('='.repeat(80))
  
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i]
    console.log(`\n行 ${i + 1} (索引 ${i}):`)
    if (row && row.length > 0) {
      row.forEach((cell, idx) => {
        const cellStr = String(cell || '')
        console.log(`  列${idx}: "${cellStr}"`)
      })
    } else {
      console.log('  (空行)')
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('提取产品名（第9行之后，第1列）:')
  console.log('='.repeat(80))
  
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
      console.log(`\n产品 ${productNames.length}: "${productName}"`)
      console.log(`  - 长度: ${productName.length}`)
      console.log(`  - 字符: ${JSON.stringify(productName)}`)
      console.log(`  - 包含空格: ${productName.includes(' ')}`)
      console.log(`  - 包含下划线: ${productName.includes('_')}`)
      console.log(`  - 包含中文: ${/[\u4e00-\u9fa5]/.test(productName)}`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('测试 isValidProductName 验证:')
  console.log('='.repeat(80))
  
  function isValidProductName(productName) {
    if (!productName) return false
    
    if (/^[a-zA-Z0-9\s\(\)\-]+$/.test(productName)) {
      return true
    }
    
    const chineseChars = (productName.match(/[\u4e00-\u9fa5]/g) || []).length
    const totalChars = productName.replace(/[\x00-\u1F]/g, '').length
    
    return totalChars > 0 && chineseChars / totalChars > 0.1
  }
  
  const validProducts = []
  const invalidProducts = []
  
  productNames.forEach(name => {
    const isValid = isValidProductName(name)
    console.log(`\n"${name}": ${isValid ? '✅ 有效' : '❌ 无效'}`)
    
    if (isValid) {
      validProducts.push(name)
    } else {
      invalidProducts.push(name)
    }
  })
  
  console.log('\n' + '='.repeat(80))
  console.log('统计结果:')
  console.log('='.repeat(80))
  console.log(`总产品数: ${productNames.length}`)
  console.log(`有效产品: ${validProducts.length}`)
  console.log(`无效产品: ${invalidProducts.length}`)
  
  if (invalidProducts.length > 0) {
    console.log('\n❌ 无效产品列表:')
    invalidProducts.forEach(name => {
      console.log(`  - "${name}"`)
    })
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('结论:')
  console.log('='.repeat(80))
  
  if (productNames.length === 0) {
    console.log('⚠️ 未找到任何产品名！')
    console.log('可能的原因:')
    console.log('1. Excel文件格式不正确')
    console.log('2. 产品数据不在第9行之后')
    console.log('3. 产品数据不在第1列或第2列')
  } else if (invalidProducts.length === productNames.length) {
    console.log('❌ 所有产品名都被判定为无效！')
    console.log('这可能是 "文件中未找到有效产品数据" 错误的原因')
    console.log('\n需要调整 isValidProductName 函数的正则表达式')
  } else {
    console.log(`✅ 有 ${validProducts.length} 个产品名有效`)
    if (validProducts.length > 0) {
      console.log('前5个有效产品:')
      validProducts.slice(0, 5).forEach(name => {
        console.log(`  - "${name}"`)
      })
    }
  }
  
} catch (error) {
  console.error('\n❌ 读取Excel文件失败:', error.message)
  console.error(error.stack)
}
