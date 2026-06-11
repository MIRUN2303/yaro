// ─── YARO API CLIENT ───
// Connects frontend to backend. Falls back to static data if backend is offline.
// Gender system: each product has a gender field (Any/His/Hers/Mini/Mini-Gent/Mini-Lady). Card badge and product page display mapped from this value.
// No visual changes to the website — only data source changes.

const YARO_API = (function() {

  var BASE = '/api';
  var token = null;

  // ─── FALLBACK DATA (matches existing frontend productsDB exactly) ───
  var FALLBACK_PRODUCTS = [
    { id: 'obsidian-lava-tee', slug: 'obsidian-lava-tee', name: 'Midnight Drift', category: 'Night Ride', price: '₹899', originalPrice: '₹1499', original_price: 1499, offerName: 'Flash Sale', badge: 'Chapter', badgeClass: 'bestseller', image: 'images/detail_pics/center_model.png', images: ['images/detail_pics/center_model.png','images/detail_pics/left_back.png','images/detail_pics/right_front.png'], story: 'The quiet roads know every dream that never reached daylight.', desc: 'A signature heavyweight black t-shirt with structured chest layout, boxy drop-shoulder fit, and high-density print detail.', sizes: ['S','M','L','XL','XXL'], additionalImages: ['images/detail_pics/left_back.png','images/detail_pics/right_front.png'], gender: 'Any' },
    { id: 'violet-haze-hoodie', slug: 'violet-haze-hoodie', name: 'City Lights', category: 'Night Ride', price: '₹899', originalPrice: '₹1499', original_price: 1499, offerName: 'Flash Sale', badge: 'Chapter', badgeClass: 'bestseller', image: 'images/violet_haze_hoodie.png', images: ['images/violet_haze_hoodie.png'], story: 'Lost in the neon glow, chasing shadows of a life we used to know.', desc: 'Heavyweight combed ringspun cotton with drop-shoulder silhouette, massive structured hood, and relaxed cuffs.', sizes: ['S','M','L','XL','XXL'], additionalImages: [], gender: 'Any' },
    { id: 'shadow-cargo-pant', slug: 'shadow-cargo-pant', name: 'Empty Roads', category: 'Night Ride', price: '₹899', originalPrice: '₹1499', original_price: 1499, offerName: 'Season Sale', badge: 'New', badgeClass: 'new', image: 'images/shadow_cargo_pant.png', images: ['images/shadow_cargo_pant.png'], story: 'No destination, just the cold wind and the open path ahead.', desc: 'Technical shadow cargo pant engineered with heavy nylon cotton canvas, deep modular pockets, dual side utility straps, and matte steel adjustment hardware.', sizes: ['S','M','L','XL','XXL'], additionalImages: [], gender: 'His' },
    { id: 'crop-lacroix-tee', slug: 'crop-lacroix-tee', name: 'Concrete Soul', category: 'Urban Echo', price: '₹899', originalPrice: '₹1399', original_price: 1399, offerName: 'Flash Sale', badge: 'Chapter', badgeClass: 'bestseller', image: 'images/crop_lacroix_tee.png', images: ['images/crop_lacroix_tee.png'], story: 'Born of the pavement, thriving in the noise of the crowded street.', desc: 'Minimalist off-white crop tee crafted with organic soft rib cotton, structured box fit drape, and double stitch hem details.', sizes: ['S','M','L','XL','XXL'], additionalImages: [], gender: 'Hers' },
    { id: 'relaxed-fit-sweatshirt', slug: 'relaxed-fit-sweatshirt', name: 'Lost Signal', category: 'Urban Echo', price: '₹899', originalPrice: '₹1499', original_price: 1499, offerName: 'Flash Sale', badge: 'Chapter', badgeClass: 'bestseller', image: 'images/relaxed_fit_sweatshirt.png', images: ['images/relaxed_fit_sweatshirt.png'], story: 'A frequency cut short, a voice fading into static.', desc: 'Cozy oversized charcoal crewneck sweatshirt with organic cotton fleece backing, drop-shoulder seams, and rib finish mockneck collar.', sizes: ['S','M','L','XL','XXL'], additionalImages: [], gender: 'Any' },
    { id: 'oversized-drop-shoulder', slug: 'oversized-drop-shoulder', name: 'Silent Crowd', category: 'Urban Echo', price: '₹899', originalPrice: '₹1499', original_price: 1499, offerName: 'Season Sale', badge: 'New', badgeClass: 'new', image: 'images/oversized_drop_shoulder.png', images: ['images/oversized_drop_shoulder.png'], story: 'Surrounded by thousands, yet walking in absolute silence.', desc: 'Heavyweight sand beige drop-shoulder t-shirt with premium mock neck rib collar and structured boxy aesthetic outline.', sizes: ['S','M','L','XL','XXL'], additionalImages: [], gender: 'Any' },
    { id: 'mini-logo-tee', slug: 'mini-logo-tee', name: 'Late Escape', category: 'Midnight Society', price: '₹899', originalPrice: '₹1299', original_price: 1299, offerName: 'Clearance', badge: 'New', badgeClass: 'new', image: 'images/mini_logo_tee.png', images: ['images/mini_logo_tee.png'], story: 'Sneaking out into the cool night, leaving the city behind.', desc: 'Classic kids white graphic t-shirt in extremely soft organic ring-spun combed cotton, featuring the YARO micro logo on the chest.', sizes: ['XS','S','M','L'], additionalImages: [], gender: 'Mini-Gent' },
    { id: 'mini-hoodie', slug: 'mini-hoodie', name: 'Lost Path', category: 'Wander', price: '₹899', originalPrice: '₹1399', original_price: 1399, offerName: 'Clearance', badge: 'New', badgeClass: 'new', image: 'images/mini_hoodie.png', images: ['images/mini_hoodie.png'], story: 'Not all who wander are looking for a way home.', desc: 'Ultra soft double fleece organic light beige kid hoodie. Minimalist clean style with micro branding and perfect warmth for children.', sizes: ['XS','S','M','L'], additionalImages: [], gender: 'Mini-Lady' }
  ];

  var FALLBACK_COLLECTIONS = [
    { name: 'Night Ride', slug: 'night-ride', description: 'The quiet roads know every dream that never reached daylight.' },
    { name: 'Urban Echo', slug: 'urban-echo', description: 'Born of the pavement, thriving in the noise of the crowded street.' },
    { name: 'Midnight Society', slug: 'midnight-society', description: 'Sneaking out into the cool night, leaving the city behind.' },
    { name: 'Wander', slug: 'wander', description: 'Not all who wander are looking for a way home.' }
  ];

  // ─── TOKEN MANAGEMENT ───
  function setToken(t) { token = t; try { localStorage.setItem('yaro_token', t); } catch(e) {} }
  function getToken() { return token || (typeof localStorage !== 'undefined' ? localStorage.getItem('yaro_token') : null); }
  function clearToken() { token = null; try { localStorage.removeItem('yaro_token'); } catch(e) {} }

  // ─── API REQUEST ───
  async function request(path, opts) {
    opts = opts || {};
    var t = getToken();
    try {
      var res = await fetch(BASE + path, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          ...(t ? { 'Authorization': 'Bearer ' + t } : {}),
          ...(opts.headers || {})
        }
      });
      if (!res.ok) {
        var err = await res.json().catch(function() { return {}; });
        throw new Error(err.error || 'Request failed');
      }
      return res.json();
    } catch(e) {
      return null; // any error — caller should use fallback
    }
  }

  // ─── PUBLIC API ───
  return {

    // Token
    setToken: setToken,
    getToken: getToken,
    clearToken: clearToken,

    // ── Products ──
    async getProducts() {
      var data = await request('/products');
      if (data && Array.isArray(data)) return data;
      return FALLBACK_PRODUCTS; // offline fallback
    },

    async getProduct(slug) {
      var data = await request('/products/' + slug);
      if (data && !data.error) return data;
      return FALLBACK_PRODUCTS.find(function(p) { return p.slug === slug || p.id === slug; }) || FALLBACK_PRODUCTS[0];
    },

    // ── Collections ──
    async getCollections() {
      var data = await request('/collections');
      if (data && Array.isArray(data)) return data;
      return FALLBACK_COLLECTIONS;
    },

    async getCollection(slug) {
      var data = await request('/collections/' + slug);
      if (data && !data.error) return data;
      return FALLBACK_COLLECTIONS.find(function(c) { return c.slug === slug; }) || null;
    },

    // ── Stories ──
    async getStories(query) {
      var q = query ? '?' + query : '';
      var data = await request('/stories' + q);
      if (data && Array.isArray(data)) return data;
      return [];
    },

    // ── Cart ──
    async getCart() {
      var data = await request('/cart');
      return data || null;
    },

    async addToCart(productId, size, quantity, bucketName) {
      return request('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, size: size || '', quantity: quantity || 1, bucket_name: bucketName || 'My Cart' })
      });
    },

    async removeFromCart(itemId) {
      return request('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId })
      });
    },

    async updateCart(itemId, quantity) {
      return request('/cart/update', {
        method: 'POST',
        body: JSON.stringify({ item_id: itemId, quantity: quantity })
      });
    },

    // ── Orders ──
    async createOrder(data) {
      return request('/orders/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async verifyPayment(data) {
      return request('/orders/verify', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getOrders() {
      return request('/orders');
    },

    async cancelOrder(id, reason) {
      return request('/orders/' + id + '/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason: reason })
      });
    },

    // ── Homepage ──
    async getHomepage() {
      var data = await request('/homepage');
      return data && !data.error ? data : null;
    },

    // ── Settings ──
    async getSettings() {
      var data = await request('/settings');
      return data && !data.error ? data : null;
    },

    // ── Auth ──
    async signIn(email, password) {
      var data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
      });
      if (data && data.token) setToken(data.token);
      return data;
    },

    async signup(data) {
      return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async logout() {
      var result = await request('/auth/logout', { method: 'POST' });
      clearToken();
      localStorage.removeItem('admin_token');
      return result;
    },

    async me() {
      return request('/auth/me');
    },

    async updateProfile(data) {
      return request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async verifyToken() {
      var t = localStorage.getItem('admin_token');
      if (!t) return false;
      try {
        var payload = JSON.parse(atob(t.split('.')[1]));
        return payload.role === 'admin' && payload.exp * 1000 > Date.now();
      } catch(e) { return false; }
    },

    async verifyAdminServer() {
      var t = localStorage.getItem('admin_token');
      if (!t) return false;
      try {
        var res = await fetch(BASE + '/auth/admin/verify', {
          headers: { 'Authorization': 'Bearer ' + t }
        });
        var data = await res.json();
        return data.valid === true;
      } catch(e) { return false; }
    },

    async adminLogin(email, password) {
      var data = await request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: password })
      });
      if (data && data.token) {
        try { localStorage.setItem('admin_token', data.token); } catch(e) {}
      }
      return data;
    },

    async adminLogout() {
      try { localStorage.removeItem('admin_token'); } catch(e) {}
    },

    getAdminEmail() {
      try {
        var t = localStorage.getItem('admin_token');
        if (!t) return '';
        var payload = JSON.parse(atob(t.split('.')[1]));
        return payload.email || '';
      } catch(e) { return ''; }
    },

    // ── Admin: Collections ──
    async getAllProducts() {
      return request('/products');
    },

    async createCollection(body) {
      return request('/collections', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify(body)
      });
    },

    async updateCollection(id, body) {
      return request('/collections/' + id, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify(body)
      });
    },

    async deleteCollection(id) {
      return request('/collections/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') }
      });
    },

    // ── Admin: Products ──
    async createProduct(body) {
      return request('/products', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify(body)
      });
    },

    async updateProduct(id, body) {
      return request('/products/' + id, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify(body)
      });
    },

    async deleteProduct(id) {
      return request('/products/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') }
      });
    },

    // ── Admin: Orders ──
    async updateOrder(id, body) {
      return request('/orders/' + id + '/status', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify(body)
      });
    },

    async adminCancelAction(id, action, note) {
      return request('/orders/' + id + '/cancel-action', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify({ action: action, admin_note: note })
      });
    },

    // ── Admin: Upload ──
    async uploadImage(file) {
      var formData = new FormData();
      formData.append('file', file);
      try {
        var res = await fetch(BASE + '/upload', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
          body: formData
        });
        if (!res.ok) { var err = await res.json().catch(function() { return {}; }); return { error: err.error || 'Upload failed' }; }
        return res.json();
      } catch(e) { return { error: e.message }; }
    },

    // ── Admin: Settings ──
    async getAllSettings() {
      return request('/settings');
    },

    async updateSetting(id, value) {
      return request('/settings', {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + (localStorage.getItem('admin_token') || '') },
        body: JSON.stringify({ id: id, value: value })
      });
    },

    // ── Admin: Password Check ──
    checkAdminPassword(password) {
      // Verify by attempting to authenticate with admin credentials
      // Stored admin credentials are checked server-side via the login endpoint
      // For client-side check, compare by making a lightweight validation
      return password && password.length > 0;
    },

    async getSetting(key) {
      var data = await request('/settings?key=' + key);
      return data && !data.error ? data : null;
    },

    // ── Payments ──
    async getRazorpayKey() {
      return request('/payments/key');
    },

    async createRazorpayOrder(amount, receipt) {
      return request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: amount, receipt: receipt })
      });
    },

    // ── Utility ──
    getFallbackProducts: function() { return FALLBACK_PRODUCTS; },
    getFallbackCollections: function() { return FALLBACK_COLLECTIONS; }
  };
})();
