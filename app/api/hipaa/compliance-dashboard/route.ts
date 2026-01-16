// app/api/hipaa/compliance-dashboard/route.ts
// HIPAA Compliance Dashboard API
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { query } from '../../../lib/postgres';
import { logger, auditLog } from '../../../lib/secure-logger';
import { getBreachStatistics } from '../../../lib/breach-notification';
import { getRetentionStatistics } from '../../../lib/data-retention';
import { getConsentStatistics } from '../../../lib/patient-consent';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Log compliance dashboard access
    await auditLog({
      userId: token.id,
      action: 'COMPLIANCE_DASHBOARD_ACCESSED',
      resource: 'hipaa_compliance',
      timestamp: new Date(),
      success: true,
      details: { accessedBy: token.email }
    });

    // Get comprehensive compliance metrics
    const [
      auditStats,
      breachStats,
      retentionStats,
      consentStats,
      userStats,
      securityStats
    ] = await Promise.all([
      getAuditLogStatistics(),
      getBreachStatistics(),
      getRetentionStatistics(),
      getConsentStatistics(),
      getUserStatistics(),
      getSecurityStatistics()
    ]);

    // Calculate overall compliance score
    const complianceScore = calculateComplianceScore({
      auditStats,
      breachStats,
      retentionStats,
      consentStats,
      userStats,
      securityStats
    });

    return NextResponse.json({
      complianceScore,
      auditStats,
      breachStats,
      retentionStats,
      consentStats,
      userStats,
      securityStats,
      lastUpdated: new Date()
    });

  } catch (error) {
    logger.error('Compliance dashboard error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Failed to load compliance data' },
      { status: 500 }
    );
  }
}

async function getAuditLogStatistics() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN action LIKE '%FAILED%' THEN 1 END) as failed_attempts,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_actions,
        MAX(timestamp) as last_activity
      FROM audit_logs
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    `);

    return {
      totalLogs: parseInt(result[0].total_logs),
      uniqueUsers: parseInt(result[0].unique_users),
      failedAttempts: parseInt(result[0].failed_attempts),
      successfulActions: parseInt(result[0].successful_actions),
      lastActivity: result[0].last_activity
    };
  } catch (error) {
    return {
      totalLogs: 0,
      uniqueUsers: 0,
      failedAttempts: 0,
      successfulActions: 0,
      lastActivity: null
    };
  }
}

async function getUserStatistics() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as active_users
      FROM users
    `);

    return {
      totalUsers: parseInt(result[0].total_users),
      newUsers: parseInt(result[0].new_users),
      activeUsers: parseInt(result[0].active_users)
    };
  } catch (error) {
    return {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0
    };
  }
}

async function getSecurityStatistics() {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_mfa_attempts,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_mfa,
        COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 END) as recent_attempts
      FROM mfa_attempts
      WHERE timestamp >= NOW() - INTERVAL '30 days'
    `);

    return {
      totalMFAAttempts: parseInt(result[0].total_mfa_attempts),
      successfulMFA: parseInt(result[0].successful_mfa),
      recentAttempts: parseInt(result[0].recent_attempts)
    };
  } catch (error) {
    return {
      totalMFAAttempts: 0,
      successfulMFA: 0,
      recentAttempts: 0
    };
  }
}

function calculateComplianceScore(stats: any): number {
  let score = 0;
  const maxScore = 100;

  // Audit Controls (25 points)
  if (stats.auditStats.totalLogs > 0) score += 10;
  if (stats.auditStats.failedAttempts < stats.auditStats.totalLogs * 0.1) score += 10;
  if (stats.auditStats.lastActivity) score += 5;

  // Access Controls (20 points)
  if (stats.securityStats.totalMFAAttempts > 0) score += 10;
  if (stats.securityStats.successfulMFA > 0) score += 10;

  // Data Retention (15 points)
  if (stats.retentionStats.totalPolicies > 0) score += 10;
  if (stats.retentionStats.completedDeletions >= 0) score += 5;

  // Patient Consent (15 points)
  if (stats.consentStats.totalUsers > 0) score += 10;
  if (stats.consentStats.consentRates.privacy_policy > 90) score += 5;

  // Breach Management (15 points)
  if (stats.breachStats.totalBreaches === 0) score += 15;
  else if (stats.breachStats.openBreaches === 0) score += 10;
  else score += 5;

  // User Management (10 points)
  if (stats.userStats.totalUsers > 0) score += 5;
  if (stats.userStats.newUsers > 0) score += 5;

  return Math.min(score, maxScore);
}
