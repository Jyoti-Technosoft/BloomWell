// Debug script to check environment variables
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check if .env.local file exists
const envPath = path.join(process.cwd(), '.env.local');
console.log('.env.local file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file content (first 200 chars):', envContent.substring(0, 200));
}

console.log('\nEnvironment Variables Debug:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('DB_PORT:', process.env.DB_PORT || 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('DB_USER:', process.env.DB_USER || 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test database connection
import { healthCheck } from './app/lib/postgres';

async function testConnection() {
  try {
    console.log('\nTesting database connection...');
    const isHealthy = await healthCheck();
    console.log('Database connection:', isHealthy ? 'SUCCESS' : 'FAILED');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

testConnection();
