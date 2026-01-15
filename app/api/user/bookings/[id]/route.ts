import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';

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
      logger.error('Booking cancellation failed - no token');
      await auditLog({
        action: 'BOOKING_CANCEL_FAILED',
        resource: 'booking',
        timestamp: new Date(),
        success: false,
        details: { reason: 'no_token' }
      });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    logger.info('Booking cancellation attempt', { bookingId: bookingId.substring(0, 8) });

    // First check if booking exists and get user info
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [token.email]);
    
    if (userResult.rows.length === 0) {
      logger.warn('Booking cancellation failed - user not found', { userId: token.id });
      await auditLog({
        userId: token.id,
        action: 'BOOKING_CANCEL_FAILED',
        resource: 'booking',
        timestamp: new Date(),
        success: false,
        details: { reason: 'user_not_found' }
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;
    logger.info('User verified for booking cancellation', { userId });

    // Check consultations first
    const consultationCheck = await pool.query(
      'SELECT id, status FROM consultations WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    logger.info('Consultation check completed', { 
      bookingId: bookingId.substring(0, 8), 
      found: consultationCheck.rows.length > 0 
    });

    if (consultationCheck.rows.length > 0) {
      const consultationResult = await pool.query(
        'UPDATE consultations SET status = $1 WHERE id = $2 AND user_id = $3',
        ['cancelled', bookingId, userId]
      );
      
      logger.info('Consultation cancelled', { 
        bookingId: bookingId.substring(0, 8), 
        rowsAffected: consultationResult.rowCount 
      });
      
      await auditLog({
        userId: token.id,
        action: 'CONSULTATION_CANCELLED',
        resource: 'consultation',
        timestamp: new Date(),
        success: true,
        details: { bookingId: bookingId.substring(0, 8) }
      });
      
      if (consultationResult.rowCount && consultationResult.rowCount > 0) {
        return NextResponse.json({ success: true, message: 'Consultation cancelled' });
      }
    }

    // Check evaluations
    const evaluationCheck = await pool.query(
      'SELECT id, status FROM evaluations WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    logger.info('Evaluation check completed', { 
      bookingId: bookingId.substring(0, 8), 
      found: evaluationCheck.rows.length > 0 
    });

    if (evaluationCheck.rows.length > 0) {
      const evaluationResult = await pool.query(
        'UPDATE evaluations SET status = $1 WHERE id = $2 AND user_id = $3',
        ['cancelled', bookingId, userId]
      );
      
      logger.info('Evaluation cancelled', { 
        bookingId: bookingId.substring(0, 8), 
        rowsAffected: evaluationResult.rowCount 
      });
      
      await auditLog({
        userId: token.id,
        action: 'EVALUATION_CANCELLED',
        resource: 'evaluation',
        timestamp: new Date(),
        success: true,
        details: { bookingId: bookingId.substring(0, 8) }
      });
      
      if (evaluationResult.rowCount && evaluationResult.rowCount > 0) {
        return NextResponse.json({ success: true, message: 'Evaluation cancelled' });
      }
    }

    logger.warn('Booking not found', { bookingId: bookingId.substring(0, 8) });
    await auditLog({
      userId: token.id,
      action: 'BOOKING_CANCEL_FAILED',
      resource: 'booking',
      timestamp: new Date(),
      success: false,
      details: { reason: 'booking_not_found', bookingId: bookingId.substring(0, 8) }
    });
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    
  } catch (error) {
    logger.error('Booking cancellation error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    await auditLog({
      action: 'BOOKING_CANCEL_FAILED',
      resource: 'booking',
      timestamp: new Date(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
