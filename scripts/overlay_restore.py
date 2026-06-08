import re

with open('store.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_css = """
    /* ─── CATEGORY MODAL ─── */
    .cat-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: rgba(5,5,5,0.8);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      padding: 20px;
    }

    .cat-modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .cat-modal {
      width: 100%;
      max-width: 480px;
      background: #050505;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 24px;
      transform: translateY(40px) scale(0.98);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
      box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    }

    .cat-modal-overlay.open .cat-modal {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
"""

content = re.sub(r'\s*/\* ─── CATEGORY MODAL ─── \*/.*?\.cat-modal-overlay\.open \.cat-modal-inner \{\s*opacity: 1;\s*transform: translateY\(0\);\s*\}', new_css, content, flags=re.DOTALL)

# Revert HTML
content = content.replace('<div class="cat-modal"><div class="cat-modal-inner">', '<div class="cat-modal">')
content = content.replace('</div></div>\n        </div>\n\n        <!-- Style Profile Removed -->', '</div>\n        </div>\n\n        <!-- Style Profile Removed -->')

# Re-add the overlay click event
overlay_js = """
      if (modalDone) {
        modalDone.addEventListener('click', closeModal);
      }
      modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
      });
"""
content = re.sub(r'\s*if \(modalDone\) \{\s*modalDone\.addEventListener\(\'click\', closeModal\);\s*\}', overlay_js, content, flags=re.DOTALL)

with open('store.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done restoring modal over the screen.")
