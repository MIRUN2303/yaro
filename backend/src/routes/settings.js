const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

// GET /api/settings — public site settings
// Supports ?key=xxx to filter a single setting
router.get('/', async (req, res) => {
  try {
    const key = req.query.key;
    let query = supabase.from('settings').select('*').order('created_at', { ascending: true });

    if (key) {
      const { data, error } = await query.eq('id', key).limit(1).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return res.json(data ? data.value : null);
    }

    const { data, error } = await query;
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — upsert a setting (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { id, value } = req.body;
    if (!id) return res.status(400).json({ error: 'Setting id required' });

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('id', id)
      .limit(1)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert({ id, value })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
