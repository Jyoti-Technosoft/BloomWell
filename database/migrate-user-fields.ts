import { query } from '../app/lib/postgres';

async function migrateUserFields() {
  try {
    console.log('Adding missing columns to users table...');
    
    // Add healthcare_purpose column
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS healthcare_purpose VARCHAR(50)`);
    console.log('✓ Added healthcare_purpose column');
    
    // Add phone_number column  
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50)`);
    console.log('✓ Added phone_number column');
    
    // Add date_of_birth column
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
    console.log('✓ Added date_of_birth column');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUserFields();
