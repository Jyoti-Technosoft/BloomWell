import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { decryptField } from '@/app/lib/encryption';

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
    const userRole = token.role as string;
    if (userRole !== 'doctor') {
      return NextResponse.json(
        { error: 'Access denied - only doctors can view appointments' },
        { status: 403 }
      );
    }

    const doctorId = token.id as string;
    const doctorName = token.name as string;

    // Get consultations assigned to this doctor
    // Match by doctor_name field since that's what's stored in consultations table
    const consultations = await pool.query(
      `SELECT 
        c.id,
        c.user_id,
        c.doctor_name,
        c.doctor_specialty,
        c.consultation_date,
        c.consultation_time,
        c.reason,
        c.status,
        c.created_at,
        u.full_name as patient_name,
        u.email as patient_email
      FROM consultations c
      JOIN users u ON c.user_id = u.id
      WHERE c.doctor_name ILIKE $1
      ORDER BY c.consultation_date ASC, c.consultation_time ASC`,
      [`%${doctorName}%`] // Use ILIKE for partial matching
    );

    console.log(`📅 Found ${consultations.rows.length} consultations for Dr. ${doctorName}`);

    // Decrypt patient names
    const decryptedConsultations = await Promise.all(
      consultations.rows.map(async (consultation) => {
        let decryptedPatientName = consultation.patient_name;
        
        try {
          // Decrypt patient name if it's encrypted
          if (typeof consultation.patient_name === 'object' && 'encrypted' in consultation.patient_name) {
            decryptedPatientName = await decryptField(consultation.patient_name);
          } else if (typeof consultation.patient_name === 'string') {
            // Check if it's a JSON string that needs parsing
            try {
              const parsed = JSON.parse(consultation.patient_name);
              if (typeof parsed === 'object' && 'encrypted' in parsed) {
                decryptedPatientName = await decryptField(parsed);
              } else {
                decryptedPatientName = parsed;
              }
            } catch {
              // It's a plain string, use as-is
              decryptedPatientName = consultation.patient_name;
            }
          }
        } catch (error) {
          console.log('Failed to decrypt patient name:', error);
          decryptedPatientName = '[Decryption Failed]';
        }

        return {
          ...consultation,
          patient_name: decryptedPatientName
        };
      })
    );

    return NextResponse.json({ 
      consultations: decryptedConsultations,
      doctorName: doctorName,
      total: decryptedConsultations.length
    });

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
