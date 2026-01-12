import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await pool.query('SELECT COUNT(*) FROM physicians');
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get physicians with pagination
    const result = await pool.query(
      'SELECT * FROM physicians ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const physicians = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      bio: row.bio,
      image: row.image,
      education: row.education,
      experience: row.experience,
      specialties: row.specialties ? row.specialties.split(',').map((s: string) => s.trim()) : [],
      rating: parseFloat(row.rating) || 0,
      reviewCount: parseInt(row.review_count) || 0,
      consultationCount: parseInt(row.consultations_count) || 0,
      initialConsultation: parseFloat(row.initial_consultation) || 150,
    }));

    return NextResponse.json({
      members: physicians,
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (error) {
    console.error('Error fetching physicians:', error);
    return NextResponse.json(
      { error: 'Failed to fetch physicians' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, bio, image, education, experience, specialties } = body;

    const specialtiesString = specialties ? specialties.join(', ') : '';

    const result = await pool.query(
      `INSERT INTO physicians (name, role, bio, image, education, experience, specialties) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [name, role, bio, image, education, experience, specialtiesString]
    );

    const physician = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      role: result.rows[0].role,
      bio: result.rows[0].bio,
      image: result.rows[0].image,
      education: result.rows[0].education,
      experience: result.rows[0].experience,
      specialties: result.rows[0].specialties ? result.rows[0].specialties.split(',').map((s: string) => s.trim()) : [],
      rating: parseFloat(result.rows[0].rating) || 0,
      reviewCount: parseInt(result.rows[0].review_count) || 0,
      consultationCount: parseInt(result.rows[0].consultations_count) || 0,
      initialConsultation: parseFloat(result.rows[0].initial_consultation) || 150,
    };

    return NextResponse.json(physician, { status: 201 });
  } catch (error) {
    console.error('Error creating physician:', error);
    return NextResponse.json(
      { error: 'Failed to create physician' },
      { status: 500 }
    );
  }
}
