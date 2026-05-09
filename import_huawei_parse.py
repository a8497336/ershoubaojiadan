import pandas as pd
import re, math

filepath = r'c:\Users\17798\Desktop\陈峰\数码回收\同行手机回收报价单\华为报价单.xlsx'
df = pd.read_excel(filepath, header=None)

# Header row is row 7, conditions: col 2=开机屏好, col 3=开机大屏好, col 4=开机小屏好, col 5=开机屏坏, col 6=不开机, col 7=废板整机
# col 0 = 型号/系列名, col 1 = 网络型号

def is_number(val):
    if val is None: return False
    if isinstance(val, (int, float)):
        return not (isinstance(val, float) and math.isnan(val))
    if isinstance(val, str):
        val = val.strip().replace(',', '').replace('/', '')
        if val == '' or val in ['-', '--', '—', '无', '暂无']:
            return False
        try:
            float(val)
            return True
        except:
            return False
    return False

def parse_price(val):
    if val is None: return None
    if isinstance(val, (int, float)):
        if isinstance(val, float) and math.isnan(val): return None
        return float(val)
    if isinstance(val, str):
        val = val.strip().replace(',', '').replace('/', '')
        if val == '' or val in ['-', '--', '—', '无', '暂无']:
            return None
        try:
            return float(val)
        except:
            return None
    return None

def is_header_row(row):
    non_nan = [v for v in row if v is not None and str(v).strip() != '']
    if len(non_nan) == 0: return False
    # Check if it's a header row (has header keywords but most values are strings)
    numeric_count = sum(1 for v in non_nan if is_number(v))
    if numeric_count >= 2:  # More than 2 numbers -> data row
        return False
    header_kws = ['开机屏好', '开机屏坏', '不开机', '废板', '网络型号']
    matches = sum(1 for v in non_nan for kw in header_kws if kw in str(v))
    return matches >= 2

results = []
for i in range(8, df.shape[0]):
    row = df.iloc[i]
    vals = [v if pd.notna(v) else None for v in row]

    # Skip header rows and footer rows
    if is_header_row(vals): continue

    # Must have at least one price
    prices = [parse_price(vals[j]) for j in range(2, 8)]
    price_count = sum(1 for p in prices if p is not None)
    if price_count < 2: continue

    model_name = vals[0]
    if model_name is None: continue
    model_name = str(model_name).strip().replace('\n', ' ').replace('\r', '')
    if model_name in ['', '/', '-', '—', 'nan', 'None']: continue
    if '网络型号' in model_name: continue
    if '系列' in model_name and price_count < 2: continue

    # Skip if model looks like a column header
    header_kws = ['序号', '型号', '开机屏好', '开机屏坏', '不开机', '废板']
    if any(kw == model_name for kw in header_kws): continue

    results.append({
        'row': i,
        'model': model_name,
        'prices': prices  # [col2, col3, col4, col5, col6, col7]
    })

print(f'Total data rows: {len(results)}')
for r in results:
    prices_str = ', '.join([str(p) if p is not None else 'None' for p in r['prices']])
    print(f"R{r['row']}: {r['model']} | {prices_str}")

# Save to JSON for processing
import json
with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f'\nSaved {len(results)} entries to huawei_data.json')