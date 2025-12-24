// database/init-db.ts
// Database initialization script
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { query, queryOne, healthCheck } from '../app/lib/postgres';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Check database connection
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      throw new Error('Database connection failed');
    }
    
    console.log('Database connection successful');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    await query(schema);
    
    console.log('Database schema created successfully');
    
    // Check if tables exist and have data
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    console.log(`Current users in database: ${userCount?.count || 0}`);
    
    const contactCount = await queryOne('SELECT COUNT(*) as count FROM contacts');
    console.log(`Current contacts in database: ${contactCount?.count || 0}`);
    
    const consultationCount = await queryOne('SELECT COUNT(*) as count FROM consultations');
    console.log(`Current consultations in database: ${consultationCount?.count || 0}`);
    
    const evaluationCount = await queryOne('SELECT COUNT(*) as count FROM evaluations');
    console.log(`Current evaluations in database: ${evaluationCount?.count || 0}`);
    
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
