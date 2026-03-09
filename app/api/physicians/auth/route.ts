import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';
import { logger } from '@/app/lib/secure-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone_number,
        p.specialization,
        p.license_number,
        p.license_state,
        p.professional_bio,
        p.consultation_fee,
        p.languages,
        p.hospital_affiliations,
        p.profile_image_url,
        p.average_rating,
        p.total_reviews,
        p.years_experience,
        p.education,
        p.certifications,
        p.created_at
      FROM public_physicians p
      WHERE 1=1
    `;

    const params: (string | number)[] = [limit, offset];

    if (specialization) {
      query += ` AND p.specialization = $${params.length + 1}`;
      params.push(specialization);
    }

    query += ` ORDER BY p.average_rating DESC, p.total_reviews DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    params.push(offset);

    const result = await pool.query(query, params);

    const physicians = result.rows.map(physician => ({
      id: physician.id,
      firstName: physician.first_name,
      lastName: physician.last_name,
      email: physician.email,
      phoneNumber: physician.phone_number,
      specialization: physician.specialization,
      licenseNumber: physician.license_number,
      licenseState: physician.license_state,
      professionalBio: physician.professional_bio,
      consultationFee: physician.consultation_fee,
      languages: physician.languages || [],
      hospitalAffiliations: physician.hospital_affiliations || [],
      profileImageUrl: physician.profile_image_url,
      averageRating: parseFloat(physician.average_rating) || 0,
      totalReviews: physician.total_reviews || 0,
      yearsExperience: physician.years_experience,
      education: physician.education || [],
      certifications: physician.certifications || [],
      isVerified: physician.doctor_is_verified,
      verificationStatus: physician.doctor_verification_status,
      createdAt: physician.created_at
    }));

    return NextResponse.json({ physicians });

  } catch (error: unknown) {
    logger.error('Get physicians error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to fetch physicians' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get physician from database
    const result = await pool.query(
      `SELECT p.*, dp.id as doctor_profile_id, dp.verification_status, dp.is_verified
       FROM physicians p
       LEFT JOIN doctor_profiles dp ON p.user_id = dp.id
       WHERE p.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const physician = result.rows[0];

    // Check if physician is verified
    if (!physician.is_verified || physician.verification_status !== 'verified') {
      return NextResponse.json(
        { 
          error: 'Account not verified. Please contact support for verification.',
          code: 'NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // In a real implementation, you would verify password here
    // For now, we'll assume password is correct for demo purposes

    // Log successful login
    await logger.info('Physician login successful', {
      physicianId: physician.id,
      email: email
    });

    return NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        physicianId: physician.id
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    logger.error('Physician login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
