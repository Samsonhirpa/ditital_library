const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Borrow digital content
router.post('/:contentId', authMiddleware, async (req, res) => {
  try {
    const contentId = req.params.contentId;
    const userId = req.user.id;
    
    // Check if content exists and is published
    const content = await pool.query(
      'SELECT * FROM digital_contents WHERE id = $1 AND status = $2',
      [contentId, 'published']
    );
    
    if (content.rows.length === 0) {
      return res.status(404).json({ message: 'Content not available' });
    }
    
    const book = content.rows[0];
    
    // Check if user already borrowed
    const existingBorrow = await pool.query(
      'SELECT * FROM digital_borrows WHERE user_id = $1 AND content_id = $2 AND status = $3',
      [userId, contentId, 'active']
    );
    
    if (existingBorrow.rows.length > 0) {
      return res.status(400).json({ message: 'Already borrowed this content' });
    }
    
    // Set expiry date (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    
    // Create borrow record
    const result = await pool.query(
      `INSERT INTO digital_borrows (user_id, content_id, expires_at) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, contentId, expiresAt]
    );
    
    // Log usage
    await pool.query(
      'INSERT INTO usage_logs (user_id, content_id, action) VALUES ($1, $2, $3)',
      [userId, contentId, 'borrow']
    );
    
    res.json({ 
      message: 'Content borrowed successfully',
      borrow: result.rows[0],
      expires_at: expiresAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Borrow failed' });
  }
});

// Download content from borrow
router.get('/:borrowId/download', authMiddleware, async (req, res) => {
  try {
    const borrowId = req.params.borrowId;
    const userId = req.user.id;
    
    const borrow = await pool.query(
      `SELECT db.*, dc.file_url 
       FROM digital_borrows db 
       JOIN digital_contents dc ON db.content_id = dc.id 
       WHERE db.id = $1 AND db.user_id = $2 AND db.status = $3 AND db.expires_at > NOW()`,
      [borrowId, userId, 'active']
    );
    
    if (borrow.rows.length === 0) {
      return res.status(403).json({ message: 'No valid borrow found' });
    }
    
    await pool.query(
      'INSERT INTO usage_logs (user_id, content_id, action) VALUES ($1, $2, $3)',
      [userId, borrow.rows[0].content_id, 'download']
    );
    
    res.json({ downloadUrl: borrow.rows[0].file_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Download failed' });
  }
});

// Get user's borrowing history
router.get('/my/history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT db.*, dc.title, dc.author, dc.thumbnail_url 
       FROM digital_borrows db 
       JOIN digital_contents dc ON db.content_id = dc.id 
       WHERE db.user_id = $1 
       ORDER BY db.borrowed_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// ========== PURCHASES ENDPOINTS ==========

// Get user's purchase history (from purchases table)
router.get('/my/history/purchases', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('===== PURCHASES API CALLED =====');
    console.log('User ID:', userId);
    
    const result = await pool.query(
      `SELECT p.*, dc.title, dc.author, dc.file_url, dc.thumbnail_url 
       FROM purchases p 
       JOIN digital_contents dc ON p.content_id = dc.id 
       WHERE p.user_id = $1 
       ORDER BY p.purchased_at DESC`,
      [userId]
    );
    
    console.log(`Found ${result.rows.length} purchases for user ${userId}`);
    res.json(result.rows);
  } catch (err) {
    console.error('Purchase history error:', err);
    res.status(500).json({ message: 'Failed to fetch purchases', error: err.message });
  }
});

module.exports = router;