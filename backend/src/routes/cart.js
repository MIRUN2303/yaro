const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Helper to get or create cart
async function getOrCreateCart(userId) {
  let { data: cart } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    cart = newCart;
  }
  return cart;
}

// GET /api/cart
router.get('/', authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('cart_id', cart.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ cart_id: cart.id, items: items || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/add
router.post('/add', authenticate, async (req, res) => {
  try {
    const { product_id, size, quantity, bucket_name } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Product ID required' });

    const cart = await getOrCreateCart(req.user.id);

    // Check if product already exists in cart (same product + size + bucket)
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .eq('size', size || '')
      .eq('bucket_name', bucket_name || 'My Cart')
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + (quantity || 1) })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ message: 'Quantity updated', item: data });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id,
        size: size || '',
        quantity: quantity || 1,
        bucket_name: bucket_name || 'My Cart'
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: 'Item added to cart', item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/remove
router.post('/remove', authenticate, async (req, res) => {
  try {
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ error: 'Item ID required' });

    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', item_id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item removed', item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/update
router.post('/update', authenticate, async (req, res) => {
  try {
    const { item_id, quantity } = req.body;
    if (!item_id) return res.status(400).json({ error: 'Item ID required' });

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', item_id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Cart updated', item: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
