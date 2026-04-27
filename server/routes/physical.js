const express = require('express');
const pool = require('../config/db');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

const getLibraryScope = (req) => req.user.library_id || null;
const LIBRARIAN_ROLES = ['physical_librarian', 'librarian'];
const MANAGER_ROLES = ['physical_manager', 'manager'];
const CATALOG_ROLES = ['cataloger', ...LIBRARIAN_ROLES, ...MANAGER_ROLES];

const ensureCatalogTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS physical_books (
      id SERIAL PRIMARY KEY,
      library_id INT REFERENCES libraries(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255),
      isbn VARCHAR(50),
      copies_total INT NOT NULL DEFAULT 1,
      copies_available INT NOT NULL DEFAULT 1,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (library_id, isbn)
    )
  `);

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

const ensurePhysicalWorkflowTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS library_settings (
      id SERIAL PRIMARY KEY,
      library_id INT UNIQUE REFERENCES libraries(id) ON DELETE CASCADE,
      loan_days INT NOT NULL DEFAULT 14,
      fine_per_day DECIMAL(10,2) NOT NULL DEFAULT 1,
      damage_fee_low DECIMAL(10,2) NOT NULL DEFAULT 0,
      damage_fee_medium DECIMAL(10,2) NOT NULL DEFAULT 0,
      damage_fee_high DECIMAL(10,2) NOT NULL DEFAULT 0,
      lost_fee_mode VARCHAR(20) NOT NULL DEFAULT 'book_sale',
      lost_fee_custom_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE library_settings
    ADD COLUMN IF NOT EXISTS damage_fee_low DECIMAL(10,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE library_settings
    ADD COLUMN IF NOT EXISTS damage_fee_medium DECIMAL(10,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE library_settings
    ADD COLUMN IF NOT EXISTS damage_fee_high DECIMAL(10,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE library_settings
    ADD COLUMN IF NOT EXISTS lost_fee_mode VARCHAR(20) NOT NULL DEFAULT 'book_sale'
  `);
  await pool.query(`
    ALTER TABLE library_settings
    ADD COLUMN IF NOT EXISTS lost_fee_custom_amount DECIMAL(10,2) NOT NULL DEFAULT 0
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS physical_members (
      id SERIAL PRIMARY KEY,
      library_id INT REFERENCES libraries(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      id_number VARCHAR(100) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING_MANAGER',
      created_by INT REFERENCES users(id),
      reviewed_by INT REFERENCES users(id),
      reviewed_at TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (library_id, id_number)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS physical_transactions (
      id SERIAL PRIMARY KEY,
      library_id INT REFERENCES libraries(id) ON DELETE CASCADE,
      member_id INT NOT NULL REFERENCES physical_members(id),
      book_id INT NOT NULL REFERENCES physical_books(id),
      issue_by INT REFERENCES users(id),
      returned_by INT REFERENCES users(id),
      issue_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_date TIMESTAMP NOT NULL,
      return_date TIMESTAMP,
      fine_per_day DECIMAL(10,2) NOT NULL DEFAULT 1,
      fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      damage_level VARCHAR(10),
      damage_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      lost_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
      return_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE physical_transactions
    ADD COLUMN IF NOT EXISTS damage_level VARCHAR(10)
  `);
  await pool.query(`
    ALTER TABLE physical_transactions
    ADD COLUMN IF NOT EXISTS damage_fee DECIMAL(10,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE physical_transactions
    ADD COLUMN IF NOT EXISTS lost_fee DECIMAL(10,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    ALTER TABLE physical_transactions
    ADD COLUMN IF NOT EXISTS return_notes TEXT
  `);
};

// Librarian registers physical members with pending manager approval.
router.post('/members', checkRole(LIBRARIAN_ROLES), async (req, res) => {
  const { name, phone, address, id_number } = req.body;

  if (!name || !phone || !address || !id_number) {
    return res.status(400).json({ message: 'name, phone, address, and id_number are required' });
  }

  try {
    await ensurePhysicalWorkflowTables();

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
router.get('/members/pending', checkRole(MANAGER_ROLES), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();

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

router.put('/members/:id/approve', checkRole(MANAGER_ROLES), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();

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

router.put('/members/:id/reject', checkRole(MANAGER_ROLES), async (req, res) => {
  const { reason } = req.body;

  try {
    await ensurePhysicalWorkflowTables();

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

router.get('/members', checkRole([...LIBRARIAN_ROLES, ...MANAGER_ROLES]), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();

    const result = await pool.query(
      `SELECT *
       FROM physical_members
       WHERE ($1::int IS NULL OR library_id = $1)
       ORDER BY created_at DESC`,
      [getLibraryScope(req)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});

router.get('/settings', checkRole([...LIBRARIAN_ROLES, ...MANAGER_ROLES]), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();

    const result = await pool.query(
      `SELECT *
       FROM library_settings
       WHERE ($1::int IS NULL OR library_id = $1)
       ORDER BY CASE WHEN library_id = $1 THEN 0 ELSE 1 END
       LIMIT 1`,
      [getLibraryScope(req)]
    );

    res.json(
      result.rows[0] || {
        library_id: getLibraryScope(req),
        loan_days: 14,
        fine_per_day: 1,
        damage_fee_low: 0,
        damage_fee_medium: 0,
        damage_fee_high: 0,
        lost_fee_mode: 'book_sale',
        lost_fee_custom_amount: 0
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

router.put('/settings', checkRole(MANAGER_ROLES), async (req, res) => {
  const {
    loan_days = 14,
    fine_per_day = 1,
    damage_fee_low = 0,
    damage_fee_medium = 0,
    damage_fee_high = 0,
    lost_fee_mode = 'book_sale',
    lost_fee_custom_amount = 0
  } = req.body;

  if (!['book_sale', 'custom'].includes(lost_fee_mode)) {
    return res.status(400).json({ message: 'lost_fee_mode must be "book_sale" or "custom"' });
  }

  try {
    await ensurePhysicalWorkflowTables();

    const result = await pool.query(
      `INSERT INTO library_settings (
         library_id, loan_days, fine_per_day,
         damage_fee_low, damage_fee_medium, damage_fee_high,
         lost_fee_mode, lost_fee_custom_amount, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (library_id)
       DO UPDATE SET
         loan_days = EXCLUDED.loan_days,
         fine_per_day = EXCLUDED.fine_per_day,
         damage_fee_low = EXCLUDED.damage_fee_low,
         damage_fee_medium = EXCLUDED.damage_fee_medium,
         damage_fee_high = EXCLUDED.damage_fee_high,
         lost_fee_mode = EXCLUDED.lost_fee_mode,
         lost_fee_custom_amount = EXCLUDED.lost_fee_custom_amount,
         updated_at = NOW()
       RETURNING *`,
      [
        getLibraryScope(req),
        Number(loan_days),
        Number(fine_per_day),
        Number(damage_fee_low),
        Number(damage_fee_medium),
        Number(damage_fee_high),
        lost_fee_mode,
        Number(lost_fee_custom_amount)
      ]
    );

    res.json({ message: 'Settings updated', settings: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update settings' });
  }
});

router.get('/categories', checkRole(CATALOG_ROLES), async (req, res) => {
  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `SELECT id, library_id, name, description, created_by, created_at, updated_at
       FROM physical_categories
       WHERE ($1::int IS NULL OR library_id = $1)
       ORDER BY name ASC`,
      [getLibraryScope(req)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch categories' });
  }
});

// Cataloger/librarian/manager can register categories.
router.post('/categories', checkRole(CATALOG_ROLES), async (req, res) => {
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
      [getLibraryScope(req), name.trim(), description?.trim() || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add category' });
  }
});

router.put('/categories/:id', checkRole(CATALOG_ROLES), async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `UPDATE physical_categories
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3
         AND ($4::int IS NULL OR library_id = $4)
       RETURNING *`,
      [name.trim(), description?.trim() || null, req.params.id, getLibraryScope(req)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update category' });
  }
});

router.delete('/categories/:id', checkRole(CATALOG_ROLES), async (req, res) => {
  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `DELETE FROM physical_categories
       WHERE id = $1
         AND ($2::int IS NULL OR library_id = $2)
       RETURNING id`,
      [req.params.id, getLibraryScope(req)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to delete category' });
  }
});

router.get('/books', checkRole(CATALOG_ROLES), async (req, res) => {
  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM physical_books b
       LEFT JOIN physical_categories c ON c.id = b.category_id
       WHERE ($1::int IS NULL OR b.library_id = $1)
       ORDER BY b.created_at DESC`,
      [getLibraryScope(req)]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch books' });
  }
});

// Optional helper endpoint to register physical books.
router.post('/books', checkRole(CATALOG_ROLES), async (req, res) => {
  const { title, author, isbn, copies_total, category_id, shelf_location } = req.body;
  const total = Number(copies_total || 1);

  if (!title || !title.trim() || total <= 0) {
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
      [getLibraryScope(req), title.trim(), author?.trim() || null, isbn?.trim() || null, total, category_id || null, shelf_location?.trim() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to add book' });
  }
});

router.put('/books/:id', checkRole(CATALOG_ROLES), async (req, res) => {
  const { title, author, isbn, copies_total, category_id, shelf_location } = req.body;
  const total = Number(copies_total || 1);

  if (!title || !title.trim() || total <= 0) {
    return res.status(400).json({ message: 'title and a positive copies_total are required' });
  }

  try {
    await ensureCatalogTables();

    const existingResult = await pool.query(
      `SELECT copies_total, copies_available
       FROM physical_books
       WHERE id = $1
         AND ($2::int IS NULL OR library_id = $2)`,
      [req.params.id, getLibraryScope(req)]
    );

    if (!existingResult.rows.length) {
      return res.status(404).json({ message: 'Book not found' });
    }

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

    const existing = existingResult.rows[0];
    const issuedCopies = Number(existing.copies_total) - Number(existing.copies_available);
    if (total < issuedCopies) {
      return res.status(400).json({ message: `copies_total cannot be less than issued copies (${issuedCopies})` });
    }

    const copiesAvailable = total - issuedCopies;

    const result = await pool.query(
      `UPDATE physical_books
       SET title = $1,
           author = $2,
           isbn = $3,
           copies_total = $4,
           copies_available = $5,
           is_available = $5 > 0,
           category_id = $6,
           shelf_location = $7,
           updated_at = NOW()
       WHERE id = $8
         AND ($9::int IS NULL OR library_id = $9)
       RETURNING *`,
      [
        title.trim(),
        author?.trim() || null,
        isbn?.trim() || null,
        total,
        copiesAvailable,
        category_id || null,
        shelf_location?.trim() || null,
        req.params.id,
        getLibraryScope(req)
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update book' });
  }
});

router.delete('/books/:id', checkRole(CATALOG_ROLES), async (req, res) => {
  try {
    await ensureCatalogTables();

    const result = await pool.query(
      `DELETE FROM physical_books
       WHERE id = $1
         AND ($2::int IS NULL OR library_id = $2)
       RETURNING id`,
      [req.params.id, getLibraryScope(req)]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to delete book' });
  }
});

// Issue book: issue_date is automatic and due_date comes from library settings.
router.post('/transactions/issue', checkRole(LIBRARIAN_ROLES), async (req, res) => {
  const { member_id, book_id } = req.body;

  if (!member_id || !book_id) {
    return res.status(400).json({ message: 'member_id and book_id are required' });
  }

  const client = await pool.connect();

  try {
    await ensureCatalogTables();
    await ensurePhysicalWorkflowTables();
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

router.get('/transactions/active', checkRole([...LIBRARIAN_ROLES, ...MANAGER_ROLES]), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();
    const result = await pool.query(
      `SELECT t.*, m.name AS member_name, b.title AS book_title
       FROM physical_transactions t
       JOIN physical_members m ON m.id = t.member_id
       JOIN physical_books b ON b.id = t.book_id
       WHERE t.return_date IS NULL
         AND ($1::int IS NULL OR t.library_id = $1)
       ORDER BY t.issue_date DESC`,
      [getLibraryScope(req)]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active transactions' });
  }
});

router.get('/transactions/overdue', checkRole([...LIBRARIAN_ROLES, ...MANAGER_ROLES]), async (req, res) => {
  try {
    await ensurePhysicalWorkflowTables();
    const result = await pool.query(
      `SELECT t.*, m.name AS member_name, b.title AS book_title,
              GREATEST((NOW()::date - t.due_date::date), 0) AS overdue_days,
              GREATEST((NOW()::date - t.due_date::date), 0) * t.fine_per_day AS estimated_fine
       FROM physical_transactions t
       JOIN physical_members m ON m.id = t.member_id
       JOIN physical_books b ON b.id = t.book_id
       WHERE t.return_date IS NULL
         AND t.due_date::date < NOW()::date
         AND ($1::int IS NULL OR t.library_id = $1)
       ORDER BY t.due_date ASC`,
      [getLibraryScope(req)]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overdue transactions' });
  }
});

// Return book: save return_date, calculate fine_amount, and update availability.
router.post('/transactions/:id/return', checkRole(LIBRARIAN_ROLES), async (req, res) => {
  const transactionId = req.params.id;
  const { damage_level, is_lost, lost_fee_custom_amount, notes } = req.body;
  const client = await pool.connect();

  try {
    await ensureCatalogTables();
    await ensurePhysicalWorkflowTables();
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

    const settingsResult = await client.query(
      `SELECT *
       FROM library_settings
       WHERE ($1::int IS NULL OR library_id = $1)
       ORDER BY CASE WHEN library_id = $1 THEN 0 ELSE 1 END
       LIMIT 1`,
      [getLibraryScope(req)]
    );

    const settings = settingsResult.rows[0] || {};
    const damageMap = {
      low: Number(settings.damage_fee_low || 0),
      medium: Number(settings.damage_fee_medium || 0),
      high: Number(settings.damage_fee_high || 0)
    };
    const normalizedDamage = damage_level && ['low', 'medium', 'high'].includes(damage_level) ? damage_level : null;
    const damageFee = normalizedDamage ? damageMap[normalizedDamage] : 0;

    let lostFee = 0;
    if (is_lost) {
      if ((settings.lost_fee_mode || 'book_sale') === 'custom') {
        lostFee = Number(
          lost_fee_custom_amount ?? settings.lost_fee_custom_amount ?? 0
        );
      } else {
        // If your deployment tracks book sale value in a separate process/table,
        // keep lost fee as zero here and let staff override via custom amount mode.
        lostFee = 0;
      }
    }

    const updateResult = await client.query(
      `UPDATE physical_transactions
       SET return_date = NOW(),
           fine_amount = (CASE
             WHEN NOW()::date > due_date::date
             THEN GREATEST((NOW()::date - due_date::date), 0) * fine_per_day
             ELSE 0
           END) + $3 + $4,
           damage_level = $5,
           damage_fee = $3,
           lost_fee = $4,
           return_notes = $6,
           returned_by = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, transactionId, damageFee, lostFee, normalizedDamage, notes || null]
    );

    if (!is_lost) {
      await client.query(
        `UPDATE physical_books
         SET copies_available = copies_available + 1,
             is_available = TRUE,
             updated_at = NOW()
         WHERE id = $1`,
        [tx.book_id]
      );
    }

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
