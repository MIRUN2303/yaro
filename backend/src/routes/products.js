const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('products')
      .select('*, collection:collections(id, name, slug), story:stories(id, title, slug)');
    if (req.query.collection_id) {
      query = query.eq('collection_id', req.query.collection_id);
    }
    if (req.query.story_id) {
      query = query.eq('story_id', req.query.story_id);
    }
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, collection:collections(id, name, slug), story:stories(id, title, slug)')
      .eq('slug', req.params.slug)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, slug, description, price, original_price, sale_price, stock, sku, images, sizes, status, category, gender, badge, badge_class, story_text, offer_name, collection_id, story_id } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' });
    const { data, error } = await supabase
      .from('products')
      .insert({ name, slug, description, price, original_price, sale_price, stock, sku, images, sizes, status, category, gender, badge, badge_class, story_text, offer_name, collection_id, story_id })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.id;
    delete updates.created_at;
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/flags (admin)
router.patch('/:id/flags', adminAuth, async (req, res) => {
  try {
    const { badge_class } = req.body;
    const allowed = ['bestseller', 'new', 'featured', ''];
    if (badge_class !== undefined && !allowed.includes(badge_class)) {
      return res.status(400).json({ error: 'Invalid badge_class. Allowed: bestseller, new, featured' });
    }
    const updates = {};
    if (badge_class !== undefined) updates.badge_class = badge_class;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
