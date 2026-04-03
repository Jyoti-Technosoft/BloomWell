import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ consultationId: string }> }) {
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

    // Check if user is a doctor
    const userRole = token.role as string;
    if (userRole !== 'doctor') {
      return NextResponse.json(
        { error: 'Access denied - only doctors can reschedule consultations' },
        { status: 403 }
      );
    }

    const { consultationId } = await params;
    const { newDate, newTime } = await request.json();

    if (!newDate || !newTime) {
      return NextResponse.json(
        { error: 'New date and time are required' },
        { status: 400 }
      );
    }

    // Get current consultation
    const consultationResult = await pool.query(
      'SELECT * FROM consultations WHERE id = $1',
      [consultationId]
    );

    if (consultationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const consultation = consultationResult.rows[0];

    // Check if consultation can be rescheduled (not completed or cancelled)
    if (consultation.status === 'completed' || consultation.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot reschedule completed or cancelled consultations' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing consultations for the same doctor
    const conflictCheck = await pool.query(
      `SELECT id FROM consultations 
       WHERE doctor_name = $1 
       AND consultation_date = $2 
       AND consultation_time = $3 
       AND status = 'scheduled'
       AND id != $4`,
      [consultation.doctor_name, newDate, newTime, consultationId]
    );

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Doctor already has a scheduled consultation at this time' },
        { status: 409 }
      );
    }

    // Update consultation with new date and time
    const updateResult = await pool.query(
      `UPDATE consultations 
       SET consultation_date = $1, consultation_time = $2
       WHERE id = $3
       RETURNING id, consultation_date, consultation_time, doctor_name, user_id`,
      [newDate, newTime, consultationId]
    );

    return NextResponse.json({
      message: 'Consultation rescheduled successfully',
      consultation: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error rescheduling consultation:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule consultation' },
      { status: 500 }
    );
  }
}
