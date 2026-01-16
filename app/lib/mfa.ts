// lib/mfa.ts
// Multi-Factor Authentication for HIPAA compliance
import crypto from 'crypto';
import { query } from './postgres';

export interface MFASetup {
  userId: string;
  secret: string;
  backupCodes: string[];
  qrCode: string;
}

export interface MFAVerification {
  userId: string;
  code: string;
  timestamp: Date;
}

// Generate secure MFA secret
export function generateMFASecret(): string {
  return crypto.randomBytes(20).toString('base64').replace(/[^A-Za-z0-9]/g, '').substring(0, 32);
}

// Generate backup codes
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

// Setup MFA for user
export async function setupMFA(userId: string): Promise<MFASetup> {
  try {
    const secret = generateMFASecret();
    const backupCodes = generateBackupCodes();
    const setupId = crypto.randomUUID();
    
    // Store MFA setup in database
    await query(
      `INSERT INTO mfa_setup (id, user_id, secret, backup_codes, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [setupId, userId, secret, JSON.stringify(backupCodes), new Date()]
    );
    
    // Generate QR code URL (simplified - in production use proper TOTP library)
    const qrCode = `otpauth://totp/BloomWell:${userId}?secret=${secret}&issuer=BloomWell`;
    
    return {
      userId,
      secret,
      backupCodes,
      qrCode
    };
  } catch (error) {
    throw new Error('MFA setup failed');
  }
}

// Verify MFA code
export async function verifyMFACode(userId: string, code: string): Promise<boolean> {
  try {
    // Get user's MFA secret
    const result = await query(
      'SELECT secret, backup_codes FROM mfa_setup WHERE user_id = $1',
      [userId]
    );
    
    if (result.length === 0) {
      return false;
    }
    
    const { secret, backup_codes } = result[0];
    const backupCodes = JSON.parse(backup_codes);
    
    // Check if it's a backup code
    if (backupCodes.includes(code)) {
      // Remove used backup code
      const updatedBackupCodes = backupCodes.filter((c: string) => c !== code);
      await query(
        'UPDATE mfa_setup SET backup_codes = $1 WHERE user_id = $2',
        [JSON.stringify(updatedBackupCodes), userId]
      );
      return true;
    }
    
    // Verify TOTP code (simplified - in production use proper TOTP library)
    // This is a basic time-based verification
    const timeStep = Math.floor(Date.now() / 30000); // 30-second steps
    const expectedCode = generateTOTPCode(secret, timeStep);
    
    return code === expectedCode;
  } catch (error) {
    return false;
  }
}

// Generate TOTP code (simplified)
function generateTOTPCode(secret: string, timeStep: number): string {
  // In production, use proper TOTP library like 'otplib'
  const hash = crypto.createHmac('sha1', secret).update(timeStep.toString()).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const code = (hash.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return code.toString().padStart(6, '0');
}

// Check if user has MFA enabled
export async function hasMFAEnabled(userId: string): Promise<boolean> {
  try {
    const result = await query(
      'SELECT id FROM mfa_setup WHERE user_id = $1',
      [userId]
    );
    return result.length > 0;
  } catch (error) {
    return false;
  }
}

export default {
  setupMFA,
  verifyMFACode,
  hasMFAEnabled,
  generateMFASecret,
  generateBackupCodes
};
