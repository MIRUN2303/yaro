(function() {
  var p = window.location.pathname.split('/').pop().split('.')[0] || 'index';
  var a = function(n) { return p === n ? ' class="active"' : ''; };
  var f = document.createElement('footer');
  f.className = 'site-footer';
  f.innerHTML = [
    '<span class="sf-copy">&copy; 2026 YARO &mdash; Wear what stays with you.</span>',
    '<div class="sf-links" id="sf-links">',
    '<a href="index.html"' + a('index') + '>Home</a>',
    '<a href="store.html"' + a('store') + '>Store</a>',
    '<a href="about.html"' + a('about') + '>About</a>',
    '<a href="contact.html"' + a('contact') + '>Contact</a>',
    '<a href="profile.html"' + a('profile') + '>Profile</a>',
    '<a href="orders.html"' + a('orders') + '>Orders</a>',
    '<a href="cart.html"' + a('cart') + '>Cart</a>',
    '</div>',
    '<div class="sf-social" id="sf-social" style="margin-top:8px;display:flex;gap:12px;justify-content:center"></div>'
  ].join('');
  document.body.appendChild(f);

  // Load social links from site settings (deferred for YARO_API)
  (function() {
    function loadSocial() {
      if (typeof YARO_API === 'undefined' || !YARO_API.getSetting) { setTimeout(loadSocial, 100); return; }
      YARO_API.getSetting('social_links').then(function(val) {
        if (!val) return;
        var socialContainer = document.getElementById('sf-social');
        if (!socialContainer) return;
        var links = { instagram: 'Instagram', facebook: 'Facebook', twitter: 'Twitter' };
        var html = '';
        Object.keys(links).forEach(function(key) {
          if (val[key]) {
            html += '<a href="' + val[key] + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,0.35);font-size:11px;text-decoration:none;transition:color 0.3s;letter-spacing:0.05em" onmouseover="this.style.color=\'rgba(196,181,253,0.7)\'" onmouseout="this.style.color=\'rgba(255,255,255,0.35)\'">' + links[key] + '</a>';
          }
        });
        if (html) socialContainer.innerHTML = html;
      });
    }
    setTimeout(loadSocial, 300);
  })();
})();
