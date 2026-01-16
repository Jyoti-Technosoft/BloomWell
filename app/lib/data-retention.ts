// lib/data-retention.ts
// Data Retention and Deletion for HIPAA compliance
import crypto from 'crypto';
import { query } from './postgres';

export interface RetentionPolicy {
  id: string;
  userId: string;
  dataType: DataType;
  retentionPeriodYears: number;
  deletionDate?: Date;
  status: RetentionStatus;
  createdAt: Date;
}

export enum DataType {
  USER_PROFILE = 'user_profile',
  EVALUATIONS = 'evaluations',
  CONSULTATIONS = 'consultations',
  MEDICAL_RECORDS = 'medical_records',
  AUDIT_LOGS = 'audit_logs',
  CONSENT_RECORDS = 'consent_records'
}

export enum RetentionStatus {
  ACTIVE = 'active',
  SCHEDULED_FOR_DELETION = 'scheduled_for_deletion',
  DELETED = 'deleted'
}

// HIPAA minimum retention periods (in years)
const HIPAA_RETENTION_PERIODS: Record<DataType, number> = {
  [DataType.USER_PROFILE]: 6,
  [DataType.EVALUATIONS]: 6,
  [DataType.CONSULTATIONS]: 6,
  [DataType.MEDICAL_RECORDS]: 6,
  [DataType.AUDIT_LOGS]: 6,
  [DataType.CONSENT_RECORDS]: 6
};

// Create retention policy for user data
export async function createRetentionPolicy(
  userId: string,
  dataType: DataType,
  customRetentionYears?: number
): Promise<RetentionPolicy> {
  try {
    const policyId = crypto.randomUUID();
    const retentionPeriod = customRetentionYears || HIPAA_RETENTION_PERIODS[dataType];
    const deletionDate = new Date();
    deletionDate.setFullYear(deletionDate.getFullYear() + retentionPeriod);
    
    await query(
      `INSERT INTO data_retention (id, user_id, data_type, retention_period_years, deletion_date, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [policyId, userId, dataType, retentionPeriod, deletionDate, RetentionStatus.ACTIVE]
    );
    
    return {
      id: policyId,
      userId,
      dataType,
      retentionPeriodYears: retentionPeriod,
      deletionDate,
      status: RetentionStatus.ACTIVE,
      createdAt: new Date()
    };
  } catch (error) {
    throw new Error('Failed to create retention policy');
  }
}

// Get retention policies for user
export async function getUserRetentionPolicies(userId: string): Promise<RetentionPolicy[]> {
  try {
    const result = await query(
      `SELECT id, user_id, data_type, retention_period_years, deletion_date, status, created_at
       FROM data_retention WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      dataType: row.data_type as DataType,
      retentionPeriodYears: row.retention_period_years,
      deletionDate: row.deletion_date,
      status: row.status as RetentionStatus,
      createdAt: row.created_at
    }));
  } catch (error) {
    return [];
  }
}

// Schedule data for deletion
export async function scheduleDataDeletion(
  userId: string,
  dataType: DataType,
  deletionDate: Date
): Promise<void> {
  try {
    await query(
      `UPDATE data_retention SET deletion_date = $1, status = $2 
       WHERE user_id = $3 AND data_type = $4`,
      [deletionDate, RetentionStatus.SCHEDULED_FOR_DELETION, userId, dataType]
    );
  } catch (error) {
    throw new Error('Failed to schedule data deletion');
  }
}

// Delete user data (permanent)
export async function deleteUserData(
  userId: string,
  dataType: DataType
): Promise<void> {
  try {
    switch (dataType) {
      case DataType.USER_PROFILE:
        await query('DELETE FROM users WHERE id = $1', [userId]);
        break;
      case DataType.EVALUATIONS:
        await query('DELETE FROM evaluations WHERE user_id = $1', [userId]);
        break;
      case DataType.CONSULTATIONS:
        await query('DELETE FROM consultations WHERE user_id = $1', [userId]);
        break;
      case DataType.AUDIT_LOGS:
        await query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
        break;
      case DataType.CONSENT_RECORDS:
        await query('DELETE FROM patient_consent WHERE user_id = $1', [userId]);
        break;
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
    
    // Update retention policy
    await query(
      `UPDATE data_retention SET status = $1 WHERE user_id = $2 AND data_type = $3`,
      [RetentionStatus.DELETED, userId, dataType]
    );
  } catch (error) {
    throw new Error(`Failed to delete ${dataType} data`);
  }
}

// Find data scheduled for deletion
export async function findScheduledDeletions(): Promise<RetentionPolicy[]> {
  try {
    const result = await query(
      `SELECT id, user_id, data_type, retention_period_years, deletion_date, status, created_at
       FROM data_retention 
       WHERE status = $1 AND deletion_date <= $2`,
      [RetentionStatus.SCHEDULED_FOR_DELETION, new Date()]
    );
    
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      dataType: row.data_type as DataType,
      retentionPeriodYears: row.retention_period_years,
      deletionDate: row.deletion_date,
      status: row.status as RetentionStatus,
      createdAt: row.created_at
    }));
  } catch (error) {
    return [];
  }
}

// Process scheduled deletions (automated job)
export async function processScheduledDeletions(): Promise<{
  processed: number;
  errors: string[];
}> {
  const scheduledDeletions = await findScheduledDeletions();
  const errors: string[] = [];
  let processed = 0;
  
  for (const deletion of scheduledDeletions) {
    try {
      await deleteUserData(deletion.userId, deletion.dataType);
      processed++;
    } catch (error) {
      errors.push(`Failed to delete ${deletion.dataType} for user ${deletion.userId}: ${error}`);
    }
  }
  
  return { processed, errors };
}

// Get retention statistics
export async function getRetentionStatistics(): Promise<{
  totalPolicies: number;
  activePolicies: number;
  scheduledDeletions: number;
  completedDeletions: number;
}> {
  try {
    const totalResult = await query('SELECT COUNT(*) as count FROM data_retention');
    const activeResult = await query("SELECT COUNT(*) as count FROM data_retention WHERE status = 'active'");
    const scheduledResult = await query("SELECT COUNT(*) as count FROM data_retention WHERE status = 'scheduled_for_deletion'");
    const deletedResult = await query("SELECT COUNT(*) as count FROM data_retention WHERE status = 'deleted'");
    
    return {
      totalPolicies: parseInt(totalResult[0].count),
      activePolicies: parseInt(activeResult[0].count),
      scheduledDeletions: parseInt(scheduledResult[0].count),
      completedDeletions: parseInt(deletedResult[0].count)
    };
  } catch (error) {
    return {
      totalPolicies: 0,
      activePolicies: 0,
      scheduledDeletions: 0,
      completedDeletions: 0
    };
  }
}

export default {
  createRetentionPolicy,
  getUserRetentionPolicies,
  scheduleDataDeletion,
  deleteUserData,
  findScheduledDeletions,
  processScheduledDeletions,
  getRetentionStatistics,
  DataType,
  RetentionStatus
};
