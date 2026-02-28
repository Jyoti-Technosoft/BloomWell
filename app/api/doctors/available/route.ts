import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consultationType = searchParams.get('consultationType');
    const userId = searchParams.get('userId');

    let query = `
      SELECT DISTINCT 
        u.id,
        u.full_name,
        dp.specialization,
        dp.is_verified,
        COUNT(c.id) as consultation_count
      FROM users u
      LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
      LEFT JOIN consultations c ON u.full_name = c.doctor_name
      WHERE u.role = 'doctor' 
        AND dp.is_verified = true
    `;

    const params: any[] = [];

    // If consultation type provided, filter by matching specialization
    if (consultationType && consultationType !== 'general') {
      // Map consultation types to specializations
      const typeToSpecialization: { [key: string]: string } = {
        'weight-loss': 'Weight Management',
        'muscle-gain': 'Sports Medicine',
        'improved-health': 'General Practice',
        'better-sleep': 'Sleep Medicine',
        'stress-reduction': 'Mental Health'
      };

      const targetSpecialization = typeToSpecialization[consultationType] || 'General Practice';
      query += ` AND (dp.specialization ILIKE $1 OR dp.specialization ILIKE $2)`;
      params.push(`%${targetSpecialization}%`, `%General Practice%`);
    }

    query += `
      GROUP BY u.id, u.full_name, dp.specialization, dp.is_verified
      ORDER BY consultation_count DESC, u.full_name ASC
    `;

    const result = await pool.query(query, params);

    // If no doctors found for specific type, return all verified doctors
    if (result.rows.length === 0 && consultationType) {
      const fallbackResult = await pool.query(`
        SELECT 
          u.id,
          u.full_name,
          dp.specialization,
          dp.is_verified,
          0 as consultation_count
        FROM users u
        LEFT JOIN doctor_profiles dp ON u.id = dp.user_id
        WHERE u.role = 'doctor' 
          AND dp.is_verified = true
        ORDER BY u.full_name ASC
      `);

      return NextResponse.json({
        success: true,
        doctors: fallbackResult.rows,
        fallbackUsed: true,
        message: 'No specialized doctors found, showing all verified doctors'
      });
    }

    return NextResponse.json({
      success: true,
      doctors: result.rows,
      fallbackUsed: false,
      message: consultationType ? 
        `Doctors matching ${consultationType} consultation type` : 
        'All verified doctors'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch doctors', details: error.message },
      { status: 500 }
    );
  }
}
