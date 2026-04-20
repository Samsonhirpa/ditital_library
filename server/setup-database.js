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