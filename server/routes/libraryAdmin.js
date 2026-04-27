const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();
const STAFF_ROLES = ['physical_librarian', 'physical_manager'];

router.use(authMiddleware, checkRole(['library_admin']));

const ensureLibraryScope = (req, res) => {
  if (!req.user.library_id) {
    res.status(400).json({ message: 'Library admin is not assigned to a library' });
    return false;
  }
  return true;
};

router.get('/staff', async (req, res) => {
  if (!ensureLibraryScope(req, res)) return;

  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, library_id, created_at
       FROM users
       WHERE library_id = $1
         AND role = ANY($2::text[])
       ORDER BY created_at DESC`,
      [req.user.library_id, STAFF_ROLES]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch staff members' });
  }
});

router.post('/staff', async (req, res) => {
  if (!ensureLibraryScope(req, res)) return;

  const { email, full_name, role, password } = req.body;

  if (!email || !password || !STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Email, password, and a valid role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, library_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, library_id, created_at`,
      [email, hashedPassword, full_name || null, role, req.user.library_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create staff member' });
  }
});

router.put('/staff/:id', async (req, res) => {
  if (!ensureLibraryScope(req, res)) return;

  const { email, full_name, role } = req.body;

  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid staff role' });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET email = $1,
           full_name = $2,
           role = $3
       WHERE id = $4
         AND library_id = $5
         AND role = ANY($6::text[])
       RETURNING id, email, full_name, role, library_id, created_at`,
      [email, full_name || null, role, req.params.id, req.user.library_id, STAFF_ROLES]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Staff member not found in your library' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update staff member' });
  }
});

router.delete('/staff/:id', async (req, res) => {
  if (!ensureLibraryScope(req, res)) return;

  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
         AND library_id = $2
         AND role = ANY($3::text[])
       RETURNING id`,
      [req.params.id, req.user.library_id, STAFF_ROLES]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Staff member not found in your library' });
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
});

router.get('/dashboard', async (req, res) => {
  if (!ensureLibraryScope(req, res)) return;

  try {
    const [staff, members, contents, borrows, sales] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM users
         WHERE library_id = $1
           AND role = ANY($2::text[])`,
        [req.user.library_id, STAFF_ROLES]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM users
         WHERE library_id = $1
           AND role = 'member'`,
        [req.user.library_id]
      ),
      pool.query(
        `SELECT COUNT(dc.id)::int AS total
         FROM digital_contents dc
         JOIN users u ON u.id = dc.uploaded_by
         WHERE u.library_id = $1`,
        [req.user.library_id]
      ),
      pool.query(
        `SELECT COUNT(db.id)::int AS total
         FROM digital_borrows db
         JOIN users u ON u.id = db.user_id
         WHERE u.library_id = $1
           AND db.status = 'active'`,
        [req.user.library_id]
      ),
      pool.query(
        `SELECT COALESCE(SUM(p.amount), 0)::numeric AS revenue,
                COUNT(p.id)::int AS sales
         FROM purchases p
         JOIN digital_contents dc ON dc.id = p.content_id
         JOIN users u ON u.id = dc.uploaded_by
         WHERE u.library_id = $1`,
        [req.user.library_id]
      ),
    ]);

    res.json({
      total_staff: staff.rows[0].total,
      total_members: members.rows[0].total,
      total_contents: contents.rows[0].total,
      active_borrows: borrows.rows[0].total,
      total_revenue: sales.rows[0].revenue,
      total_sales: sales.rows[0].sales,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
