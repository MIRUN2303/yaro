const BASE = '/api';
const TOKEN = localStorage.getItem('admin_token');

if (!TOKEN && !window.location.href.includes('login.html')) {
  window.location.href = 'login.html';
}

async function api(path, opts) {
  opts = opts || {};
  try {
    var res = await fetch(BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { 'Authorization': 'Bearer ' + TOKEN } : {}),
        ...(opts.headers || {})
      },
      ...opts
    });
    return res.json();
  } catch(e) {
    return { error: 'Network error' };
  }
}

function showToast(msg, type) {
  var t = document.createElement('div');
  t.className = 'toast ' + (type || 'success') + ' show';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 2500);
}

// ─── ROUTING ───
var sidebarLinks = document.querySelectorAll('#sidebar nav a');
for (var i = 0; i < sidebarLinks.length; i++) {
  sidebarLinks[i].addEventListener('click', function(e) {
    e.preventDefault();
    var links = document.querySelectorAll('#sidebar nav a');
    for (var j = 0; j < links.length; j++) links[j].classList.remove('active');
    this.classList.add('active');
    loadPage(this.dataset.page);
  });
}

document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('admin_token');
  window.location.href = 'login.html';
});

function loadPage(page) {
  var container = document.getElementById('page-content');
  switch(page) {
    case 'dashboard': renderDashboard(container); break;
    case 'collections': renderCollections(container); break;
    case 'stories': renderStories(container); break;
    case 'products': renderProducts(container); break;
    case 'orders': renderOrders(container); break;
    case 'homepage': renderHomepage(container); break;
    case 'settings': renderSettings(container); break;
  }
}

// ─── DASHBOARD ───
async function renderDashboard(container) {
  try {
    var result = await Promise.all([api('/collections'), api('/products'), api('/orders?admin=1'), api('/stories')]);
    var cols = Array.isArray(result[0]) ? result[0] : [];
    var prods = Array.isArray(result[1]) ? result[1] : [];
    var ords = Array.isArray(result[2]) ? result[2] : [];
    var stories = Array.isArray(result[3]) ? result[3] : [];
    container.innerHTML =
      '<div class="page-header"><h2>Dashboard</h2></div>' +
      '<div class="dashboard-grid">' +
        '<div class="stat-card"><div class="stat-value">' + cols.length + '</div><div class="stat-label">Collections</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + stories.length + '</div><div class="stat-label">Stories</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + prods.length + '</div><div class="stat-label">Products</div></div>' +
        '<div class="stat-card"><div class="stat-value">' + ords.length + '</div><div class="stat-label">Orders</div></div>' +
      '</div>';
  } catch(e) { container.innerHTML = '<p style="color:#666;padding:40px;">Error loading dashboard</p>'; }
}

// ─── COLLECTIONS ───
async function renderCollections(container) {
  var data = await api('/collections');
  var items = Array.isArray(data) ? data : [];
  container.innerHTML =
    '<div class="page-header"><h2>Collections</h2><button class="btn btn-primary" onclick="openCollectionModal()">+ Add Collection</button></div>' +
    '<div class="table-wrap"><table>' +
      '<thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr></thead>' +
      '<tbody>' + items.map(function(c) { return '<tr><td><strong>' + esc(c.name) + '</strong></td><td>' + esc(c.slug) + '</td><td>' + esc((c.description||'').slice(0,60)) + '</td><td class="actions"><button class="btn btn-sm btn-primary" onclick="openCollectionModal(\'' + c.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'collections\',\'' + c.id + '\')">Delete</button></td></tr>'; }).join('') +
      '</tbody></table></div>';
}

function openCollectionModal(id) {
  var title = id ? 'Edit Collection' : 'Add Collection';
  var html = '<h3>' + title + '</h3><form id="modal-form">';
  html += '<div class="form-group"><label>Name</label><input type="text" id="f-name" required></div>';
  html += '<div class="form-group"><label>Slug</label><input type="text" id="f-slug" required></div>';
  html += '<div class="form-group"><label>Description</label><textarea id="f-desc"></textarea></div>';
  html += '<div class="form-group"><label>Cover Image URL</label><input type="text" id="f-cover"></div>';
  html += '<button type="submit" class="btn btn-primary">Save</button></form>';
  openModal(html);
  if (id) loadCollection(id);
  document.getElementById('modal-form').addEventListener('submit', function(e) { e.preventDefault(); saveCollection(id); });
}

async function loadCollection(id) {
  var data = await api('/collections/' + id);
  if (data && !data.error) {
    setVal('f-name', data.name);
    setVal('f-slug', data.slug);
    setVal('f-desc', data.description);
    setVal('f-cover', data.cover_image);
  }
}

async function saveCollection(id) {
  var body = {
    name: val('f-name'), slug: val('f-slug'),
    description: val('f-desc'), cover_image: val('f-cover')
  };
  var res = id ? await api('/collections/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/collections', { method: 'POST', body: JSON.stringify(body) });
  if (res && res.error) { showToast(res.error, 'error'); return; }
  closeModal(); showToast(id ? 'Collection updated' : 'Collection created'); loadPage('collections');
}

// ─── STORIES ───
async function renderStories(container) {
  var result = await Promise.all([api('/stories'), api('/collections')]);
  var items = Array.isArray(result[0]) ? result[0] : [];
  var cols = Array.isArray(result[1]) ? result[1] : [];
  var colMap = {};
  for (var i = 0; i < cols.length; i++) colMap[cols[i].id] = cols[i].name;
  container.innerHTML =
    '<div class="page-header"><h2>Stories</h2><button class="btn btn-primary" onclick="openStoryModal()">+ Add Story</button></div>' +
    '<div class="table-wrap"><table>' +
      '<thead><tr><th>Title</th><th>Slug</th><th>Collection</th><th>Actions</th></tr></thead>' +
      '<tbody>' + items.map(function(s) { return '<tr><td><strong>' + esc(s.title) + '</strong></td><td>' + esc(s.slug) + '</td><td>' + esc(colMap[s.collection_id] || '-') + '</td><td class="actions"><button class="btn btn-sm btn-primary" onclick="openStoryModal(\'' + s.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'stories\',\'' + s.id + '\')">Delete</button></td></tr>'; }).join('') +
      '</tbody></table></div>';
}

async function openStoryModal(id) {
  var cols = await api('/collections');
  var colList = Array.isArray(cols) ? cols : [];
  var title = id ? 'Edit Story' : 'Add Story';
  var html = '<h3>' + title + '</h3><form id="modal-form">';
  html += '<div class="form-group"><label>Collection</label><select id="f-collection">';
  for (var i = 0; i < colList.length; i++) html += '<option value="' + colList[i].id + '">' + esc(colList[i].name) + '</option>';
  html += '</select></div>';
  html += '<div class="form-group"><label>Title</label><input type="text" id="f-title" required></div>';
  html += '<div class="form-group"><label>Slug</label><input type="text" id="f-slug" required></div>';
  html += '<div class="form-group"><label>Description</label><input type="text" id="f-desc"></div>';
  html += '<div class="form-group"><label>Story Content</label><textarea id="f-content"></textarea></div>';
  html += '<button type="submit" class="btn btn-primary">Save</button></form>';
  openModal(html);
  if (id) loadStory(id);
  document.getElementById('modal-form').addEventListener('submit', function(e) { e.preventDefault(); saveStory(id); });
}

async function loadStory(id) {
  var data = await api('/stories/' + id);
  if (data && !data.error) {
    setVal('f-collection', data.collection_id);
    setVal('f-title', data.title);
    setVal('f-slug', data.slug);
    setVal('f-desc', data.description);
    setVal('f-content', data.story_content);
  }
}

async function saveStory(id) {
  var body = {
    collection_id: val('f-collection') || null,
    title: val('f-title'), slug: val('f-slug'),
    description: val('f-desc'), story_content: val('f-content')
  };
  var res = id ? await api('/stories/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/stories', { method: 'POST', body: JSON.stringify(body) });
  if (res && res.error) { showToast(res.error, 'error'); return; }
  closeModal(); showToast(id ? 'Story updated' : 'Story created'); loadPage('stories');
}

// ─── PRODUCTS ───
async function renderProducts(container) {
  var result = await Promise.all([api('/products'), api('/collections'), api('/stories')]);
  var items = Array.isArray(result[0]) ? result[0] : [];
  var cols = Array.isArray(result[1]) ? result[1] : [];
  var colMap = {};
  for (var i = 0; i < cols.length; i++) colMap[cols[i].id] = cols[i].name;
  container.innerHTML =
    '<div class="page-header"><h2>Products</h2><button class="btn btn-primary" onclick="openProductModal()">+ Add Product</button></div>' +
    '<div class="table-wrap"><table>' +
      '<thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Collection</th><th>Flags</th><th>Status</th><th>Actions</th></tr></thead>' +
      '<tbody>' + items.map(function(p) {
        return '<tr><td>' + (p.images && p.images[0] ? '<img class="thumb" src="' + p.images[0] + '">' : '-') + '</td>' +
          '<td><strong>' + esc(p.name) + '</strong></td>' +
          '<td>\u20b9' + (p.price || 0) + '</td>' +
          '<td>' + (p.stock || 0) + '</td>' +
          '<td>' + esc(colMap[p.collection_id] || '-') + '</td>' +
          '<td><div class="flag-group">' +
            '<button class="flag-btn ' + (p.badge_class === 'bestseller' ? 'active' : '') + '" onclick="setFlag(\'' + p.id + '\',\'bestseller\')"><span class="flag-indicator flag-bestseller"></span>Best</button>' +
            '<button class="flag-btn ' + (p.badge_class === 'new' ? 'active' : '') + '" onclick="setFlag(\'' + p.id + '\',\'new\')"><span class="flag-indicator flag-new"></span>New</button>' +
            '<button class="flag-btn ' + (p.badge_class === 'featured' ? 'active' : '') + '" onclick="setFlag(\'' + p.id + '\',\'featured\')"><span class="flag-indicator flag-featured"></span>Featured</button>' +
            '<button class="flag-btn ' + (!p.badge_class ? 'active' : '') + '" onclick="setFlag(\'' + p.id + '\',\'\')">None</button>' +
          '</div></td>' +
          '<td><span class="badge ' + (p.status === 'active' ? 'badge-success' : 'badge-warning') + '">' + esc(p.status) + '</span></td>' +
          '<td class="actions"><button class="btn btn-sm btn-primary" onclick="openProductModal(\'' + p.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'products\',\'' + p.id + '\')">Delete</button></td></tr>';
      }).join('') +
      '</tbody></table></div>';
}

async function setFlag(id, badgeClass) {
  var res = await api('/products/' + id + '/flags', { method: 'PATCH', body: JSON.stringify({ badge_class: badgeClass }) });
  if (res && res.error) { showToast(res.error, 'error'); return; }
  showToast('Flag updated');
  loadPage('products');
}

async function openProductModal(id) {
  var result = await Promise.all([api('/collections'), api('/stories')]);
  var cols = Array.isArray(result[0]) ? result[0] : [];
  var stories = Array.isArray(result[1]) ? result[1] : [];
  var title = id ? 'Edit Product' : 'Add Product';
  var html = '<h3>' + title + '</h3><form id="modal-form">';
  html += '<div class="form-row"><div class="form-group"><label>Collection</label><select id="f-collection"><option value="">None</option>';
  for (var i = 0; i < cols.length; i++) html += '<option value="' + cols[i].id + '">' + esc(cols[i].name) + '</option>';
  html += '</select></div><div class="form-group"><label>Story</label><select id="f-story"><option value="">None</option>';
  for (var i = 0; i < stories.length; i++) html += '<option value="' + stories[i].id + '">' + esc(stories[i].title) + '</option>';
  html += '</select></div></div>';
  html += '<div class="form-row"><div class="form-group"><label>Name</label><input type="text" id="f-name" required></div>';
  html += '<div class="form-group"><label>Slug</label><input type="text" id="f-slug" required></div></div>';
  html += '<div class="form-group"><label>Description</label><textarea id="f-desc"></textarea></div>';
  html += '<div class="form-row"><div class="form-group"><label>Price (\u20b9)</label><input type="number" id="f-price"></div>';
  html += '<div class="form-group"><label>Original Price (\u20b9)</label><input type="number" id="f-oprice"></div></div>';
  html += '<div class="form-row"><div class="form-group"><label>Stock</label><input type="number" id="f-stock"></div>';
  html += '<div class="form-group"><label>SKU</label><input type="text" id="f-sku"></div></div>';
  html += '<div class="form-group"><label>Images (comma-separated URLs)</label><input type="text" id="f-images"></div>';
  html += '<div class="form-group"><label>Sizes (comma-separated)</label><input type="text" id="f-sizes"></div>';
  html += '<div class="form-row"><div class="form-group"><label>Badge Text</label><input type="text" id="f-badge"></div>';
  html += '<div class="form-group"><label>Offer Name</label><input type="text" id="f-offer"></div></div>';
  html += '<div class="form-row"><div class="form-group"><label>Gender</label><select id="f-gender"><option value="Any">Any</option><option value="His">His</option><option value="Hers">Hers</option><option value="Mini">Mini</option><option value="Mini-Gent">Mini-Gent</option><option value="Mini-Lady">Mini-Lady</option></select></div>';
  html += '<div class="form-group"><label>Category</label><input type="text" id="f-category"></div></div>';
  html += '<div class="form-group"><label>Story Text</label><textarea id="f-story-text"></textarea></div>';
  html += '<div class="form-group"><label>Status</label><select id="f-status"><option value="active">Active</option><option value="draft">Draft</option></select></div>';
  html += '<button type="submit" class="btn btn-primary">Save</button></form>';
  openModal(html);
  if (id) loadProduct(id);
  document.getElementById('modal-form').addEventListener('submit', function(e) { e.preventDefault(); saveProduct(id); });
}

async function loadProduct(id) {
  var data = await api('/products/' + id);
  if (data && !data.error) {
    setVal('f-collection', data.collection_id);
    setVal('f-story', data.story_id);
    setVal('f-name', data.name);
    setVal('f-slug', data.slug);
    setVal('f-desc', data.description);
    setVal('f-price', data.price);
    setVal('f-oprice', data.original_price);
    setVal('f-stock', data.stock);
    setVal('f-sku', data.sku);
    setVal('f-images', (data.images || []).join(', '));
    setVal('f-sizes', (data.sizes || []).join(', '));
    setVal('f-badge', data.badge);
    setVal('f-offer', data.offer_name);
    setVal('f-gender', data.gender || 'Any');
    setVal('f-category', data.category);
    setVal('f-story-text', data.story_text);
    setVal('f-status', data.status || 'active');
  }
}

async function saveProduct(id) {
  var body = {
    collection_id: val('f-collection') || null,
    story_id: val('f-story') || null,
    name: val('f-name'),
    slug: val('f-slug'),
    description: val('f-desc'),
    price: parseInt(val('f-price')) || 0,
    original_price: parseInt(val('f-oprice')) || null,
    stock: parseInt(val('f-stock')) || 0,
    sku: val('f-sku'),
    images: val('f-images').split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    sizes: val('f-sizes').split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    badge: val('f-badge'),
    badge_class: '',
    offer_name: val('f-offer'),
    gender: val('f-gender') || 'Any',
    category: val('f-category'),
    story_text: val('f-story-text'),
    status: val('f-status')
  };
  var res = id ? await api('/products/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/products', { method: 'POST', body: JSON.stringify(body) });
  if (res && res.error) { showToast(res.error, 'error'); return; }
  closeModal(); showToast(id ? 'Product updated' : 'Product created'); loadPage('products');
}

// ─── ORDERS ───
async function renderOrders(container) {
  var data = await api('/orders?admin=1');
  var items = Array.isArray(data) ? data : [];
  container.innerHTML =
    '<div class="page-header"><h2>Orders</h2></div>' +
    '<div class="table-wrap"><table>' +
      '<thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th><th>Actions</th></tr></thead>' +
      '<tbody>' + (items.length ? items.map(function(o) {
        var ps = o.payment_status; var fs = o.fulfillment_status;
        return '<tr><td><strong>' + esc(o.order_number) + '</strong></td>' +
          '<td>' + esc(o.user_id || '-') + '</td>' +
          '<td>\u20b9' + ((o.total/100).toFixed(2)) + '</td>' +
          '<td><span class="badge ' + (ps === 'confirmed' ? 'badge-success' : ps === 'failed' ? 'badge-danger' : ps === 'refunded' ? 'badge-warning' : '') + '">' + esc(ps) + '</span></td>' +
          '<td><span class="badge ' + (fs === 'shipped' || fs === 'delivered' ? 'badge-success' : '') + '">' + esc(fs) + '</span></td>' +
          '<td>' + (o.created_at ? new Date(o.created_at).toLocaleDateString() : '-') + '</td>' +
          '<td class="actions"><button class="btn btn-sm btn-primary" onclick="updateOrderStatus(\'' + o.id + '\')">Update</button></td></tr>';
      }).join('') : '<tr><td colspan="7" style="text-align:center;color:#666;padding:40px;">No orders yet</td></tr>') +
      '</tbody></table></div>';
}

async function updateOrderStatus(id) {
  var html = '<h3>Update Order Status</h3><form id="modal-form">';
  html += '<div class="form-group"><label>Payment Status</label><select id="f-pstatus"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></div>';
  html += '<div class="form-group"><label>Fulfillment Status</label><select id="f-fstatus"><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select></div>';
  html += '<button type="submit" class="btn btn-primary">Update</button></form>';
  openModal(html);
  document.getElementById('modal-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = { payment_status: val('f-pstatus'), fulfillment_status: val('f-fstatus') };
    var res = await api('/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify(body) });
    if (res && res.error) { showToast(res.error, 'error'); return; }
    closeModal(); showToast('Order status updated'); loadPage('orders');
  });
}

// ─── HOMEPAGE ───
async function renderHomepage(container) {
  var data = await api('/homepage');
  var hp = data && !data.error ? data : {};
  var cols = await api('/collections');
  var stories = await api('/stories');
  var colList = Array.isArray(cols) ? cols : [];
  var storyList = Array.isArray(stories) ? stories : [];
  container.innerHTML =
    '<div class="page-header"><h2>Homepage Settings</h2></div>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:32px;max-width:720px;">' +
    '<form id="homepage-form">' +
      '<div class="form-group"><label>Hero Title</label><input type="text" id="hp-hero-title" value="' + esc(hp.hero_title || '') + '"></div>' +
      '<div class="form-group"><label>Hero Subtitle</label><input type="text" id="hp-hero-subtitle" value="' + esc(hp.hero_subtitle || '') + '"></div>' +
      '<div class="form-group"><label>CTA Button Text</label><input type="text" id="hp-cta-text" value="' + esc(hp.cta_text || '') + '"></div>' +
      '<div class="form-group"><label>Featured Collection</label><select id="hp-featured-collection"><option value="">None</option>';
  for (var i = 0; i < colList.length; i++) {
    container.innerHTML += '<option value="' + colList[i].id + '"' + (hp.featured_collection_id === colList[i].id ? ' selected' : '') + '>' + esc(colList[i].name) + '</option>';
  }
  container.innerHTML += '</select></div>' +
      '<div class="form-group"><label>Featured Story</label><select id="hp-featured-story"><option value="">None</option>';
  for (var i = 0; i < storyList.length; i++) {
    container.innerHTML += '<option value="' + storyList[i].id + '"' + (hp.featured_story_id === storyList[i].id ? ' selected' : '') + '>' + esc(storyList[i].title) + '</option>';
  }
  container.innerHTML += '</select></div>' +
      '<div class="form-group"><label>About Text</label><textarea id="hp-about-text" style="min-height:100px;">' + esc(hp.about_text || '') + '</textarea></div>' +
      '<button type="submit" class="btn btn-primary">Save Changes</button>' +
    '</form></div>';
  document.getElementById('homepage-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
      hero_title: val('hp-hero-title'),
      hero_subtitle: val('hp-hero-subtitle'),
      cta_text: val('hp-cta-text'),
      featured_collection_id: val('hp-featured-collection') || null,
      featured_story_id: val('hp-featured-story') || null,
      about_text: val('hp-about-text')
    };
    var res = await api('/homepage', { method: 'PUT', body: JSON.stringify(body) });
    if (res && res.error) { showToast(res.error, 'error'); return; }
    showToast('Homepage settings saved');
  });
}

// ─── SETTINGS ───
async function renderSettings(container) {
  var data = await api('/settings');
  var s = data && !data.error ? data : {};
  var socialStr = '';
  if (s.social_links && typeof s.social_links === 'object') {
    try { socialStr = JSON.stringify(s.social_links, null, 2); } catch(e) { socialStr = ''; }
  }
  container.innerHTML =
    '<div class="page-header"><h2>Site Settings</h2></div>' +
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:32px;max-width:720px;">' +
    '<form id="settings-form">' +
      '<div class="form-group"><label>Site Name</label><input type="text" id="st-site-name" value="' + esc(s.site_name || '') + '"></div>' +
      '<div class="form-group"><label>Site Description</label><input type="text" id="st-site-desc" value="' + esc(s.site_description || '') + '"></div>' +
      '<div class="form-group"><label>Admin Email</label><input type="email" id="st-admin-email" value="' + esc(s.admin_email || '') + '"></div>' +
      '<div class="form-row"><div class="form-group"><label>Currency</label><select id="st-currency"><option value="INR"' + (s.currency === 'INR' ? ' selected' : '') + '>INR (\u20b9)</option><option value="USD"' + (s.currency === 'USD' ? ' selected' : '') + '>USD ($)</option></select></div>' +
      '<div class="form-group"><label>Shipping Fee (\u20b9)</label><input type="number" id="st-shipping" value="' + (s.shipping_fee || 0) + '"></div></div>' +
      '<div class="form-group"><label>Tax Rate (%)</label><input type="number" id="st-tax" value="' + (s.tax_rate || 0) + '" step="0.1"></div>' +
      '<div class="form-group"><label>Social Links (JSON)</label><textarea id="st-social" style="min-height:80px;font-family:monospace;font-size:12px;">' + esc(socialStr) + '</textarea><div class="form-hint">Example: {"instagram":"https://instagram.com/yaro","twitter":"https://twitter.com/yaro"}</div></div>' +
      '<button type="submit" class="btn btn-primary">Save Changes</button>' +
    '</form></div>';
  document.getElementById('settings-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var socialRaw = val('st-social');
    var socialLinks = {};
    if (socialRaw.trim()) {
      try { socialLinks = JSON.parse(socialRaw); } catch(e) { showToast('Invalid JSON in social links', 'error'); return; }
    }
    var body = {
      site_name: val('st-site-name'),
      site_description: val('st-site-desc'),
      admin_email: val('st-admin-email'),
      currency: val('st-currency'),
      shipping_fee: parseFloat(val('st-shipping')) || 0,
      tax_rate: parseFloat(val('st-tax')) || 0,
      social_links: socialLinks
    };
    var res = await api('/settings', { method: 'PUT', body: JSON.stringify(body) });
    if (res && res.error) { showToast(res.error, 'error'); return; }
    showToast('Settings saved');
  });
}

// ─── HELPERS ───
function esc(str) { var d = document.createElement('div'); d.appendChild(document.createTextNode(str || '')); return d.innerHTML; }
function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }

function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

document.querySelector('.modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

async function deleteItem(type, id) {
  if (!confirm('Delete this ' + type.slice(0, -1) + '?')) return;
  var res = await api('/' + type + '/' + id, { method: 'DELETE' });
  if (res && res.error) { showToast(res.error, 'error'); return; }
  showToast(type.slice(0, -1) + ' deleted');
  loadPage(type);
}

// Init
loadPage('dashboard');
