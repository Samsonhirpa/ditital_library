const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadDir);
}

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.epub', '.jpg', '.jpeg', '.png', '.txt', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, EPUB, JPG, PNG, WEBP, TXT are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Upload new content (Librarian only)
router.post('/upload', authMiddleware, checkRole(['librarian', 'admin']), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  console.log('📤 Upload request received');
  
  try {
    const contentFile = req.files?.file?.[0];
    const coverFile = req.files?.cover?.[0];
    if (!contentFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { title, author, subject, year, keywords, access_level } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }
    
    const fileUrl = `/uploads/${contentFile.filename}`;
    const coverImageUrl = coverFile ? `/uploads/${coverFile.filename}` : null;
    const keywordsArray = keywords ? keywords.split(',').map(k => k.trim()) : [];
    
    const result = await pool.query(
      `INSERT INTO digital_contents 
       (title, author, subject, publication_year, keywords, file_url, cover_image_url, access_level, uploaded_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft') 
       RETURNING *`,
      [title, author, subject, year, keywordsArray, fileUrl, coverImageUrl, access_level || 'all', req.user.id]
    );
    
    res.status(201).json({ success: true, message: 'Content uploaded successfully', content: result.rows[0] });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// Submit content for approval
router.put('/:id/submit', authMiddleware, checkRole(['librarian', 'admin']), async (req, res) => {
  try {
    const content = await pool.query(
      'SELECT * FROM digital_contents WHERE id = $1 AND uploaded_by = $2',
      [req.params.id, req.user.id]
    );
    
    if (content.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found or not yours' });
    }
    
    await pool.query('UPDATE digital_contents SET status = $1 WHERE id = $2', ['pending_review', req.params.id]);
    
    await pool.query(
      'INSERT INTO approval_queue (content_id, submitted_by, status) VALUES ($1, $2, $3)',
      [req.params.id, req.user.id, 'pending']
    );
    
    res.json({ message: 'Content submitted for approval' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submission failed' });
  }
});

// Search catalog - PUBLIC (no authentication required)
router.get('/search', async (req, res) => {
  try {
    const { title, author, subject, year } = req.query;
    let query = `SELECT * FROM digital_contents WHERE status = 'published'`;
    const params = [];
    let paramIndex = 1;
    
    if (title && title.trim()) {
      query += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${title}%`);
      paramIndex++;
    }
    if (author && author.trim()) {
      query += ` AND author ILIKE $${paramIndex}`;
      params.push(`%${author}%`);
      paramIndex++;
    }
    if (subject && subject.trim()) {
      query += ` AND subject ILIKE $${paramIndex}`;
      params.push(`%${subject}%`);
      paramIndex++;
    }
    if (year && year.trim()) {
      query += ` AND publication_year = $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }
    
    query += ` ORDER BY published_at DESC NULLS LAST`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get my uploads (for librarian)
router.get('/my-uploads', authMiddleware, checkRole(['librarian', 'admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM digital_contents WHERE uploaded_by = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch uploads' });
  }
});

// DOWNLOAD PURCHASED BOOK - FIXED
router.get('/download/:contentId', authMiddleware, async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.id;
    
    console.log(`===== DOWNLOAD REQUEST =====`);
    console.log(`User ID from token: ${userId}`);
    console.log(`Content ID: ${contentId}`);
    
    // Check purchases table
    const result = await pool.query(
      `SELECT p.*, dc.title, dc.file_url, dc.author 
       FROM purchases p 
       JOIN digital_contents dc ON p.content_id = dc.id 
       WHERE p.user_id = $1 AND p.content_id = $2`,
      [userId, contentId]
    );
    
    if (result.rows.length === 0) {
      // Check payment_receipts as fallback
      const receiptResult = await pool.query(
        `SELECT pr.*, dc.file_url 
         FROM payment_receipts pr
         JOIN digital_contents dc ON pr.content_id = dc.id
         WHERE pr.user_id = $1 AND pr.content_id = $2 AND pr.status = 'approved'`,
        [userId, contentId]
      );
      
      if (receiptResult.rows.length > 0) {
        return res.json({ success: true, downloadUrl: receiptResult.rows[0].file_url });
      }
      
      return res.status(403).json({ message: 'You have not purchased this book' });
    }
    
    const fileUrl = result.rows[0].file_url;
    console.log('File URL found:', fileUrl);
    
    res.json({ success: true, downloadUrl: fileUrl });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: 'Download failed: ' + err.message });
  }
});

// DEBUG: Check user purchases
router.get('/debug/my-purchases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const purchases = await pool.query(
      `SELECT p.*, dc.title, dc.file_url 
       FROM purchases p 
       JOIN digital_contents dc ON p.content_id = dc.id 
       WHERE p.user_id = $1`,
      [userId]
    );
    
    res.json({
      userId: userId,
      purchases: purchases.rows,
      purchaseCount: purchases.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
