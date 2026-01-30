const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupPaymentTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/schema-payments.sql');
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating payment tables...');
    
    // Execute the schema
    await client.query(sqlSchema);
    
    console.log('✅ Payment tables created successfully!');
    console.log('Tables created:');
    console.log('- customers');
    console.log('- payment_transactions');
    console.log('- orders');
    console.log('- All indexes created');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'payment_transactions', 'orders')
    `);
    
    console.log('\n✅ Verification - Tables found:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
  } catch (error) {
    console.error('❌ Error setting up payment tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

setupPaymentTables();
