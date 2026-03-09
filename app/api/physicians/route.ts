import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // Add timeout to queries
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 10000)
    );

    // Get total count for pagination
    const countResult = await Promise.race([
      query('SELECT COUNT(*) FROM physicians'),
      timeoutPromise
    ]) as { count: string }[];
    
    if (!countResult || countResult.length === 0) {
      throw new Error('Failed to get physician count');
    }
    
    const totalCount = parseInt(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get physicians with pagination
    const result = await Promise.race([
      query(
        'SELECT * FROM physicians ORDER BY id LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      timeoutPromise
    ]) as {
    id: string;
    name: string;
    specialization: string;
    experience: string;
    education: string;
    languages: string;
    consultation_fee: number;
    image_url?: string;
    rating?: number;
    available_days: string;
    available_time: string;
    available_time_slots?: string;
    available_dates?: string;
    about: string;
    specialties?: string | string[];
    role?: string;
    bio?: string;
    image?: string;
    review_count?: number;
    consultations_count?: number;
    initial_consultation?: string;
    consultation_link?: string;
  }[];

    const physicians = result.map((row: {
    id: string;
    name: string;
    specialization: string;
    experience: string;
    education: string;
    languages: string;
    consultation_fee: number;
    image_url?: string;
    rating?: number;
    available_days: string;
    available_time: string;
    available_time_slots?: string;
    available_dates?: string;
    about: string;
    specialties?: string | string[];
    role?: string;
    bio?: string;
    image?: string;
    review_count?: number;
    consultations_count?: number;
    initial_consultation?: string;
    consultation_link?: string;
  }) => {
      // Parse specialties
      let specialties = [];
      if (row.specialties) {
        if (Array.isArray(row.specialties)) {
          specialties = row.specialties;
        } else if (typeof row.specialties === 'string') {
          // Try to parse as JSON first, then fallback to comma-separated or single string
          try {
            const parsed = JSON.parse(row.specialties);
            specialties = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // Handle comma-separated or single string values
            specialties = row.specialties.includes(',') 
              ? row.specialties.split(',').map((s: string) => s.trim())
              : [row.specialties.trim()];
          }
        }
      }

      // Parse available_time_slots
      let available_time_slots = [];
      try {
        available_time_slots = row.available_time_slots ? (typeof row.available_time_slots === 'string' ? JSON.parse(row.available_time_slots) : row.available_time_slots) : [];
      } catch (e) {
        console.error('Error parsing available_time_slots for physician', row.id, e);
        available_time_slots = [];
      }

      // Parse available_dates
      let available_dates = [];
      try {
        available_dates = row.available_dates ? (typeof row.available_dates === 'string' ? JSON.parse(row.available_dates) : row.available_dates) : [];
      } catch (e) {
        console.error('Error parsing available_dates for physician', row.id, e);
        available_dates = [];
      }

      return {
        id: row.id,
        name: row.name,
        role: row.role,
        bio: row.bio,
        image: row.image,
        education: row.education,
        experience: row.experience,
        specialties: specialties,
        rating: Number(row.rating) || 0,
        reviewCount: Number(row.review_count) || 0,
        consultationCount: Number(row.consultations_count) || 0,
        initialConsultation: Number(row.initial_consultation) || 150,
        available_time_slots: available_time_slots,
        available_dates: available_dates,
        consultationLink: row.consultation_link || '',
      };
    });

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
    const body: {
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  education?: string;
  experience?: string;
  specialties?: string[];
  consultationLink?: string;
} = await request.json();
    const { name, role, bio, image, education, experience, specialties, consultationLink } = body;

    const specialtiesString = specialties ? specialties.join(', ') : '';

    const result = await query(
      `INSERT INTO physicians (name, role, bio, image, education, experience, specialties, consultation_link) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name || '', role || '', bio || '', image || '', education || '', experience || '', specialtiesString, consultationLink || '']
    );

    const physician = {
      id: result[0].id,
      name: result[0].name,
      role: result[0].role,
      bio: result[0].bio,
      image: result[0].image,
      education: result[0].education,
      experience: result[0].experience,
      specialties: result[0].specialties ? String(result[0].specialties).split(',').map((s: string) => s.trim()) : [],
      rating: Number(result[0].rating) || 0,
      reviewCount: Number(result[0].review_count) || 0,
      consultationCount: Number(result[0].consultations_count) || 0,
      initialConsultation: Number(result[0].initial_consultation) || 150,
      available_time_slots: result[0].available_time_slots ? (typeof result[0].available_time_slots === 'string' ? JSON.parse(result[0].available_time_slots) : result[0].available_time_slots) : [],
      available_dates: result[0].available_dates ? (typeof result[0].available_dates === 'string' ? JSON.parse(result[0].available_dates) : result[0].available_dates) : [],
      consultationLink: result[0].consultation_link || '',
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
