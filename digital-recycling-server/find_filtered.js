const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = path.join('..', '同行手机回收报价单');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx') && !f.startsWith('_'));

function hasValidChinese(text) {
  if (!text) return false;
  if (/^[a-zA-Z0-9]+$/.test(text)) return true;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const totalChars = text.replace(/[\x00-\x1F]/g, '').length;
  return totalChars > 0 && chineseChars / totalChars > 0.1;
}

function isValidProductName(productName) {
  if (!productName) return false;
  // 长度上限：防止描述性长文本混入
  if (productName.length > 50) return false;
  // 必须包含至少一个字母 / 数字 / 中文
  if (!/[a-zA-Z0-9\u4e00-\u9fa5]/.test(productName)) return false;
  // 排除明显乱码
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(productName)) return false;
  return true;
}

const HEADER_KEYWORDS = ['开机屏好', '开机屏坏', '不开机', '废板'];
const NO_SERIES_MARKERS = ['型号', '序号'];

function cleanStr(s) {
  if (s == null) return '';
  return String(s).replace(/\n/g, '').replace(/\r/g, '').trim();
}

function isHeaderRow(row) {
  if (!row || row.length === 0) return false;
  const text = row.map(c => cleanStr(c)).join(' ');
  return HEADER_KEYWORDS.some(kw => text.includes(kw));
}

const allFiltered = [];

for (const f of files) {
  const filepath = path.join(dir, f);
  let wb;
  try {
    wb = XLSX.readFile(filepath);
  } catch (e) {
    console.log('  [skip] ' + f + ' parse failed: ' + e.message);
    continue;
  }
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  let currentSeries = null;
  for (let i = 7; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    if (isHeaderRow(row)) {
      const first = cleanStr(row[0]);
      currentSeries = (first && !NO_SERIES_MARKERS.includes(first)) ? first : null;
      continue;
    }
    const productName = cleanStr(row[0]);
    if (!productName) continue;
    if (!isValidProductName(productName)) {
      allFiltered.push({ file: f, series: currentSeries, name: productName });
    }
  }
}

console.log('\nTotal filtered: ' + allFiltered.length);
for (const item of allFiltered) {
  console.log('  [' + item.file + '] series=' + item.series + ' -> "' + item.name + '"');
}