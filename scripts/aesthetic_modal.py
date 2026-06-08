import re

with open('store.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update .cat-modal-overlay CSS for more aesthetic animation
new_css = """
    /* ─── CATEGORY MODAL ─── */
    .cat-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.5s ease, visibility 0.5s ease;
      padding: 0;
    }

    .cat-modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .cat-modal {
      width: 100%;
      max-width: 480px;
      background: rgba(10, 10, 12, 0.7);
      backdrop-filter: blur(40px) saturate(180%);
      border-top: 1px solid rgba(255,255,255,0.15);
      border-left: 1px solid rgba(255,255,255,0.08);
      border-right: 1px solid rgba(255,255,255,0.08);
      border-bottom: none;
      border-radius: 24px 24px 0 0;
      padding: 24px;
      padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
      transform: translateY(100%);
      opacity: 1;
      transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -30px 80px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.1);
    }

    .cat-modal-overlay.open .cat-modal {
      transform: translateY(0);
    }

    /* Staggered entry for cards */
    .cat-modal .cat-card {
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cat-modal-overlay.open .cat-modal .cat-card {
      opacity: 1;
      transform: translateY(0);
    }
"""
content = re.sub(r'\s*/\* ─── CATEGORY MODAL ─── \*/.*?\.cat-modal-overlay\.open \.cat-modal \{\s*transform: translateY\(0\);\s*\}', new_css, content, flags=re.DOTALL)

# 2. Update catData.forEach to use index for transition delay
js_find = r'catData\.forEach\(function\(cat\) \{'
js_replace = r'catData.forEach(function(cat, index) {\n          var card = document.createElement(\'div\');\n          card.className = \'cat-card\';\n          card.style.transitionDelay = (index * 0.035) + \'s\';'
content = re.sub(r'catData\.forEach\(function\(cat\) \{\s*var card = document\.createElement\(\'div\'\);\s*card\.className = \'cat-card\';', js_replace, content)

with open('store.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done upgrading modal animations.")
