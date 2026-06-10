const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

const FALLBACK = {
  site_name: 'YARO',
  site_description: 'Every Collection Begins Somewhere',
  admin_email: '',
  currency: 'INR',
  social_links: {},
  shipping_fee: 0,
  tax_rate: 0
};

// GET /api/settings — public site settings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings')
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

// PUT /api/settings — update site settings (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { site_name, site_description, admin_email, currency, social_links, shipping_fee, tax_rate } = req.body;
    const { data: existing, error: existsErr } = await supabase.from('settings').select('id').limit(1).single();
    if (!existsErr && existing) {
      const { data, error } = await supabase
        .from('settings')
        .update({ site_name, site_description, admin_email, currency, social_links, shipping_fee, tax_rate, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }
    const { data, error } = await supabase
      .from('settings')
      .insert({ site_name, site_description, admin_email, currency, social_links, shipping_fee, tax_rate })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    if (err.message && err.message.includes('relation') && err.message.includes('does not exist')) {
      return res.status(500).json({ error: 'settings table does not exist. Run: node scripts/migrate.js' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
