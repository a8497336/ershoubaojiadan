import json

brands_data = {
    30: [  # 8848
        ('M6', [100, 40, 40, 40]),
        ('M5至尊', [40, 40, 40, 40]),
        ('M5', [40, 40, 40, 40]),
        ('灵感M5+', [40, 40, 40, 40]),
        ('M4', [40, 40, 40, 40]),
        ('M3', [40, 35, 35, 30]),
        ('M2', [25, 25, 25, 25]),
    ],
    32: [  # 步步高
        ('Imoo get', [30, 30, 30, 30]),
        ('Imoo c1', [30, 30, 30, 30]),
    ],
    17: [  # 锤子
        ('锤子Pro3', [150, 150, 150, 130]),
        ('坚果R2', [200, 180, 150, 150]),
        ('锤子Pro2s', [100, 100, 100, 100]),
        ('R1', [80, 80, 80, 80]),
        ('坚果3', [80, 80, 80, 80]),
        ('坚果2', [80, 80, 80, 80]),
        ('锤子Pro2', [100, 100, 100, 100]),
        ('锤子Pro', [80, 80, 80, 80]),
        ('坚果3 64', [100, 100, 100, 100]),
        ('坚果3 128', [100, 100, 100, 100]),
        ('锤子M1', [130, 130, 130, 130]),
        ('坚果', [30, 30, 30, 30]),
        ('锤子T2', [25, 25, 25, 25]),
        ('锤子T1', [25, 25, 25, 25]),
    ],
    34: [  # 朵唯
        ('朵唯D9 pro', [60, 60, 60, 60]),
        ('X11proM', [60, 60, 60, 60]),
        ('K10pro', [60, 60, 60, 60]),
        ('M30', [60, 60, 60, 60]),
        ('M40Pro', [60, 60, 60, 60]),
        ('M2', [20, 20, 20, 20]),
        ('L9mini/C32', [30, 30, 30, 30]),
        ('L9', [60, 60, 60, 60]),
        ('L8plus/C27', [30, 30, 30, 30]),
        ('L825/C38', [30, 30, 30, 30]),
        ('L7/C24', [30, 30, 30, 30]),
        ('L5P/C19', [30, 30, 30, 30]),
        ('L5m/C22', [30, 30, 30, 30]),
        ('L520/C38', [100, 100, 100, 100]),
        ('A8', [100, 100, 100, 100]),
        ('A6/C25', [50, 50, 50, 50]),
        ('A55/Q5801', [50, 50, 50, 50]),
        ('A5/C29', [50, 50, 50, 50]),
        ('A15/C36', [50, 50, 50, 50]),
        ('A12/C34', [50, 50, 50, 50]),
        ('A11/C33', [50, 50, 50, 50]),
        ('A10/C35', [50, 50, 50, 50]),
        ('525', [100, 100, 100, 100]),
        ('520', [100, 100, 100, 100]),
        ('S5/C20', [30, 30, 30, 30]),
        ('L5P/C21', [30, 30, 30, 30]),
        ('L3c/C17', [30, 30, 30, 30]),
        ('L1/C14', [30, 30, 30, 30]),
        ('P70', [80, 80, 80, 80]),
        ('逆客V8', [30, 30, 30, 30]),
        ('逆客V5', [30, 30, 30, 30]),
        ('逆客V3', [25, 25, 25, 25]),
        ('逆客V1', [25, 25, 25, 25]),
    ],
    35: [  # 格力
        ('格力3代', [45, 45, 45, 45]),
        ('格力2代', [55, 55, 55, 55]),
        ('格力1代', [20, 20, 20, 20]),
    ],
}

conditions = [1, 4, 5, 6]  # 开机屏好, 开机屏坏, 不开机, 废板整机

output = {
    'brands_data': {},
    'conditions': conditions,
}

for bid, items in brands_data.items():
    models_list = []
    prices_entries = []
    for name, prices in items:
        models_list.append(name)
        for ci, cond_id in enumerate(conditions):
            prices_entries.append({
                'model': name,
                'condition_id': cond_id,
                'price': prices[ci]
            })
    output['brands_data'][str(bid)] = {
        'models': models_list,
        'prices': prices_entries,
        'count': len(models_list)
    }

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\import_5_data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

# Now generate and print SQL
lines = []
for bid, items in brands_data.items():
    count = len(items)
    print(f'Brand {bid}: {count} models, {count * 4} prices')
    lines.append(f'-- Brand {bid} ({count} models)')
    for name, _ in items:
        escaped = name.replace("'", "\\'")
        lines.append(f"({bid}, 1, '{escaped}', NOW(), NOW())")

# Print product SQL
print('\n=== PRODUCTS INSERT SQL ===')
print('INSERT IGNORE INTO products (brand_id, category_id, name, created_at, updated_at) VALUES')
print(',\n'.join(lines) + ';')

total = sum(len(v) for v in brands_data.values())
print(f'\nTotal: {total} products, {total * 4} prices')
