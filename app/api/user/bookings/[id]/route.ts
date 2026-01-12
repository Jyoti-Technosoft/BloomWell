import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      console.error('No token found in DELETE booking request');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    console.log('Attempting to delete booking:', bookingId);
    console.log('User email:', token.email);

    // First check if booking exists and get user info
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [token.email]);
    
    if (userResult.rows.length === 0) {
      console.error('User not found for email:', token.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;
    console.log('User ID:', userId);

    // Check consultations first
    const consultationCheck = await pool.query(
      'SELECT id, status FROM consultations WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    console.log('Consultation check result:', consultationCheck.rows);

    if (consultationCheck.rows.length > 0) {
      const consultationResult = await pool.query(
        'UPDATE consultations SET status = $1 WHERE id = $2 AND user_id = $3',
        ['cancelled', bookingId, userId]
      );
      
      console.log('Updated consultation, rows affected:', consultationResult.rowCount);
      
      if (consultationResult.rowCount && consultationResult.rowCount > 0) {
        return NextResponse.json({ success: true, message: 'Consultation cancelled' });
      }
    }

    // Check evaluations
    const evaluationCheck = await pool.query(
      'SELECT id, status FROM evaluations WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    console.log('Evaluation check result:', evaluationCheck.rows);

    if (evaluationCheck.rows.length > 0) {
      const evaluationResult = await pool.query(
        'UPDATE evaluations SET status = $1 WHERE id = $2 AND user_id = $3',
        ['cancelled', bookingId, userId]
      );
      
      console.log('Updated evaluation, rows affected:', evaluationResult.rowCount);
      
      if (evaluationResult.rowCount && evaluationResult.rowCount > 0) {
        return NextResponse.json({ success: true, message: 'Evaluation cancelled' });
      }
    }

    console.error('Booking not found:', bookingId);
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Error cancelling booking:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to cancel booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
