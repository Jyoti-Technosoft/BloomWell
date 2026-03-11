import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/app/lib/postgres';

export async function POST(request: NextRequest) {
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

    // Check if user is a patient or admin
    const userRole = token.role as string;
    if (!['patient', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized - only patients and admins can book appointments' },
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

    const userId = userResult.rows[0].id;

    const { 
      doctorId, 
      evaluationId, 
      appointmentType, 
      scheduledAt, 
      durationMinutes = 30,
      notes 
    } = await request.json();

    // Validate required fields
    if (!doctorId || !appointmentType || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields: doctorId, appointmentType, scheduledAt' },
        { status: 400 }
      );
    }

    // Check if doctor exists and is a doctor
    const doctorResult = await pool.query('SELECT id, role FROM users WHERE id = $1', [doctorId]);
    if (doctorResult.rows.length === 0 || doctorResult.rows[0].role !== 'doctor') {
      return NextResponse.json(
        { error: 'Invalid doctor' },
        { status: 400 }
      );
    }

    // Check if evaluation exists and belongs to user (if provided)
    if (evaluationId) {
      const evaluationResult = await pool.query(
        'SELECT id, status FROM evaluations WHERE id = $1 AND user_id = $2',
        [evaluationId, userId]
      );
      if (evaluationResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Evaluation not found or does not belong to user' },
          { status: 404 }
        );
      }
      if (evaluationResult.rows[0].status !== 'approved') {
        return NextResponse.json(
          { error: 'Evaluation must be approved before booking appointment' },
          { status: 400 }
        );
      }
    }

    // Check if time slot is available
    const scheduledDateTime = new Date(scheduledAt);
    const endTime = new Date(scheduledDateTime.getTime() + durationMinutes * 60000);

    const conflictResult = await pool.query(`
      SELECT id FROM appointments 
      WHERE doctor_id = $1 
        AND status = 'scheduled'
        AND (
          (scheduled_at <= $2 AND (scheduled_at + (duration_minutes || ' minutes')::interval) > $2)
          OR (scheduled_at < $3 AND (scheduled_at + (duration_minutes || ' minutes')::interval) >= $3)
          OR (scheduled_at >= $2 AND (scheduled_at + (duration_minutes || ' minutes')::interval) <= $3)
        )
    `, [doctorId, scheduledDateTime, endTime]);

    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 409 }
      );
    }

    // Create appointment
    const appointmentId = uuidv4();
    const result = await pool.query(`
      INSERT INTO appointments (
        id, user_id, doctor_id, evaluation_id, appointment_type, 
        status, scheduled_at, duration_minutes, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      appointmentId,
      userId,
      doctorId,
      evaluationId,
      appointmentType,
      'scheduled',
      scheduledDateTime,
      durationMinutes,
      notes
    ]);

    const appointment = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment.id,
        doctorId: appointment.doctor_id,
        evaluationId: appointment.evaluation_id,
        appointmentType: appointment.appointment_type,
        status: appointment.status,
        scheduledAt: appointment.scheduled_at,
        durationMinutes: appointment.duration_minutes,
        notes: appointment.notes,
        createdAt: appointment.created_at
      }
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}

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

    // Get user from database
    const userEmail = token.email as string;
    const userResult = await pool.query('SELECT id, role FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];
    const userRole = user.role;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = `
      SELECT a.*, 
             u_patient.full_name as patient_name, 
             u_patient.email as patient_email,
             u_doctor.full_name as doctor_name, 
             u_doctor.email as doctor_email
      FROM appointments a
      JOIN users u_patient ON a.user_id = u_patient.id
      JOIN users u_doctor ON a.doctor_id = u_doctor.id
      WHERE 1=1
    `;
    
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Filter based on user role
    if (userRole === 'patient') {
      query += ` AND a.user_id = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    } else if (userRole === 'doctor') {
      query += ` AND a.doctor_id = $${paramIndex}`;
      params.push(user.id);
      paramIndex++;
    }
    // Admins can see all appointments

    // Filter by date if provided
    if (date) {
      query += ` AND DATE(a.scheduled_at) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    // Filter by status if provided
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.scheduled_at ASC`;

    const result = await pool.query(query, params);

    const appointments = result.rows.map(row => ({
      id: row.id,
      patientName: row.patient_name,
      patientEmail: row.patient_email,
      doctorName: row.doctor_name,
      doctorEmail: row.doctor_email,
      evaluationId: row.evaluation_id,
      appointmentType: row.appointment_type,
      status: row.status,
      scheduledAt: row.scheduled_at,
      durationMinutes: row.duration_minutes,
      notes: row.notes,
      prescription: row.prescription,
      doctorNotes: row.doctor_notes,
      meetingLink: row.meeting_link,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      cancelledAt: row.cancelled_at,
      cancellationReason: row.cancellation_reason
    }));

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error('Appointments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
