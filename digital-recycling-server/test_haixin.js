// 真實 Excel 回歸測試：模擬新的 import 流程對海信.xlsx 的解析
const XLSX = require('xlsx');
const path = require('path');

const filepath = path.join('..', '同行手机回收报价单', '海信.xlsx');
const wb = XLSX.readFile(filepath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

const HEADER_KEYWORDS = ['开机屏好', '开机屏坏', '不开机', '废板'];
const SKIP_COLUMNS = ['网络型号', '序号', '备注'];
const NO_SERIES_MARKERS = ['型号', '序号'];
const SERIES_COLUMN_PATTERN = /^[A-Za-z][\u4e00-\u9fa5]+列$/;

function cleanStr(s) {
  if (s == null) return '';
  return String(s).replace(/\n/g, '').replace(/\r/g, '').trim();
}

function isHeaderRow(row) {
  if (!row || row.length === 0) return false;
  const text = row.map(c => cleanStr(c)).join(' ');
  return HEADER_KEYWORDS.some(kw => text.includes(kw));
}

function parseHeaderRow(row) {
  let seriesName = null;
  const conditions = [];
  let hasModelCode = false;
  let modelCodeColIndex = -1;
  let productNameColIndex = 0;

  for (let i = 0; i < row.length; i++) {
    const val = cleanStr(row[i]);
    if (!val) continue;
    if (SKIP_COLUMNS.includes(val)) {
      if (val === '网络型号') { hasModelCode = true; modelCodeColIndex = i; }
      continue;
    }
    if (i === 0) {
      if (NO_SERIES_MARKERS.includes(val)) {
        seriesName = null;
      } else if (SERIES_COLUMN_PATTERN.test(val)) {
        seriesName = val;
        productNameColIndex = i;
      } else {
        seriesName = val;
        productNameColIndex = i;
      }
      continue;
    }
    if (SERIES_COLUMN_PATTERN.test(val) && !seriesName) {
      seriesName = val;
      productNameColIndex = i;
      continue;
    }
    conditions.push({ name: val, colIndex: i });
  }
  return { seriesName, conditions, hasModelCode, modelCodeColIndex, productNameColIndex };
}

function isValidProductName(productName) {
  if (!productName) return false;
  if (productName.length > 50) return false;
  if (!/[a-zA-Z0-9\u4e00-\u9fa5]/.test(productName)) return false;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(productName)) return false;
  return true;
}

const products = [];
const skipped = [];
let currentSeries = null;
let currentConditions = [];
let hasModelCode = false;
let modelCodeColIndex = -1;
let productNameColIndex = 0;
const headerRows = [];

for (let i = 7; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  if (isHeaderRow(row)) {
    const parsed = parseHeaderRow(row);
    currentSeries = parsed.seriesName;
    currentConditions = parsed.conditions;
    hasModelCode = parsed.hasModelCode;
    modelCodeColIndex = parsed.modelCodeColIndex;
    productNameColIndex = parsed.productNameColIndex;
    headerRows.push({ row: i, series: currentSeries, productNameColIndex, conditionsCount: currentConditions.length });
    continue;
  }
  if (currentConditions.length === 0) continue;
  let productName = '';
  if (hasModelCode) {
    productName = cleanStr(row[productNameColIndex] != null ? row[productNameColIndex] : row[0]);
  } else {
    const sourceVal = productNameColIndex > 0 && row[productNameColIndex] != null
      ? row[productNameColIndex]
      : row[0];
    productName = cleanStr(sourceVal);
  }
  if (!productName) continue;
  if (!isValidProductName(productName)) {
    skipped.push({ row: i, name: productName });
    continue;
  }
  products.push({ row: i, name: productName, series: currentSeries });
}

console.log('=== 海信.xlsx 真實回歸測試（已加 column 識別） ===\n');
console.log('Header 區段偵測：');
for (const h of headerRows) console.log(`  Row ${h.row}: series="${h.series}", productNameCol=${h.productNameColIndex}, conditions=${h.conditionsCount}`);
console.log('');
console.log('總解析產品數:', products.length, '| 跳過數:', skipped.length);
console.log('');
console.log('所有產品名單：');
for (const p of products) console.log(`  Row ${p.row}: "${p.name}" (${p.series || '無系列'})`);

const hasF50 = products.some(p => p.name === 'F50');
const hasF50Plus = products.some(p => p.name === 'F50+');
const hasH60 = products.some(p => p.name === 'H60');
const hasE18Pro = products.some(p => p.name === 'E18Pro');
console.log('\n=== 驗證結果 ===');
console.log('F50    入庫:', hasF50 ? '✅' : '❌');
console.log('F50+   入庫:', hasF50Plus ? '✅' : '❌');
console.log('H60    入庫:', hasH60 ? '✅' : '❌');
console.log('E18Pro 入庫:', hasE18Pro ? '✅' : '❌');
console.log('');
const ok = hasF50 && hasF50Plus && hasH60 && hasE18Pro;
console.log(ok ? '🎉 修復成功：F50+ 與其他型號都正確入庫' : '❌ 仍有問題');
process.exit(ok ? 0 : 1);
