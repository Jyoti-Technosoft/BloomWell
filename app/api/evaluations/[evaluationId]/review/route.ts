import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ evaluationId: string }> }) {
  try {
    const resolvedParams = await params;
    const evaluationId = resolvedParams.evaluationId;

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

    // Get email from NextAuth token
    const userEmail = token.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - no email found' },
        { status: 401 }
      );
    }

    // Get user from database with role
    const userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;
    const userRole = userResult.rows[0].role;

    // Check if user is a medical professional (doctor or admin)
    if (!['doctor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized - only medical professionals can review evaluations' },
        { status: 403 }
      );
    }

    const { approved, prescription, notes, recommendedMedicine, recommendedDosage } = await request.json();

    // Get evaluation details to verify doctor ownership
    const evaluationResult = await pool.query(
      'SELECT user_id, doctor_id, status FROM evaluations WHERE id = $1',
      [evaluationId]
    );

    if (evaluationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    const evaluation = evaluationResult.rows[0];

    // Check if evaluation is still pending review
    if (evaluation.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Evaluation has already been reviewed' },
        { status: 400 }
      );
    }

    // For doctors: check if this evaluation is assigned to them
    // For admins: allow reviewing any evaluation
    if (userRole === 'doctor' && evaluation.doctor_id && evaluation.doctor_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized - this evaluation is not assigned to you' },
        { status: 403 }
      );
    }

    // Update evaluation status
    const result = await pool.query(
      `UPDATE evaluations 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP,
           responses = responses || $2
       WHERE id = $3
       RETURNING *`,
      [
        approved ? 'approved' : 'rejected',
        JSON.stringify({
          prescription: prescription || null,
          doctorNotes: notes || null,
          recommendedMedicine: recommendedMedicine || null,
          recommendedDosage: recommendedDosage || null,
          reviewedBy: userId,
          reviewedAt: new Date().toISOString()
        }),
        evaluationId
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    await auditLog({
      userId: userId,
      action: 'EVALUATION_REVIEWED',
      resource: 'evaluation',
      timestamp: new Date(),
      success: true,
      details: { 
        approved,
        reviewedBy: userId,
        evaluationId: evaluationId
      }
    });

    return NextResponse.json({
      success: true,
      message: `Evaluation ${approved ? 'approved' : 'rejected'} successfully`,
      evaluation: result.rows[0]
    });

  } catch (error) {
    logger.error('Evaluation review error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
