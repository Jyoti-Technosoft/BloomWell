// scripts/test-encrypted-fields.ts
// Test script to verify sensitive fields are encrypted in database
import { query } from '../app/lib/postgres';
import { encryptSensitiveFields, decryptSensitiveFields } from '../app/lib/encryption';
import { auditLog } from '../app/lib/secure-logger';

interface TestData {
  lastFourSSN: string;
  medicalHistory: string;
  medications: string;
  allergies: string;
  medicalConditions: string[];
  healthConcerns: string[];
  phoneNumber: string;
  emergencyPhone: string;
}

async function testEncryptedFields() {
  console.log('🔒 Testing Encrypted Fields in Database...\n');

  try {
    // 1. Create test data
    console.log('1️⃣ Creating test patient data...');
    const testData: TestData = {
      lastFourSSN: '1234',
      medicalHistory: 'Patient has diabetes and hypertension',
      medications: 'Metformin, Lisinopril',
      allergies: 'Penicillin, Peanuts',
      medicalConditions: ['Diabetes Type 2', 'Hypertension'],
      healthConcerns: ['Weight management', 'Blood sugar control'],
      phoneNumber: '+1-555-123-4567',
      emergencyPhone: '+1-555-987-6543'
    };

    console.log('   📝 Original data:', JSON.stringify(testData, null, 2));

    // 2. Encrypt the data
    console.log('\n2️⃣ Encrypting sensitive fields...');
    const encryptedData = encryptSensitiveFields(testData);
    console.log('   🔐 Encrypted data:', JSON.stringify(encryptedData, null, 2));

    // 3. Save to database (simulating evaluation submission)
    console.log('\n3️⃣ Saving encrypted data to database...');
    
    // First, try to find an existing user or create a test user
    let testUserId: string;
    const existingUsers = await query('SELECT id FROM users LIMIT 1');
    
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
      console.log('   👤 Using existing user:', testUserId);
    } else {
      // Create a test user first
      testUserId = 'test-user-' + Date.now();
      await query(`
        INSERT INTO users (id, email, password_hash, full_name, created_at, date_of_birth, gender, phone_number)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, $7)
      `, [
        testUserId,
        'test-user@example.com',
        'hashed-password',
        'Test User',
        '1990-01-01',
        'other',
        '+1-555-123-4567'
      ]);
      console.log('   👤 Created test user:', testUserId);
    }
    
    const evaluationId = 'test-eval-' + Date.now();

    const encryptedJson = JSON.stringify(encryptedData);
    console.log('   🔍 JSON being stored:', encryptedJson);
    
    await query(`
      INSERT INTO evaluations (id, user_id, medicine_id, medicine_name, evaluation_type, responses, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      evaluationId,
      testUserId,
      'test-medicine',
      'Test Medicine',
      'general',
      encryptedJson,
      'test',
      new Date()
    ]);

    console.log('   ✅ Data saved to database');

    // 4. Retrieve from database
    console.log('\n4️⃣ Retrieving data from database...');
    const result = await query(
      'SELECT responses FROM evaluations WHERE id = $1',
      [evaluationId]
    );

    if (result.length === 0) {
      throw new Error('Test evaluation not found in database');
    }

    const responsesField = result[0].responses;
    console.log('   🔍 Raw responses from database:', responsesField, typeof responsesField);
    
    let storedData;
    try {
      // Handle case where responses might already be an object
      if (typeof responsesField === 'object') {
        storedData = responsesField;
      } else {
        storedData = JSON.parse(responsesField);
      }
    } catch (error) {
      console.error('   ❌ Failed to parse responses:', error);
      console.log('   📄 Raw value:', responsesField);
      throw new Error(`Invalid JSON in responses field: ${responsesField}`);
    }
    
    console.log('   📄 Stored data from database:', JSON.stringify(storedData, null, 2));

    // 5. Verify encryption
    console.log('\n5️⃣ Verifying field encryption...');
    const encryptionResults = {
      lastFourSSN: {
        original: testData.lastFourSSN,
        stored: storedData.lastFourSSN,
        isEncrypted: typeof storedData.lastFourSSN === 'object' && storedData.lastFourSSN.encrypted,
        isReadable: typeof storedData.lastFourSSN === 'string'
      },
      medicalHistory: {
        original: testData.medicalHistory,
        stored: storedData.medicalHistory,
        isEncrypted: typeof storedData.medicalHistory === 'object' && storedData.medicalHistory.encrypted,
        isReadable: typeof storedData.medicalHistory === 'string'
      },
      medications: {
        original: testData.medications,
        stored: storedData.medications,
        isEncrypted: typeof storedData.medications === 'object' && storedData.medications.encrypted,
        isReadable: typeof storedData.medications === 'string'
      },
      allergies: {
        original: testData.allergies,
        stored: storedData.allergies,
        isEncrypted: typeof storedData.allergies === 'object' && storedData.allergies.encrypted,
        isReadable: typeof storedData.allergies === 'string'
      },
      phoneNumber: {
        original: testData.phoneNumber,
        stored: storedData.phoneNumber,
        isEncrypted: typeof storedData.phoneNumber === 'object' && storedData.phoneNumber.encrypted,
        isReadable: typeof storedData.phoneNumber === 'string'
      },
      emergencyPhone: {
        original: testData.emergencyPhone,
        stored: storedData.emergencyPhone,
        isEncrypted: typeof storedData.emergencyPhone === 'object' && storedData.emergencyPhone.encrypted,
        isReadable: typeof storedData.emergencyPhone === 'string'
      }
    };

    // 6. Display results
    console.log('\n📊 Encryption Test Results:');
    console.log('='.repeat(60));

    let allEncrypted = true;
    let allReadable = true;

    for (const [field, result] of Object.entries(encryptionResults)) {
      const status = result.isEncrypted ? '✅ ENCRYPTED' : '❌ NOT ENCRYPTED';
      const readable = result.isReadable ? '❌ READABLE (BAD!)' : '✅ NOT READABLE (GOOD)';
      
      console.log(`${field}:`);
      console.log(`   Original: ${result.original}`);
      console.log(`   Stored: ${JSON.stringify(result.stored)}`);
      console.log(`   Encryption: ${status}`);
      console.log(`   Readability: ${readable}`);
      console.log('');

      if (!result.isEncrypted) allEncrypted = false;
      if (result.isReadable) allReadable = false;
    }

    // 7. Test decryption
    console.log('7️⃣ Testing decryption...');
    const decryptedData = decryptSensitiveFields(storedData);
    console.log('   🔓 Decrypted data:', JSON.stringify(decryptedData, null, 2));

    // 8. Verify decryption matches original
    console.log('\n8️⃣ Verifying decryption accuracy...');
    const decryptionMatches = 
      decryptedData.lastFourSSN === testData.lastFourSSN &&
      decryptedData.medicalHistory === testData.medicalHistory &&
      decryptedData.medications === testData.medications &&
      decryptedData.allergies === testData.allergies &&
      decryptedData.phoneNumber === testData.phoneNumber &&
      decryptedData.emergencyPhone === testData.emergencyPhone &&
      JSON.stringify(decryptedData.medicalConditions) === JSON.stringify(testData.medicalConditions) &&
      JSON.stringify(decryptedData.healthConcerns) === JSON.stringify(testData.healthConcerns);

    // 9. Final results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TEST RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ All fields encrypted: ${allEncrypted ? 'YES' : 'NO'}`);
    console.log(`✅ All fields unreadable in database: ${!allReadable ? 'YES' : 'NO'}`);
    console.log(`✅ Decryption works correctly: ${decryptionMatches ? 'YES' : 'NO'}`);

    if (allEncrypted && !allReadable && decryptionMatches) {
      console.log('\n🎉 SUCCESS! All sensitive fields are properly encrypted and can be decrypted!');
      console.log('✅ HIPAA encryption requirements are met.');
    } else {
      console.log('\n❌ ISSUES FOUND! Encryption is not working correctly.');
      console.log('⚠️  Please check encryption implementation.');
    }

    // 10. Cleanup test data
    console.log('\n9️⃣ Cleaning up test data...');
    await query('DELETE FROM evaluations WHERE id = $1', [evaluationId]);
    
    // Clean up test user if we created one (check if it's a test user)
    if (testUserId.startsWith('test-user-')) {
      await query('DELETE FROM users WHERE id = $1', [testUserId]);
      console.log('   🗑️ Test user and evaluation data cleaned up');
    } else {
      console.log('   🗑️ Test evaluation data cleaned up (existing user preserved)');
    }

    // 11. Log the test
    await auditLog({
      userId: testUserId,
      action: 'ENCRYPTION_TEST_COMPLETED',
      resource: 'encryption_verification',
      timestamp: new Date(),
      success: allEncrypted && !allReadable && decryptionMatches,
      details: {
        allEncrypted,
        allReadable: !allReadable,
        decryptionMatches,
        testFields: Object.keys(testData)
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEncryptedFields().catch(error => {
    console.error('Encryption test failed:', error);
    process.exit(1);
  });
}

export default testEncryptedFields;
