const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270388',
  database: 'digital_library',
});

async function checkUser() {
  try {
    const result = await pool.query('SELECT email, full_name, role FROM users');
    console.log('📋 Current users in database:');
    console.log('--------------------------------');
    result.rows.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.full_name}`);
      console.log(`Role: ${user.role}`);
      console.log('--------------------------------');
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit();
}

checkUser();