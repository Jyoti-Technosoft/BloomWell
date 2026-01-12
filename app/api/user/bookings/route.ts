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

    const result = await pool.query(
      `SELECT 
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
      
      ORDER BY created_at DESC`,
      [token.email]
    );

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
      createdAt: row.created_at
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
