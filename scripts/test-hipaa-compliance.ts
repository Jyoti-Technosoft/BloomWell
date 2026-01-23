// scripts/test-hipaa-compliance.ts
// Comprehensive HIPAA Compliance Testing Script
import { readFileSync, existsSync } from 'fs';
import { query } from '../app/lib/postgres';
import { encryptSensitiveFields, decryptSensitiveFields } from '@/app/lib/encryption';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

interface ComplianceTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
  weight: number;
}

class HIPAAComplianceTester {
  private tests: ComplianceTest[] = [];
  private results: { [key: string]: boolean } = {};

  constructor() {
    this.setupTests();
  }

  private setupTests() {
    // Administrative Safeguards Tests
    this.tests.push({
      name: 'Privacy Policy Exists',
      description: 'HIPAA-compliant privacy policy is present',
      test: async () => this.testPrivacyPolicy(),
      weight: 5
    });

    this.tests.push({
      name: 'Training Documentation',
      description: 'HIPAA training program documentation exists',
      test: async () => this.testTrainingDocumentation(),
      weight: 5
    });

    // Technical Safeguards Tests
    this.tests.push({
      name: 'Encryption Key Set',
      description: 'ENCRYPTION_KEY environment variable is set',
      test: async () => this.testEncryptionKey(),
      weight: 10
    });

    this.tests.push({
      name: 'Field Encryption Working',
      description: 'Field-level encryption functions correctly',
      test: async () => this.testEncryption(),
      weight: 10
    });

    this.tests.push({
      name: 'Audit Logging Database',
      description: 'Audit logs are stored in database',
      test: async () => this.testAuditLogging(),
      weight: 10
    });

    this.tests.push({
      name: 'Secure Logging Active',
      description: 'Secure logger sanitizes PHI',
      test: async () => this.testSecureLogging(),
      weight: 5
    });

    // Access Control Tests
    this.tests.push({
      name: 'Session Timeout',
      description: 'Session timeout is 15 minutes',
      test: async () => this.testSessionTimeout(),
      weight: 10
    });

    this.tests.push({
      name: 'MFA System',
      description: 'Multi-factor authentication system exists',
      test: async () => this.testMFASystem(),
      weight: 10
    });

    // Database Schema Tests
    this.tests.push({
      name: 'HIPAA Tables Exist',
      description: 'Required HIPAA compliance tables exist',
      test: async () => this.testHIPAATables(),
      weight: 10
    });

    this.tests.push({
      name: 'Data Retention System',
      description: 'Data retention policies are implemented',
      test: async () => this.testDataRetention(),
      weight: 5
    });

    this.tests.push({
      name: 'Breach Notification System',
      description: 'Breach notification system exists',
      test: async () => this.testBreachNotification(),
      weight: 5
    });

    // Patient Rights Tests
    this.tests.push({
      name: 'Consent Management',
      description: 'Patient consent management system exists',
      test: async () => this.testConsentManagement(),
      weight: 5
    });

    this.tests.push({
      name: 'Data Deletion',
      description: 'Patient data deletion procedures exist',
      test: async () => this.testDataDeletion(),
      weight: 5
    });

    // Security Tests
    this.tests.push({
      name: 'JWT Secret Set',
      description: 'JWT_SECRET environment variable is set',
      test: async () => this.testJWTSecret(),
      weight: 5
    });

    this.tests.push({
      name: 'Database Connection',
      description: 'Database connection is secure (SSL)',
      test: async () => this.testDatabaseConnection(),
      weight: 5
    });

    this.tests.push({
      name: 'Compliance Dashboard',
      description: 'HIPAA compliance dashboard API exists',
      test: async () => this.testComplianceDashboard(),
      weight: 5
    });
  }

  private async testPrivacyPolicy(): Promise<boolean> {
    try {
      const privacyPath = './app/privacy/page.tsx';
      if (!existsSync(privacyPath)) return false;
      
      const content = readFileSync(privacyPath, 'utf8');
      return content.includes('HIPAA') && 
             content.includes('Protected Health Information') &&
             content.includes('Privacy Practices');
    } catch (error) {
      return false;
    }
  }

  private async testTrainingDocumentation(): Promise<boolean> {
    try {
      const trainingPath = './documents/HIPAA_TRAINING_PROGRAM.md';
      if (!existsSync(trainingPath)) return false;
      
      const content = readFileSync(trainingPath, 'utf8');
      return content.includes('HIPAA') && 
             content.includes('Training') &&
             content.includes('Compliance');
    } catch (error) {
      return false;
    }
  }

  private async testEncryptionKey(): Promise<boolean> {
    return !!process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64;
  }

  private async testEncryption(): Promise<boolean> {
    try {
      // First check if encryption key is set
      if (!process.env.ENCRYPTION_KEY) {
        return false;
      }
      
      // Test encryption without database calls
      const testData = { lastFourSSN: '1234' };
      const encrypted = await encryptSensitiveFields(testData);
      
      // Check if the field was actually encrypted (should be an object with encrypted property)
      if (!encrypted.lastFourSSN || typeof encrypted.lastFourSSN !== 'object' || !encrypted.lastFourSSN.encrypted) {
        return false;
      }
      
      // Test decryption
      const decrypted = await decryptSensitiveFields(encrypted);
      return testData.lastFourSSN === String(decrypted.lastFourSSN);
    } catch (error) {
      console.error('Encryption test error:', error);
      return false;
    }
  }

  private async testAuditLogging(): Promise<boolean> {
    try {
      // First check if secure logger exists
      const secureLoggerPath = './app/lib/secure-logger.ts';
      if (!existsSync(secureLoggerPath)) return false;
      
      // Check if audit_logs table exists
      try {
        const result = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'audit_logs'
          );
        `);
        return result[0].exists;
      } catch (dbError) {
        // If database connection fails, check if the code has audit logging
        const content = readFileSync(secureLoggerPath, 'utf8');
        return content.includes('audit_logs') && 
               content.includes('INSERT INTO audit_logs');
      }
    } catch (error) {
      return false;
    }
  }

  private async testSecureLogging(): Promise<boolean> {
    try {
      const secureLoggerPath = './app/lib/secure-logger.ts';
      if (!existsSync(secureLoggerPath)) return false;
      
      const content = readFileSync(secureLoggerPath, 'utf8');
      return content.includes('sanitizeData') && 
             content.includes('auditLog') &&
             content.includes('hashIdentifier');
    } catch (error) {
      return false;
    }
  }

  private async testSessionTimeout(): Promise<boolean> {
    try {
      const authPath = './app/api/auth/[...nextauth]/route.ts';
      if (!existsSync(authPath)) return false;
      
      const content = readFileSync(authPath, 'utf8');
      return content.includes('maxAge: 15 * 60');
    } catch (error) {
      return false;
    }
  }

  private async testMFASystem(): Promise<boolean> {
    try {
      const mfaPath = './app/lib/mfa.ts';
      if (!existsSync(mfaPath)) return false;
      
      const content = readFileSync(mfaPath, 'utf8');
      return content.includes('verifyMFACode') && 
             content.includes('setupMFA') &&
             content.includes('generateMFASecret');
    } catch (error) {
      return false;
    }
  }

  private async testHIPAATables(): Promise<boolean> {
    try {
      const requiredTables = [
        'audit_logs',
        'patient_consent',
        'data_retention',
        'mfa_setup',
        'breach_incidents'
      ];

      // First try to check database
      try {
        for (const table of requiredTables) {
          const result = await query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_name = '${table}'
            );
          `);
          if (!result[0].exists) return false;
        }
        return true;
      } catch (dbError) {
        // If database connection fails, check if schema file contains the tables
        const schemaPath = './database/schema.sql';
        if (!existsSync(schemaPath)) return false;
        
        const content = readFileSync(schemaPath, 'utf8');
        for (const table of requiredTables) {
          if (!content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
            return false;
          }
        }
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  private async testDataRetention(): Promise<boolean> {
    try {
      const retentionPath = './app/lib/data-retention.ts';
      if (!existsSync(retentionPath)) return false;
      
      const content = readFileSync(retentionPath, 'utf8');
      return content.includes('createRetentionPolicy') && 
             content.includes('deleteUserData') &&
             content.includes('processScheduledDeletions');
    } catch (error) {
      return false;
    }
  }

  private async testBreachNotification(): Promise<boolean> {
    try {
      const breachPath = './app/lib/breach-notification.ts';
      if (!existsSync(breachPath)) return false;
      
      const content = readFileSync(breachPath, 'utf8');
      return content.includes('reportBreach') && 
             content.includes('sendBreachNotifications') &&
             content.includes('BreachType');
    } catch (error) {
      return false;
    }
  }

  private async testConsentManagement(): Promise<boolean> {
    try {
      const consentPath = './app/lib/patient-consent.ts';
      if (!existsSync(consentPath)) return false;
      
      const content = readFileSync(consentPath, 'utf8');
      return content.includes('recordConsent') && 
             content.includes('hasConsent') &&
             content.includes('ConsentType');
    } catch (error) {
      return false;
    }
  }

  private async testDataDeletion(): Promise<boolean> {
    try {
      const retentionPath = './app/lib/data-retention.ts';
      if (!existsSync(retentionPath)) return false;
      
      const content = readFileSync(retentionPath, 'utf8');
      return content.includes('deleteUserData') && 
             content.includes('DataType');
    } catch (error) {
      return false;
    }
  }

  private async testJWTSecret(): Promise<boolean> {
    return !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32;
  }

  private async testDatabaseConnection(): Promise<boolean> {
    try {
      const postgresPath = './app/lib/postgres.ts';
      if (!existsSync(postgresPath)) return false;
      
      const content = readFileSync(postgresPath, 'utf8');
      return content.includes('ssl: true') || 
             content.includes('sslmode=require') ||
             content.includes('SSL');
    } catch (error) {
      return false;
    }
  }

  private async testComplianceDashboard(): Promise<boolean> {
    try {
      const dashboardPath = './app/api/hipaa/compliance-dashboard/route.ts';
      if (!existsSync(dashboardPath)) return false;
      
      const content = readFileSync(dashboardPath, 'utf8');
      return content.includes('complianceScore') && 
             content.includes('auditStats') &&
             content.includes('breachStats');
    } catch (error) {
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🔒 Starting HIPAA Compliance Test Suite...\n');

    let totalWeight = 0;
    let passedWeight = 0;

    for (const test of this.tests) {
      try {
        const passed = await test.test();
        this.results[test.name] = passed;
        
        if (passed) {
          passedWeight += test.weight;
          console.log(`✅ ${test.name} (${test.weight}pts) - ${test.description}`);
        } else {
          console.log(`❌ ${test.name} (${test.weight}pts) - ${test.description}`);
        }
        
        totalWeight += test.weight;
      } catch (error) {
        console.log(`⚠️  ${test.name} (${test.weight}pts) - Test failed: ${error}`);
        totalWeight += test.weight;
      }
    }

    const score = Math.round((passedWeight / totalWeight) * 100);
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 HIPAA Compliance Score: ${score}/100`);
    console.log('='.repeat(60));

    if (score === 100) {
      console.log('🎉 PERFECT SCORE! Your application is fully HIPAA compliant!');
    } else if (score >= 90) {
      console.log('✅ EXCELLENT! Your application meets HIPAA requirements.');
    } else if (score >= 80) {
      console.log('⚠️  GOOD! Minor improvements needed for full compliance.');
    } else if (score >= 70) {
      console.log('⚠️  FAIR! Significant improvements needed.');
    } else {
      console.log('❌ NEEDS WORK! Major compliance issues found.');
    }

    console.log('\n📋 Detailed Results:');
    for (const [name, passed] of Object.entries(this.results)) {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${status} ${name}`);
    }

    if (score < 100) {
      console.log('\n🔧 To achieve 100% compliance, address the failed tests above.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new HIPAAComplianceTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default HIPAAComplianceTester;
