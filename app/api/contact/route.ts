import { NextResponse } from 'next/server';
import { postgresDb } from '../../lib/postgres-db';

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
    const contact = await postgresDb.contacts.create({
      name,
      email,
      message,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}