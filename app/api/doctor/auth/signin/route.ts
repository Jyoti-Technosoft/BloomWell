import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Doctor auth endpoint called');
    const { email, password } = await request.json();
    console.log('📧 Email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔗 Database URL exists:', !!process.env.NEON_DATABASE_URL);
    
    // Get user from database
    const userResult = await pool.query(
      `SELECT u.*, dp.id as doctor_profile_id, dp.verification_status, dp.is_verified
       FROM users u
       LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
       WHERE u.email = $1`,
      [email]
    );
    
    console.log('👤 User query result rows:', userResult.rows.length);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Check if user is a doctor
    if (user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'This login is for healthcare providers only' },
        { status: 403 }
      );
    }

    // Check if doctor is verified
    if (user.doctor_profile_id && !user.is_verified) {
      return NextResponse.json(
        { 
          error: 'Your account is pending verification. You will be notified once your credentials are verified.',
          code: 'PENDING_VERIFICATION'
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Log successful login
    await auditLog({
      userId: user.id,
      action: 'DOCTOR_LOGIN',
      resource: 'authentication',
      timestamp: new Date(),
      success: true,
      details: {
        email: email,
        role: user.role,
        verificationStatus: user.verification_status
      }
    });

    logger.info('Doctor login successful', {
      userId: user.id,
      email: email,
      role: user.role
    });

    // Return user data for session
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        doctorProfileId: user.doctor_profile_id,
        isVerified: user.is_verified,
        verificationStatus: user.verification_status
      }
    });

  } catch (error) {
    logger.error('Doctor login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
