const XLSX = require('xlsx');
const path = process.argv[2] || '..\\同行手机回收报价单\\海信.xlsx';
const wb = XLSX.readFile(path);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log('Sheets:', wb.SheetNames);
console.log('Total rows:', data.length);
for (let i = 0; i < data.length; i++) {
  console.log(i + ':', JSON.stringify(data[i]));
}
