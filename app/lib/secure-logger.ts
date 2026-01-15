// lib/secure-logger.ts
// HIPAA-compliant logging utility that prevents PHI exposure
import crypto from 'crypto';

// Hash function for sensitive identifiers
function hashIdentifier(identifier: string): string {
  return crypto.createHash('sha256').update(identifier).digest('hex').substring(0, 8);
}

// Sanitize data to remove PHI
function sanitizeData(data: any): any {
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
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip known PHI fields entirely
      const phiFields = ['ssn', 'socialSecurity', 'medicalHistory', 'medications', 'allergies', 'conditions'];
      if (phiFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
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
  details?: any;
}

// Audit logging for HIPAA compliance
export async function auditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const sanitizedEntry = {
      userId: entry.userId ? hashIdentifier(entry.userId) : null,
      action: entry.action,
      resource: entry.resource,
      timestamp: entry.timestamp,
      ipAddress: entry.ipAddress ? hashIdentifier(entry.ipAddress) : null,
      userAgent: entry.userAgent ? entry.userAgent.substring(0, 100) : null,
      success: entry.success,
      details: entry.details ? sanitizeData(entry.details) : null
    };

    // Log to secure audit trail
    console.log('AUDIT:', JSON.stringify(sanitizedEntry));
    
    // TODO: Store in database audit table
    // await postgresDb.auditLogs.create(sanitizedEntry);
    
  } catch (error) {
    // Fail silently to avoid breaking application flow
    console.error('Audit logging failed:', error instanceof Error ? error.message : String(error));
  }
}

// Secure logging functions
export const logger = {
  info: (message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : null;
    console.log(`INFO: ${message}`, sanitizedData ? JSON.stringify(sanitizedData) : '');
  },
  
  warn: (message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : null;
    console.warn(`WARN: ${message}`, sanitizedData ? JSON.stringify(sanitizedData) : '');
  },
  
  error: (message: string, data?: any) => {
    const sanitizedData = data ? sanitizeData(data) : null;
    console.error(`ERROR: ${message}`, sanitizedData ? JSON.stringify(sanitizedData) : '');
  },
  
  audit: auditLog
};

export default logger;
