// scripts/generate-encryption-key.ts
// Generate proper 64-character hex encryption key for HIPAA compliance
import { writeFileSync, readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env.local' });
}

function generateEncryptionKey() {
  console.log('🔐 Generating HIPAA-compliant encryption key...');
  
  try {
    // Generate 32 bytes = 64 hex characters using Node.js crypto
    const key = randomBytes(32).toString('hex');
    
    console.log(`✅ Generated key: ${key}`);
    console.log(`✅ Key length: ${key.length} characters`);
    
    if (key.length !== 64) {
      console.log('❌ Key length is incorrect. Expected 64 characters.');
      return false;
    }
    
    // Update .env.local file
    let envContent = '';
    const envPath = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
    
    try {
      envContent = readFileSync(envPath, 'utf8');
    } catch (error) {
      // File doesn't exist, create new one
      envContent = '';
    }
    
    // Remove existing ENCRYPTION_KEY line
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => !line.startsWith('ENCRYPTION_KEY='));
    
    // Add new ENCRYPTION_KEY
    filteredLines.push(`ENCRYPTION_KEY=${key}`);
    
    // Write back to file
    writeFileSync(envPath, filteredLines.join('\n'));
    
    console.log('✅ ENCRYPTION_KEY updated in .env');
    console.log('🔄 Please restart your application to load the new key.');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to generate encryption key:', error);
    return false;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  generateEncryptionKey();
}

export default generateEncryptionKey;
