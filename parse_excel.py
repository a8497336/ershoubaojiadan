#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析同行手机回收报价单Excel，生成SQL插入语句
"""

import pandas as pd
import os
import re
import math
import json
from datetime import date

DIR_PATH = r'c:\Users\17798\Desktop\陈峰\数码回收\同行手机回收报价单'
OUTPUT_DIR = r'c:\Users\17798\Desktop\陈峰\数码回收'

# brand name -> brand_id mapping (from database)
BRAND_MAP = {
    '苹果': 11, '华为': 9, '小米': 7, 'OPPO': 5, 'VIVO': 6,
    '三星': 10, '魅族': 16, '锤子': 17, '360': 18, 'HTC': 19,
    '黑莓': 20, '一加': 21, '真我': 22, '诺基亚': 23, '美图': 24,
    '乐视': 25, '努比亚': 26, '中国移动': 27, 'TCL': 28, '中兴': 29,
    '8848': 30, '糖果': 31, '步步高': 32, '海信': 33, '朵唯': 34,
    '格力': 35, '摩托罗拉': 36, '华硕': 37, '柔宇': 38, '谷歌': 39,
    '金立': 13, '联想': 14, '酷派': 15,
}

# condition key -> condition_id
CONDITION_MAP = {
    '开机屏好': 1,
    '开机屏坏': 4,
    '不开机': 5,
    '废板整机': 6,
    '废板-整机': 6,
    '开机屏好外屏碎': 7,
    '开机坏未拆标': 8,
    '无ID靓板': 9,
    '无ID不靓板': 10,
    '开机大屏好': 11,
    '开机小屏好': 12,
    '开机屏好配件机': 13,
    '开机屏坏配件机': 14,
    '开机屏好小老化': 15,
    '开机屏好大老化': 16,
    '不开机屏好': 17,
}

# Normalize condition name to standard key
def normalize_condition(name):
    name = str(name).strip().replace('\n', ' ').replace('\r', '')
    # Remove parenthetical notes
    name = re.sub(r'[（(][^)）]*[)）]', '', name).strip()
    name = re.sub(r'\s+', '', name)
    
    # Direct matches
    mapping = {
        '开机屏好': '开机屏好',
        '开机屏好无ID': '开机屏好',
        '开机屏坏': '开机屏坏',
        '开机屏坏无ID': '开机屏坏',
        '不开机': '不开机',
        '废板整机': '废板整机',
        '废板-整机': '废板整机',
        '废板-整机': '废板整机',
        '废板整机': '废板整机',
        '无ID靓板': '无ID靓板',
        '无ID不靓板': '无ID不靓板',
        '开机大屏好': '开机大屏好',
        '开机小屏好': '开机小屏好',
        '开机屏好配件机': '开机屏好配件机',
        '开机屏坏配件机': '开机屏坏配件机',
        '开机屏好小老化': '开机屏好小老化',
        '开机屏好大老化': '开机屏好大老化',
        '不开机屏好': '不开机屏好',
        '开机屏好外屏碎': '开机屏好外屏碎',
        '开机坏未拆标': '开机坏未拆标',
    }
    
    for key, val in mapping.items():
        clean_key = re.sub(r'\s+', '', key)
        if name == clean_key or clean_key in name or name in clean_key:
            return val
    
    return None

def is_number(val):
    """Check if value is a number"""
    if val is None:
        return False
    if isinstance(val, (int, float)):
        return not (isinstance(val, float) and math.isnan(val))
    if isinstance(val, str):
        val = val.strip().replace(',', '').replace('/', '').replace('￥', '')
        if val == '' or val in ['/', '-', '--', '—', '无', '暂无']:
            return False
        try:
            float(val)
            return True
        except:
            return False
    return False

def parse_price(val):
    """Parse price to float or None"""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        if isinstance(val, float) and math.isnan(val):
            return None
        return float(val)
    if isinstance(val, str):
        val = val.strip().replace(',', '').replace('￥', '').replace('¥', '')
        if val == '' or val in ['/', '-', '--', '—', '无', '暂无', 'None']:
            return None
        try:
            return float(val)
        except:
            return None
    return None

def extract_brand_from_filename(filename):
    """Extract brand name from filename"""
    # Remove extension
    name = os.path.splitext(filename)[0]
    # Remove common suffixes
    name = re.sub(r'报价单\d*$', '', name)
    name = re.sub(r'手机.*$', '', name)
    
    # Direct mapping
    keyword_map = {
        '苹果': '苹果', '华为': '华为', '小米': '小米',
        'OPPO': 'OPPO', 'VIVO': 'VIVO', '三星': '三星',
        '魅族': '魅族', '锤子': '锤子', '360': '360',
        'HTC': 'HTC', '黑莓': '黑莓', '一加': '一加',
        '真我': '真我', '诺基亚': '诺基亚', '美图': '美图',
        '乐视': '乐视', '努比亚': '努比亚', '中国移动': '中国移动',
        'TCL': 'TCL', '中兴': '中兴', '8848': '8848',
        '糖果': '糖果', '步步高': '步步高', '海信': '海信',
        '朵唯': '朵唯', '格力': '格力', '摩托罗拉': '摩托罗拉',
        '华硕': '华硕', '柔宇': '柔宇', '谷歌': '谷歌',
        '金立': '金立', '联想': '联想', '酷派': '酷派',
    }
    
    for keyword, brand in keyword_map.items():
        if keyword in name:
            return brand
    
    return name

def is_header_row(row_values):
    """Check if a row is a sub-header (category divider)"""
    non_nan = [v for v in row_values if v is not None and str(v).strip() != '']
    if len(non_nan) == 0:
        return False
    
    # Count non-numeric values
    non_numeric = 0
    for v in non_nan:
        if isinstance(v, str) and not is_number(v):
            non_numeric += 1
    
    # If more than half are non-numeric strings, it's likely a header
    if non_numeric >= len(non_nan) * 0.5:
        # Check if these look like column headers (not model names)
        header_keywords = ['系列', '序号', '型号', '开机', '不开机', '废板', '网络型号', '备注']
        matches = 0
        for v in non_nan:
            for kw in header_keywords:
                if kw in str(v):
                    matches += 1
                    break
        if matches >= 2:
            return True
    
    return False

def extract_category(row_values, col_count):
    """Extract category/series name from a header row"""
    for i in range(min(2, col_count)):
        val = str(row_values[i]) if row_values[i] is not None else ''
        val = val.strip()
        if val and not val.isdigit() and val not in ['序号', '型号', '系列']:
            if not any(kw in val for kw in ['开机', '不开机', '废板', '备注', '网络']):
                return val
    return None

def parse_excel(filepath):
    """Parse a single Excel file, return list of (brand, category, model, model_code, conditions_dict)"""
    filename = os.path.basename(filepath)
    brand = extract_brand_from_filename(filename)
    
    try:
        df = pd.read_excel(filepath, header=None)
    except Exception as e:
        print(f"  ERROR reading {filename}: {e}")
        return []
    
    if df.shape[0] < 8:
        print(f"  SKIP {filename}: too few rows ({df.shape[0]})")
        return []
    
    results = []
    current_category = None
    
    # Parse row 7 to understand column structure
    header_row = [str(v).strip().replace('\n', ' ') if pd.notna(v) else '' for v in df.iloc[7]]
    
    # Map each column index to a condition key (or special marker)
    col_mapping = {}  # col_index -> condition_key
    has_network_model = False
    network_model_col = None
    model_col = None
    category_col = None
    
    for i, h in enumerate(header_row):
        h_clean = h.strip()
        if not h_clean:
            continue
        
        if h_clean in ['序号', 'No', 'NO']:
            continue
        if h_clean in ['备注', 'Remarks', '看外观点数', '点数', '网络型号']:
            if '网络型号' in h_clean:
                has_network_model = True
                network_model_col = i
            continue
        
        norm = normalize_condition(h_clean)
        if norm and norm in CONDITION_MAP:
            col_mapping[i] = norm
        elif '型号' in h_clean or '系列' in h_clean or '折叠' in h_clean or 'Find' in h_clean or 'X系列' in h_clean or 'S系列' in h_clean or 'W系列' in h_clean or 'Z系列' in h_clean or 'P系列' in h_clean or 'Mate' in h_clean or 'Nova' in h_clean or 'ivvi' in h_clean or '系列' in h_clean or '糖果' in h_clean or '诺基亚' in h_clean or 'Google' in h_clean or 'G系列' in h_clean or 'H系列' in h_clean or 'V系列' in h_clean or 'Zen' in h_clean or '数字' in h_clean:
            if model_col is None:
                model_col = i
                category_col = i
                # The first column might be a category/series column
                if '系列' in h_clean or '折叠' in h_clean or 'Find' in h_clean or '糖果' in h_clean or '诺基亚' in h_clean or 'Google' in h_clean:
                    category_col = i
                    model_col = i  # In these formats, first col is both category and model
    
    # Handle special case: files with explicit "型号" column
    has_explicit_model = False
    for i, h in enumerate(header_row):
        if '型号' == h.strip():
            model_col = i
            has_explicit_model = True
            break
    
    # Also check if col 1 is a model column for common patterns
    if model_col is None and len(header_row) >= 2:
        # Common pattern: [序号/系列, 型号, conditions...]
        col0 = header_row[0].strip()
        col1 = header_row[1].strip()
        if '型号' == col1:
            model_col = 1
            has_explicit_model = True
        elif '型号' == col0:
            model_col = 0
            has_explicit_model = True
    
    # For files with network model column (like 华为), the model columns are different
    if has_network_model and network_model_col is not None:
        model_col = 0  # First column is model (or category+model)
        network_model_col = 1
    
    # Handle 摩托罗拉 (序号, G系列, ...)
    if '序号' in str(header_row[0]) and model_col is None:
        model_col = 1
    
    # Default: col 0 or 1 is model
    if model_col is None:
        for i in range(min(3, len(header_row))):
            h = header_row[i].strip()
            if h and h not in ['序号', '网络型号'] and h not in col_mapping:
                model_col = i
                break
    
    if model_col is None:
        model_col = 0
    
    # Special handling for 诺基亚, 谷歌, 糖果 etc. where col 1 is a repeating brand name
    skip_col_1_brand = filename in ['诺基亚.xlsx', '谷歌.xlsx', '糖果.xlsx']
    
    print(f"  Brand: {brand}, cols: {len(header_row)}, model_col: {model_col}, "
          f"net_model_col: {network_model_col}, conditions: {list(col_mapping.keys())} -> {list(col_mapping.values())}")
    
    # Process data rows (row 8 onwards)
    for row_idx in range(8, df.shape[0]):
        row = df.iloc[row_idx]
        row_values = [v if pd.notna(v) else None for v in row]
        
        # Skip fully empty rows
        non_empty = [v for v in row_values if v is not None and str(v).strip() != '']
        if len(non_empty) == 0:
            continue
        
        # Check if this is a sub-header row
        if is_header_row(row_values):
            cat = extract_category(row_values, len(header_row))
            if cat:
                current_category = cat
                print(f"    New category: {current_category} (row {row_idx})")
            continue
        
        # Extract model name
        model_name = None
        model_code = None
        
        if model_col is not None and model_col < len(row_values):
            model_name = row_values[model_col]
            if model_name is not None:
                model_name = str(model_name).strip().replace('\n', ' ').replace('\r', '')
                if model_name in ['', '/', '-', '—', 'nan', 'None']:
                    model_name = None
        
        if network_model_col is not None and network_model_col < len(row_values):
            model_code = row_values[network_model_col]
            if model_code is not None:
                model_code = str(model_code).strip().replace('\n', ' ').replace('\r', '')
                if model_code in ['', '/', '-', '—', 'nan', 'None']:
                    model_code = None
        
        if model_name is None:
            continue
        
        # Skip if model_name looks like a column header
        if any(model_name == h.strip() for h in header_row):
            continue
        
        # Build conditions dict
        conditions = {}
        for col_idx, cond_key in col_mapping.items():
            if col_idx < len(row_values):
                price = parse_price(row_values[col_idx])
                if price is not None:
                    conditions[cond_key] = price
        
        if conditions:
            results.append({
                'brand': brand,
                'category': current_category,
                'model': model_name,
                'model_code': model_code,
                'conditions': conditions
            })
    
    return results

def main():
    files = sorted([f for f in os.listdir(DIR_PATH) if f.endswith('.xlsx')])
    
    all_data = []
    stats = {}
    
    for f in files:
        filepath = os.path.join(DIR_PATH, f)
        print(f'\n=== Processing: {f} ===')
        data = parse_excel(filepath)
        brand = extract_brand_from_filename(f)
        stats[f] = len(data)
        all_data.extend(data)
        print(f'  Parsed {len(data)} entries')
    
    print(f'\n=== Summary ===')
    print(f'Total files: {len(files)}')
    print(f'Total entries: {len(all_data)}')
    for f, cnt in sorted(stats.items()):
        print(f'  {f}: {cnt}')
    
    # Generate SQL
    effective_date = date.today().isoformat()
    
    # Generate as Python list for easier manipulation
    output = {
        'data': all_data,
        'effective_date': effective_date,
        'stats': stats
    }
    
    with open(os.path.join(OUTPUT_DIR, 'parsed_data.json'), 'w', encoding='utf-8') as fout:
        json.dump(output, fout, ensure_ascii=False, indent=2, default=str)
    
    print(f'\nData saved to parsed_data.json')
    print(f'Total models with prices: {len(all_data)}')
    
    # Count unique models per brand
    brand_models = {}
    for d in all_data:
        b = d['brand']
        if b not in brand_models:
            brand_models[b] = set()
        brand_models[b].add(d['model'])
    
    print('\nUnique models per brand:')
    for b in sorted(brand_models.keys()):
        print(f'  {b}: {len(brand_models[b])}')

if __name__ == '__main__':
    main()
