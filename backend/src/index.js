require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const app = require('./app');
const path = require('path');
const PORT = process.env.PORT || 3000;

// ─── LOCAL DEV: static file serving ───
const ADMIN_PATH = process.env.ADMIN_PATH || 'admin-secret-' + Math.random().toString(36).slice(2, 10);
console.log('Admin path: /' + ADMIN_PATH);

app.use('/' + ADMIN_PATH, express.static(path.join(__dirname, '..', 'admin'), { dotfiles: 'deny' }));
app.get('/admin', (req, res) => { res.status(404).send('Not found'); });
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { dotfiles: 'deny' }));

// ─── START ───
app.listen(PORT, () => {
  console.log(`YARO backend running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/${ADMIN_PATH}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
