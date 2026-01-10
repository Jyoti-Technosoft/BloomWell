import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    const client = await pool.connect();
    
    // Get total count for pagination
    const countResult = await client.query(
      `SELECT COUNT(*) as total 
       FROM reviews 
       WHERE status IN ('approved', 'pending')`
    );
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated reviews
    const result = await client.query(
      `SELECT id, name, rating, content, created_at 
       FROM reviews 
       WHERE status IN ('approved', 'pending') 
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    client.release();
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, rating, content, userId } = body;

    if (!name || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'Name, rating, and content are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    const reviewId = uuidv4();
    
    await client.query(
      `INSERT INTO reviews (id, user_id, name, email, rating, content, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'approved')`,
      [reviewId, userId || null, name, email || null, rating, content]
    );
    
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        id: reviewId,
        name,
        rating,
        content,
        status: 'approved'
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
