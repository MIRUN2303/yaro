# Connecting YARO Frontend to Backend

This document describes the minimal changes to connect the existing frontend to the backend API without altering any visual or behavioral characteristics.

## Overview

All frontend files remain **visually and functionally identical**. The only changes are:
1. Data source switches from static JS arrays to API calls
2. Cart operations sync with backend
3. Auth token management
4. Razorpay checkout integration

## File: `api.js` (NEW — add to project root)

Create this shared helper that all pages include:

```js
const API_BASE = window.location.origin + '/api';

const API = {
  token: null,

  setToken(t) { this.token = t; localStorage.setItem('yaro_token', t); },
  getToken() { return this.token || localStorage.getItem('yaro_token'); },
  clearToken() { this.token = null; localStorage.removeItem('yaro_token'); },

  async request(path, opts = {}) {
    const token = this.getToken();
    const res = await fetch(API_BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...opts.headers
      },
      ...opts
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'API error');
    }
    return res.json();
  },

  // Products
  products: (query) => API.request('/products' + (query ? '?' + query : '')),
  product: (slug) => API.request('/products/' + slug),

  // Collections
  collections: () => API.request('/collections'),
  collection: (slug) => API.request('/collections/' + slug),

  // Stories
  stories: (query) => API.request('/stories' + (query ? '?' + query : '')),
  story: (slug) => API.request('/stories/' + slug),

  // Cart
  getCart: () => API.request('/cart'),
  addToCart: (data) => API.request('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  removeFromCart: (itemId) => API.request('/cart/remove', { method: 'POST', body: JSON.stringify({ item_id: itemId }) }),
  updateCart: (itemId, qty) => API.request('/cart/update', { method: 'POST', body: JSON.stringify({ item_id: itemId, quantity: qty }) }),

  // Orders
  createOrder: (data) => API.request('/orders/create', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => API.request('/orders/verify', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => API.request('/orders'),

  // Auth
  login: (email, password) => API.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => API.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => API.request('/auth/logout', { method: 'POST' }),
  me: () => API.request('/auth/me'),

  // Payments
  getRazorpayKey: () => API.request('/payments/key'),
  createRazorpayOrder: (amount) => API.request('/payments/create-order', { method: 'POST', body: JSON.stringify({ amount }) })
};
```

## Per-Page Changes

### 1. `product.html`

**Change:** Replace static `productsDB` array with API data.

**Before (line ~1855):**
```js
const productsDB = [
  { id: 'obsidian-lava-tee', name: 'Midnight Drift', ... },
  // ... 7 more static entries
];
```

**After:**
```js
let productsDB = [];
(async function loadProducts() {
  try {
    productsDB = await API.products();
  } catch(e) {
    // Fallback: use embedded data if API unavailable
    productsDB = FALLBACK_PRODUCTS;
  }
  // Continue with existing logic using `activeProduct`
  const productId = urlParams.get('id') || 'obsidian-lava-tee';
  let activeProduct = productsDB.find(p => p.slug === productId);
  if (!activeProduct) activeProduct = productsDB[0];
  // ... rest of existing code unchanged
})();
```

Keep the existing static array as `FALLBACK_PRODUCTS` for when API is unreachable.

### 2. `store.html`

**Change:** Replace static product card HTML with dynamic rendering from API.

The 8 hardcoded `.product-card` elements should be rendered via JS after fetching from API. The HTML structure per card stays **identical** — only the data source changes.

**Minimal approach:** Add a script at the bottom that:
1. Fetches products from API
2. Populates the `.product-grid` with the same HTML structure
3. Re-binds all event listeners

Keep the static HTML as server-rendered fallback.

### 3. `cart.html`

**Change:** Sync localStorage buckets with backend cart.

**Minimal approach:**
- After any cart mutation, also call `API.addToCart()` / `API.removeFromCart()` in the background
- On page load, attempt to merge backend cart items with local buckets
- Keep localStorage as primary (works offline), use API as sync layer

The `productsDB` array should also come from API with fallback.

### 4. `index.html`

**Change:** Featured stories in slide 3 can fetch from API.

**Minimal approach:** The `.featured-story-item` elements in slide 3 currently have hardcoded `data-id` attributes. Add a script that enriches them with dynamic data from API (prices, availability) without changing the HTML structure.

### 5. Checkout Flow

**Change:** Integrate Razorpay.

In `cart.html`, when the user clicks the checkout button:

```js
// After creating the order on backend
const orderData = await API.createOrder({
  items: cartItems,
  subtotal: subtotal,
  shipping: shipping,
  tax: tax,
  total: total,
  shipping_address: shippingAddress
});

// Open Razorpay checkout
const rzp = new Razorpay({
  key: orderData.razorpay_key_id,
  order_id: orderData.razorpay_order_id,
  amount: orderData.amount,
  currency: 'INR',
  name: 'YARO',
  handler: async function(response) {
    await API.verifyPayment({
      order_id: orderData.order_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });
    // Show success
  }
});
rzp.open();
```

## Important

- **Do NOT change** any CSS classes, HTML structure, or animation code
- **Do NOT remove** existing static data — keep as fallback
- **Wrap all API calls** in try/catch with fallback to static data
- The website must work **identically** even if the backend is offline

## Testing

1. Start backend: `cd backend && npm start`
2. Open the frontend — everything should look the same
3. Data now comes from the database instead of static arrays
4. Admin dashboard at `/admin`
