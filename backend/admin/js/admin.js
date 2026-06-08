const BASE = '/api';
const TOKEN = localStorage.getItem('admin_token');

if (!TOKEN && !window.location.href.includes('login.html')) {
  window.location.href = 'login.html';
}

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { 'Authorization': 'Bearer ' + TOKEN } : {}),
      ...opts.headers
    },
    ...opts
  });
  return res.json();
}

// ─── ROUTING ───
document.querySelectorAll('#sidebar nav a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('#sidebar nav a').forEach(function(a) { a.classList.remove('active'); });
    this.classList.add('active');
    loadPage(this.dataset.page);
  });
});

document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('admin_token');
  window.location.href = 'login.html';
});

function loadPage(page) {
  const container = document.getElementById('page-content');
  switch(page) {
    case 'dashboard': renderDashboard(container); break;
    case 'collections': renderCollections(container); break;
    case 'stories': renderStories(container); break;
    case 'products': renderProducts(container); break;
    case 'orders': renderOrders(container); break;
  }
}

// ─── DASHBOARD ───
async function renderDashboard(container) {
  try {
    const [cols, prods, ords] = await Promise.all([
      api('/collections'),
      api('/products'),
      api('/orders?admin=1')
    ]);
    container.innerHTML = `
      <div class="page-header"><h2>Dashboard</h2></div>
      <div class="dashboard-grid">
        <div class="stat-card"><div class="stat-value">${(Array.isArray(cols) ? cols : []).length}</div><div class="stat-label">Collections</div></div>
        <div class="stat-card"><div class="stat-value">${(Array.isArray(prods) ? prods : []).length}</div><div class="stat-label">Products</div></div>
        <div class="stat-card"><div class="stat-value">${(Array.isArray(ords) ? ords : []).length}</div><div class="stat-label">Orders</div></div>
      </div>`;
  } catch(e) { container.innerHTML = '<p>Error loading dashboard</p>'; }
}

// ─── COLLECTIONS ───
async function renderCollections(container) {
  const data = await api('/collections');
  const items = Array.isArray(data) ? data : [];
  container.innerHTML = `
    <div class="page-header"><h2>Collections</h2><button class="btn btn-primary" onclick="openCollectionModal()">+ Add Collection</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>${items.map(function(c) { return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.slug) + '</td><td>' + esc((c.description||'').slice(0,60)) + '</td><td class="actions"><button class="btn btn-sm btn-primary" onclick="openCollectionModal(\'' + c.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'collections\',\'' + c.id + '\')">Delete</button></td></tr>'; }).join('')}</tbody>
    </table></div>`;
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
  document.getElementById('modal-form').addEventListener('submit', function(e) {
    e.preventDefault(); saveCollection(id);
  });
}

async function loadCollection(id) {
  var data = await api('/collections/' + id);
  if (data.error) return;
  document.getElementById('f-name').value = data.name || '';
  document.getElementById('f-slug').value = data.slug || '';
  document.getElementById('f-desc').value = data.description || '';
  document.getElementById('f-cover').value = data.cover_image || '';
}

async function saveCollection(id) {
  var body = {
    name: document.getElementById('f-name').value,
    slug: document.getElementById('f-slug').value,
    description: document.getElementById('f-desc').value,
    cover_image: document.getElementById('f-cover').value
  };
  var res = id ? await api('/collections/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/collections', { method: 'POST', body: JSON.stringify(body) });
  if (res.error) { alert('Error: ' + res.error); return; }
  closeModal(); loadPage('collections');
}

// ─── STORIES ───
async function renderStories(container) {
  const [stories, cols] = await Promise.all([api('/stories'), api('/collections')]);
  const items = Array.isArray(stories) ? stories : [];
  const colMap = {};
  (Array.isArray(cols) ? cols : []).forEach(function(c) { colMap[c.id] = c.name; });
  container.innerHTML = `
    <div class="page-header"><h2>Stories</h2><button class="btn btn-primary" onclick="openStoryModal()">+ Add Story</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Title</th><th>Slug</th><th>Collection</th><th>Actions</th></tr></thead>
      <tbody>${items.map(function(s) { return '<tr><td>' + esc(s.title) + '</td><td>' + esc(s.slug) + '</td><td>' + esc(colMap[s.collection_id] || '-') + '</td><td class="actions"><button class="btn btn-sm btn-primary" onclick="openStoryModal(\'' + s.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'stories\',\'' + s.id + '\')">Delete</button></td></tr>'; }).join('')}</tbody>
    </table></div>`;
}

async function openStoryModal(id) {
  const cols = await api('/collections');
  var title = id ? 'Edit Story' : 'Add Story';
  var html = '<h3>' + title + '</h3><form id="modal-form">';
  html += '<div class="form-group"><label>Collection</label><select id="f-collection">';
  (Array.isArray(cols) ? cols : []).forEach(function(c) { html += '<option value="' + c.id + '">' + esc(c.name) + '</option>'; });
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
  if (data.error) return;
  document.getElementById('f-collection').value = data.collection_id || '';
  document.getElementById('f-title').value = data.title || '';
  document.getElementById('f-slug').value = data.slug || '';
  document.getElementById('f-desc').value = data.description || '';
  document.getElementById('f-content').value = data.story_content || '';
}

async function saveStory(id) {
  var body = {
    collection_id: document.getElementById('f-collection').value,
    title: document.getElementById('f-title').value,
    slug: document.getElementById('f-slug').value,
    description: document.getElementById('f-desc').value,
    story_content: document.getElementById('f-content').value
  };
  var res = id ? await api('/stories/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/stories', { method: 'POST', body: JSON.stringify(body) });
  if (res.error) { alert('Error: ' + res.error); return; }
  closeModal(); loadPage('stories');
}

// ─── PRODUCTS ───
async function renderProducts(container) {
  const [prods, cols, stories] = await Promise.all([api('/products'), api('/collections'), api('/stories')]);
  const items = Array.isArray(prods) ? prods : [];
  const colMap = {}; (Array.isArray(cols) ? cols : []).forEach(function(c) { colMap[c.id] = c.name; });
  container.innerHTML = `
    <div class="page-header"><h2>Products</h2><button class="btn btn-primary" onclick="openProductModal()">+ Add Product</button></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Price</th><th>Stock</th><th>Collection</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${items.map(function(p) { return '<tr><td>' + (p.images && p.images[0] ? '<img class="thumb" src="' + fixImg(p.images[0]) + '">' : '-') + '</td><td>' + esc(p.name) + '</td><td>' + esc(p.slug) + '</td><td>₹' + p.price + '</td><td>' + (p.stock || 0) + '</td><td>' + esc(colMap[p.collection_id] || '-') + '</td><td><span class="badge ' + (p.status === 'active' ? 'badge-success' : 'badge-warning') + '">' + esc(p.status) + '</span></td><td class="actions"><button class="btn btn-sm btn-primary" onclick="openProductModal(\'' + p.id + '\')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteItem(\'products\',\'' + p.id + '\')">Delete</button></td></tr>'; }).join('')}</tbody>
    </table></div>`;
}

async function openProductModal(id) {
  const [cols, stories] = await Promise.all([api('/collections'), api('/stories')]);
  var title = id ? 'Edit Product' : 'Add Product';
  var html = '<h3>' + title + '</h3><form id="modal-form">';
  html += '<div class="form-row"><div class="form-group"><label>Collection</label><select id="f-collection"><option value="">None</option>';
  (Array.isArray(cols) ? cols : []).forEach(function(c) { html += '<option value="' + c.id + '">' + esc(c.name) + '</option>'; });
  html += '</select></div><div class="form-group"><label>Story</label><select id="f-story"><option value="">None</option>';
  (Array.isArray(stories) ? stories : []).forEach(function(s) { html += '<option value="' + s.id + '">' + esc(s.title) + '</option>'; });
  html += '</select></div></div>';
  html += '<div class="form-row"><div class="form-group"><label>Name</label><input type="text" id="f-name" required></div>';
  html += '<div class="form-group"><label>Slug</label><input type="text" id="f-slug" required></div></div>';
  html += '<div class="form-group"><label>Description</label><textarea id="f-desc"></textarea></div>';
  html += '<div class="form-row"><div class="form-group"><label>Price (₹)</label><input type="number" id="f-price"></div>';
  html += '<div class="form-group"><label>Original Price (₹)</label><input type="number" id="f-oprice"></div></div>';
  html += '<div class="form-row"><div class="form-group"><label>Stock</label><input type="number" id="f-stock"></div>';
  html += '<div class="form-group"><label>SKU</label><input type="text" id="f-sku"></div></div>';
  html += '<div class="form-group"><label>Images (comma-separated URLs)</label><input type="text" id="f-images"></div>';
  html += '<div class="form-group"><label>Sizes (comma-separated)</label><input type="text" id="f-sizes"></div>';
  html += '<div class="form-row"><div class="form-group"><label>Badge</label><input type="text" id="f-badge"></div>';
  html += '<div class="form-group"><label>Offer Name</label><input type="text" id="f-offer"></div></div>';
  html += '<div class="form-group"><label>Story Text</label><textarea id="f-story-text"></textarea></div>';
  html += '<div class="form-group"><label>Status</label><select id="f-status"><option value="active">Active</option><option value="draft">Draft</option></select></div>';
  html += '<button type="submit" class="btn btn-primary">Save</button></form>';
  openModal(html);
  if (id) loadProduct(id);
  document.getElementById('modal-form').addEventListener('submit', function(e) { e.preventDefault(); saveProduct(id); });
}

async function loadProduct(id) {
  var data = await api('/products/' + id);
  if (data.error) return;
  document.getElementById('f-collection').value = data.collection_id || '';
  document.getElementById('f-story').value = data.story_id || '';
  document.getElementById('f-name').value = data.name || '';
  document.getElementById('f-slug').value = data.slug || '';
  document.getElementById('f-desc').value = data.description || '';
  document.getElementById('f-price').value = data.price || '';
  document.getElementById('f-oprice').value = data.original_price || '';
  document.getElementById('f-stock').value = data.stock || '';
  document.getElementById('f-sku').value = data.sku || '';
  document.getElementById('f-images').value = (data.images || []).join(', ');
  document.getElementById('f-sizes').value = (data.sizes || []).join(', ');
  document.getElementById('f-badge').value = data.badge || '';
  document.getElementById('f-offer').value = data.offer_name || '';
  document.getElementById('f-story-text').value = data.story_text || '';
  document.getElementById('f-status').value = data.status || 'active';
}

async function saveProduct(id) {
  var body = {
    collection_id: document.getElementById('f-collection').value || null,
    story_id: document.getElementById('f-story').value || null,
    name: document.getElementById('f-name').value,
    slug: document.getElementById('f-slug').value,
    description: document.getElementById('f-desc').value,
    price: parseInt(document.getElementById('f-price').value) || 0,
    original_price: parseInt(document.getElementById('f-oprice').value) || null,
    stock: parseInt(document.getElementById('f-stock').value) || 0,
    sku: document.getElementById('f-sku').value,
    images: document.getElementById('f-images').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    sizes: document.getElementById('f-sizes').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    badge: document.getElementById('f-badge').value,
    badge_class: '',
    offer_name: document.getElementById('f-offer').value,
    story_text: document.getElementById('f-story-text').value,
    status: document.getElementById('f-status').value
  };
  var res = id ? await api('/products/' + id, { method: 'PUT', body: JSON.stringify(body) })
               : await api('/products', { method: 'POST', body: JSON.stringify(body) });
  if (res.error) { alert('Error: ' + res.error); return; }
  closeModal(); loadPage('products');
}

// ─── ORDERS ───
async function renderOrders(container) {
  const data = await api('/orders?admin=1');
  const items = Array.isArray(data) ? data : [];
  container.innerHTML = `
    <div class="page-header"><h2>Orders</h2></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${items.length ? items.map(function(o) {
        var ps = o.payment_status;
        var fs = o.fulfillment_status;
        return '<tr><td><strong>' + esc(o.order_number) + '</strong></td><td>' + esc(o.user_id || '-') + '</td><td>₹' + (o.total/100).toFixed(2) + '</td><td><span class="badge ' + (ps === 'confirmed' ? 'badge-success' : ps === 'failed' ? 'badge-danger' : 'badge-warning') + '">' + esc(ps) + '</span></td><td><span class="badge ' + (fs === 'shipped' ? 'badge-success' : fs === 'delivered' ? 'badge-success' : 'badge-warning') + '">' + esc(fs) + '</span></td><td>' + (o.created_at ? new Date(o.created_at).toLocaleDateString() : '-') + '</td><td class="actions"><button class="btn btn-sm btn-primary" onclick="updateOrderStatus(\'' + o.id + '\')">Update</button></td></tr>'; }
      ).join('') : '<tr><td colspan="7" style="text-align:center;color:#666;padding:32px;">No orders yet</td></tr>'}</tbody>
    </table></div>`;
}

async function updateOrderStatus(id) {
  var html = '<h3>Update Order Status</h3><form id="modal-form">';
  html += '<div class="form-group"><label>Payment Status</label><select id="f-pstatus"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></div>';
  html += '<div class="form-group"><label>Fulfillment Status</label><select id="f-fstatus"><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option></select></div>';
  html += '<button type="submit" class="btn btn-primary">Update</button></form>';
  openModal(html);
  document.getElementById('modal-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var body = {
      payment_status: document.getElementById('f-pstatus').value,
      fulfillment_status: document.getElementById('f-fstatus').value
    };
    var res = await api('/orders/' + id + '/status', { method: 'PUT', body: JSON.stringify(body) });
    if (res.error) { alert('Error: ' + res.error); return; }
    closeModal(); loadPage('orders');
  });
}

// ─── HELPERS ───
function fixImg(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) return src;
  return '/' + src;
}
function esc(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

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
  if (res.error) { alert('Error: ' + res.error); return; }
  loadPage(type);
}

// Init
loadPage('dashboard');
