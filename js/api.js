const YARO_API = (function() {

  var SUPABASE_URL = 'https://hggaxgdiritrawbpyues.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZ2F4Z2Rpcml0cmF3YnB5dWVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTE1NjIsImV4cCI6MjA5NjQyNzU2Mn0.huBcWXCsLlTVW-_6VLOI4FRppb_72QJl-bhwsw2zynI';
  var ADMIN_EMAIL = 'yarodrops@gmail.com';

  var authToken = null;
  var authUser = null;

  // ─── FALLBACK DATA ───
  // ─── SUPABASE HELPERS ───
  function headers(token, prefer) {
    var h = { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' };
    var t = token || authToken || localStorage.getItem('sb_token');
    if (t) h['Authorization'] = 'Bearer ' + t;
    if (prefer) h['Prefer'] = prefer;
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
      var pref = (method === 'POST' || method === 'PATCH') ? 'return=representation' : null;
      var res = await fetch(url, {
        method: method,
        headers: headers(t, pref),
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) {
        var err = await res.text().catch(function(){ return '{}'; });
        return { error: err };
      }
      if (method === 'DELETE') return { success: true };
      var text = await res.text();
      return text ? JSON.parse(text) : { success: true };
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
        localStorage.setItem('sb_user', JSON.stringify(data.user));
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
        localStorage.removeItem('sb_user');
        localStorage.removeItem('admin_token');
        return { success: true };
      } catch(e) { return { error: e.message }; }
    },

    getSession() {
      if (authUser) return { user: authUser, token: authToken };
      var t = localStorage.getItem('sb_token');
      if (t) {
        var u = localStorage.getItem('sb_user');
        if (u) { try { return { user: JSON.parse(u), token: t }; } catch(e) {} }
      }
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
      if (result.user) {
        localStorage.setItem('admin_token', result.session.access_token);
        try { sessionStorage.setItem('admin_pass', password); } catch(e) {}
      }
      return result;
    },

    async adminLogout() {
      localStorage.removeItem('admin_token');
      try { sessionStorage.removeItem('admin_pass'); } catch(e) {}
      return this.signOut();
    },

    checkAdminPassword(pwd) {
      var stored = null;
      try { stored = sessionStorage.getItem('admin_pass'); } catch(e) {}
      return stored && stored === pwd;
    },

    setToken: function(t) {},
    getToken: function() { return getStoredToken(); },
    clearToken: function() { authToken = null; authUser = null; localStorage.removeItem('sb_token'); localStorage.removeItem('sb_refresh'); localStorage.removeItem('sb_user'); },
    verifyToken: async function() {
      try {
        var t = getStoredToken();
        if (!t) return false;
        var res = await fetch(SUPABASE_URL + '/auth/v1/user', {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + t }
        });
        return res.ok;
      } catch(e) { return false; }
    },

    // ── Products ──
    async getProducts() {
      var data = await sbGet('products', { select: '*', filter: 'status=eq.active', order: 'created_at.desc' });
      if (data && Array.isArray(data) && data.length) return data;
      return [];
    },

    async getAllProducts() {
      var data = await sbGet('products', { select: '*', order: 'created_at.desc' });
      if (data && Array.isArray(data) && data.length) return data;
      return [];
    },

    async getProduct(slugOrId) {
      var p = await sbSingle('products', 'slug', slugOrId);
      if (p && !p.error) return p;
      p = await sbSingle('products', 'id', slugOrId);
      if (p && !p.error) return p;
      return null;
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
      return [];
    },

    async getCollection(slug) {
      var c = await sbSingle('collections', 'slug', slug);
      if (c) return c;
      return null;
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

    async cancelOrder(id, reason) {
      var cancellation = {
        reason: reason,
        status: 'requested',
        requested_at: new Date().toISOString()
      };
      return sbUpdate('orders', { cancellation: cancellation }, 'id=eq.' + id);
    },

    async adminCancelAction(id, action, adminNote) {
      var o = await sbSingle('orders', 'id', id, { select: 'cancellation' });
      if (!o) return { error: 'Order not found' };
      var canc = o.cancellation || {};
      canc.status = action;
      canc.reviewed_at = new Date().toISOString();
      if (adminNote) canc.admin_note = adminNote;
      var body = { cancellation: canc };
      if (action === 'approved') body.fulfillment_status = 'cancelled';
      return sbUpdate('orders', body, 'id=eq.' + id);
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

    // ── Site Settings (admin-controlled bridge) ──
    async getSetting(id) {
      var data = await sbSingle('site_settings', 'id', id);
      if (data && data.value) return data.value;
      return null;
    },

    async getAllSettings() {
      var data = await sbGet('site_settings', { select: '*', order: 'id.asc' });
      if (data && Array.isArray(data)) return data;
      return [];
    },

    async updateSetting(id, value) {
      return sbWrite('PATCH', 'site_settings', { value: value, updated_at: new Date().toISOString() }, 'id=eq.' + id);
    },

    async createSetting(id, label, value, description) {
      return sbInsert('site_settings', { id: id, value: value || {}, label: label || '', description: description || '' });
    },

    // ── Utility ──
    getBaseUrl: function() { return SUPABASE_URL; },

    // ── Image Upload ──
    async uploadImage(file) {
      try {
        var ext = file.name.split('.').pop().toLowerCase();
        var fileName = Date.now() + '-' + Math.random().toString(36).substr(2,6) + '.' + ext;
        var t = getStoredToken();
        var res = await fetch(SUPABASE_URL + '/storage/v1/object/yaro-images/' + fileName, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + (t || ''),
            'Content-Type': file.type,
            'x-upsert': 'false'
          },
          body: file
        });
        if (!res.ok) {
          var errText = await res.text().catch(function(){ return 'Upload failed' });
          return { error: errText };
        }
        var publicUrl = SUPABASE_URL + '/storage/v1/object/public/yaro-images/' + fileName;
        return { url: publicUrl };
      } catch(e) { return { error: e.message }; }
    }
  };
})();
