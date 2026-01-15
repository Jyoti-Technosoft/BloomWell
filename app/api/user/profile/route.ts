import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { query } from '../../../lib/postgres';
import { logger, auditLog } from '../../../lib/secure-logger';
import pool from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });
    
    if (!token) {
      logger.error('Authentication failed - no token');
      await auditLog({
        action: 'AUTH_FAILED',
        resource: 'user_profile',
        timestamp: new Date(),
        success: false,
        details: { reason: 'no_token' }
      });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    logger.info('Profile access attempt', { userId: token.id });

    const result = await pool.query(
      `SELECT 
        id,
        email,
        full_name,
        first_name,
        last_name,
        phone_number,
        date_of_birth,
        address,
        city,
        state,
        zip_code,
        emergency_contact,
        emergency_phone,
        allergies,
        medications,
        medical_history
      FROM users
      WHERE email = $1`,
      [token.email]
    );

    if (result.rows.length === 0) {
      logger.warn('User not found', { userId: token.id });
      await auditLog({
        userId: token.id,
        action: 'PROFILE_ACCESS_FAILED',
        resource: 'user_profile',
        timestamp: new Date(),
        success: false,
        details: { reason: 'user_not_found' }
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];
    
    // Log successful profile access
    await auditLog({
      userId: token.id,
      action: 'PROFILE_ACCESSED',
      resource: 'user_profile',
      timestamp: new Date(),
      success: true,
      details: { profileFields: Object.keys(user).length }
    });
    
    const profileData = {
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      email: user.email || '',
      phone: user.phone_number || '',
      dateOfBirth: user.date_of_birth ? user.date_of_birth : '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zip_code || '',
      emergencyContact: user.emergency_contact || '',
      emergencyPhone: user.emergency_phone || '',
      allergies: user.allergies || '',
      medications: user.medications || '',
      medicalHistory: user.medical_history || ''
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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
      logger.error('Profile update authentication failed');
      await auditLog({
        action: 'PROFILE_UPDATE_FAILED',
        resource: 'user_profile',
        timestamp: new Date(),
        success: false,
        details: { reason: 'no_token' }
      });
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    logger.info('Profile update attempt', { userId: token.id });

    const body = await request.json();
    logger.info('Profile update data received', { fieldCount: Object.keys(body).length });
    
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
      allergies,
      medications,
      medicalHistory
    } = body;

    // First check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [token.email]);
    if (userCheck.rows.length === 0) {
      logger.warn('Profile update failed - user not found', { userId: token.id });
      await auditLog({
        userId: token.id,
        action: 'PROFILE_UPDATE_FAILED',
        resource: 'user_profile',
        timestamp: new Date(),
        success: false,
        details: { reason: 'user_not_found' }
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user profile in the unified users table
    logger.info('Updating user profile', { userId: token.id });
    const result = await pool.query(
      `UPDATE users SET
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone_number = COALESCE($4, phone_number),
        date_of_birth = COALESCE($5, date_of_birth),
        address = COALESCE($6, address),
        city = COALESCE($7, city),
        state = COALESCE($8, state),
        zip_code = COALESCE($9, zip_code),
        emergency_contact = COALESCE($10, emergency_contact),
        emergency_phone = COALESCE($11, emergency_phone),
        allergies = COALESCE($12, allergies),
        medications = COALESCE($13, medications),
        medical_history = COALESCE($14, medical_history),
        full_name = COALESCE($15, full_name)
      WHERE email = $1`,
      [
        token.email,
        firstName || null,
        lastName || null,
        phone || null,
        dateOfBirth || null,
        address || null,
        city || null,
        state || null,
        zipCode || null,
        emergencyContact || null,
        emergencyPhone || null,
        allergies || null,
        medications || null,
        medicalHistory || null,
        firstName && lastName ? `${firstName} ${lastName}`.trim() : null
      ]
    );

    logger.info('Profile update completed', { 
      userId: token.id, 
      rowsAffected: result.rowCount 
    });

    // Log successful profile update
    await auditLog({
      userId: token.id,
      action: 'PROFILE_UPDATED',
      resource: 'user_profile',
      timestamp: new Date(),
      success: true,
      details: { fieldsUpdated: Object.keys(body).length }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Profile update error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    await auditLog({
      action: 'PROFILE_UPDATE_FAILED',
      resource: 'user_profile',
      timestamp: new Date(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
