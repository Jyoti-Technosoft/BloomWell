// lib/breach-notification.ts
// HIPAA Breach Notification System
import crypto from 'crypto';
import { query } from './postgres';

export interface BreachIncident {
  id: string;
  userId?: string;
  breachType: BreachType;
  severity: BreachSeverity;
  description: string;
  affectedDataTypes: string[];
  discoveryDate: Date;
  notificationDate?: Date;
  resolvedDate?: Date;
  status: BreachStatus;
  mitigationSteps: string[];
  affectedUsers: number;
  notifiedUsers: number;
}

export enum BreachType {
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_THEFT = 'data_theft',
  ACCIDENTAL_DISCLOSURE = 'accidental_disclosure',
  HACKING = 'hacking',
  LOSS_THEFT = 'loss_theft',
  IMPROPER_DISPOSAL = 'improper_disposal'
}

export enum BreachSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum BreachStatus {
  DISCOVERED = 'discovered',
  INVESTIGATING = 'investigating',
  NOTIFICATION_SENT = 'notification_sent',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm'
}

// Report a breach incident
export async function reportBreach(
  breachType: BreachType,
  severity: BreachSeverity,
  description: string,
  affectedDataTypes: string[],
  mitigationSteps: string[] = []
): Promise<BreachIncident> {
  try {
    const breachId = crypto.randomUUID();
    
    await query(
      `INSERT INTO breach_incidents (id, breach_type, severity, description, affected_data_types, 
       discovery_date, status, mitigation_steps, affected_users, notified_users)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        breachId,
        breachType,
        severity,
        description,
        JSON.stringify(affectedDataTypes),
        new Date(),
        BreachStatus.DISCOVERED,
        JSON.stringify(mitigationSteps),
        0,
        0
      ]
    );
    
    return {
      id: breachId,
      breachType,
      severity,
      description,
      affectedDataTypes,
      discoveryDate: new Date(),
      status: BreachStatus.DISCOVERED,
      mitigationSteps,
      affectedUsers: 0,
      notifiedUsers: 0
    };
  } catch (error) {
    throw new Error('Failed to report breach');
  }
}

// Get breach incidents
export async function getBreachIncidents(): Promise<BreachIncident[]> {
  try {
    const result = await query(
      `SELECT id, user_id, breach_type, severity, description, affected_data_types, 
       discovery_date, notification_date, resolved_date, status, mitigation_steps, 
       affected_users, notified_users FROM breach_incidents ORDER BY discovery_date DESC`
    );
    
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      breachType: row.breach_type as BreachType,
      severity: row.severity as BreachSeverity,
      description: row.description,
      affectedDataTypes: JSON.parse(row.affected_data_types),
      discoveryDate: row.discovery_date,
      notificationDate: row.notification_date,
      resolvedDate: row.resolved_date,
      status: row.status as BreachStatus,
      mitigationSteps: JSON.parse(row.mitigation_steps),
      affectedUsers: row.affected_users,
      notifiedUsers: row.notified_users
    }));
  } catch (error) {
    return [];
  }
}

// Update breach status
export async function updateBreachStatus(
  breachId: string,
  status: BreachStatus,
  mitigationSteps?: string[]
): Promise<void> {
  try {
    await query(
      `UPDATE breach_incidents SET status = $1, mitigation_steps = $2 WHERE id = $3`,
      [status, JSON.stringify(mitigationSteps || []), breachId]
    );
  } catch (error) {
    throw new Error('Failed to update breach status');
  }
}

// Send breach notifications (HIPAA requirement)
export async function sendBreachNotifications(
  breachId: string,
  notificationMethod: 'email' | 'sms' | 'mail' = 'email'
): Promise<{
  sent: number;
  failed: number;
}> {
  try {
    // Get breach details
    const breachResult = await query(
      'SELECT * FROM breach_incidents WHERE id = $1',
      [breachId]
    );
    
    if (breachResult.length === 0) {
      throw new Error('Breach not found');
    }
    
    const breach = breachResult[0];
    
    // Determine affected users based on breach type
    let affectedUsers = [];
    if (breach.breach_type === BreachType.UNAUTHORIZED_ACCESS) {
      // Get all users who accessed the system during breach period
      affectedUsers = await query(
        'SELECT DISTINCT user_id FROM audit_logs WHERE timestamp >= $1',
        [breach.discovery_date]
      );
    } else {
      // Get all users for full breach
      affectedUsers = await query('SELECT id as user_id FROM users');
    }
    
    let sent = 0;
    let failed = 0;
    
    // Send notifications to affected users
    for (const user of affectedUsers) {
      try {
        // In production, implement actual email/SMS sending
        await sendBreachNotification(user.user_id, breach, notificationMethod);
        sent++;
      } catch (error) {
        failed++;
      }
    }
    
    // Update breach record
    await query(
      `UPDATE breach_incidents SET notification_date = $1, status = $2, 
       affected_users = $3, notified_users = $4 WHERE id = $5`,
      [new Date(), BreachStatus.NOTIFICATION_SENT, affectedUsers.length, sent, breachId]
    );
    
    return { sent, failed };
  } catch (error) {
    throw new Error('Failed to send breach notifications');
  }
}

// Send individual breach notification
async function sendBreachNotification(
  userId: string,
  breach: any,
  method: string
): Promise<void> {
  // In production, implement actual notification sending
  console.log(`Sending ${method} breach notification to user ${userId}:`, {
    breachType: breach.breach_type,
    severity: breach.severity,
    description: breach.description,
    discoveryDate: breach.discovery_date
  });
  
  // Log notification attempt
  await query(
    `INSERT INTO breach_notifications (id, user_id, breach_id, method, sent_at, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [crypto.randomUUID(), userId, breach.id, method, new Date(), 'sent']
  );
}

// Check if breach notification is required (HIPAA 60-day rule)
export async function isNotificationRequired(breachId: string): Promise<boolean> {
  try {
    const result = await query(
      'SELECT discovery_date, severity FROM breach_incidents WHERE id = $1',
      [breachId]
    );
    
    if (result.length === 0) {
      return false;
    }
    
    const breach = result[0];
    const discoveryDate = new Date(breach.discovery_date);
    const now = new Date();
    const daysSinceDiscovery = Math.floor((now.getTime() - discoveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // HIPAA requires notification within 60 days for significant breaches
    return daysSinceDiscovery >= 60 || breach.severity === BreachSeverity.CRITICAL;
  } catch (error) {
    return false;
  }
}

// Get breach statistics
export async function getBreachStatistics(): Promise<{
  totalBreaches: number;
  openBreaches: number;
  resolvedBreaches: number;
  notificationsSent: number;
}> {
  try {
    const totalResult = await query('SELECT COUNT(*) as count FROM breach_incidents');
    const openResult = await query("SELECT COUNT(*) as count FROM breach_incidents WHERE status IN ('discovered', 'investigating', 'notification_sent')");
    const resolvedResult = await query("SELECT COUNT(*) as count FROM breach_incidents WHERE status = 'resolved'");
    const notificationResult = await query("SELECT COUNT(*) as count FROM breach_incidents WHERE notification_date IS NOT NULL");
    
    return {
      totalBreaches: parseInt(totalResult[0].count),
      openBreaches: parseInt(openResult[0].count),
      resolvedBreaches: parseInt(resolvedResult[0].count),
      notificationsSent: parseInt(notificationResult[0].count)
    };
  } catch (error) {
    return {
      totalBreaches: 0,
      openBreaches: 0,
      resolvedBreaches: 0,
      notificationsSent: 0
    };
  }
}

export default {
  reportBreach,
  getBreachIncidents,
  updateBreachStatus,
  sendBreachNotifications,
  isNotificationRequired,
  getBreachStatistics,
  BreachType,
  BreachSeverity,
  BreachStatus
};
