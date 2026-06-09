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
    '<input type="text" placeholder="Search..." class="header-search-input">',
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

  // Show admin link if admin is logged in
  (function() {
    try {
      var token = localStorage.getItem('sb_token');
      if (!token) return;
      fetch('https://hggaxgdiritrawbpyues.supabase.co/auth/v1/user', {
        headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2F4Z2Rpcml0cmF3YnB5dWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTE1NjIsImV4cCI6MjA5NjQyNzU2Mn0.huBcWXCsLlTVW-_6VLOI4FRppb_72QJl-bhwsw2zynI', 'Authorization': 'Bearer ' + token }
      }).then(function(r) { return r.json(); }).then(function(u) {
        if (u && u.email === 'yarodrops@gmail.com') {
          var link = document.getElementById('admin-header-link');
          if (link) { link.style.display = ''; link.classList.add('visible'); }
          var mLink = document.getElementById('mobile-admin-link');
          if (mLink) { mLink.style.display = ''; mLink.classList.add('visible'); }
          var s = document.createElement('style');
          s.textContent = '.admin-nav-link.visible{display:inline-flex!important;align-items:center;gap:4px;padding:4px 12px!important;background:rgba(196,181,253,0.1);border:1px solid rgba(196,181,253,0.2);border-radius:6px;color:#c4b5fd!important;font-weight:600!important}.admin-nav-link.visible:hover{background:rgba(196,181,253,0.18)!important;border-color:rgba(196,181,253,0.35)!important;color:#d8ccff!important}.admin-nav-link.visible::after{display:none!important}';
          document.head.appendChild(s);
        }
      }).catch(function() {});
    } catch(e) {}
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
