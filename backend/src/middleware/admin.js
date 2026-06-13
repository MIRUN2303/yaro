// Admin authentication middleware for Express routes
// Verifies JWT token from Authorization header and ensures role is 'admin'
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer', '').trim();
  if (!token) return res.status(401).json({ error: 'Admin token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Not admin');
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
}

module.exports = { adminAuth };
