import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      console.error('No token found in bookings request');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewType = searchParams.get('view') || 'patient'; // 'patient' or 'doctor'
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = '';
    let params: (string | number)[] = [];

    if (viewType === 'doctor' && token.role === 'doctor') {
      // Doctor view: show consultations where this doctor is assigned
      // First get the doctor's name
      const doctorResult = await pool.query(
        'SELECT full_name FROM users WHERE id = $1',
        [token.id]
      );

      if (doctorResult.rows.length === 0) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      const doctorName = doctorResult.rows[0].full_name;

      query = `
        SELECT 
          c.id,
          'consultation' as type,
          c.status,
          c.consultation_date as date,
          c.consultation_time as time,
          '30 minutes' as duration,
          c.reason as notes,
          NULL as meeting_link,
          c.created_at,
          c.doctor_name as physician_name,
          c.doctor_specialty as specialty,
          NULL as physician_image,
          'in-person' as location_type,
          NULL as location_address,
          u.full_name as patient_name,
          u.email as patient_email,
          u.phone_number as patient_phone
        FROM consultations c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.doctor_name = $1
      `;
      params = [doctorName];

      // Add status filter
      if (status && status !== 'all') {
        query += ` AND c.status = $${params.length + 1}`;
        params.push(status);
      }

      // Add date filter
      if (date === 'today') {
        query += ` AND c.consultation_date = CURRENT_DATE`;
      } else if (date === 'upcoming') {
        query += ` AND c.consultation_date >= CURRENT_DATE`;
      } else if (date === 'past') {
        query += ` AND c.consultation_date < CURRENT_DATE`;
      }

      query += ` ORDER BY c.consultation_date ASC, c.consultation_time ASC`;

    } else {
      // Patient view (original functionality)
      query = `
        SELECT 
          c.id,
          'consultation' as type,
          c.status,
          c.consultation_date as date,
          c.consultation_time as time,
          '30 minutes' as duration,
          c.reason as notes,
          NULL as meeting_link,
          c.created_at,
          c.doctor_name as physician_name,
          c.doctor_specialty as specialty,
          NULL as physician_image,
          'in-person' as location_type,
          NULL as location_address
        FROM consultations c
        WHERE c.user_id = (SELECT id FROM users WHERE email = $1)
        
        UNION ALL
        
        SELECT 
          e.id,
          'evaluation' as type,
          e.status,
          NULL as date,
          NULL as time,
          '30 minutes' as duration,
          NULL as notes,
          NULL as meeting_link,
          e.created_at,
          NULL as physician_name,
          NULL as specialty,
          NULL as physician_image,
          'video' as location_type,
          NULL as location_address
        FROM evaluations e
        WHERE e.user_id = (SELECT id FROM users WHERE email = $1)
        
        ORDER BY created_at DESC`;
      params = [token.email || ''];
    }

    const result = await pool.query(query, params);

    const bookings = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      status: row.status,
      date: row.date,
      time: row.time,
      duration: row.duration,
      physician: {
        name: row.physician_name || 'System',
        specialty: row.specialty || 'General',
        image: row.physician_image
      },
      location: {
        type: row.location_type,
        address: row.location_address,
        meetingLink: row.meeting_link
      },
      notes: row.notes,
      createdAt: row.created_at,
      // Add patient information for doctor view
      ...(viewType === 'doctor' && {
        patient: {
          name: row.patient_name,
          email: row.patient_email,
          phone: row.patient_phone
        }
      })
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Only doctors can update appointments
    if (token.role !== 'doctor') {
      return NextResponse.json({ error: 'Unauthorized - only doctors can update appointments' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      bookingId, 
      status, 
      // prescription, 
      // doctorNotes, 
      // meetingLink,
      // cancellationReason 
    } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get doctor name first
    const doctorResult = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [token.id]
    );

    if (doctorResult.rows.length === 0) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const doctorName = doctorResult.rows[0].full_name;

    // Verify consultation belongs to this doctor
    const consultationResult = await pool.query(
      'SELECT id, doctor_name FROM consultations WHERE id = $1',
      [bookingId]
    );

    if (consultationResult.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const consultationDoctorName = consultationResult.rows[0].doctor_name;
  
    // Handle doctor name variations (e.g., "Dr. Sarah Johnson" vs "Sarah Johnson")
    const normalizeDoctorName = (name: string) => {
      return name.toLowerCase()
        .replace(/^dr\.?\s*/i, '') // Remove "Dr." or "Dr" from start
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    };
    
    const normalizedTokenName = normalizeDoctorName(doctorName);
    const normalizedConsultationName = normalizeDoctorName(consultationDoctorName);
 
    if (normalizedTokenName !== normalizedConsultationName) {
      return NextResponse.json({ 
        error: 'Booking does not belong to this doctor',
        debug: {
          tokenDoctorName: doctorName,
          consultationDoctorName: consultationDoctorName,
          normalizedTokenName,
          normalizedConsultationName
        }
      }, { status: 404 });
    }

    // Build update query for consultations
    let updateQuery = 'UPDATE consultations SET';
    const updateParams: (string | number)[] = [];
    let paramIndex = 1;
    let hasUpdates = false;

    if (status) {
      if (hasUpdates) updateQuery += ',';
      updateQuery += ` status = $${paramIndex}`;
      updateParams.push(status);
      paramIndex++;
      hasUpdates = true;
    }

    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    updateParams.push(bookingId);

    try {
      const result = await pool.query(updateQuery, updateParams);
      const updatedConsultation = result.rows[0];

      return NextResponse.json({
        success: true,
        message: 'Appointment updated successfully',
        booking: {
          id: updatedConsultation.id,
          status: updatedConsultation.status
        }
      });
    } catch (dbError) {
      console.error('🔍 Debug - Database update error:', dbError);
      return NextResponse.json({
        error: 'Database update failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Booking update error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      console.error('No token found in DELETE bookings request');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(request.url);
    const bookingId = url.pathname.split('/').pop();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Try to cancel consultation first
    const consultationResult = await pool.query(
      'UPDATE consultations SET status = $1 WHERE id = $2 AND user_id = (SELECT id FROM users WHERE email = $3)',
      ['cancelled', bookingId, token.email]
    );

    // If no consultation was updated, try evaluation
    if (consultationResult.rowCount === 0) {
      const evaluationResult = await pool.query(
        'UPDATE evaluations SET status = $1 WHERE id = $2 AND user_id = (SELECT id FROM users WHERE email = $3)',
        ['cancelled', bookingId, token.email]
      );

      if (evaluationResult.rowCount === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to cancel booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
