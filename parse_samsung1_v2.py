import pandas as pd

file_path = r'c:\Users\17798\Desktop\陈峰\数码回收\同行手机回收报价单\三星报价单1.xlsx'
df = pd.read_excel(file_path, header=None)

# Find header row - look for "型号" or similar
for i in range(5, 20):
    row = df.iloc[i].tolist()
    text = [str(v)[:50] if pd.notna(v) else 'NA' for v in row]
    print(f"Row {i}: {text}")

print("\n--- Checking max cols ---")
for i in range(len(df)):
    row = df.iloc[i]
    non_null = sum(1 for v in row if pd.notna(v))
    if non_null >= 4:
        print(f"Row {i} has {non_null} non-null: {[str(v)[:50] if pd.notna(v) else 'NA' for v in row.tolist()[:8]]}")