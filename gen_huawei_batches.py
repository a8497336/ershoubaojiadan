import json

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Split into batches of 100
batch_size = 100
for batch_num in range((len(data) + batch_size - 1) // batch_size):
    start = batch_num * batch_size
    end = min(start + batch_size, len(data))
    batch = data[start:end]
    
    with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_prod_batch_%d.sql' % batch_num, 'w', encoding='utf-8') as f:
        f.write('INSERT IGNORE INTO products (brand_id, category_id, name, created_at, updated_at) VALUES\n')
        vals = []
        for item in batch:
            name = item['model'].replace("'", "''")
            vals.append("(9, 1, '%s', NOW(), NOW())" % name)
        f.write(',\n'.join(vals) + ';')
    
    print(f'Batch {batch_num}: rows {start+1}-{end} ({len(batch)} products)')

print(f'Total: {len(data)} products in {(len(data)+batch_size-1)//batch_size} batches')