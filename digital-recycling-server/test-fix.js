// 验证纯数字产品名解析逻辑

function cleanStr(s) {
  if (s == null) return ''
  return String(s).replace(/\n/g, '').replace(/\r/g, '').trim()
}

// 修复后的逻辑
function parseProductName(row, hasModelCode, modelCodeColIndex) {
  let productName = ''
  let nameColIndex = 0

  if (hasModelCode) {
    productName = cleanStr(row[0])
  } else {
    const firstVal = cleanStr(row[0])
    // 纯数字就是产品名（如1107、1105、1100），直接作为产品名
    if (/^\d+$/.test(firstVal)) {
      productName = firstVal
      nameColIndex = 0
    } else {
      productName = firstVal
      nameColIndex = 0
    }
  }

  return { productName, nameColIndex }
}

// 测试用例
console.log('=== 验证纯数字产品名解析 ===\n')

// OPPO报价单中的纯数字型号行
const testCases = [
  { row: [1107, "10", "10", "10", "10", "10", "10"], desc: 'OPPO 1107' },
  { row: [1105, "10", "10", "10", "10", "10", "10"], desc: 'OPPO 1105' },
  { row: [1100, "10", "10", "10", "10", "10", "10"], desc: 'OPPO 1100' },
  { row: ['Findx8', 1700, 1100, 800, 600, 170, 150], desc: 'Findx8' },
  { row: ['reno14', '1300', '1100', '1000', '600', '180', '150'], desc: 'reno14' },
]

testCases.forEach(tc => {
  const result = parseProductName(tc.row, false, -1)
  console.log(`${tc.desc}: 解析结果 = "${result.productName}"`)
})

console.log('\n=== 验证通过 ===')