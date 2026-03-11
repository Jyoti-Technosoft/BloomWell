import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Your Neon database connection string from .env.local
const DATABASE_URL = process.env.NEON_DATABASE_URL
;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.log('Please add your Neon connection string to .env.local:');
  console.log('DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require');
  process.exit(1);
}

// Ensure SSL mode is specified in the connection string
const connectionString = DATABASE_URL.includes('sslmode=') 
  ? DATABASE_URL 
  : `${DATABASE_URL}${DATABASE_URL.includes('?') ? '&' : '?'}sslmode=require`;

async function runMigration() {
  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  });

  try {
    console.log('Connecting to Neon database...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/006_sample_doctors_with_passwords.sql'),
      'utf8'
    );

    console.log('Running migration...');
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the data was inserted
    const result = await pool.query('SELECT email, name, role FROM users WHERE role = $1', ['doctor']);
    console.log('\n📋 Test Doctor Accounts Created:');
    result.rows.forEach(doctor => {
      console.log(`📧 ${doctor.email} | 👤 ${doctor.name} | 🏥 ${doctor.role}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
