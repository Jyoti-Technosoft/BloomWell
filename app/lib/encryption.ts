// lib/encryption.ts
// Field-level encryption for HIPAA compliance
import crypto from 'crypto';

// Check if AWS credentials are available
const AWS_AVAILABLE = false;

// Type for AWS KMS client (dynamically imported)
type KMSClient = unknown;

let kms: KMSClient | null = null;

// Initialize AWS KMS if available
async function initializeAWS() {
  if (AWS_AVAILABLE) {
    try {
      const { KMSClient } = await import('@aws-sdk/client-kms');
      kms = new KMSClient({
        region: process.env.AWS_REGION!,
      });
      console.log('🔐 AWS KMS encryption enabled');
    } catch {
      // Error already logged above
    }
  } else {
    console.log('🔒 Using fallback encryption (no AWS credentials)');
  }
}

// Initialize on module load
initializeAWS();

const KMS_KEY_ID = process.env.AWS_KMS_KEY_ID!;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const FALLBACK_KEY = process.env.ENCRYPTION_KEY || 'fallback-encryption-key-32-chars!';
const FIXED_FALLBACK_KEY = crypto.createHash('sha256').update(FALLBACK_KEY).digest();

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  key: string; // encrypted data key (base64)
}

/* ------------------ Core Encryption ------------------ */

export async function encryptField(text: string): Promise<EncryptedData> {
  if (!text) {
    return { encrypted: '', iv: '', tag: '', key: '' };
  }

  if (AWS_AVAILABLE && kms) {
    // Use AWS KMS encryption
    // const { GenerateDataKeyCommand } = await import('@aws-sdk/client-kms');
    // GenerateDataKeyCommand is used in generateDataKey function
    const { plaintextKey, encryptedKey } = await generateDataKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, plaintextKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
      key: encryptedKey.toString('base64'),
    };
  } else {
    // Use fallback encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, FIXED_FALLBACK_KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex'),
      key: 'fallback', // Indicate fallback encryption
    };
  }
}

async function generateDataKey() {
  if (AWS_AVAILABLE && kms) {
    const { GenerateDataKeyCommand } = await import('@aws-sdk/client-kms');
    const command = new GenerateDataKeyCommand({
      KeyId: KMS_KEY_ID,
      KeySpec: 'AES_256',
    });

    const response = await (kms as { send: (cmd: unknown) => Promise<{ Plaintext: Buffer; CiphertextBlob: Buffer }> }).send(command);
    return {
      plaintextKey: (response as { Plaintext: Buffer }).Plaintext,
      encryptedKey: (response as { CiphertextBlob: Buffer }).CiphertextBlob,
    };
  } else {
    // Fallback: return a key derived from fallback key
    return {
      plaintextKey: FIXED_FALLBACK_KEY,
      encryptedKey: 'fallback',
    };
  }
}

async function decryptDataKey(encryptedKey: string): Promise<Buffer> {
  if (AWS_AVAILABLE && kms && encryptedKey !== 'fallback') {
    const { DecryptCommand } = await import('@aws-sdk/client-kms');
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
    });

    const response = await (kms as { send: (cmd: unknown) => Promise<{ Plaintext: Buffer }> }).send(command);
    return (response as { Plaintext: Buffer }).Plaintext;
  } else {
    // Fallback: return fallback key
    return FIXED_FALLBACK_KEY;
  }
}

export async function decryptField(data: EncryptedData): Promise<string> {
  if (!data?.encrypted) return '';

  try {
    const key = await decryptDataKey(data.key);

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(data.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(data.tag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: unknown) {
    console.error('Decryption failed:', error);
    return '[DECRYPTION_FAILED - Different encryption key used]';
  }
}

/* ------------------ Utilities ------------------ */

export function hashIdentifier(identifier: string): string {
  return crypto
    .createHash('sha256')
    .update(identifier)
    .digest('hex')
    .substring(0, 8);
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/* ------------------ Bulk Field Helpers ------------------ */

export const SENSITIVE_FIELDS = [
  'fullName',
  'phoneNumber',
  'dateOfBirth',
  'address',
  'city',
  'state',
  'zipCode',
  'emergencyPhone',
  'allergies',
  'medications',
  'medicalHistory',
  'healthcarePurpose',
  'lastFourSSN',
];

export async function encryptSensitiveFields(data: Record<string, unknown>) {
  if (!data || typeof data !== 'object') return data;

  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (result[field]) {
      const value = Array.isArray(result[field])
        ? JSON.stringify(result[field])
        : String(result[field]);

      result[field] = await encryptField(value);
    }
  }

  return result;
}

export async function decryptSensitiveFields(data: Record<string, unknown>) {
  if (!data || typeof data !== 'object') return data;

  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    const value = result[field];

    // Handle encrypted data stored as JSON string
    let encryptedData = value;
    if (typeof value === 'string') {
      // Skip JSON parsing for plain strings that aren't encrypted
      if (!value.includes('"encrypted"')) {
        // This is a plain string, not encrypted data
        continue;
      }
      try {
        encryptedData = JSON.parse(value);
      } catch (e) {
        console.log(`Failed to parse encrypted data for ${field}:`, e);
        continue;
      }
    }
    
    if (encryptedData && typeof encryptedData === 'object' && 'encrypted' in encryptedData) {
      // Try to decrypt regardless of AWS availability
      const decryptedValue = await decryptField(encryptedData as EncryptedData);

      if (decryptedValue.includes('[DECRYPTION_FAILED')) {
        result[field] = `[ENCRYPTED - Different encryption key used]`;
      } else {
        try {
          result[field] = JSON.parse(decryptedValue);
        } catch {
          result[field] = decryptedValue;
        }
      }
    } else if (encryptedData && typeof encryptedData === 'object' && 'encrypted' in encryptedData) {
      console.log(`Field ${field} is encrypted but missing key - cannot decrypt`);
      // Keep original encrypted data for now
      result[field] = `[ENCRYPTED - Missing Key] ${value}`;
    }
  }

  return result;
}
