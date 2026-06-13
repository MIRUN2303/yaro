(function() {
  var p = window.location.pathname.split('/').pop().split('.')[0] || 'index';
  var a = function(n) {
    var cls = '';
    if (p === n) cls = 'active';
    if (n === 'store') cls = cls ? cls + ' store-nav-trigger' : 'store-nav-trigger';
    return cls ? 'class="' + cls + '"' : '';
  };
  var h = document.createElement('header');
  h.className = 'site-header';
  h.innerHTML = [
    '<a href="index.html" class="sh-logo">YARO</a>',
    '<div class="sh-search">',
    '<svg class="sh-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    '<input type="text" class="header-search-input">',
    '<button class="sh-search-clear">&#10005;</button>',
    '</div>',
    '<button class="sh-menu-btn" id="sh-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>',
    '<nav class="sh-nav">',
    '<a href="index.html" ' + a('index') + '>Home</a>',
    '<a href="store.html" ' + a('store') + '>Store</a>',
    '<a href="about.html" ' + a('about') + '>About</a>',
    '<a href="contact.html" ' + a('contact') + '>Contact</a>',
    '<a href="profile.html" ' + a('profile') + '>Profile</a>',
    '<a href="orders.html" ' + a('orders') + '>Orders</a>',
    '<a href="admin.html" id="admin-header-link" class="admin-nav-link" style="display:none">Admin</a>',
    '<a href="cart.html" class="cart-link' + (p === 'cart' ? ' active' : '') + '">Cart <span class="cart-count" id="cart-count">0</span></a>',
    '</nav>'
  ].join('');
  document.body.prepend(h);

  // Add announcement bar below header
  var ab = document.createElement('div');
  ab.id = 'announcement-bar';
  ab.style.cssText = 'display:none;text-align:center;padding:8px 16px;background:rgba(196,181,253,0.06);border-bottom:1px solid rgba(196,181,253,0.08);font-size:11px;color:#c4b5fd;letter-spacing:0.08em;font-family:"Clash Display",sans-serif';
  h.parentNode.insertBefore(ab, h.nextSibling);

  // Admin link handling
  (function() {
    function showAdminLink() {
      var link = document.getElementById('admin-header-link');
      if (link) { link.style.display = ''; link.classList.add('visible'); }
      var mLink = document.getElementById('mobile-admin-link');
      if (mLink) { mLink.style.display = ''; mLink.classList.add('visible'); }
      var s = document.createElement('style');
      s.textContent = '.admin-nav-link.visible{display:inline-flex!important;align-items:center;gap:4px;padding:4px 12px!important;background:rgba(196,181,253,0.1);border:1px solid rgba(196,181,253,0.2);border-radius:6px;color:#c4b5fd!important;font-weight:600!important}.admin-nav-link.visible:hover{background:rgba(196,181,253,0.18)!important;border-color:rgba(196,181,253,0.35)!important;color:#d8ccff!important}.admin-nav-link.visible::after{display:none!important}';
      document.head.appendChild(s);
    }

    function hideAdminLink() {
      var link = document.getElementById('admin-header-link');
      if (link) { link.style.display = 'none'; link.classList.remove('visible'); }
      var mLink = document.getElementById('mobile-admin-link');
      if (mLink) { mLink.style.display = 'none'; mLink.classList.remove('visible'); }
    }

    // Initial check
    try {
      var t = localStorage.getItem('admin_token');
      var ut = localStorage.getItem('yaro_token');
      if (t && ut) {
        try {
          var payload = JSON.parse(atob(t.split('.')[1]));
          if (payload.role === 'admin' && payload.exp * 1000 > Date.now()) {
            showAdminLink();
          } else {
            hideAdminLink();
            localStorage.removeItem('admin_token');
          }
        } catch(e) {
          hideAdminLink();
          localStorage.removeItem('admin_token');
        }
      } else {
        hideAdminLink();
      }
    } catch(e) {}

    // Listen for logout event to hide admin link
    if (typeof window !== 'undefined') {
      window.addEventListener('yaroLogout', hideAdminLink);
    }
  })();

  // Password confirmation modal before navigating to admin panel
  (function() {
    var adminLink = document.getElementById('admin-header-link');
    if (!adminLink) return;
    adminLink.addEventListener('click', function(e) {
      e.preventDefault();
      if (document.getElementById('admin-confirm-overlay')) return;

      var overlay = document.createElement('div');
      overlay.id = 'admin-confirm-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.8);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;font-family:"Clash Display",sans-serif;';

      var modal = document.createElement('div');
      modal.style.cssText = 'background:rgba(10,8,18,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 36px;width:380px;max-width:90vw;box-shadow:0 30px 80px rgba(0,0,0,0.6);';

      modal.innerHTML =
        '<div style="font-family:Pilowlava,serif;font-size:22px;letter-spacing:-0.02em;color:#fff;text-align:center;margin-bottom:4px;">YARO</div>' +
        '<div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a1a1aa;text-align:center;margin-bottom:28px;">Confirm Access</div>' +
        '<div style="margin-bottom:16px;">' +
        '<input type="password" id="admin-confirm-pw" placeholder="Enter your password" style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#fff;font-size:14px;outline:none;font-family:\'Clash Display\',sans-serif;box-sizing:border-box;">' +
        '</div>' +
        '<button id="admin-confirm-btn" style="width:100%;padding:14px;border:none;border-radius:100px;background:linear-gradient(135deg,#c4b5fd 0%,#a78bfa 100%);color:#050505;font-family:\'Clash Display\',sans-serif;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:0.5px;">Confirm</button>' +
        '<div id="admin-confirm-error" style="font-size:12px;color:#ef4444;text-align:center;margin-top:12px;min-height:18px;"></div>' +
        '<div style="text-align:center;margin-top:14px;"><a href="#" id="admin-confirm-cancel" style="font-size:12px;color:rgba(255,255,255,0.3);text-decoration:none;">Cancel</a></div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      document.getElementById('admin-confirm-cancel').addEventListener('click', function(ce) {
        ce.preventDefault(); overlay.remove();
      });
      overlay.addEventListener('click', function(ce) {
        if (ce.target === overlay) overlay.remove();
      });

      var pwInput = document.getElementById('admin-confirm-pw');
      var confirmBtn = document.getElementById('admin-confirm-btn');
      var errEl = document.getElementById('admin-confirm-error');

      function doConfirm() {
        var pw = pwInput.value;
        if (!pw) { errEl.textContent = 'Password required'; return; }
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        var email = '';
        try {
          var t = localStorage.getItem('admin_token');
          if (t) { var p = JSON.parse(atob(t.split('.')[1])); email = p.email || ''; }
        } catch(e) {}
        fetch('/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: pw })
        }).then(function(r) { return r.json(); }).then(function(data) {
          if (data.token) {
            localStorage.setItem('admin_token', data.token);
            overlay.remove();
            window.location.href = 'manage.html';
          } else {
            errEl.textContent = data.error || 'Wrong password';
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
          }
        }).catch(function() {
          errEl.textContent = 'Server error. Try again.';
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '1';
        });
      }

      confirmBtn.addEventListener('click', doConfirm);
      pwInput.addEventListener('keydown', function(ke) {
        if (ke.key === 'Enter') doConfirm();
      });
      setTimeout(function() { pwInput.focus(); }, 100);
    });
  })();

  // Load announcement from site settings (deferred for YARO_API availability)
  (function() {
    function loadAnnouncement() {
      if (typeof YARO_API === 'undefined' || !YARO_API.getSetting) { setTimeout(loadAnnouncement, 100); return; }
      YARO_API.getSetting('announcement').then(function(val) {
        if (val && val.enabled && val.text) {
          var bar = document.getElementById('announcement-bar');
          if (bar) { bar.textContent = val.text; bar.style.display = 'block'; }
        }
      });
    }
    setTimeout(loadAnnouncement, 200);
  })();

  document.querySelectorAll('.sh-search').forEach(function(w) {
    var input = w.querySelector('.header-search-input');
    var clear = w.querySelector('.sh-search-clear');
    if (!input || !clear) return;
    function toggle() { clear.classList.toggle('show', input.value.length > 0); }
    input.addEventListener('input', toggle);
    clear.addEventListener('click', function() { input.value = ''; clear.classList.remove('show'); input.focus(); });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.value.trim()) {
        window.location.href = 'store.html?search=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var cartEl = document.getElementById('cart-count');
  if (cartEl) {
    try {
      var buckets = JSON.parse(localStorage.getItem('yaro_buckets') || '{}');
      var count = 0;
      Object.keys(buckets).forEach(function(k) {
        if (buckets[k] && buckets[k].items) { buckets[k].items.forEach(function(i) { count += i.qty; }); }
      });
      cartEl.textContent = count;
    } catch(e) {}
  }
})();
