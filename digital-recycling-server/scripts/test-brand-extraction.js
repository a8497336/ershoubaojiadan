/**
 * 测试脚本：验证所有34个Excel文件名的品牌名提取
 * 运行：node scripts/test-brand-extraction.js
 */
const path = require('path')
const fs = require('fs')
const iconv = require('iconv-lite')

// ========== 从 product-manage.js 复制的核心函数 ==========

const BRAND_STYLE_MAP = {
  '热门老年机': { icon_text: '老年', bg_color: 'bg-xiaomi' },
  '智能机/电容屏': { icon_text: '智能', bg_color: 'bg-apple' },
  '手机拆机件': { icon_text: '拆机', bg_color: 'bg-huawei' },
  '电池': { icon_text: '电池', bg_color: 'bg-blackberry' },
  'OPPO': { icon_text: 'OP', bg_color: 'bg-oppo' },
  'VIVO': { icon_text: 'V', bg_color: 'bg-vivo' },
  '小米': { icon_text: 'mi', bg_color: 'bg-xiaomi' },
  '华为OK板': { icon_text: 'HW', bg_color: 'bg-huawei' },
  '华为': { icon_text: 'HW', bg_color: 'bg-huawei' },
  '三星': { icon_text: 'S', bg_color: 'bg-samsung' },
  '苹果': { icon_text: '苹果', bg_color: 'bg-apple' },
  '高仿苹果': { icon_text: '高仿', bg_color: 'bg-apple' },
  '金立': { icon_text: 'G', bg_color: 'bg-jinli' },
  '联想': { icon_text: 'L', bg_color: 'bg-lenovo' },
  '酷派/ivvi': { icon_text: 'cool', bg_color: 'bg-coolpad' },
  '酷派': { icon_text: 'cool', bg_color: 'bg-coolpad' },
  '魅族': { icon_text: 'M', bg_color: 'bg-meizu' },
  '锤子': { icon_text: 'T', bg_color: 'bg-smartisan' },
  '360': { icon_text: '+', bg_color: 'bg-360' },
  'HTC': { icon_text: 'htc', bg_color: 'bg-htc' },
  '黑莓': { icon_text: '黑莓', bg_color: 'bg-blackberry' },
  '一加': { icon_text: '1+', bg_color: 'bg-oneplus' },
  '真我/realme': { icon_text: 'R', bg_color: 'bg-realme' },
  '真我': { icon_text: 'R', bg_color: 'bg-realme' },
  '诺基亚': { icon_text: 'N', bg_color: 'bg-nokia' },
  '美图': { icon_text: 'M', bg_color: 'bg-meitu' },
  '乐视': { icon_text: 'L', bg_color: 'bg-leeco' },
  '努比亚': { icon_text: 'n', bg_color: 'bg-nubia' },
  '中国移动': { icon_text: '移动', bg_color: 'bg-chinamobile' },
  'TCL': { icon_text: 'T', bg_color: 'bg-tcl' },
  '中兴': { icon_text: 'Z', bg_color: 'bg-zte' },
  '8848': { icon_text: '8848', bg_color: 'bg-8848' },
  '糖果/国美': { icon_text: 'GOME', bg_color: 'bg-sugar' },
  '糖果': { icon_text: 'GOME', bg_color: 'bg-sugar' },
  '步步高': { icon_text: '步步', bg_color: 'bg-bbk' },
  '海信': { icon_text: 'H', bg_color: 'bg-hisense' },
  '朵唯': { icon_text: 'D', bg_color: 'bg-doov' },
  '格力': { icon_text: 'G', bg_color: 'bg-gree' },
  '摩托罗拉': { icon_text: 'M', bg_color: 'bg-moto' },
  '华硕': { icon_text: 'A', bg_color: 'bg-asus' },
  '柔宇': { icon_text: '柔', bg_color: 'bg-royole' },
  '谷歌Google': { icon_text: 'G', bg_color: 'bg-google' },
  '谷歌': { icon_text: 'G', bg_color: 'bg-google' }
}

function hasValidChinese(text) {
  if (!text) return false
  if (/^[a-zA-Z0-9]+$/.test(text)) return true
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const totalChars = text.replace(/[\x00-\u1F]/g, '').length
  return totalChars > 0 && chineseChars / totalChars > 0.1
}

function isGarbledText(text) {
  if (!text) return false
  if (/^[a-zA-Z0-9]+$/.test(text)) return false
  return !hasValidChinese(text) && /[\x80-\xFF]/.test(text)
}

function fixGarbledFilename(garbledStr) {
  try {
    const utf8String = Buffer.from(garbledStr, 'latin1').toString('utf8')
    if (hasValidChinese(utf8String)) return utf8String
  } catch (e) {}
  try {
    const latin1Buffer = Buffer.from(garbledStr, 'latin1')
    const gbkString = iconv.decode(latin1Buffer, 'gbk')
    if (hasValidChinese(gbkString)) return gbkString
  } catch (e) {}
  try {
    const gbkString = iconv.decode(Buffer.from(garbledStr, 'binary'), 'gbk')
    if (hasValidChinese(gbkString)) return gbkString
  } catch (e) {}
  try {
    const utf16leString = Buffer.from(garbledStr, 'latin1').toString('utf16le')
    if (hasValidChinese(utf16leString)) return utf16leString
  } catch (e) {}
  try {
    const latin1Buffer = Buffer.from(garbledStr, 'latin1')
    const big5String = iconv.decode(latin1Buffer, 'big5')
    if (hasValidChinese(big5String)) return big5String
  } catch (e) {}
  try {
    const gbkString = iconv.decode(Buffer.from(garbledStr), 'gbk')
    if (hasValidChinese(gbkString)) return gbkString
  } catch (e) {}
  try {
    const extracted = garbledStr.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim()
    if (extracted && hasValidChinese(extracted)) return extracted
  } catch (e) {}
  return null
}

function cleanBrandName(name) {
  name = name
    .replace(/报价单/g, '')
    .replace(/手机/g, '')
    .replace(/回收/g, '')
    .trim()
  if (/^\d+$/.test(name)) return name
  return name.replace(/\d+$/g, '').trim()
}

function extractBrandName(filename) {
  let name = filename
    .replace(/\.xlsx$/i, '')
    .trim()
  if (!name) return ''
  if (hasValidChinese(name)) return cleanBrandName(name)
  if (/^[a-zA-Z0-9]+$/.test(name)) return cleanBrandName(name)
  if (isGarbledText(name)) {
    const recovered = fixGarbledFilename(name)
    if (recovered) return cleanBrandName(recovered)
    return ''
  }
  return cleanBrandName(name)
}

// ========== 测试 ==========

const dir = path.resolve('e:/数码回收/同行手机回收报价单')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'))

console.log('='.repeat(60))
console.log('测试所有文件名（正常编码）')
console.log('='.repeat(60))

let pass = 0
let fail = 0

for (const file of files) {
  const result = extractBrandName(file)
  const status = result ? '✓' : '✗'
  if (result) pass++; else fail++
  console.log(`${status} ${file.padEnd(30)} → "${result}"`)
}

console.log('\n' + '='.repeat(60))
console.log('测试乱码文件名（模拟multer接收）')
console.log('='.repeat(60))

// 模拟GBK文件名被multer按Latin-1解释的场景
const garbledTests = [
  { orig: '华为报价单.xlsx', garbled: generateGarbledGBK('华为报价单') + '.xlsx', expect: '华为' },
  { orig: '魅族报价单.xlsx', garbled: generateGarbledGBK('魅族报价单') + '.xlsx', expect: '魅族' },
  { orig: '小米报价单.xlsx', garbled: generateGarbledGBK('小米报价单') + '.xlsx', expect: '小米' },
  { orig: '360报价单.xlsx', garbled: generateGarbledGBK('360报价单') + '.xlsx', expect: '360' },
]

function generateGarbledGBK(chinese) {
  const gbkBuf = iconv.encode(chinese, 'gbk')
  return gbkBuf.toString('latin1')
}

for (const t of garbledTests) {
  // Test with normal name
  const normal = extractBrandName(t.orig)
  const nStatus = normal === t.expect ? '✓' : '✗'
  
  // Test with garbled name
  const garbled = extractBrandName(t.garbled)
  const gStatus = garbled === t.expect ? '✓' : '✗'
  
  console.log(`正常: ${nStatus} "${t.orig}" → "${normal}" (期望: "${t.expect}")`)
  console.log(`乱码: ${gStatus} "${t.garbled}" → "${garbled}" (期望: "${t.expect}")`)
}

// 专门测试 æµå¯ 乱码检测
console.log('\n' + '='.repeat(60))
console.log('专门测试 æµå¯ 乱码检测')
console.log('='.repeat(60))
const aeTest = 'æµå¯报价单.xlsx'
console.log(`isGarbledText("æµå¯"): ${isGarbledText('æµå¯')}`)
console.log(`fixGarbledFilename("æµå¯"): "${fixGarbledFilename('æµå¯')}"`)
console.log(`extractBrandName("${aeTest}"): "${extractBrandName(aeTest)}"`)

console.log('\n' + '='.repeat(60))
console.log(`结果: ${pass} 通过, ${fail} 失败 (共 ${files.length} 个文件)`)
console.log('='.repeat(60))