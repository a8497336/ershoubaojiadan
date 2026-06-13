const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', '同行手机回收报价单', 'OPPO报价单.xlsx');
console.log('读取文件:', filePath);

const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, {header:1});

console.log('总行数:', data.length);
console.log('\n=== 前20行内容 ===');
data.slice(0, 20).forEach((row, i) => console.log(i + ':', JSON.stringify(row)));

// 查找1107, 1105, 1100相关行
console.log('\n=== 搜索型号1107, 1105, 1100 ===');
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const rowStr = JSON.stringify(row);
  if (rowStr.includes('1107') || rowStr.includes('1105') || rowStr.includes('1100')) {
    console.log(`行${i}:`, rowStr);
  }
}

// 打印列标题（第7行附近，即索引6）
console.log('\n=== 列标题（第7行） ===');
if (data[6]) {
  console.log(JSON.stringify(data[6]));
}

// 打印数据行示例
console.log('\n=== 产品数据行示例 ===');
for (let i = 7; i < Math.min(30, data.length); i++) {
  if (data[i] && data[i].length > 0) {
    console.log(`行${i}:`, JSON.stringify(data[i]));
  }
}