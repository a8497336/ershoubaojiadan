import json

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

product_ids = list(range(380, 380 + len(data)))
condition_ids = [1, 11, 12, 4, 5, 6]

batch_size = 15
total_prices = 0

for batch_num in range((len(data) + batch_size - 1) // batch_size):
    start = batch_num * batch_size
    end = min(start + batch_size, len(data))
    
    with open(r'c:\Users\17798\Desktop\陈峰\数码回收\hw_price_%d.sql' % batch_num, 'w', encoding='utf-8') as f:
        f.write('INSERT INTO prices (product_id, condition_id, price, effective_date, created_at, updated_at) VALUES\n')
        vals = []
        for i in range(start, end):
            pid = product_ids[i]
            prices = data[i]['prices']
            for ci_idx, cond_id in enumerate(condition_ids):
                price = prices[ci_idx]
                # Only insert if price is not None and >= 2 (skip placeholder values like 1)
                if price is not None and price >= 2:
                    vals.append("(%d, %d, %s, '2026-05-08', NOW(), NOW())" % (pid, cond_id, price))
                    total_prices += 1
        f.write(',\n'.join(vals) + ';')
    
    print('Batch %d: products %d-%d (%d entries)' % (batch_num, start+1, end, len(vals)))

print('Total: %d price entries' % total_prices)