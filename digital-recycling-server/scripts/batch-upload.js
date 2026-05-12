const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const axios = require('axios')

const DIR = path.resolve(__dirname, '..', '..', '同行手机回收报价单')
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzc4Mzg2OTQ2LCJleHAiOjE3Nzg0NzMzNDZ9.KMnN5jVRxkFo3MUk396F-Z4hRpDdoEqeqhmEV7Q9x7s'
const URL = 'http://localhost:3000/api/admin/products/import'

async function uploadFile(filePath) {
  const fileName = path.basename(filePath)
  const form = new FormData()
  form.append('file', fs.createReadStream(filePath), fileName)

  try {
    const res = await axios.post(URL, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${TOKEN}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })
    return { fileName, ok: true, data: res.data }
  } catch (err) {
    return { fileName, ok: false, error: err.response?.data || err.message }
  }
}

async function main() {
  const allFiles = fs.readdirSync(DIR).filter(f => f.endsWith('.xlsx') && f !== '_temp_import.xlsx')
  console.log(`共找到 ${allFiles.length} 个 Excel 文件\n`)

  const totals = { brands: 0, products: 0, conditions: 0, prices: 0, success: 0, fail: 0 }
  const failed = []

  for (const fileName of allFiles) {
    const filePath = path.join(DIR, fileName)
    console.log(`[${totals.success + totals.fail + 1}/${allFiles.length}] 正在导入: ${fileName}`)

    const result = await uploadFile(filePath)
    if (result.ok && result.data.code === 0) {
      const d = result.data.data
      console.log(`  ✅ 成功 | 品牌: ${d.brandName || '?'} | 产品: ${d.products} | 条件: ${d.conditions} | 价格: ${d.prices}`)
      totals.products += (d.products || 0)
      totals.conditions += (d.conditions || 0)
      totals.prices += (d.prices || 0)
      totals.success++
    } else {
      console.log(`  ❌ 失败: ${JSON.stringify(result.error || result.data)}`)
      totals.fail++
      failed.push({ fileName, error: result.error || result.data })
    }
  }

  console.log(`\n========== 导入汇总 ==========`)
  console.log(`成功: ${totals.success} 个, 失败: ${totals.fail} 个`)
  console.log(`总产品数: ${totals.products}`)
  console.log(`总条件数: ${totals.conditions}`)
  console.log(`总价格数: ${totals.prices}`)

  if (failed.length > 0) {
    console.log(`\n失败文件:`)
    failed.forEach(f => console.log(`  - ${f.fileName}: ${JSON.stringify(f.error)}`))
  }

  fs.writeFileSync(path.join(__dirname, 'import-result.json'), JSON.stringify({ totals, failed }, null, 2))
  console.log(`\n结果已保存到 import-result.json`)
}

main().catch(console.error)