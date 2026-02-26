import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';

export async function POST() {
  try {
    // Add role column to users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient'
    `);

    // Create doctor_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        experience_years INTEGER DEFAULT 0,
        qualification TEXT,
        approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_doctor_profiles_approved ON doctor_profiles(approved)
    `);

    // Update existing users with appropriate roles based on email
    await pool.query(`
      UPDATE users SET role = 'admin' WHERE email LIKE '%admin%'
    `);
    
    await pool.query(`
      UPDATE users SET role = 'doctor' WHERE email LIKE '%doctor%' OR email LIKE '%medical%'
    `);

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully',
      changes: [
        'Added role column to users table',
        'Created doctor_profiles table',
        'Updated user roles based on email patterns'
      ]
    });

  } catch (error) {
    console.error('Database migration error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update database schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
