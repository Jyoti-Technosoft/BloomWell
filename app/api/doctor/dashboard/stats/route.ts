import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth token from cookies
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is a doctor or admin
    const userRole = token.role as string;
    if (!['doctor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized - only doctors and admins can access dashboard stats' },
        { status: 403 }
      );
    }

    // Use token.id directly instead of email lookup
    const doctorId = token.id as string;

    // Get evaluation counts for patients who have consultations with this doctor
    // First get doctor's name
    const doctorResult = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorName = doctorResult.rows[0].full_name;

    // Get evaluation counts directly for this doctor using doctor_id
    const [
      totalEvaluationsResult,
      pendingEvaluationsResult,
      approvedEvaluationsResult,
      rejectedEvaluationsResult,
      totalPatientsResult
    ] = await Promise.all([
      // Count all evaluations assigned to this doctor
      pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations 
        WHERE doctor_id = $1
      `, [doctorId]),
      // Count pending evaluations for this doctor
      pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations 
        WHERE status = $1 AND doctor_id = $2
      `, ['pending_review', doctorId]),
      // Count approved evaluations for this doctor
      pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations 
        WHERE status = $1 AND doctor_id = $2
      `, ['approved', doctorId]),
      // Count rejected evaluations for this doctor
      pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations 
        WHERE status = $1 AND doctor_id = $2
      `, ['rejected', doctorId]),
      // Count unique patients for this doctor
      pool.query(`
        SELECT COUNT(DISTINCT user_id) as count 
        FROM evaluations 
        WHERE doctor_id = $1 AND user_id IS NOT NULL
      `, [doctorId])
    ]);

    const totalEvaluations = parseInt(totalEvaluationsResult.rows[0]?.count || '0');
    const pendingEvaluations = parseInt(pendingEvaluationsResult.rows[0]?.count || '0');
    const approvedEvaluations = parseInt(approvedEvaluationsResult.rows[0]?.count || '0');
    const rejectedEvaluations = parseInt(rejectedEvaluationsResult.rows[0]?.count || '0');
    const totalPatients = parseInt(totalPatientsResult.rows[0]?.count || '0');

    // Fallback: If no evaluations assigned to this doctor (old evaluations without doctor_id)
    // Use consultation-based approach for backward compatibility
    if (totalEvaluations === 0) {
      const fallbackResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations e 
        WHERE e.user_id IN (
          SELECT DISTINCT c.user_id 
          FROM consultations c 
          WHERE c.doctor_name = $1
        ) AND e.doctor_id IS NULL
      `, [doctorName]);

      const fallbackPending = await pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations e 
        WHERE e.status = $1 AND e.user_id IN (
          SELECT DISTINCT c.user_id 
          FROM consultations c 
          WHERE c.doctor_name = $2
        ) AND e.doctor_id IS NULL
      `, ['pending_review', doctorName]);

      const fallbackApproved = await pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations e 
        WHERE e.status = $1 AND e.user_id IN (
          SELECT DISTINCT c.user_id 
          FROM consultations c 
          WHERE c.doctor_name = $2
        ) AND e.doctor_id IS NULL
      `, ['approved', doctorName]);

      const fallbackRejected = await pool.query(`
        SELECT COUNT(*) as count 
        FROM evaluations e 
        WHERE e.status = $1 AND e.user_id IN (
          SELECT DISTINCT c.user_id 
          FROM consultations c 
          WHERE c.doctor_name = $2
        ) AND e.doctor_id IS NULL
      `, ['rejected', doctorName]);

      const fallbackPatients = await pool.query(`
        SELECT COUNT(DISTINCT e.user_id) as count 
        FROM evaluations e 
        WHERE e.user_id IN (
          SELECT DISTINCT c.user_id 
          FROM consultations c 
          WHERE c.doctor_name = $1
        ) AND e.doctor_id IS NULL AND e.user_id IS NOT NULL
      `, [doctorName]);

      // Update stats with fallback values
      return NextResponse.json({
        totalEvaluations: parseInt(fallbackResult.rows[0]?.count || '0'),
        pendingEvaluations: parseInt(fallbackPending.rows[0]?.count || '0'),
        approvedEvaluations: parseInt(fallbackApproved.rows[0]?.count || '0'),
        rejectedEvaluations: parseInt(fallbackRejected.rows[0]?.count || '0'),
        totalPatients: parseInt(fallbackPatients.rows[0]?.count || '0'),
        todayAppointments: 0, // Will be calculated below
        fallbackMode: true
      });
    }

    // Get today's consultations for this doctor
    let todayAppointments = 0;
    try {
      const todayAppointmentsResult = await pool.query(
        'SELECT COUNT(*) as count FROM consultations WHERE consultation_date = CURRENT_DATE AND doctor_name = $1',
        [doctorName]
      );
      todayAppointments = parseInt(todayAppointmentsResult.rows[0]?.count || '0');
    } catch (error: any) {
      todayAppointments = 0;
    }

    const stats = {
      totalEvaluations: totalEvaluations,
      pendingEvaluations: pendingEvaluations,
      approvedEvaluations: approvedEvaluations,
      rejectedEvaluations: rejectedEvaluations,
      todayAppointments: todayAppointments,
      totalPatients: totalPatients,
      fallbackMode: false
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
