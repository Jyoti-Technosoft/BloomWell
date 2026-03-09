import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';
import { validateAndSanitize } from '@/app/lib/input-sanitizer';
import bcrypt from 'bcrypt';

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
  npiNumber: string;
  deaNumber: string;
  professionalBio: string;
  
  // Education & Experience (can be strings from textareas or arrays)
  education?: any;
  experience?: any;
  professionalRole?: string;
  workExperience?: string;
  
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
      'specialization', 'licenseNumber', 'licenseState', 'licenseExpiryDate', 'npiNumber', 'deaNumber'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof DoctorRegistrationData]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    // Additional validation for license expiry date
    if (!data.licenseExpiryDate || data.licenseExpiryDate.trim() === '') {
      return NextResponse.json(
        { error: 'License expiry date is required' },
        { status: 400 }
      );
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
    const firstNameResult = validateAndSanitize({ firstName: data.firstName }, {
      firstName: { type: 'name', required: true, maxLength: 50 }
    });
    
    const lastNameResult = validateAndSanitize({ lastName: data.lastName }, {
      lastName: { type: 'name', required: true, maxLength: 50 }
    });
    
    const emailResult = validateAndSanitize({ email: data.email }, {
      email: { type: 'email', required: true, maxLength: 255 }
    });
    
    const phoneResult = validateAndSanitize({ phoneNumber: data.phoneNumber }, {
      phoneNumber: { type: 'phone', required: true, maxLength: 20 }
    });
    
    const specializationResult = validateAndSanitize({ specialization: data.specialization }, {
      specialization: { type: 'text', required: true, maxLength: 100 }
    });
    
    const licenseNumberResult = validateAndSanitize({ licenseNumber: data.licenseNumber }, {
      licenseNumber: { type: 'text', required: true, maxLength: 50 }
    });
    
    const licenseStateResult = validateAndSanitize({ licenseState: data.licenseState }, {
      licenseState: { type: 'text', required: true, maxLength: 50 }
    });
    
    const npiNumberResult = validateAndSanitize({ npiNumber: data.npiNumber }, {
      npiNumber: { type: 'text', required: true, maxLength: 20 }
    });
    
    const deaNumberResult = validateAndSanitize({ deaNumber: data.deaNumber }, {
      deaNumber: { type: 'text', required: true, maxLength: 20 }
    });
    
    const bioResult = data.professionalBio ? validateAndSanitize({ professionalBio: data.professionalBio }, {
      professionalBio: { type: 'html', maxLength: 1000 }
    }) : { isValid: true, sanitizedData: { professionalBio: null }, errors: [] };
    
    const feeResult = data.consultationFee ? validateAndSanitize({ consultationFee: data.consultationFee }, {
      consultationFee: { type: 'text', maxLength: 10 }
    }) : { isValid: true, sanitizedData: { consultationFee: null }, errors: [] };

    // Check if any validation failed
    const allErrors = [
      ...firstNameResult.errors,
      ...lastNameResult.errors,
      ...emailResult.errors,
      ...phoneResult.errors,
      ...specializationResult.errors,
      ...licenseNumberResult.errors,
      ...licenseStateResult.errors,
      ...npiNumberResult.errors,
      ...deaNumberResult.errors,
      ...bioResult.errors,
      ...feeResult.errors
    ];

    if (allErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: allErrors },
        { status: 400 }
      );
    }

    // Only proceed with sanitized data if all validations passed
    const sanitizedData = {
      firstName: firstNameResult.sanitizedData.firstName,
      lastName: lastNameResult.sanitizedData.lastName,
      email: emailResult.sanitizedData.email,
      phoneNumber: phoneResult.sanitizedData.phoneNumber,
      specialization: specializationResult.sanitizedData.specialization,
      licenseNumber: licenseNumberResult.sanitizedData.licenseNumber,
      licenseState: licenseStateResult.sanitizedData.licenseState,
      npiNumber: npiNumberResult.sanitizedData.npiNumber,
      deaNumber: deaNumberResult.sanitizedData.deaNumber,
      professionalBio: bioResult.sanitizedData.professionalBio,
      consultationFee: feeResult.sanitizedData.consultationFee
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
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generate user ID
    const generatedUserId = `doctor_${crypto.randomUUID()}`;

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create user with doctor role
      const userResult = await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone_number, date_of_birth, healthcare_purpose, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'doctor', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          generatedUserId,
          sanitizedData.email,
          hashedPassword,
          `${sanitizedData.firstName} ${sanitizedData.lastName}`,
          sanitizedData.phoneNumber,
          '1900-01-01', // Default date of birth for doctors (will be updated in profile)
          'Healthcare Provider' // Default healthcare purpose for doctors
        ]
      );

      const userId = userResult.rows[0].id;
      // Handle education and experience - convert from string if needed
      let educationData: any = data.education || [];
      let experienceData: any = data.experience || [];
      
      // If education is a string, convert it to the expected format
      if (typeof educationData === 'string' && educationData.trim()) {
        educationData = [{
          degree: educationData.trim(),
          institution: '',
          year: ''
        }];
      }
      
      // If experience is a string, convert it to the expected format  
      if (typeof experienceData === 'string' && experienceData.trim()) {
        experienceData = [{
          position: experienceData.trim(),
          institution: '',
          startDate: '',
          current: true
        }];
      }

      // Create doctor profile
      // Log all values before insertion for debugging
      const insertValues = [
        userId, // user_id
        sanitizedData.firstName, // first_name
        sanitizedData.lastName, // last_name
        sanitizedData.specialization, // specialization
        sanitizedData.licenseNumber, // license_number
        sanitizedData.licenseState, // license_state
        data.licenseExpiryDate, // license_expiry_date
        sanitizedData.npiNumber, // npi_number
        sanitizedData.deaNumber, // dea_number
        sanitizedData.phoneNumber, // phone_number
        sanitizedData.email, // email
        sanitizedData.professionalBio, // professional_bio
        JSON.stringify(experienceData), // experience (JSONB)
        JSON.stringify(data.hospitalAffiliations || []), // hospital_affiliations (JSONB)
        JSON.stringify(data.languages || ['English']), // languages (JSONB)
        sanitizedData.consultationFee ? parseFloat(sanitizedData.consultationFee) : null, // consultation_fee
        JSON.stringify({}), // availability (JSONB) - empty for now
        JSON.stringify([]), // verification_documents (JSONB) - empty for now
        null, // verification_date
        null, // rejection_reason
        false, // is_verified
        'pending', // verification_status
        data.experience ? parseInt(data.experience) : null, // experience_years
        data.education || null, // education (TEXT)
        data.professionalRole || null, // professional_role
        data.workExperience || null, // work_experience
        JSON.stringify([]), // specialties (TEXT) - empty for now
        JSON.stringify([]), // publications (TEXT) - empty for now
        JSON.stringify([]), // awards (TEXT) - empty for now
        JSON.stringify([]), // certifications (TEXT) - empty for now
        'doctor' // role
      ];

      // Note: user_id is now VARCHAR in both tables, no casting needed
      const profileResult = await client.query(
        `INSERT INTO doctor_profiles (
           user_id, first_name, last_name, specialization, license_number, 
           license_state, license_expiry_date, npi_number, dea_number,
           phone_number, email, professional_bio, experience, hospital_affiliations, 
           languages, consultation_fee, availability, verification_documents, 
           verification_date, rejection_reason, is_verified, verification_status,
           experience_years, education, professional_role, work_experience,
           specialties, publications, awards, certifications, role,
           created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        insertValues
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
          
        } else {
          console.log('⚠️ Specialization not found:', sanitizedData.specialization);
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
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Doctor registration request error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

