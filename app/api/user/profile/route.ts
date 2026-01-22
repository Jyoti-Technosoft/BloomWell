import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger, auditLog } from '@/app/lib/secure-logger';
import { decryptSensitiveFields, encryptSensitiveFields } from '@/app/lib/encryption';
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
        healthcare_purpose,
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
    
    // Map database field names to encryption field names
    const mappedUser = {
      fullName: user.full_name,
      phoneNumber: user.phone_number,
      dateOfBirth: user.date_of_birth,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zip_code,
      emergencyPhone: user.emergency_phone,
      allergies: user.allergies,
      medications: user.medications,
      medicalHistory: user.medical_history,
      healthcarePurpose: user.healthcare_purpose,
      email: user.email,
      id: user.id,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    // Decrypt sensitive fields before returning
    const decryptedUser = await decryptSensitiveFields(mappedUser);
    
    // Log successful profile access
    await auditLog({
      userId: token.id,
      action: 'PROFILE_ACCESSED',
      resource: 'user_profile',
      timestamp: new Date(),
      success: true,
      details: { profileFields: Object.keys(decryptedUser).length }
    });
    
    const profileData = {
      fullName: decryptedUser.fullName || '',
      email: decryptedUser.email || '',
      phone: decryptedUser.phoneNumber || '',
      dateOfBirth: decryptedUser.dateOfBirth || '',
      healthcarePurpose: decryptedUser.healthcarePurpose || '',
      address: decryptedUser.address || '',
      city: decryptedUser.city || '',
      state: decryptedUser.state || '',
      zipCode: decryptedUser.zipCode || '',
      emergencyPhone: decryptedUser.emergencyPhone || '',
      allergies: decryptedUser.allergies || '',
      medications: decryptedUser.medications || '',
      medicalHistory: decryptedUser.medicalHistory || '',
      createdAt: decryptedUser.created_at,
      updatedAt: decryptedUser.updated_at
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

    // Encrypt sensitive fields before updating
    const encryptedData = await encryptSensitiveFields({
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
    });

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

    // Update user profile in unified users table
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
        encryptedData.phoneNumber,
        encryptedData.dateOfBirth,
        encryptedData.healthcarePurpose,
        encryptedData.address,
        encryptedData.city,
        encryptedData.state,
        encryptedData.zipCode,
        emergencyPhone, // emergency_contact is not encrypted
        encryptedData.emergencyPhone,
        encryptedData.allergies,
        encryptedData.medications,
        encryptedData.medicalHistory,
        encryptedData.fullName
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
