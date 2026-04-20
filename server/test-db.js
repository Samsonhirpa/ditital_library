const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270388',
  database: 'digital_library',
});

async function test() {
  console.log('Testing connection with password: 270388');
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ SUCCESS! Database connected!');
    console.log('Time:', result.rows[0].now);
  } catch (err) {
    console.error('❌ FAILED!');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    if (err.code === '28P01') {
      console.log('\n💡 Password is WRONG. Please reset your PostgreSQL password.');
    } else if (err.code === '3D000') {
      console.log('\n💡 Database "digital_library" does NOT exist. Create it first.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 PostgreSQL is NOT running. Start the service first.');
    }
  }
  process.exit();
}

test();