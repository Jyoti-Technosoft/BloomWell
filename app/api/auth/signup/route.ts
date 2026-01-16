import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/app/lib/postgres';
import { encryptSensitiveFields } from '@/app/lib/encryption';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      fullName,
      phoneNumber,
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
    } = await request.json();
    
    // Validate input - only check fields that exist in database schema
    if (!email || !password || !fullName || !phoneNumber || !dateOfBirth || !healthcarePurpose) {
      return NextResponse.json(
        { error: 'Email, password, full name, phone number, date of birth, and healthcare purpose are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TEMPORARILY DISABLED: Encrypt sensitive fields before saving to database
    // TODO: Re-enable after database columns are updated to TEXT type
    const userData = {
      email,
      fullName,
      phoneNumber,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      emergencyPhone,
      allergies,
      medications,
      medicalHistory,
      healthcarePurpose
    };

    const encryptedUserData = userData; // Temporarily using unencrypted data

    // Create user with encrypted sensitive fields
    const user = await pool.query(
      `INSERT INTO users (
        id, email, password_hash, full_name, phone_number, date_of_birth,
        address, city, state, zip_code, emergency_phone,
        allergies, medications, medical_history, healthcare_purpose
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, email, full_name, phone_number, date_of_birth, healthcare_purpose, address, city, state, zip_code, emergency_phone, allergies, medications, medical_history, created_at`,
      [
        userId,
        email,
        passwordHash,
        encryptedUserData.fullName || null,
        encryptedUserData.phoneNumber || null,
        encryptedUserData.dateOfBirth || null,
        encryptedUserData.address || null,
        encryptedUserData.city || null,
        encryptedUserData.state || null,
        encryptedUserData.zipCode || null,
        encryptedUserData.emergencyPhone || null,
        encryptedUserData.allergies || null,
        encryptedUserData.medications || null,
        encryptedUserData.medicalHistory || null,
        healthcarePurpose
      ]
    );

    // Return user data without password
    const createdUser = user.rows[0];
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.full_name,
          phone: createdUser.phone_number,
          dateOfBirth: createdUser.date_of_birth,
          healthcarePurpose: createdUser.healthcarePurpose,
          address: createdUser.address,
          city: createdUser.city,
          state: createdUser.state,
          zipCode: createdUser.zip_code,
          emergencyPhone: createdUser.emergency_phone,
          allergies: createdUser.allergies,
          medications: createdUser.medications,
          medicalHistory: createdUser.medical_history,
          createdAt: createdUser.created_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}