import json

with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Product IDs: 380-868 (first item is row 8 = id 380)
# Since we used INSERT IGNORE and the order is the same, IDs are sequential starting from 380
product_ids = list(range(380, 380 + len(data)))

# Conditions: col2=开机屏好(1), col3=开机大屏好(11), col4=开机小屏好(12), col5=开机屏坏(4), col6=不开机(5), col7=废板整机(6)
condition_ids = [1, 11, 12, 4, 5, 6]

# Generate price INSERT SQL in batches
batch_size = 20
total_prices = 0

for batch_num in range((len(data) + batch_size - 1) // batch_size):
    start = batch_num * batch_size
    end = min(start + batch_size, len(data))
    
    with open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_price_batch_%d.sql' % batch_num, 'w', encoding='utf-8') as f:
        f.write('INSERT INTO prices (product_id, condition_id, price, effective_date, created_at, updated_at) VALUES\n')
        vals = []
        for i in range(start, end):
            pid = product_ids[i]
            prices = data[i]['prices']  # 6 values: [col2, col3, col4, col5, col6, col7]
            for ci_idx, cond_id in enumerate(condition_ids):
                price = prices[ci_idx]
                if price is not None:
                    vals.append("(%d, %d, %s, '2026-05-08', NOW(), NOW())" % (pid, cond_id, price))
                    total_prices += 1
        f.write(',\n'.join(vals) + ';')
    
    print('Batch %d: products %d-%d (%d products, %d price entries)' % (batch_num, start+1, end, end-start, len(vals)))

print('Total price entries: %d' % total_prices)