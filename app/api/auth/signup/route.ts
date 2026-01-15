import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/app/lib/postgres';

export async function POST(request: Request) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      emergencyContact,
      emergencyPhone,
      allergies,
      medications,
      medicalHistory
    } = await request.json();
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
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

    // Create user with all profile information
    const user = await pool.query(
      `INSERT INTO users (
        id, email, password_hash, full_name, first_name, last_name, phone_number, date_of_birth,
        address, city, state, zip_code, emergency_contact, emergency_phone,
        allergies, medications, medical_history, gender
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, email, full_name, first_name, last_name, phone_number, created_at`,
      [
        userId,
        email,
        passwordHash,
        `${firstName} ${lastName}`,
        firstName,
        lastName,
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
        gender || null
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
          firstName: createdUser.first_name,
          lastName: createdUser.last_name,
          phone: createdUser.phone_number,
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