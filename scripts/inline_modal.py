import re

with open('store.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace .cat-modal-overlay and .cat-modal CSS
new_modal_css = """
    .cat-modal-overlay {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.4s cubic-bezier(0.19, 1, 0.22, 1), margin-bottom 0.4s ease;
      margin-bottom: 0;
    }

    .cat-modal-overlay.open {
      grid-template-rows: 1fr;
      margin-bottom: 40px;
    }

    .cat-modal {
      min-height: 0;
      overflow: hidden;
    }
    
    .cat-modal-inner {
      background: #050505;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 24px;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.4s ease;
    }

    .cat-modal-overlay.open .cat-modal-inner {
      opacity: 1;
      transform: translateY(0);
    }
"""
content = re.sub(r'\s*\.cat-modal-overlay \{.*?\.cat-modal-overlay\.open \.cat-modal \{\s*transform:.*?\}\s*', new_modal_css, content, flags=re.DOTALL)

# Add .cat-modal-inner to the HTML
content = content.replace('<div class="cat-modal">', '<div class="cat-modal"><div class="cat-modal-inner">')
content = content.replace('</div>\n        </div>\n\n        <!-- Style Profile Removed -->', '</div></div>\n        </div>\n\n        <!-- Style Profile Removed -->')

# Replace .filter-btn CSS
new_fb_css = """
    /* ─── FILTER BUTTON ─── */
    .filter-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 16px 24px;
      background: #fff;
      border: 1px solid #fff;
      color: #000;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
      font-family: inherit;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(255,255,255,0.1);
    }

    .filter-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,255,255,0.2);
    }

    .filter-btn .fb-icon {
      font-size: 16px;
      color: #000;
    }

    .filter-btn .fb-label {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #000;
      flex: 1;
      text-align: left;
    }

    .filter-btn .fb-count {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: rgba(0,0,0,0.6);
      text-transform: uppercase;
    }
"""
content = re.sub(r'\s*/\* ─── FILTER BUTTON ─── \*/.*?(?=\s*\.cat-card \{)', new_fb_css, content, flags=re.DOTALL)

# Also fix the fact that I removed JS listeners for overlay clicking
# Wait, we want to remove the overlay click listener since it's no longer a fullscreen overlay
content = re.sub(r"\s*modalOverlay\.addEventListener\('click', function\(e\) \{.*?\}\);\s*", '\n', content, flags=re.DOTALL)

with open('store.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done inline modal styling.")
