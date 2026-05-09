import json

data = json.load(open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', encoding='utf-8'))
condition_ids = [1, 11, 12, 4, 5, 6]

# Products 860-868 correspond to data indices 480-488
lines = []
for i in range(480, 489):
    product_id = 380 + i
    entry = data[i]
    prices = entry['prices']
    model = entry['model']
    print(f'Product {product_id}: {model}, prices={prices}')
    for j, price in enumerate(prices):
        if price is not None and price >= 2:
            cond_id = condition_ids[j]
            lines.append(f"({product_id}, {cond_id}, {price}, '2026-05-08', NOW(), NOW())")

if lines:
    sql = "INSERT IGNORE INTO prices (product_id, condition_id, price, effective_date, created_at, updated_at) VALUES\n" + ",\n".join(lines) + ";"
    with open(r'c:\Users\17798\Desktop\陈峰\数码回收\hw_final.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f'\nGenerated {len(lines)} entries for products 860-868')
    print(f'Written to hw_final.sql')
else:
    print('No entries to generate')