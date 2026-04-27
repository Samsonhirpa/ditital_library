const express = require('express');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

const getLibraryScope = (req) => req.user.library_id || null;

const ensureCatalogTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS physical_categories (
      id SERIAL PRIMARY KEY,
      library_id INT REFERENCES libraries(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INT REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (library_id, name)
    )
  `);

  await pool.query(`
    ALTER TABLE physical_books
    ADD COLUMN IF NOT EXISTS category_id INT REFERENCES physical_categories(id) ON DELETE SET NULL
  `);

  await pool.query(`
    ALTER TABLE physical_books
    ADD COLUMN IF NOT EXISTS shelf_location VARCHAR(100)
  `);
};

// Librarian registers physical members with pending manager approval.
router.post('/members', checkRole(['physical_librarian']), async (req, res) => {
  const { name, phone, address, id_number } = req.body;

  if (!name || !phone || !address || !id_number) {
    return res.status(400).json({ message: 'name, phone, address, and id_number are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO physical_members (library_id, name, phone, address, id_number, status, created_by)
       VALUES ($1, $2, $3, $4, $5, 'PENDING_MANAGER', $6)
       RETURNING *`,
      [getLibraryScope(req), name, phone, address, id_number, req.user.id]
    );

    res.status(201).json({
      message: 'Member created and pending manager approval',
      member: result.rows[0]
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to register member' });
  }
});

// Manager reviews pending members.
router.get('/members/pending', checkRole(['physical_manager']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM physical_members
       WHERE status = 'PENDING_MANAGER'
         AND ($1::int IS NULL OR library_id = $1)
       ORDER BY created_at ASC`,
      [getLibraryScope(req)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending members' });
  }
});

router.put('/members/:id/approve', checkRole(['physical_manager']), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE physical_members
       SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = NULL
       WHERE id = $2
         AND status = 'PENDING_MANAGER'
         AND ($3::int IS NULL OR library_id = $3)
       RETURNING *`,
      [req.user.id, req.params.id, getLibraryScope(req)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Pending member not found' });
    }

    res.json({ message: 'Member approved', member: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve member' });
  }
});

router.put('/members/:id/reject', checkRole(['physical_manager']), async (req, res) => {
  const { reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE physical_members
       SET status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
       WHERE id = $3
         AND status = 'PENDING_MANAGER'
         AND ($4::int IS NULL OR library_id = $4)
       RETURNING *`,
      [req.user.id, reason || null, req.params.id, getLibraryScope(req)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Pending member not found' });
    }

    res.json({ message: 'Member rejected', member: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject member' });
  }
});

// Cataloger/librarian/manager can register categories.
router.post('/categories', checkRole(['cataloger', 'librarian', 'manager']), async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `INSERT INTO physical_categories (library_id, name, description, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [getLibraryScope(req), name.trim(), description || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add category' });
  }
});

// Optional helper endpoint to register physical books.
router.post('/books', checkRole(['cataloger', 'librarian', 'manager']), async (req, res) => {
  const { title, author, isbn, copies_total, category_id, shelf_location } = req.body;
  const total = Number(copies_total || 1);

  if (!title || total <= 0) {
    return res.status(400).json({ message: 'title and a positive copies_total are required' });
  }

  try {
    await ensureCatalogTables();

    if (category_id) {
      const categoryResult = await pool.query(
        `SELECT id
         FROM physical_categories
         WHERE id = $1
           AND ($2::int IS NULL OR library_id = $2)`,
        [category_id, getLibraryScope(req)]
      );

      if (!categoryResult.rows.length) {
        return res.status(400).json({ message: 'Category not found in your library' });
      }
    }

    const result = await pool.query(
      `INSERT INTO physical_books (library_id, title, author, isbn, copies_total, copies_available, category_id, shelf_location)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7)
       RETURNING *`,
      [getLibraryScope(req), title, author || null, isbn || null, total, category_id || null, shelf_location || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add book' });
  }
});

// Issue book: issue_date is automatic and due_date comes from library settings.
router.post('/transactions/issue', checkRole(['physical_librarian']), async (req, res) => {
  const { member_id, book_id } = req.body;

  if (!member_id || !book_id) {
    return res.status(400).json({ message: 'member_id and book_id are required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const memberResult = await client.query(
      `SELECT id, status, library_id
       FROM physical_members
       WHERE id = $1
         AND status = 'APPROVED'
         AND ($2::int IS NULL OR library_id = $2)`,
      [member_id, getLibraryScope(req)]
    );

    if (!memberResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Member not approved or not in your library' });
    }

    const bookResult = await client.query(
      `SELECT id, copies_available, library_id
       FROM physical_books
       WHERE id = $1
         AND ($2::int IS NULL OR library_id = $2)
       FOR UPDATE`,
      [book_id, getLibraryScope(req)]
    );

    if (!bookResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Book not found in your library' });
    }

    const available = Number(bookResult.rows[0].copies_available || 0);
    if (available <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Book is not available' });
    }

    const settingResult = await client.query(
      `SELECT loan_days, fine_per_day
       FROM library_settings
       WHERE ($1::int IS NULL OR library_id = $1)
       ORDER BY CASE WHEN library_id = $1 THEN 0 ELSE 1 END
       LIMIT 1`,
      [getLibraryScope(req)]
    );

    const loanDays = Number(settingResult.rows[0]?.loan_days || 14);
    const finePerDay = Number(settingResult.rows[0]?.fine_per_day || 1);

    const transactionResult = await client.query(
      `INSERT INTO physical_transactions (
          library_id, member_id, book_id, issue_by, issue_date, due_date, fine_per_day
       )
       VALUES (
          $1, $2, $3, $4, NOW(), NOW() + make_interval(days => $5), $6
       )
       RETURNING *`,
      [getLibraryScope(req), member_id, book_id, req.user.id, loanDays, finePerDay]
    );

    await client.query(
      `UPDATE physical_books
       SET copies_available = copies_available - 1,
           is_available = (copies_available - 1) > 0,
           updated_at = NOW()
       WHERE id = $1`,
      [book_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Book issued successfully',
      transaction: transactionResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: error.message || 'Failed to issue book' });
  } finally {
    client.release();
  }
});

// Return book: save return_date, calculate fine_amount, and update availability.
router.post('/transactions/:id/return', checkRole(['physical_librarian']), async (req, res) => {
  const transactionId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const txResult = await client.query(
      `SELECT *
       FROM physical_transactions
       WHERE id = $1
         AND return_date IS NULL
         AND ($2::int IS NULL OR library_id = $2)
       FOR UPDATE`,
      [transactionId, getLibraryScope(req)]
    );

    if (!txResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Active transaction not found' });
    }

    const tx = txResult.rows[0];

    const updateResult = await client.query(
      `UPDATE physical_transactions
       SET return_date = NOW(),
           fine_amount = CASE
             WHEN NOW()::date > due_date::date
             THEN GREATEST((NOW()::date - due_date::date), 0) * fine_per_day
             ELSE 0
           END,
           returned_by = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, transactionId]
    );

    await client.query(
      `UPDATE physical_books
       SET copies_available = copies_available + 1,
           is_available = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [tx.book_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Book returned successfully',
      transaction: updateResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: error.message || 'Failed to return book' });
  } finally {
    client.release();
  }
});

module.exports = router;
