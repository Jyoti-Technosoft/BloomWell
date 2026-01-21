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
        phone_number,
        date_of_birth,
        healthcarePurpose,
        address,
        city,
        state,
        zip_code,
        emergency_contact,
        emergency_phone,
        allergies,
        medications,
        medical_history,
        created_at,
        updated_at
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
      fullName: user.full_name || '',
      email: user.email || '',
      phone: user.phone_number || '',
      dateOfBirth: user.date_of_birth || '',
      healthcarePurpose: user.healthcarePurpose || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zip_code || '',
      emergencyPhone: user.emergency_phone || '',
      allergies: user.allergies || '',
      medications: user.medications || '',
      medicalHistory: user.medical_history || '',
      createdAt: user.created_at,
      updatedAt: user.updated_at
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
      fullName,
      phone,
      dateOfBirth,
      healthcarePurpose,
      address,
      city,
      state,
      zipCode,
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
        phone_number = COALESCE($2, phone_number),
        date_of_birth = COALESCE($3, date_of_birth),
        healthcare_purpose = COALESCE($4, healthcare_purpose),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        state = COALESCE($7, state),
        zip_code = COALESCE($8, zip_code),
        emergency_contact = COALESCE($9, emergency_contact),
        emergency_phone = COALESCE($10, emergency_phone),
        allergies = COALESCE($11, allergies),
        medications = COALESCE($12, medications),
        medical_history = COALESCE($13, medical_history),
        full_name = COALESCE($14, full_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING id, email, full_name, phone_number, date_of_birth, healthcare_purpose,
                address, city, state, zip_code, emergency_contact, emergency_phone,
                allergies, medications, medical_history, created_at, updated_at`,
      [
        token.email,
        phone,
        dateOfBirth,
        healthcarePurpose,
        address,
        city,
        state,
        zipCode,
        emergencyPhone,
        allergies,
        medications,
        medicalHistory,
        fullName
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
