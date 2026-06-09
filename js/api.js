const YARO_API = (function() {

  var SUPABASE_URL = 'https://hggaxgdiritrawbpyues.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2F4Z2Rpcml0cmF3YnB5dWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTE1NjIsImV4cCI6MjA5NjQyNzU2Mn0.huBcWXCsLlTVW-_6VLOI4FRppb_72QJl-bhwsw2zynI';
  var ADMIN_EMAIL = 'yarodrops@gmail.com';

  var authToken = null;
  var authUser = null;

  // ─── FALLBACK DATA ───
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

  // ─── SUPABASE HELPERS ───
  function headers(token) {
    var h = { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
    var t = token || authToken || localStorage.getItem('sb_token');
    if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }

  function getStoredToken() {
    return authToken || localStorage.getItem('sb_token');
  }

  async function sbGet(table, opts) {
    try {
      var url = SUPABASE_URL + '/rest/v1/' + table + '?select=' + encodeURIComponent(opts && opts.select || '*');
      if (opts && opts.filter) url += '&' + opts.filter;
      if (opts && opts.order) url += '&order=' + encodeURIComponent(opts.order);
      if (opts && opts.limit) url += '&limit=' + opts.limit;
      var res = await fetch(url, { headers: headers() });
      if (!res.ok) return null;
      return res.json();
    } catch(e) { return null; }
  }

  async function sbSingle(table, column, value, opts) {
    try {
      var url = SUPABASE_URL + '/rest/v1/' + table + '?select=' + encodeURIComponent(opts && opts.select || '*') + '&' + column + '=eq.' + encodeURIComponent(value) + '&limit=1';
      var res = await fetch(url, { headers: headers() });
      if (!res.ok) return null;
      var data = await res.json();
      return (data && data.length) ? data[0] : null;
    } catch(e) { return null; }
  }

  async function sbWrite(method, table, body, filter) {
    try {
      var url = SUPABASE_URL + '/rest/v1/' + table;
      if (filter) url += '?' + filter;
      var t = getStoredToken();
      var res = await fetch(url, {
        method: method,
        headers: headers(t),
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        var err = await res.text().catch(function(){ return '{}'; });
        return { error: err };
      }
      if (method === 'DELETE') return { success: true };
      return res.json();
    } catch(e) { return { error: e.message }; }
  }

  async function sbInsert(table, body) { return sbWrite('POST', table, body); }
  async function sbUpdate(table, body, filter) { return sbWrite('PATCH', table, body, filter); }
  async function sbDelete(table, filter) { return sbWrite('DELETE', table, null, filter); }

  // ─── AUTH HELPERS ───
  function isAdmin() {
    return authUser && authUser.email === ADMIN_EMAIL;
  }

  // ─── CART HELPERS (localStorage, no backend needed) ───
  function getCartFromStorage() {
    try { var d = localStorage.getItem('yaro_buckets'); return d ? JSON.parse(d) : {}; } catch(e) { return {}; }
  }

  function saveCartToStorage(cart) {
    try { localStorage.setItem('yaro_buckets', JSON.stringify(cart)); } catch(e) {}
  }

  function getActiveBucketName() {
    return localStorage.getItem('yaro_active_bucket') || 'My Cart';
  }

  // ─── PUBLIC API ───
  return {

    // ── Auth ──
    async signIn(email, password) {
      try {
        var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();
        if (!res.ok || data.error) return { error: data.error_description || data.msg || 'Invalid credentials' };
        authToken = data.access_token;
        authUser = data.user;
        localStorage.setItem('sb_token', data.access_token);
        localStorage.setItem('sb_refresh', data.refresh_token);
        return { user: data.user, session: data };
      } catch(e) { console.error('signIn error:', e); return { error: e.message || 'Network error — check your connection' }; }
    },

    async signUp(email, password, meta) {
      try {
        var body = { email: email, password: password };
        if (meta) body.data = meta;
        var res = await fetch(SUPABASE_URL + '/auth/v1/signup', {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        var data = await res.json();
        if (!res.ok || data.error) return { error: data.msg || 'Signup failed (code ' + res.status + ')' };
        return { user: data };
      } catch(e) { console.error('signUp error:', e); return { error: e.message || 'Network error — check your connection' }; }
    },

    async signOut() {
      try {
        authToken = null;
        authUser = null;
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_refresh');
        localStorage.removeItem('admin_token');
        return { success: true };
      } catch(e) { return { error: e.message }; }
    },

    getSession() {
      if (authUser) return { user: authUser, token: authToken };
      var t = localStorage.getItem('sb_token');
      if (t) return { token: t };
      return null;
    },

    isAdmin: function() { return isAdmin(); },

    async adminLogin(email, password) {
      var result = await this.signIn(email, password);
      if (result.error) return result;
      if (result.user && result.user.email !== ADMIN_EMAIL) {
        await this.signOut();
        return { error: 'Not authorized as admin' };
      }
      if (result.user) localStorage.setItem('admin_token', result.session.access_token);
      return result;
    },

    async adminLogout() {
      localStorage.removeItem('admin_token');
      return this.signOut();
    },

    setToken: function(t) {},
    getToken: function() { return getStoredToken(); },
    clearToken: function() { authToken = null; authUser = null; localStorage.removeItem('sb_token'); localStorage.removeItem('sb_refresh'); },

    // ── Products ──
    async getProducts() {
      var data = await sbGet('products', { select: '*', filter: 'status=eq.active', order: 'created_at.desc' });
      if (data && Array.isArray(data) && data.length) return data;
      return FALLBACK_PRODUCTS;
    },

    async getAllProducts() {
      var data = await sbGet('products', { select: '*', order: 'created_at.desc' });
      if (data && Array.isArray(data) && data.length) return data;
      return FALLBACK_PRODUCTS;
    },

    async getProduct(slug) {
      var p = await sbSingle('products', 'slug', slug);
      if (p && !p.error) return p;
      return FALLBACK_PRODUCTS.find(function(p) { return p.slug === slug || p.id === slug; }) || FALLBACK_PRODUCTS[0];
    },

    async createProduct(data) {
      return sbInsert('products', data);
    },

    async updateProduct(id, data) {
      return sbUpdate('products', data, 'id=eq.' + id);
    },

    async deleteProduct(id) {
      return sbDelete('products', 'id=eq.' + id);
    },

    // ── Collections ──
    async getCollections() {
      var data = await sbGet('collections', { select: '*', order: 'created_at.asc' });
      if (data && Array.isArray(data) && data.length) return data;
      return FALLBACK_COLLECTIONS;
    },

    async getCollection(slug) {
      var c = await sbSingle('collections', 'slug', slug);
      if (c) return c;
      return FALLBACK_COLLECTIONS.find(function(c) { return c.slug === slug; }) || null;
    },

    async createCollection(data) {
      return sbInsert('collections', data);
    },

    async updateCollection(id, data) {
      return sbUpdate('collections', data, 'id=eq.' + id);
    },

    async deleteCollection(id) {
      return sbDelete('collections', 'id=eq.' + id);
    },

    // ── Stories ──
    async getStories() {
      var data = await sbGet('stories', { select: '*', order: 'created_at.desc' });
      if (data && Array.isArray(data)) return data;
      return [];
    },

    async getStory(id) {
      return sbSingle('stories', 'id', id);
    },

    async createStory(data) {
      return sbInsert('stories', data);
    },

    async updateStory(id, data) {
      return sbUpdate('stories', data, 'id=eq.' + id);
    },

    async deleteStory(id) {
      return sbDelete('stories', 'id=eq.' + id);
    },

    // ── Orders ──
    async getOrders() {
      return sbGet('orders', { select: '*,order_items(*)', order: 'created_at.desc' });
    },

    async getOrder(id) {
      return sbSingle('orders', 'id', id, { select: '*,order_items(*)' });
    },

    async updateOrder(id, data) {
      return sbUpdate('orders', data, 'id=eq.' + id);
    },

    async createOrder(data) {
      return sbInsert('orders', data);
    },

    async createOrderItems(items) {
      return sbInsert('order_items', items);
    },

    // ── Cart (localStorage) ──
    async getCart() {
      return getCartFromStorage();
    },

    async addToCart(productId, size, quantity, bucketName) {
      var cart = getCartFromStorage();
      var name = bucketName || getActiveBucketName();
      if (!cart[name]) cart[name] = [];
      var existing = null;
      for (var i = 0; i < cart[name].length; i++) {
        if (cart[name][i].product_id === productId && cart[name][i].size === (size || '')) {
          existing = cart[name][i];
          existing.quantity = (existing.quantity || 1) + (quantity || 1);
          break;
        }
      }
      if (!existing) cart[name].push({ product_id: productId, size: size || '', quantity: quantity || 1, bucket_name: name });
      saveCartToStorage(cart);
      return { success: true, cart: cart[name] };
    },

    async removeFromCart(itemIndex, bucketName) {
      var cart = getCartFromStorage();
      var name = bucketName || getActiveBucketName();
      if (cart[name]) {
        cart[name].splice(itemIndex, 1);
        if (!cart[name].length) delete cart[name];
      }
      saveCartToStorage(cart);
      return { success: true };
    },

    async updateCart(itemIndex, quantity, bucketName) {
      var cart = getCartFromStorage();
      var name = bucketName || getActiveBucketName();
      if (cart[name] && cart[name][itemIndex]) {
        cart[name][itemIndex].quantity = quantity;
        saveCartToStorage(cart);
      }
      return { success: true };
    },

    // ── Payments (placeholder) ──
    async getRazorpayKey() {
      return { key: 'rzp_test_xxxxx' };
    },

    async createRazorpayOrder(amount, receipt) {
      return { error: 'Serverless payment function required' };
    },

    async verifyPayment(data) {
      return { error: 'Serverless payment function required' };
    },

    async updateProfile(meta) {
      try {
        var t = getStoredToken();
        if (!t) return { error: 'Not authenticated' };
        var res = await fetch(SUPABASE_URL + '/auth/v1/user', {
          method: 'PUT',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
          body: JSON.stringify({ data: meta })
        });
        var data = await res.json();
        if (!res.ok) return { error: data.msg || 'Update failed' };
        return data;
      } catch(e) { return { error: e.message }; }
    },

    // ── Legacy methods (mapped) ──
    async login(email, password) { return this.signIn(email, password); },
    async signup(data) { return this.signUp(data.email, data.password, { name: data.name, phone: data.phone }); },
    async logout() { return this.signOut(); },
    async me() {
      var session = this.getSession();
      if (session && session.user) return session.user;
      try {
        var t = getStoredToken();
        if (!t) return null;
        var res = await fetch(SUPABASE_URL + '/auth/v1/user', {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + t }
        });
        if (!res.ok) return null;
        var user = await res.json();
        authUser = user;
        return user;
      } catch(e) { return null; }
    },

    // ── Utility ──
    getBaseUrl: function() { return SUPABASE_URL; },
    getFallbackProducts: function() { return FALLBACK_PRODUCTS; },
    getFallbackCollections: function() { return FALLBACK_COLLECTIONS; }
  };
})();
