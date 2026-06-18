const XLSX = require('xlsx');
const path = process.argv[2];
const wb = XLSX.readFile(path);
for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log('=== Sheet:', sheetName, 'Total rows:', data.length);
  for (let i = 0; i < data.length; i++) {
    console.log(i + ':', JSON.stringify(data[i]));
  }
}
