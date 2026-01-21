import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { postgresDb } from '../../../lib/postgres-db';
import { decryptSensitiveFields } from '@/app/lib/encryption';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await postgresDb.users.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response with user data (without password)
    const { password_hash, ...userWithoutPassword } = user;
    
    // Map database field names to encryption field names
    const mappedUser = {
      fullName: userWithoutPassword.full_name,
      phoneNumber: userWithoutPassword.phone_number,
      dateOfBirth: userWithoutPassword.date_of_birth,
      healthcarePurpose: userWithoutPassword.healthcarePurpose,
      email: userWithoutPassword.email,
      id: userWithoutPassword.id,
      created_at: userWithoutPassword.created_at
    };
    
    // Decrypt sensitive fields before returning
    const decryptedUser = await decryptSensitiveFields(mappedUser);
    
    const response = NextResponse.json({ user: decryptedUser }, { status: 200 });

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set x-user header with decrypted data
    response.headers.set('x-user', JSON.stringify(decryptedUser));

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    );
  }
}