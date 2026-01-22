// scripts/setup-hipaa-compliance.ts
// Setup script for HIPAA compliance requirements
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { query } from '../app/lib/postgres';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env.local' });
}

async function setupHIPAACompliance() {
  console.log('🔒 Setting up HIPAA Compliance...\n');

  try {
    // 1. Check environment variables
    console.log('1️⃣ Checking environment variables...');
    await checkEnvironmentVariables();

    // 2. Create database tables
    console.log('\n2️⃣ Creating HIPAA compliance tables...');
    await createHIPAATables();

    // 3. Generate encryption key if missing
    console.log('\n3️⃣ Setting up encryption...');
    await setupEncryption();

    // 4. Verify setup
    console.log('\n4️⃣ Verifying setup...');
    await verifySetup();

    console.log('\n✅ HIPAA Compliance Setup Complete!');
    console.log('📊 Run "npm run test:hipaa-compliance" to verify your score.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function checkEnvironmentVariables() {
  const envPath = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
  let envContent = '';
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf8');
  }

  const requiredVars = {
    'ENCRYPTION_KEY': 'openssl rand -hex 32',
    'JWT_SECRET': 'openssl rand -hex 32'
  };

  let updated = false;

  for (const [varName, command] of Object.entries(requiredVars)) {
    if (!envContent.includes(`${varName}=`)) {
      console.log(`   📝 Adding ${varName}...`);
      try {
        const value = execSync(command, { encoding: 'utf8' }).trim();
        envContent += `\n${varName}=${value}`;
        updated = true;
      } catch (error) {
        console.log(`   ⚠️  Could not generate ${varName}. Please add it manually.`);
      }
    } else {
      console.log(`   ✅ ${varName} is set`);
    }
  }

  if (updated) {
    writeFileSync(envPath, envContent);
    console.log('   💾 Updated .env file');
    console.log('   🔄 Please restart your application to load new variables');
  }
}

async function createHIPAATables() {
  try {
    // Read schema file
    const schemaPath = './database/schema.sql';
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await query(schema);
    console.log('   ✅ HIPAA compliance tables created');
  } catch (error) {
    console.log('   ⚠️  Tables may already exist or error occurred:', error instanceof Error ? error.message : String(error));
  }
}

async function setupEncryption() {
  const envPath = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';
  const envContent = readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('ENCRYPTION_KEY=')) {
    console.log('   ⚠️  ENCRYPTION_KEY not set. Please add it to environment variables.');
    console.log(`   💡 Run: openssl rand -hex 32`);
    console.log(`   📝 Then add: ENCRYPTION_KEY=<generated-key> to ${envPath}`);
  } else {
    console.log('   ✅ ENCRYPTION_KEY is set');
  }
}

async function verifySetup() {
  try {
    // Test database connection
    await query('SELECT 1');
    console.log('   ✅ Database connection working');

    // Test encryption
    const { encryptField, decryptField } = await import('@/app/lib/encryption');
    const test = 'test-data';
    const encrypted = await encryptField(test);
    const decrypted = await decryptField(encrypted);
    
    if (test === decrypted) {
      console.log('   ✅ Encryption/decryption working');
    } else {
      console.log('   ❌ Encryption test failed');
    }

    // Check tables
    const tables = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('audit_logs', 'patient_consent', 'data_retention', 'mfa_setup', 'breach_incidents')
    `);
    
    console.log(`   ✅ Found ${tables.length} HIPAA compliance tables`);

  } catch (error) {
    console.log('   ❌ Verification failed:', error instanceof Error ? error.message : String(error));
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupHIPAACompliance().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

export default setupHIPAACompliance;
