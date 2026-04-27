const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270388',
  database: 'digital_library',
});

async function fixRolePasswords() {
  // Set password for all non-member roles to "password123"
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('🔧 Resetting passwords for Librarian, Manager, Admin, Super Admin roles');
  console.log('New password for all:', password);
  
  try {
    // Update only librarian, manager, admin roles
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1 
       WHERE role IN ('librarian', 'manager', 'admin', 'super_admin')
       RETURNING email, role`,
      [hashedPassword]
    );
    
    console.log(`\n✅ Updated ${result.rows.length} users:`);
    result.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) → Password: ${password}`);
    });
    
    if (result.rows.length === 0) {
      console.log('\n⚠️ No librarian, manager, admin, or super_admin users found!');
      console.log('Creating them now...');
      
      // Create them if they don't exist
      const users = [
        { email: 'librarian@lib.com', name: 'Digital Librarian', role: 'librarian' },
        { email: 'manager@lib.com', name: 'Digital Manager', role: 'manager' },
        { email: 'admin@lib.com', name: 'System Admin', role: 'admin' },
        { email: 'superadmin@lib.com', name: 'Super Admin', role: 'super_admin' }
      ];
      
      for (const user of users) {
        await pool.query(
          `INSERT INTO users (email, password_hash, full_name, role) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
          [user.email, hashedPassword, user.name, user.role]
        );
        console.log(`   ✅ Created/Updated: ${user.email} (${user.role})`);
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  await pool.end();
}

fixRolePasswords();