const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

const initializeMultiTenantSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS libraries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(100) UNIQUE,
      address TEXT,
      contact_email VARCHAR(255),
      contact_phone VARCHAR(50),
      is_active BOOLEAN DEFAULT TRUE,
      created_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS library_id INT REFERENCES libraries(id) ON DELETE SET NULL
  `);
};

let schemaReadyPromise;
const ensureSchema = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = initializeMultiTenantSchema();
  }
  return schemaReadyPromise;
};

router.use(authMiddleware, checkRole(['super_admin']));

router.use(async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize multi-tenant schema' });
  }
});

router.get('/libraries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.*, 
              u.id AS admin_user_id,
              u.full_name AS admin_full_name,
              u.email AS admin_email
       FROM libraries l
       LEFT JOIN users u ON u.library_id = l.id AND u.role = 'library_admin'
       ORDER BY l.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch libraries' });
  }
});

router.post('/libraries', async (req, res) => {
  const {
    name,
    code,
    address,
    contact_email,
    contact_phone,
    admin_full_name,
    admin_email,
    admin_password
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const libraryResult = await client.query(
      `INSERT INTO libraries (name, code, address, contact_email, contact_phone, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, code || null, address || null, contact_email || null, contact_phone || null, req.user.id]
    );

    const library = libraryResult.rows[0];

    if (admin_email && admin_password) {
      const hashedPassword = await bcrypt.hash(admin_password, 10);

      await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, library_id)
         VALUES ($1, $2, $3, 'library_admin', $4)`,
        [admin_email, hashedPassword, admin_full_name || null, library.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(library);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: error.message || 'Failed to create library' });
  } finally {
    client.release();
  }
});

router.put('/libraries/:id', async (req, res) => {
  const { name, code, address, contact_email, contact_phone, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE libraries
       SET name = $1,
           code = $2,
           address = $3,
           contact_email = $4,
           contact_phone = $5,
           is_active = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, code || null, address || null, contact_email || null, contact_phone || null, is_active, req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Library not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update library' });
  }
});

router.delete('/libraries/:id', async (req, res) => {
  try {
    await pool.query('UPDATE users SET library_id = NULL WHERE library_id = $1', [req.params.id]);
    const result = await pool.query('DELETE FROM libraries WHERE id = $1 RETURNING id', [req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Library not found' });
    }

    res.json({ message: 'Library deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete library' });
  }
});

router.post('/libraries/:id/assign-admin', async (req, res) => {
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = 'library_admin',
           library_id = $1
       WHERE id = $2
       RETURNING id, email, full_name, role, library_id`,
      [req.params.id, user_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign library admin' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, library_id, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
