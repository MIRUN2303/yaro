const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

// GET /api/stories
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('stories')
      .select('*, collection:collections(id, name, slug)');
    if (req.query.collection_id) {
      query = query.eq('collection_id', req.query.collection_id);
    }
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*, collection:collections(id, name, slug)')
      .eq('slug', req.params.slug)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Story not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stories (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { collection_id, title, slug, description, story_content, cover_image } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Title and slug required' });
    const { data, error } = await supabase
      .from('stories')
      .insert({ collection_id, title, slug, description, story_content, cover_image })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/stories/:id (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { collection_id, title, slug, description, story_content, cover_image } = req.body;
    const { data, error } = await supabase
      .from('stories')
      .update({ collection_id, title, slug, description, story_content, cover_image })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Story not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/stories/:id (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Story not found' });
    res.json({ message: 'Story deleted', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
