import json
data = json.load(open(r'c:\Users\17798\Desktop\陈峰\数码回收\huawei_data.json', encoding='utf-8'))
print(f'Total entries: {len(data)}')
last = data[-20:]
for e in last:
    print(f'idx={e["row"]}, model={e["model"]}, prices={e["prices"]}')