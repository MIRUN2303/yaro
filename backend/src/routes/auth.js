const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { sendWelcome } = require('../services/email');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Signup failed');

    // Cocopoy-style: store role in users table (default 'user')
    const role = authData.user.user_metadata?.role || 'user';
    const { error: userError } = await supabase
      .from('users')
      .insert({ id: authData.user.id, name, email, phone, role });

    if (userError) console.warn('User mirror insert warning:', userError.message);

    // Send welcome email
    sendWelcome(email, name || email);

    res.status(201).json({
      message: 'Account created. Check your email to confirm.',
      user: authData.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Get or create local user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!existingUser) {
      await supabase
        .from('users')
        .insert({ id: data.user.id, email, name: data.user.user_metadata?.name || email });
    }

    const response = {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || existingUser?.name || email
      }
    };

    // Cocopoy-style admin check: hardcoded email OR database role
    const isAdmin = email === process.env.ADMIN_EMAIL ||
      (existingUser && existingUser.role === 'admin');
    if (isAdmin) {
      // Ensure role is set in DB for future checks
      if (existingUser && existingUser.role !== 'admin') {
        await supabase.from('users').update({ role: 'admin' }).eq('id', existingUser.id);
      }
      response.admin_token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      response.admin_path = process.env.ADMIN_PATH;
    }

    res.json(response);
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await supabase.auth.admin.signOut(token);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.FRONTEND_URL + '/reset-password.html'
    });

    if (error) throw error;
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || user.email,
      phone: profile?.phone || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      role: profile?.role || 'user'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile — update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const { name, phone, avatar_url } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      // If user doesn't exist in mirror, create it
      if (error.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({ id: user.id, email: user.email, name: name || user.email, phone: phone || '', avatar_url: avatar_url || '' })
          .select()
          .single();
        if (insertError) throw insertError;
        return res.json({ id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone || '', avatar_url: newUser.avatar_url || '' });
      }
      throw error;
    }

    res.json({ id: data.id, name: data.name, email: data.email, phone: data.phone || '', avatar_url: data.avatar_url || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login (local JWT, not Supabase)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let authorized = false;

    // Check 1: Hardcoded admin credentials from .env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      authorized = true;
    }

    // Check 2: Cocopoy-style DB role check (role='admin' in users table)
    if (!authorized) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();

      if (user && user.role === 'admin') {
        // For DB-role admins, verify password against Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (!authError && authData.user) {
          authorized = true;
        }
      }
    }

    if (authorized) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({ token, message: 'Admin authenticated' });
    }
    res.status(401).json({ error: 'Invalid admin credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify admin token (used by frontend admin.html for server-side check)
router.get('/admin/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.json({ valid: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.json({ valid: true, email: decoded.email });
    }
    res.json({ valid: false });
  } catch (err) {
    res.json({ valid: false });
  }
});

module.exports = router;
