import re

with open('store.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .cat-modal-inner to remove overflow-y so it expands fully
content = content.replace('overflow-y: auto;', '')

# 2. Update .cat-card to be very small and tight
new_cat_card_css = """
    .cat-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .cat-card {
      position: relative;
      border-radius: 6px;
      padding: 12px 6px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.03);
      cursor: pointer;
      user-select: none;
      transition: all 0.35s cubic-bezier(0.19, 1, 0.22, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
      flex: 1 1 calc(25% - 6px);
      min-width: 65px;
      max-width: 90px;
    }
"""
content = re.sub(r'\s*\.cat-card \{.*?overflow: hidden;\s*\}', new_cat_card_css, content, flags=re.DOTALL)

# 3. Make .cat-name smaller
content = re.sub(r'\.cat-card \.cat-name \{\s*font-size: 11px;', '.cat-card .cat-name {\n      font-size: 9px;', content)

# 4. Hide .cat-count to save vertical space
new_cat_count = """
    .cat-card .cat-count {
      display: none;
    }
"""
content = re.sub(r'\s*\.cat-card \.cat-count \{.*?\transition: color 0\.3s ease;\s*\}', new_cat_count, content, flags=re.DOTALL)

# 5. Ensure the media query cat-grid isn't messing it up
content = re.sub(r'\s*\.cat-grid \{\s*grid-template-columns: repeat\(auto-fill, minmax\(90px, 1fr\)\);\s*gap: 6px;\s*\}', '', content, flags=re.DOTALL)
content = re.sub(r'\s*\.cat-card \{\s*padding: 12px 8px 10px;\s*border-radius: 8px;\s*\}', '', content, flags=re.DOTALL)

with open('store.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done making icons aesthetic and tight without scroll.")
