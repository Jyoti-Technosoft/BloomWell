// scripts/inspect-database-encryption.ts
// Inspect existing database data to verify encryption
import { query } from '../app/lib/postgres';

async function inspectDatabaseEncryption() {
  console.log('🔍 Inspecting Database Encryption...\n');

  try {
    // 1. Check if evaluations table exists and has data
    console.log('1️⃣ Checking evaluations table...');
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'evaluations'
      )
    `);

    if (!tableCheck[0].exists) {
      console.log('❌ Evaluations table not found. Run database setup first.');
      return;
    }

    // 2. Get sample evaluation data
    console.log('2️⃣ Retrieving sample evaluation data...');
    const evaluations = await query(`
      SELECT id, user_id, responses, created_at 
      FROM evaluations 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (evaluations.length === 0) {
      console.log('❌ No evaluation data found. Submit some test data first.');
      return;
    }

    console.log(`   📊 Found ${evaluations.length} evaluations\n`);

    // 3. Analyze each evaluation
    for (let i = 0; i < evaluations.length; i++) {
      const evaluation = evaluations[i];
      console.log(`3️⃣${i + 1}. Analyzing Evaluation ID: ${evaluation.id}`);
      
      try {
        const responses = JSON.parse(evaluation.responses);
        console.log(`   📄 Created: ${evaluation.created_at}`);
        
        // Check sensitive fields
        const sensitiveFields = [
          'lastFourSSN',
          'medicalHistory', 
          'medications',
          'allergies',
          'medicalConditions',
          'healthConcerns',
          'phoneNumber',
          'emergencyPhone'
        ];

        let encryptedCount = 0;
        let totalCount = 0;

        for (const field of sensitiveFields) {
          if (responses[field]) {
            totalCount++;
            const isEncrypted = typeof responses[field] === 'object' && 
                               responses[field].encrypted && 
                               responses[field].iv && 
                               responses[field].tag;
            
            if (isEncrypted) {
              encryptedCount++;
              console.log(`   ✅ ${field}: ENCRYPTED`);
            } else {
              console.log(`   ❌ ${field}: NOT ENCRYPTED (Value: ${JSON.stringify(responses[field]).substring(0, 50)}...)`);
            }
          }
        }

        const encryptionRate = totalCount > 0 ? (encryptedCount / totalCount) * 100 : 0;
        console.log(`   📊 Encryption Rate: ${encryptionRate.toFixed(1)}% (${encryptedCount}/${totalCount} fields)`);
        
        if (encryptionRate === 100) {
          console.log(`   🎉 All sensitive fields properly encrypted!\n`);
        } else {
          console.log(`   ⚠️  Some fields are not encrypted - SECURITY RISK!\n`);
        }

      } catch (parseError) {
        console.log(`   ❌ Failed to parse responses JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    }

    // 4. Summary
    console.log('4️⃣ Overall Summary:');
    console.log('='.repeat(50));
    
    const totalEvaluations = await query('SELECT COUNT(*) as count FROM evaluations');
    console.log(`📊 Total evaluations in database: ${totalEvaluations[0].count}`);

    // Check for any unencrypted sensitive data
    const unencryptedCheck = await query(`
      SELECT id, responses 
      FROM evaluations 
      WHERE responses::text LIKE '%lastFourSSN%' 
      AND responses::text NOT LIKE '%encrypted%'
      LIMIT 1
    `);

    if (unencryptedCheck.length > 0) {
      console.log('❌ SECURITY RISK: Found evaluations with unencrypted sensitive data!');
      console.log('   Run encryption migration to fix this issue.');
    } else {
      console.log('✅ No unencrypted sensitive data found in recent evaluations.');
    }

    // 5. Recommendations
    console.log('\n5️⃣ Recommendations:');
    if (unencryptedCheck.length > 0) {
      console.log('🔧 IMMEDIATE ACTION REQUIRED:');
      console.log('   1. Run data encryption migration');
      console.log('   2. Update application to use encryption');
      console.log('   3. Verify all new submissions are encrypted');
    } else {
      console.log('✅ Encryption appears to be working correctly!');
      console.log('💡 Continue monitoring new submissions');
    }

  } catch (error) {
    console.error('❌ Database inspection failed:', error);
    process.exit(1);
  }
}

// Run inspection if this file is executed directly
if (require.main === module) {
  inspectDatabaseEncryption().catch(error => {
    console.error('Database inspection failed:', error);
    process.exit(1);
  });
}

export default inspectDatabaseEncryption;
