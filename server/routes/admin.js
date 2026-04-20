const express = require('express');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');
const router = express.Router();

// All routes require admin role
router.use(authMiddleware, checkRole(['admin']));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_approved, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Create user (admin)
router.post('/users', async (req, res) => {
  const { email, full_name, role, password } = req.body;
  
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, full_name, role]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Get approval queue
router.get('/approvals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aq.*, dc.title, dc.author, u.email as submitted_by_email 
       FROM approval_queue aq 
       JOIN digital_contents dc ON aq.content_id = dc.id 
       JOIN users u ON aq.submitted_by = u.id 
       WHERE aq.status = 'pending' 
       ORDER BY aq.submitted_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch approvals' });
  }
});

// Approve content
router.put('/approvals/:id/approve', async (req, res) => {
  try {
    const approvalId = req.params.id;
    
    // Get approval record
    const approval = await pool.query('SELECT * FROM approval_queue WHERE id = $1', [approvalId]);
    if (approval.rows.length === 0) {
      return res.status(404).json({ message: 'Approval not found' });
    }
    
    // Update approval status
    await pool.query(
      'UPDATE approval_queue SET status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3',
      ['approved', req.user.id, approvalId]
    );
    
    // Update content status
    await pool.query(
      'UPDATE digital_contents SET status = $1 WHERE id = $2',
      ['approved', approval.rows[0].content_id]
    );
    
    res.json({ message: 'Content approved' });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed' });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ul.*, u.email, dc.title 
       FROM usage_logs ul 
       LEFT JOIN users u ON ul.user_id = u.id 
       LEFT JOIN digital_contents dc ON ul.content_id = dc.id 
       ORDER BY ul.created_at DESC 
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;