// lib/patient-consent.ts
// Patient Consent Management for HIPAA compliance
import crypto from 'crypto';
import { query } from './postgres';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  consentDate: Date;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export enum ConsentType {
  PRIVACY_POLICY = 'privacy_policy',
  HIPAA_NOTICE = 'hipaa_notice',
  TREATMENT = 'treatment',
  TELEHEALTH = 'telehealth',
  DATA_SHARING = 'data_sharing',
  MARKETING = 'marketing',
  RESEARCH = 'research'
}

// Record patient consent
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string,
  expiresAt?: Date
): Promise<ConsentRecord> {
  try {
    const consentId = crypto.randomUUID();
    
    await query(
      `INSERT INTO patient_consent (id, user_id, consent_type, consent_given, consent_date, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        consentId,
        userId,
        consentType,
        consentGiven,
        new Date(),
        expiresAt || null,
        ipAddress || null,
        userAgent || null
      ]
    );
    
    return {
      id: consentId,
      userId,
      consentType,
      consentGiven,
      consentDate: new Date(),
      expiresAt,
      ipAddress,
      userAgent
    };
  } catch (error) {
    throw new Error('Failed to record consent');
  }
}

// Check if user has given specific consent
export async function hasConsent(
  userId: string,
  consentType: ConsentType
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT consent_given, expires_at FROM patient_consent 
       WHERE user_id = $1 AND consent_type = $2 
       ORDER BY consent_date DESC LIMIT 1`,
      [userId, consentType]
    );
    
    if (result.length === 0) {
      return false;
    }
    
    const consent = result[0];
    
    // Check if consent has expired
    if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
      return false;
    }
    
    return consent.consent_given;
  } catch (error) {
    return false;
  }
}

// Get all user consents
export async function getUserConsents(userId: string): Promise<ConsentRecord[]> {
  try {
    const result = await query(
      `SELECT id, user_id, consent_type, consent_given, consent_date, expires_at, ip_address, user_agent
       FROM patient_consent WHERE user_id = $1 ORDER BY consent_date DESC`,
      [userId]
    );
    
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      consentType: row.consent_type as ConsentType,
      consentGiven: row.consent_given,
      consentDate: row.consent_date,
      expiresAt: row.expires_at,
      ipAddress: row.ip_address,
      userAgent: row.user_agent
    }));
  } catch (error) {
    return [];
  }
}

// Revoke consent
export async function revokeConsent(
  userId: string,
  consentType: ConsentType,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await recordConsent(userId, consentType, false, ipAddress, userAgent);
  } catch (error) {
    throw new Error('Failed to revoke consent');
  }
}

// Check if user has all required consents for treatment
export async function hasRequiredConsents(userId: string): Promise<{
  hasAllConsents: boolean;
  missingConsents: ConsentType[];
}> {
  const requiredConsents = [
    ConsentType.PRIVACY_POLICY,
    ConsentType.HIPAA_NOTICE,
    ConsentType.TREATMENT
  ];
  
  const consentChecks = await Promise.all(
    requiredConsents.map(async consentType => ({
      type: consentType,
      hasConsent: await hasConsent(userId, consentType)
    }))
  );
  
  const missingConsents = consentChecks
    .filter(check => !check.hasConsent)
    .map(check => check.type);
  
  return {
    hasAllConsents: missingConsents.length === 0,
    missingConsents
  };
}

// Get consent statistics (for compliance reporting)
export async function getConsentStatistics(): Promise<{
  totalUsers: number;
  consentRates: Record<ConsentType, number>;
}> {
  try {
    // Get total users
    const userResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userResult[0].count);
    
    // Get consent rates for each type
    const consentTypes = Object.values(ConsentType);
    const consentRates: Record<ConsentType, number> = {} as any;
    
    for (const consentType of consentTypes) {
      const consentResult = await query(
        `SELECT COUNT(DISTINCT user_id) as count FROM patient_consent 
         WHERE consent_type = $1 AND consent_given = true`,
        [consentType]
      );
      
      const consentCount = parseInt(consentResult[0].count);
      consentRates[consentType] = totalUsers > 0 ? (consentCount / totalUsers) * 100 : 0;
    }
    
    return {
      totalUsers,
      consentRates
    };
  } catch (error) {
    return {
      totalUsers: 0,
      consentRates: {} as any
    };
  }
}

export default {
  recordConsent,
  hasConsent,
  getUserConsents,
  revokeConsent,
  hasRequiredConsents,
  getConsentStatistics,
  ConsentType
};
