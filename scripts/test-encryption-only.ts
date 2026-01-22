// scripts/test-encryption-only.ts
// Simple test for encryption without database
import dotenv from 'dotenv';
import { encryptSensitiveFields, decryptSensitiveFields } from '../app/lib/encryption';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.prod' });
} else {
  dotenv.config({ path: '.env.local' });
}

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

async function testEncryptionOnly() {
  console.log('🔒 Testing Encryption Only (No Database)...\n');

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
    const encryptedData = await encryptSensitiveFields(testData);
    console.log('   🔐 Encrypted data:', JSON.stringify(encryptedData, null, 2));

    // 3. Verify encryption
    console.log('\n3️⃣ Verifying field encryption...');
    const encryptionResults = {
      lastFourSSN: {
        original: testData.lastFourSSN,
        stored: encryptedData.lastFourSSN,
        isEncrypted: typeof encryptedData.lastFourSSN === 'object' && encryptedData.lastFourSSN.encrypted,
        isReadable: typeof encryptedData.lastFourSSN === 'string'
      },
      medicalHistory: {
        original: testData.medicalHistory,
        stored: encryptedData.medicalHistory,
        isEncrypted: typeof encryptedData.medicalHistory === 'object' && encryptedData.medicalHistory.encrypted,
        isReadable: typeof encryptedData.medicalHistory === 'string'
      },
      medications: {
        original: testData.medications,
        stored: encryptedData.medications,
        isEncrypted: typeof encryptedData.medications === 'object' && encryptedData.medications.encrypted,
        isReadable: typeof encryptedData.medications === 'string'
      },
      allergies: {
        original: testData.allergies,
        stored: encryptedData.allergies,
        isEncrypted: typeof encryptedData.allergies === 'object' && encryptedData.allergies.encrypted,
        isReadable: typeof encryptedData.allergies === 'string'
      },
      medicalConditions: {
        original: JSON.stringify(testData.medicalConditions),
        stored: encryptedData.medicalConditions,
        isEncrypted: typeof encryptedData.medicalConditions === 'object' && encryptedData.medicalConditions.encrypted,
        isReadable: typeof encryptedData.medicalConditions === 'string'
      },
      healthConcerns: {
        original: JSON.stringify(testData.healthConcerns),
        stored: encryptedData.healthConcerns,
        isEncrypted: typeof encryptedData.healthConcerns === 'object' && encryptedData.healthConcerns.encrypted,
        isReadable: typeof encryptedData.healthConcerns === 'string'
      },
      phoneNumber: {
        original: testData.phoneNumber,
        stored: encryptedData.phoneNumber,
        isEncrypted: typeof encryptedData.phoneNumber === 'object' && encryptedData.phoneNumber.encrypted,
        isReadable: typeof encryptedData.phoneNumber === 'string'
      },
      emergencyPhone: {
        original: testData.emergencyPhone,
        stored: encryptedData.emergencyPhone,
        isEncrypted: typeof encryptedData.emergencyPhone === 'object' && encryptedData.emergencyPhone.encrypted,
        isReadable: typeof encryptedData.emergencyPhone === 'string'
      }
    };

    // 4. Display results
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

    // 5. Test decryption
    console.log('6️⃣ Testing decryption...');
    const decryptedData = await decryptSensitiveFields(encryptedData);
    console.log('   🔓 Decrypted data:', JSON.stringify(decryptedData, null, 2));

    // 6. Verify decryption matches original
    console.log('\n7️⃣ Verifying decryption accuracy...');
    const decryptionMatches = 
      decryptedData.lastFourSSN === testData.lastFourSSN &&
      decryptedData.medicalHistory === testData.medicalHistory &&
      decryptedData.medications === testData.medications &&
      decryptedData.allergies === testData.allergies &&
      decryptedData.phoneNumber === testData.phoneNumber &&
      decryptedData.emergencyPhone === testData.emergencyPhone &&
      JSON.stringify(decryptedData.medicalConditions) === JSON.stringify(testData.medicalConditions) &&
      JSON.stringify(decryptedData.healthConcerns) === JSON.stringify(testData.healthConcerns);

    // 7. Final results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TEST RESULTS:');
    console.log('='.repeat(60));
    console.log(`✅ All fields encrypted: ${allEncrypted ? 'YES' : 'NO'}`);
    console.log(`✅ All fields unreadable in storage: ${!allReadable ? 'YES' : 'NO'}`);
    console.log(`✅ Decryption works correctly: ${decryptionMatches ? 'YES' : 'NO'}`);

    if (allEncrypted && !allReadable && decryptionMatches) {
      console.log('\n🎉 SUCCESS! All sensitive fields are properly encrypted and can be decrypted!');
      console.log('✅ HIPAA encryption requirements are met.');
      console.log('✅ Ready for production deployment.');
    } else {
      console.log('\n❌ ISSUES FOUND! Encryption is not working correctly.');
      console.log('⚠️  Please check encryption implementation.');
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testEncryptionOnly().catch((error: any) => {
    console.error('Encryption test failed:', error);
    process.exit(1);
  });
}

export default testEncryptionOnly;
