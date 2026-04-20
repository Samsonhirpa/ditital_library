const express = require('express');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// Usage statistics for librarian
router.get('/usage', authMiddleware, checkRole(['librarian', 'admin']), async (req, res) => {
  try {
    // Total views
    const views = await pool.query(
      "SELECT COUNT(*) FROM usage_logs WHERE action = 'view'"
    );
    
    // Total downloads
    const downloads = await pool.query(
      "SELECT COUNT(*) FROM usage_logs WHERE action = 'download'"
    );
    
    // Active borrows
    const activeBorrows = await pool.query(
      "SELECT COUNT(*) FROM digital_borrows WHERE status = 'active' AND expires_at > NOW()"
    );
    
    // Most popular content
    const popular = await pool.query(
      `SELECT dc.title, COUNT(ul.id) as views, COUNT(CASE WHEN ul.action = 'download' THEN 1 END) as downloads
       FROM usage_logs ul
       JOIN digital_contents dc ON ul.content_id = dc.id
       GROUP BY dc.id, dc.title
       ORDER BY views DESC
       LIMIT 5`
    );
    
    res.json({
      total_views: parseInt(views.rows[0].count),
      total_downloads: parseInt(downloads.rows[0].count),
      active_borrows: parseInt(activeBorrows.rows[0].count),
      top_content: popular.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

module.exports = router;