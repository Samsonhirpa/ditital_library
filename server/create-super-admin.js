const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

const defaultEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@lib.com';
const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
const defaultName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

async function createOrUpdateSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'super_admin')
       ON CONFLICT (email)
       DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = 'super_admin'
       RETURNING id, email, full_name, role`,
      [defaultEmail, hashedPassword, defaultName]
    );

    const user = result.rows[0];
    console.log('✅ Super Admin user is ready');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Temporary Password: ${defaultPassword}`);
    console.log('   Please change the password after first login.');
  } catch (error) {
    console.error('❌ Failed to create super admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createOrUpdateSuperAdmin();
