const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '270388',
  database: 'digital_library',
});

async function setupDatabase() {
  console.log('🔧 Setting up database tables...');
  
  try {

    // Create libraries table for multi-tenant physical library management
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
    console.log('✅ libraries table created');

    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS library_id INT REFERENCES libraries(id) ON DELETE SET NULL
    `);
    console.log('✅ users.library_id column ensured');

    await pool.query(`
      UPDATE users
      SET role = CASE
        WHEN role = 'librarian' THEN 'physical_librarian'
        WHEN role = 'manager' THEN 'physical_manager'
        ELSE role
      END
      WHERE library_id IS NOT NULL
        AND role IN ('librarian', 'manager')
    `);
    console.log('✅ library staff roles migrated to physical_* roles');


    await pool.query(`
      CREATE TABLE IF NOT EXISTS library_settings (
        id SERIAL PRIMARY KEY,
        library_id INT UNIQUE REFERENCES libraries(id) ON DELETE CASCADE,
        loan_days INT NOT NULL DEFAULT 14,
        fine_per_day DECIMAL(10,2) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ library_settings table created');

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
    console.log('✅ physical_members table created');

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
    console.log('✅ physical_books table created');

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
    console.log('✅ physical_categories table created');

    await pool.query(`
      ALTER TABLE physical_books
      ADD COLUMN IF NOT EXISTS category_id INT REFERENCES physical_categories(id) ON DELETE SET NULL
    `);
    console.log('✅ physical_books.category_id column ensured');

    await pool.query(`
      ALTER TABLE physical_books
      ADD COLUMN IF NOT EXISTS shelf_location VARCHAR(100)
    `);
    console.log('✅ physical_books.shelf_location column ensured');

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ physical_transactions table created');

    // Create digital_contents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_contents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        subject VARCHAR(100),
        publication_year INT,
        keywords TEXT[],
        file_url TEXT NOT NULL,
        thumbnail_url TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        price DECIMAL(10,2) DEFAULT 0,
        access_level VARCHAR(20) DEFAULT 'all',
        uploaded_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      )
    `);
    console.log('✅ digital_contents table created');
    
    // Create digital_borrows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_borrows (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        content_id INT REFERENCES digital_contents(id),
        borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        access_token UUID DEFAULT gen_random_uuid(),
        status VARCHAR(20) DEFAULT 'active'
      )
    `);
    console.log('✅ digital_borrows table created');
    
    // Create purchases table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        content_id INT REFERENCES digital_contents(id),
        amount DECIMAL(10,2),
        payment_intent_id VARCHAR(255),
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ purchases table created');
    
    // Create usage_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        content_id INT REFERENCES digital_contents(id),
        action VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ usage_logs table created');
    
    // Create approval_queue table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approval_queue (
        id SERIAL PRIMARY KEY,
        content_id INT REFERENCES digital_contents(id),
        submitted_by INT REFERENCES users(id),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT REFERENCES users(id),
        reviewed_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        comments TEXT
      )
    `);
    console.log('✅ approval_queue table created');
    
    console.log('\n🎉 All tables created successfully!');
    
    // Show all tables
    const tables = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  await pool.end();
}

setupDatabase();
