const express = require('express');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// All routes require manager role
router.use(authMiddleware, checkRole(['manager']));

// Get content ready for publishing
router.get('/ready-to-publish', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM digital_contents 
       WHERE status = 'approved' 
       ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch content' });
  }
});

// Publish content
router.put('/contents/:id/publish', async (req, res) => {
  try {
    const { price } = req.body;
    
    const result = await pool.query(
      `UPDATE digital_contents 
       SET status = 'published', price = $1, published_at = NOW() 
       WHERE id = $2 AND status = 'approved' 
       RETURNING *`,
      [price || 0, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Content cannot be published' });
    }
    
    res.json({ message: 'Content published successfully', content: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Publishing failed' });
  }
});

// Update price
router.put('/contents/:id/price', async (req, res) => {
  const { price } = req.body;
  
  try {
    await pool.query('UPDATE digital_contents SET price = $1 WHERE id = $2', [price, req.params.id]);
    res.json({ message: 'Price updated' });
  } catch (err) {
    res.status(500).json({ message: 'Price update failed' });
  }
});

// Dashboard - sales and finance
router.get('/dashboard/sales', async (req, res) => {
  try {
    // Total revenue
    const revenue = await pool.query(
      'SELECT SUM(amount) as total_revenue, COUNT(*) as total_sales FROM purchases'
    );
    
    // Sales by content
    const topContent = await pool.query(
      `SELECT dc.title, COUNT(p.id) as sales_count, SUM(p.amount) as revenue 
       FROM purchases p 
       JOIN digital_contents dc ON p.content_id = dc.id 
       GROUP BY dc.id, dc.title 
       ORDER BY revenue DESC 
       LIMIT 10`
    );
    
    // Daily sales (last 7 days)
    const dailySales = await pool.query(
      `SELECT DATE(purchased_at) as date, SUM(amount) as daily_revenue, COUNT(*) as sales 
       FROM purchases 
       WHERE purchased_at >= NOW() - INTERVAL '7 days' 
       GROUP BY DATE(purchased_at) 
       ORDER BY date DESC`
    );
    
    res.json({
      total_revenue: revenue.rows[0].total_revenue || 0,
      total_sales: revenue.rows[0].total_sales || 0,
      top_content: topContent.rows,
      daily_sales: dailySales.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;