import re

with open('store.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove style profile HTML block
content = re.sub(r'\s*<!-- Style Profile -->.*?</div>\s*</div>\s*', '\n        ', content, flags=re.DOTALL | re.IGNORECASE)

# 2. Remove updateStyleProfile JS function entirely
content = re.sub(r'\s*// ─── UPDATE STYLE PROFILE ───\s*function updateStyleProfile\(\) \{.*?\}(?=\s*// ─── UPDATE PRODUCTS ───)', '', content, flags=re.DOTALL)

# 3. Remove calls to updateStyleProfile
content = re.sub(r'updateStyleProfile\(\);\s*', '', content)

# 4. Remove .style-profile and .sp-bars CSS entirely
content = re.sub(r'\s*/\* ─── STYLE PROFILE ─── \*/.*?(?=\s*/\* ─── FILTER ACTIONS ─── \*/)', '\n', content, flags=re.DOTALL)

with open('store.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
