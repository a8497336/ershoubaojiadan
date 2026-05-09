import json

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Total: {len(data)} products')

# Write INSERT SQL to a file
with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_products.sql', 'w', encoding='utf-8') as f:
    f.write('INSERT IGNORE INTO products (brand_id, category_id, name, created_at, updated_at) VALUES\n')
    vals = []
    for item in data:
        name = item['model'].replace("'", "''")
        vals.append(f"(9, 1, '{name}', NOW(), NOW())")
    f.write(',\n'.join(vals) + ';')

print(f'Written {len(data)} products to huawei_products.sql')

# Write products data for price inserts
products_list = []
for item in data:
    products_list.append({
        'row': item['row'],
        'name': item['model'],
        'prices': item['prices']
    })

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_products.json', 'w', encoding='utf-8') as f:
    json.dump(products_list, f, ensure_ascii=False, indent=2)

print('Done')