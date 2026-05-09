import pandas as pd

file_path = r'c:\Users\17798\Desktop\陈峰\数码回收\同行手机回收报价单\三星报价单1.xlsx'
df = pd.read_excel(file_path, header=None)
print("Shape:", df.shape)
print("Columns:", list(df.columns))
print()
for i in range(min(5, len(df))):
    print(f"Row {i}: {[str(v)[:80] if pd.notna(v) else 'NA' for v in df.iloc[i].tolist()]}")
print()
print("First row (header):")
row0 = df.iloc[0].tolist()
for j, v in enumerate(row0):
    if pd.notna(v):
        print(f"  Col {j}: {v}")
# Check how many data rows
print(f"\nTotal rows: {len(df)}")
# Print last few rows
for i in range(max(0, len(df)-3), len(df)):
    row = df.iloc[i].tolist()
    print(f"Row {i}: {[str(v)[:50] if pd.notna(v) else 'NA' for v in row[:8]]}")