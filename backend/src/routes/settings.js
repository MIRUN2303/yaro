const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');

// GET /api/settings — public site settings
// Supports ?key=xxx to filter a single setting
router.get('/', async (req, res) => {
  try {
    const key = req.query.key;
    
    // Fetch the first row from the settings table
    const { data: settingsRow, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (key) {
      if (!settingsRow) {
        // Fallbacks if no data seeded yet
        if (key === 'announcement') return res.json({ enabled: false, text: '' });
        if (key === 'store_banner') return res.json({ heading: 'Every Collection Begins Somewhere', subheading: 'Stories you can wear', enabled: true });
        if (key === 'social_links') return res.json({ instagram: '', facebook: '', twitter: '' });
        return res.json(null);
      }

      if (key === 'announcement') {
        return res.json(settingsRow.social_links?._announcement || { enabled: false, text: '' });
      }
      if (key === 'store_banner') {
        return res.json(settingsRow.social_links?._store_banner || { heading: 'Every Collection Begins Somewhere', subheading: 'Stories you can wear', enabled: true });
      }
      if (key === 'social_links') {
        const cleanLinks = {};
        if (settingsRow.social_links) {
          Object.keys(settingsRow.social_links).forEach(k => {
            if (!k.startsWith('_')) cleanLinks[k] = settingsRow.social_links[k];
          });
        }
        return res.json(cleanLinks);
      }
      // Return custom database column if requested
      return res.json(settingsRow[key] !== undefined ? settingsRow[key] : null);
    }

    // Return the settings array for the other admin dashboard, filtering out private keys
    if (!settingsRow) {
      return res.json([]);
    }

    const cleanLinks = {};
    if (settingsRow.social_links) {
      Object.keys(settingsRow.social_links).forEach(k => {
        if (!k.startsWith('_')) cleanLinks[k] = settingsRow.social_links[k];
      });
    }

    const cleanRow = {
      ...settingsRow,
      social_links: cleanLinks
    };

    res.json([cleanRow]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — upsert a setting (admin)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { id, value } = req.body;

    // Fetch existing settings row
    let { data: existing, error: getErr } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (getErr && getErr.code !== 'PGRST116') throw getErr;

    if (id) {
      // ─── Single key-value update (admin.html style) ───
      let social_links = existing ? (existing.social_links || {}) : {};
      
      if (id === 'announcement' || id === 'store_banner') {
        social_links['_' + id] = value;
      } else if (id === 'social_links') {
        // merge and preserve private keys
        const cleanLinks = value || {};
        const newSocial = { ...cleanLinks };
        Object.keys(social_links).forEach(k => {
          if (k.startsWith('_')) newSocial[k] = social_links[k];
        });
        social_links = newSocial;
      } else {
        return res.status(400).json({ error: 'Unsupported setting key: ' + id });
      }

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('settings')
          .update({ social_links, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert({ social_links })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return res.json({ id, value });
    } else {
      // ─── Full settings object update (backend/admin style) ───
      const { site_name, site_description, admin_email, currency, shipping_fee, tax_rate, social_links: clientLinks } = req.body;
      
      let social_links = existing ? (existing.social_links || {}) : {};
      const newSocial = { ...(clientLinks || {}) };
      // preserve private keys
      Object.keys(social_links).forEach(k => {
        if (k.startsWith('_')) newSocial[k] = social_links[k];
      });

      const updates = {
        site_name,
        site_description,
        admin_email,
        currency,
        shipping_fee: parseFloat(shipping_fee) || 0,
        tax_rate: parseFloat(tax_rate) || 0,
        social_links: newSocial,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('settings')
          .update(updates)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert(updates)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      // Return clean response to the client
      const responseLinks = {};
      if (result.social_links) {
        Object.keys(result.social_links).forEach(k => {
          if (!k.startsWith('_')) responseLinks[k] = result.social_links[k];
        });
      }
      return res.json({
        ...result,
        social_links: responseLinks
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
