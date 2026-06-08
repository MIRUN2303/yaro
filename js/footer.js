(function() {
  var p = window.location.pathname.split('/').pop().split('.')[0] || 'index';
  var a = function(n) { return p === n ? ' class="active"' : ''; };
  var f = document.createElement('footer');
  f.className = 'site-footer';
  f.innerHTML = [
    '<span class="sf-copy">&copy; 2026 YARO &mdash; Wear what stays with you.</span>',
    '<div class="sf-links">',
    '<a href="index.html"' + a('index') + '>Home</a>',
    '<a href="store.html"' + a('store') + '>Store</a>',
    '<a href="about.html"' + a('about') + '>About</a>',
    '<a href="contact.html"' + a('contact') + '>Contact</a>',
    '<a href="profile.html"' + a('profile') + '>Profile</a>',
    '<a href="orders.html"' + a('orders') + '>Orders</a>',
    '<a href="cart.html"' + a('cart') + '>Cart</a>',
    '</div>'
  ].join('');
  document.body.appendChild(f);
})();
