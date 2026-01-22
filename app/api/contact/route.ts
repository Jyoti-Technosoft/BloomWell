import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../lib/postgres';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    
    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save contact form submission to PostgreSQL
    const contactId = uuidv4();
    const result = await pool.query(
      'INSERT INTO contacts (id, name, email, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [contactId, name, email, message]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}