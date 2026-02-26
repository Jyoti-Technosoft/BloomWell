import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { decryptField } from '@/app/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Patients API called');
    
    // Get NextAuth token from cookies - using same pattern as dashboard API
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    console.log('📋 Token result:', token ? '✅ Found' : '❌ Missing');
    if (token) {
      console.log('👤 Token info:', { 
        id: token.id, 
        email: token.email, 
        role: token.role 
      });
    }

    if (!token) {
      console.log('❌ No token found - returning 401');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is a doctor
    if (token.role !== 'doctor') {
      console.log('❌ User is not a doctor - role:', token.role);
      return NextResponse.json(
        { error: 'Unauthorized - only doctors can access patients' },
        { status: 403 }
      );
    }

    console.log('✅ Doctor authenticated, proceeding with patient fetch');

    // Get doctor info - use token.id directly instead of email lookup
    const doctorId = token.id as string;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build query to get patients who have submitted evaluations
    let query = `
      SELECT DISTINCT 
        u.id,
        u.email,
        u.full_name,
        u.phone_number,
        u.date_of_birth,
        MAX(e.created_at) as last_visit,
        COUNT(e.id) as total_visits,
        MAX(CASE 
          WHEN e.status = 'pending_review' THEN e.created_at 
          ELSE NULL 
        END) as last_pending_date
      FROM users u
      JOIN evaluations e ON u.id = e.user_id
      WHERE u.role = 'patient'
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Add search filter
    if (search) {
      query += ` AND (u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY u.id, u.email, u.full_name, u.phone_number, u.date_of_birth
      ORDER BY last_visit DESC
    `;

    const result = await pool.query(query, params);

    // Process patients and decrypt data
    const patients = await Promise.all(
      result.rows.map(async (row) => {
        let decryptedName = row.full_name;
        let decryptedPhone = row.phone_number;
        let decryptedDateOfBirth = row.date_of_birth;

        try {
          // Decrypt patient data
          if (row.full_name && typeof row.full_name === 'object' && 'encrypted' in row.full_name) {
            decryptedName = await decryptField(row.full_name);
          }
          
          if (row.phone_number && typeof row.phone_number === 'object' && 'encrypted' in row.phone_number) {
            decryptedPhone = await decryptField(row.phone_number);
          }
          
          if (row.date_of_birth && typeof row.date_of_birth === 'object' && 'encrypted' in row.date_of_birth) {
            decryptedDateOfBirth = await decryptField(row.date_of_birth);
          }
        } catch (error) {
          console.error('Error decrypting patient data:', error);
        }

        // Determine patient status based on recent activity
        const lastVisit = new Date(row.last_visit);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let status: 'active' | 'inactive' | 'new';
        if (row.total_visits === 1) {
          status = 'new';
        } else if (lastVisit > thirtyDaysAgo) {
          status = 'active';
        } else {
          status = 'inactive';
        }

        // Parse name
        const nameParts = (decryptedName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          id: row.id,
          firstName,
          lastName,
          email: row.email,
          phoneNumber: decryptedPhone || '',
          dateOfBirth: decryptedDateOfBirth || '',
          lastVisit: row.last_visit,
          totalVisits: parseInt(row.total_visits),
          status,
          lastPendingDate: row.last_pending_date
        };
      })
    );

    // Filter by status if provided
    let filteredPatients = patients;
    if (status && status !== 'all') {
      filteredPatients = patients.filter(patient => patient.status === status);
    }

    return NextResponse.json({ patients: filteredPatients });

  } catch (error) {
    console.error('Get doctor patients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}
