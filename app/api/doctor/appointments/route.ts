import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth token from cookies - using same pattern as dashboard API
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
        { error: 'Unauthorized - only doctors and admins can access appointments' },
        { status: 403 }
      );
    }

    // Use token.id directly instead of email lookup
    const doctorId = token.id as string;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT a.*, 
             u.full_name as patient_name, 
             u.email as patient_email,
             u.phone_number as patient_phone,
             e.medicine_name as evaluation_medicine,
             e.status as evaluation_status
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN evaluations e ON a.evaluation_id = e.id
      WHERE a.doctor_id = $1
    `;
    
    const params: any[] = [doctorId];
    let paramIndex = 2;

    // Filter by date if provided
    if (date) {
      if (date === 'today') {
        query += ` AND DATE(a.scheduled_at) = CURRENT_DATE`;
      } else if (date === 'upcoming') {
        query += ` AND a.scheduled_at >= CURRENT_DATE`;
      } else {
        query += ` AND DATE(a.scheduled_at) = $${paramIndex}`;
        params.push(date);
        paramIndex++;
      }
    }

    // Filter by status if provided
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.scheduled_at ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const appointments = result.rows.map(row => ({
      id: row.id,
      patientName: row.patient_name,
      patientEmail: row.patient_email,
      patientPhone: row.patient_phone,
      evaluationId: row.evaluation_id,
      evaluationMedicine: row.evaluation_medicine,
      evaluationStatus: row.evaluation_status,
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

  } catch (error: any) {
    console.error('Doctor appointments fetch error:', error);
    
    // Handle missing appointments table gracefully
    if (error.code === '42P01' && error.message.includes('relation "appointments" does not exist')) {
      console.log('Appointments table does not exist, returning empty array');
      return NextResponse.json({ appointments: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
        { error: 'Unauthorized - only doctors and admins can update appointments' },
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

    const { 
      appointmentId, 
      status, 
      prescription, 
      doctorNotes, 
      meetingLink,
      cancellationReason 
    } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Verify appointment belongs to this doctor
    const appointmentResult = await pool.query(
      'SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2',
      [appointmentId, doctorId]
    );

    if (appointmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found or does not belong to this doctor' },
        { status: 404 }
      );
    }

    // Build update query
    let updateQuery = 'UPDATE appointments SET updated_at = CURRENT_TIMESTAMP';
    const updateParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      updateQuery += `, status = $${paramIndex}`;
      updateParams.push(status);
      paramIndex++;
      
      if (status === 'cancelled') {
        updateQuery += `, cancelled_at = CURRENT_TIMESTAMP`;
        if (cancellationReason) {
          updateQuery += `, cancellation_reason = $${paramIndex}`;
          updateParams.push(cancellationReason);
          paramIndex++;
        }
      }
    }

    if (prescription !== undefined) {
      updateQuery += `, prescription = $${paramIndex}`;
      updateParams.push(prescription);
      paramIndex++;
    }

    if (doctorNotes !== undefined) {
      updateQuery += `, doctor_notes = $${paramIndex}`;
      updateParams.push(doctorNotes);
      paramIndex++;
    }

    if (meetingLink !== undefined) {
      updateQuery += `, meeting_link = $${paramIndex}`;
      updateParams.push(meetingLink);
      paramIndex++;
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    updateParams.push(appointmentId);

    const result = await pool.query(updateQuery, updateParams);
    const updatedAppointment = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        prescription: updatedAppointment.prescription,
        doctorNotes: updatedAppointment.doctor_notes,
        meetingLink: updatedAppointment.meeting_link,
        updatedAt: updatedAppointment.updated_at
      }
    });

  } catch (error: any) {
    console.error('Appointment update error:', error);
    
    // Handle missing appointments table gracefully
    if (error.code === '42P01' && error.message.includes('relation "appointments" does not exist')) {
      console.log('Appointments table does not exist, cannot update appointment');
      return NextResponse.json(
        { error: 'Appointments feature is not available' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
