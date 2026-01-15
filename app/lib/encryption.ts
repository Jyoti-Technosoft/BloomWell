// lib/encryption.ts
// Field-level encryption for HIPAA compliance
import crypto from 'crypto';

// Get and validate encryption key (lazy evaluation)
const getEncryptionKey = () => {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  
  // CRITICAL: Fail fast if encryption key is not set
  if (!ENCRYPTION_KEY) {
    throw new Error('FATAL: ENCRYPTION_KEY environment variable is required for HIPAA compliance. Set it in .env.local');
  }

  if (ENCRYPTION_KEY.length !== 64) {
    throw new Error('FATAL: ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }
  
  return ENCRYPTION_KEY;
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

// Encrypt sensitive field
export function encryptField(text: string): EncryptedData {
  if (!text) return { encrypted: '', iv: '', tag: '' };
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getEncryptionKey(), 'hex'), iv);
  cipher.setAAD(Buffer.from('additional-data')); // Additional authenticated data
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

// Decrypt sensitive field
export function decryptField(encryptedData: EncryptedData): string {
  if (!encryptedData.encrypted) return '';
  
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getEncryptionKey(), 'hex'), Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// Hash sensitive identifiers (for audit logs)
export function hashIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
}

// Fields that require encryption
export const SENSITIVE_FIELDS = [
  'ssn',
  'socialSecurity',
  'lastFourSSN',
  'medicalHistory',
  'medications',
  'allergies',
  'medicalConditions',
  'healthConcerns',
  'sleepIssues',
  'stressTriggers',
  'stressManagementTechniques',
  'currentlyUsingMedicines',
  'emergencyPhone',
  'phoneNumber'
];

// Encrypt object with sensitive fields
export function encryptSensitiveFields(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const encrypted = { ...data };
  
  for (const field of SENSITIVE_FIELDS) {
    if (encrypted[field]) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }
  
  return encrypted;
}

// Decrypt object with sensitive fields
export function decryptSensitiveFields(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const decrypted = { ...data };
  
  for (const field of SENSITIVE_FIELDS) {
    if (decrypted[field] && typeof decrypted[field] === 'object' && decrypted[field].encrypted) {
      decrypted[field] = decryptField(decrypted[field]);
    }
  }
  
  return decrypted;
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export default {
  encryptField,
  decryptField,
  hashIdentifier,
  encryptSensitiveFields,
  decryptSensitiveFields,
  generateSecureToken,
  SENSITIVE_FIELDS
};
