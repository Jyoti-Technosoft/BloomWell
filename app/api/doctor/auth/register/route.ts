import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';
import { validateAndSanitize } from '@/app/lib/input-sanitizer';

interface DoctorRegistrationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  
  // Professional Information
  specialization: string;
  licenseNumber: string;
  licenseState: string;
  licenseExpiryDate: string;
  npiNumber?: string;
  deaNumber?: string;
  professionalBio?: string;
  
  // Education & Experience
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience?: Array<{
    position: string;
    institution: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }>;
  
  // Practice Information
  consultationFee?: string;
  languages?: string[];
  hospitalAffiliations?: string[];
  
  // Terms
  agreeTerms: boolean;
  agreeHipaa: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: DoctorRegistrationData = await request.json();

    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword',
      'specialization', 'licenseNumber', 'licenseState', 'licenseExpiryDate'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof DoctorRegistrationData]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate password match
    if (data.password !== data.confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      firstName: validateAndSanitize(data.firstName, 'First Name').sanitized,
      lastName: validateAndSanitize(data.lastName, 'Last Name').sanitized,
      email: validateAndSanitize(data.email, 'Email').sanitized,
      phoneNumber: validateAndSanitize(data.phoneNumber, 'Phone Number').sanitized,
      specialization: validateAndSanitize(data.specialization, 'Specialization').sanitized,
      licenseNumber: validateAndSanitize(data.licenseNumber, 'License Number').sanitized,
      licenseState: validateAndSanitize(data.licenseState, 'License State').sanitized,
      professionalBio: data.professionalBio ? validateAndSanitize(data.professionalBio, 'Professional Bio').sanitized : null,
      consultationFee: data.consultationFee ? validateAndSanitize(data.consultationFee, 'Consultation Fee').sanitized : null
    };

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [sanitizedData.email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const existingLicense = await pool.query(
      'SELECT id FROM doctor_profiles WHERE license_number = $1',
      [sanitizedData.licenseNumber]
    );

    if (existingLicense.rows.length > 0) {
      return NextResponse.json(
        { error: 'License number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create user with doctor role
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, full_name, phone_number, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'doctor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          sanitizedData.email,
          hashedPassword,
          `${sanitizedData.firstName} ${sanitizedData.lastName}`,
          sanitizedData.phoneNumber
        ]
      );

      const userId = userResult.rows[0].id;

      // Create doctor profile
      const profileResult = await client.query(
        `INSERT INTO doctor_profiles (
           user_id, first_name, last_name, specialization, license_number, 
           license_state, license_expiry_date, npi_number, dea_number,
           phone_number, email, professional_bio, consultation_fee,
           education, experience, languages, hospital_affiliations,
           is_verified, verification_status, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, false, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          userId,
          sanitizedData.firstName,
          sanitizedData.lastName,
          sanitizedData.specialization,
          sanitizedData.licenseNumber,
          sanitizedData.licenseState,
          data.licenseExpiryDate,
          data.npiNumber || null,
          data.deaNumber || null,
          sanitizedData.phoneNumber,
          sanitizedData.email,
          sanitizedData.professionalBio,
          sanitizedData.consultationFee ? parseFloat(sanitizedData.consultationFee) : null,
          JSON.stringify(data.education || []),
          JSON.stringify(data.experience || []),
          JSON.stringify(data.languages || ['English']),
          JSON.stringify(data.hospitalAffiliations || [])
        ]
      );

      const doctorProfileId = profileResult.rows[0].id;

      // Add specializations
      if (data.specialization) {
        const specializationResult = await client.query(
          'SELECT id FROM doctor_specializations WHERE name = $1',
          [sanitizedData.specialization]
        );

        if (specializationResult.rows.length > 0) {
          await client.query(
            'INSERT INTO doctor_specialization_link (doctor_id, specialization_id) VALUES ($1, $2)',
            [doctorProfileId, specializationResult.rows[0].id]
          );
        }
      }

      await client.query('COMMIT');

      // Log successful registration
      await auditLog({
        userId: userId,
        action: 'DOCTOR_REGISTRATION',
        resource: 'doctor_profile',
        timestamp: new Date(),
        success: true,
        details: {
          email: sanitizedData.email,
          licenseNumber: sanitizedData.licenseNumber,
          specialization: sanitizedData.specialization
        }
      });

      logger.info('Doctor registration successful', {
        userId,
        email: sanitizedData.email,
        licenseNumber: sanitizedData.licenseNumber
      });

      return NextResponse.json({
        success: true,
        message: 'Doctor registration successful. Your profile is pending verification.',
        userId: userId,
        doctorProfileId: doctorProfileId
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    logger.error('Doctor registration error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
