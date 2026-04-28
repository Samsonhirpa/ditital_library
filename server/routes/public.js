const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/libraries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, code, address, contact_email, contact_phone, is_active
       FROM libraries
       WHERE is_active = TRUE
       ORDER BY name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    const undefinedTableCode = '42P01';
    if (error?.code === undefinedTableCode) {
      return res.json([]);
    }

    return res.status(500).json({ message: 'Failed to fetch public libraries' });
  }
});

module.exports = router;
