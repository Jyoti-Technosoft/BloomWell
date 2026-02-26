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

    // Get user from database
    const userEmail = token.email as string;
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const doctorId = userResult.rows[0].id;

    // Get dashboard stats
    const [
      totalEvaluationsResult,
      pendingEvaluationsResult,
      approvedEvaluationsResult,
      rejectedEvaluationsResult,
      totalPatientsResult
    ] = await Promise.all([
      // Total evaluations in the system
      pool.query('SELECT COUNT(*) as count FROM evaluations'),
      
      // All pending evaluations (doctors can see all pending evaluations)
      pool.query('SELECT COUNT(*) as count FROM evaluations WHERE status = $1', ['pending_review']),
      
      // Approved evaluations
      pool.query('SELECT COUNT(*) as count FROM evaluations WHERE status = $1', ['approved']),
      
      // Rejected evaluations
      pool.query('SELECT COUNT(*) as count FROM evaluations WHERE status = $1', ['rejected']),
      
      // Total unique patients
      pool.query('SELECT COUNT(DISTINCT user_id) as count FROM evaluations')
    ]);

    // Try to get today's appointments (table might not exist)
    let todayAppointments = 0;
    try {
      const todayAppointmentsResult = await pool.query('SELECT COUNT(*) as count FROM appointments WHERE DATE(created_at) = CURRENT_DATE');
      todayAppointments = parseInt(todayAppointmentsResult.rows[0]?.count || '0');
    } catch (error) {
      // Appointments table doesn't exist, keep as 0
      console.log('Appointments table not found, using 0 for todayAppointments');
    }

    const stats = {
      totalEvaluations: parseInt(totalEvaluationsResult.rows[0]?.count || '0'),
      pendingEvaluations: parseInt(pendingEvaluationsResult.rows[0]?.count || '0'),
      approvedEvaluations: parseInt(approvedEvaluationsResult.rows[0]?.count || '0'),
      rejectedEvaluations: parseInt(rejectedEvaluationsResult.rows[0]?.count || '0'),
      todayAppointments: todayAppointments,
      totalPatients: parseInt(totalPatientsResult.rows[0]?.count || '0'),
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
