import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';

export async function GET(request: NextRequest) {
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

    // Check if user is a doctor
    if (token.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - only doctors can access this endpoint' },
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

    const userId = userResult.rows[0].id;

    // Get doctor profile
    const profileResult = await pool.query(
      `SELECT dp.*
       FROM doctor_profiles dp
       WHERE dp.user_id = $1`,
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const profile = profileResult.rows[0];

    // Format response
    const formattedProfile = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phoneNumber: profile.phone_number,
      // Use specialties field (from physicians) instead of specialization
      specialization: profile.specialties || profile.specialization,
      role: profile.role,
      licenseNumber: profile.license_number,
      licenseState: profile.license_state,
      licenseExpiryDate: profile.license_expiry_date,
      npiNumber: profile.npi_number,
      deaNumber: profile.dea_number,
      professionalBio: profile.professional_bio,
      consultationFee: profile.consultation_fee,
      languages: profile.languages || [],
      hospitalAffiliations: profile.hospital_affiliations || [],
      isVerified: profile.is_verified,
      verificationStatus: profile.verification_status,
      verificationDate: profile.verification_date,
      rejectionReason: profile.rejection_reason,
      // Enhanced fields
      experienceYears: profile.experience_years,
      education: profile.education,
      professionalRole: profile.professional_role,
      workExperience: profile.work_experience,
      specialties: profile.specialties,
      publications: profile.publications,
      awards: profile.awards,
      certifications: profile.certifications,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };

    return NextResponse.json({ profile: formattedProfile });

  } catch (error) {
    logger.error('Get doctor profile error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    // Check if user is a doctor
    if (token.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized - only doctors can update their profile' },
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

    const userId = userResult.rows[0].id;

    // Get update data
    const updateData = await request.json();

    // Build update query dynamically
    let updateQuery = 'UPDATE doctor_profiles SET updated_at = CURRENT_TIMESTAMP';
    const updateParams: (string | number)[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'firstName', 'lastName', 'phoneNumber', 'professionalBio', 'consultationFee', 
      'languages', 'hospitalAffiliations', 'role', 'specialization', 'experienceYears',
      'education', 'workExperience', 'professionalRole'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        switch (field) {
          case 'firstName':
            updateQuery += `, first_name = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'lastName':
            updateQuery += `, last_name = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'phoneNumber':
            updateQuery += `, phone_number = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'professionalBio':
            updateQuery += `, professional_bio = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'consultationFee':
            updateQuery += `, consultation_fee = $${paramIndex}`;
            updateParams.push(parseFloat(updateData[field]));
            paramIndex++;
            break;
          case 'languages':
            updateQuery += `, languages = $${paramIndex}`;
            updateParams.push(JSON.stringify(updateData[field]));
            paramIndex++;
            break;
          case 'hospitalAffiliations':
            updateQuery += `, hospital_affiliations = $${paramIndex}`;
            updateParams.push(JSON.stringify(updateData[field]));
            paramIndex++;
            break;
          case 'role':
            updateQuery += `, role = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'specialization':
            updateQuery += `, specialization = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'experienceYears':
            updateQuery += `, experience_years = $${paramIndex}`;
            updateParams.push(parseInt(updateData[field]));
            paramIndex++;
            break;
          case 'education':
            updateQuery += `, education = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'workExperience':
            updateQuery += `, work_experience = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
          case 'professionalRole':
            updateQuery += `, professional_role = $${paramIndex}`;
            updateParams.push(updateData[field]);
            paramIndex++;
            break;
        }
      }
    }

    updateQuery += ` WHERE user_id = $${paramIndex} RETURNING *`;
    updateParams.push(userId);

    const result = await pool.query(updateQuery, updateParams);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Doctor profile not found' },
        { status: 404 }
      );
    }

    const updatedProfile = result.rows[0];

    // Log successful update
    await auditLog({
      userId: userId,
      action: 'DOCTOR_PROFILE_UPDATED',
      resource: 'doctor_profile',
      timestamp: new Date(),
      success: true,
      details: {
        updatedFields: Object.keys(updateData)
      }
    });

    // Format response
    const formattedProfile = {
      id: updatedProfile.id,
      firstName: updatedProfile.first_name,
      lastName: updatedProfile.last_name,
      email: updatedProfile.email,
      phoneNumber: updatedProfile.phone_number,
      specialization: updatedProfile.specialization,
      licenseNumber: updatedProfile.license_number,
      licenseState: updatedProfile.license_state,
      licenseExpiryDate: updatedProfile.license_expiry_date,
      npiNumber: updatedProfile.npi_number,
      deaNumber: updatedProfile.dea_number,
      professionalBio: updatedProfile.professional_bio,
      consultationFee: updatedProfile.consultation_fee,
      languages: updatedProfile.languages || [],
      hospitalAffiliations: updatedProfile.hospital_affiliations || [],
      isVerified: updatedProfile.is_verified,
      verificationStatus: updatedProfile.verification_status,
      verificationDate: updatedProfile.verification_date,
      rejectionReason: updatedProfile.rejection_reason,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: formattedProfile
    });

  } catch (error) {
    logger.error('Update doctor profile error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
