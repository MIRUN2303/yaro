const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const uploadDir = process.env.UPLOAD_DIR || path.join(os.tmpdir(), 'yaro-uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// POST /api/upload — upload to Supabase Storage
router.post('/', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from('yaro-images')
      .upload('public/' + fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    // Clean up local temp file
    fs.unlinkSync(filePath);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('yaro-images')
      .getPublicUrl('public/' + fileName);

    res.json({ url: publicUrl, path: data.path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
