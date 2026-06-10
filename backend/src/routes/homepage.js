const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

const FALLBACK = {
  hero_title: 'WEAR WHAT STAYS WITH YOU.',
  hero_subtitle: 'Every Collection Begins Somewhere',
  cta_text: 'Explore Store',
  featured_collection_id: null,
  featured_story_id: null,
  about_text: ''
};

// GET /api/homepage — public homepage content
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || FALLBACK);
  } catch (err) {
    if (err.message && err.message.includes('relation') && err.message.includes('does not exist')) {
      return res.json(FALLBACK);
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/homepage — update homepage content (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { hero_title, hero_subtitle, cta_text, featured_collection_id, featured_story_id, about_text } = req.body;
    const { data: existing, error: existsErr } = await supabase.from('homepage').select('id').limit(1).single();
    if (!existsErr && existing) {
      const { data, error } = await supabase
        .from('homepage')
        .update({ hero_title, hero_subtitle, cta_text, featured_collection_id, featured_story_id, about_text, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }
    const { data, error } = await supabase
      .from('homepage')
      .insert({ hero_title, hero_subtitle, cta_text, featured_collection_id, featured_story_id, about_text })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    if (err.message && err.message.includes('relation') && err.message.includes('does not exist')) {
      return res.status(500).json({ error: 'homepage table does not exist. Run the migration script: node scripts/migrate.js' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
