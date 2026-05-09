import json

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

product_ids = list(range(380, 380 + len(data)))
condition_ids = [1, 11, 12, 4, 5, 6]

vals = []
for i in range(30, len(data)):
    pid = product_ids[i]
    prices = data[i]['prices']
    for ci_idx, cond_id in enumerate(condition_ids):
        price = prices[ci_idx]
        if price is not None and price >= 2:
            vals.append((pid, cond_id, price))

print('Remaining: %d entries' % len(vals))
if vals:
    print('Product IDs: %d to %d' % (vals[0][0], vals[-1][0]))

batch_size = 90
for g in range((len(vals) + batch_size - 1) // batch_size):
    start = g * batch_size
    end = min(start + batch_size, len(vals))
    chunk = vals[start:end]
    
    fname = r'c:\Users\17798\Desktop\陈峰\数码回收\hw_rem_%d.sql' % g
    with open(fname, 'w', encoding='utf-8') as f:
        f.write('INSERT IGNORE INTO prices (product_id, condition_id, price, effective_date, created_at, updated_at) VALUES\n')
        lines = []
        for pid, cond_id, price in chunk:
            lines.append("(%d, %d, %s, '2026-05-08', NOW(), NOW())" % (pid, cond_id, price))
        f.write(',\n'.join(lines) + ';')
    
    print('Batch %d: %d entries (products %d-%d)' % (g, len(chunk), chunk[0][0], chunk[-1][0]))