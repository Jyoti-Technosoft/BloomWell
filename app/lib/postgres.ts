// lib/postgres.ts
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// if (!process.env.DATABASE_URL) {
//   throw new Error('❌ DATABASE_URL is not defined in environment variables');
// }

// Connection pool configuration
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || '5432'),
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   max: 20, // Maximum number of connections in the pool
//   idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
//   connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
// });

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL, // Neon pooled URL
  ssl: true,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait when connecting a new client (reduced from 2000)
  application_name: 'bloom-well', // Helps with connection pooling
  keepAlive: true, // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Initial delay before keep-alive check
});


// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
// console.log('DATABASE_URL:', process.env.DATABASE_URL);
// console.log('DB_PORT:', process.env.DB_PORT);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_NAME:', process.env.DB_NAME);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database connection helper
export async function getConnection(): Promise<PoolClient> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw new Error('Failed to connect to database');
  }
}

// Helper function to execute queries with proper error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await getConnection();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function for single query result
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Transaction helper
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database health check
export async function healthCheck(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Close all connections (for graceful shutdown)
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
