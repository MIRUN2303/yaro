const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

// GET /api/collections
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/collections/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Collection not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, slug, description, cover_image } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'Name and slug required' });
    const { data, error } = await supabase
      .from('collections')
      .insert({ name, slug, description, cover_image })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/collections/:id (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, slug, description, cover_image } = req.body;
    const { data, error } = await supabase
      .from('collections')
      .update({ name, slug, description, cover_image })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Collection not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Collection deleted', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
