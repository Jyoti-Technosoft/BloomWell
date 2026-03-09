// lib/secure-logger.ts
// HIPAA-compliant logging utility that prevents PHI exposure
import crypto from 'crypto';
import { query } from './postgres';

// Hash function for sensitive identifiers
function hashIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
}

// Sanitize data to remove PHI
export function sanitizeForLogging(data: unknown): unknown {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Check for potential PHI patterns
    if (data.includes('@') && data.includes('.')) {
      // Email pattern
      const [local, domain] = data.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    if (/\d{3}-\d{2}-\d{4}/.test(data)) {
      // SSN pattern
      return '***-**-****';
    }
    if (data.length > 50) {
      return data.substring(0, 20) + '...';
    }
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip known PHI fields entirely
      const phiFields = ['ssn', 'socialSecurity', 'medicalHistory', 'medications', 'allergies', 'conditions'];
      if (phiFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: unknown;
}

// Store audit log in database (HIPAA requirement)
async function storeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const auditId = crypto.randomUUID();
    const sanitizedEntry = {
      userId: entry.userId || null,
      action: entry.action,
      resource: entry.resource,
      timestamp: entry.timestamp,
      ipAddress: entry.ipAddress ? hashIdentifier(entry.ipAddress) : null,
      userAgent: entry.userAgent ? entry.userAgent.substring(0, 100) : null,
      success: entry.success,
      details: entry.details ? sanitizeForLogging(entry.details) : null
    };

    await query(
      `INSERT INTO audit_logs (id, user_id, action, resource, timestamp, ip_address, user_agent, success, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        auditId,
        sanitizedEntry.userId || '',
        sanitizedEntry.action,
        sanitizedEntry.resource,
        sanitizedEntry.timestamp.toISOString(),
        sanitizedEntry.ipAddress || '',
        sanitizedEntry.userAgent || '',
        sanitizedEntry.success ? 1 : 0,
        JSON.stringify(sanitizedEntry.details)
      ]
    );
  } catch (error) {
    // Fail silently to avoid breaking application flow
    console.error('Audit logging failed:', error instanceof Error ? error.message : String(error));
  }
}

// Audit logging for HIPAA compliance
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Store in database for compliance
    await storeAuditLog(entry);
    
    // Also log to console for immediate monitoring
    const sanitizedEntry = {
      userId: entry.userId ? hashIdentifier(entry.userId) : null,
      action: entry.action,
      resource: entry.resource,
      timestamp: entry.timestamp,
      success: entry.success,
      details: entry.details ? sanitizeForLogging(entry.details) : null
    };

    console.log('AUDIT:', JSON.stringify(sanitizedEntry));
    
  } catch (error) {
    // Fail silently to avoid breaking application flow
    console.error('Audit logging failed:', error instanceof Error ? error.message : String(error));
  }
}

// Secure logging functions
export function createSecureLogger(context: string): (message: string, data?: unknown) => void {
  return (message: string, data?: unknown) => {
    const sanitizedData = data ? sanitizeForLogging(data) : null;
    console.log(`INFO: ${context} - ${message}`, sanitizedData ? JSON.stringify(sanitizedData) : '');
  };
}

export const logger = {
  info: createSecureLogger('INFO'),
  warn: createSecureLogger('WARN'),
  error: createSecureLogger('ERROR'),
  audit: auditLog
};

export default logger;
