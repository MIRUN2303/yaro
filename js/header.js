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
    '<a href="cart.html" class="cart-link' + (p === 'cart' ? ' active' : '') + '">Cart <span class="cart-count" id="cart-count">0</span></a>',
    '</nav>'
  ].join('');
  document.body.prepend(h);

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
