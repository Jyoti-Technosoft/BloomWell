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
      medicalHistory,
    } = await request.json();

    /* ---------------- Validation ---------------- */

    if (!email || !password || !fullName || !phoneNumber || !dateOfBirth || !healthcarePurpose) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    /* ---------------- Check Existing User ---------------- */

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    /* ---------------- Hash Password ---------------- */

    const passwordHash = await bcrypt.hash(password, 12);

    const userId = `user_${crypto.randomUUID()}`;

    /* ---------------- Encrypt PHI ---------------- */

    const encryptedUserData = await encryptSensitiveFields({
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
      healthcarePurpose,
    });

    /* ---------------- Insert User ---------------- */

    const result = await pool.query(
      `
      INSERT INTO users (
        id,
        email,
        password_hash,
        full_name,
        phone_number,
        date_of_birth,
        address,
        city,
        state,
        zip_code,
        emergency_phone,
        allergies,
        medications,
        medical_history,
        healthcare_purpose
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      )
      RETURNING id, email, created_at
      `,
      [
        userId,
        email,
        passwordHash,
        JSON.stringify(encryptedUserData.fullName),
        JSON.stringify(encryptedUserData.phoneNumber),
        JSON.stringify(encryptedUserData.dateOfBirth),
        JSON.stringify(encryptedUserData.address),
        JSON.stringify(encryptedUserData.city),
        JSON.stringify(encryptedUserData.state),
        JSON.stringify(encryptedUserData.zipCode),
        JSON.stringify(encryptedUserData.emergencyPhone),
        JSON.stringify(encryptedUserData.allergies),
        JSON.stringify(encryptedUserData.medications),
        JSON.stringify(encryptedUserData.medicalHistory),
        JSON.stringify(encryptedUserData.healthcarePurpose),
      ]
    );

    /* ---------------- Response (NO PHI) ---------------- */

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: result.rows[0].id,
          email: result.rows[0].email,
          createdAt: result.rows[0].created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
