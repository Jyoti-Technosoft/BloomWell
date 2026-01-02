import { NextResponse } from 'next/server';
import { postgresDb } from '../../lib/postgres-db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await postgresDb.users.findByEmail(decoded.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { doctorName, doctorSpecialty, date, time, reason } = await request.json();

    // Validate required fields
    if (!doctorName || !date || !time || !reason) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create consultation booking
    const booking = await postgresDb.consultations.create({
      user_id: user.id,
      doctor_name: doctorName,
      doctor_specialty: doctorSpecialty,
      consultation_date: date,
      consultation_time: time,
      reason,
      status: 'pending'
    });

    return NextResponse.json(
      { 
        message: 'Consultation booked successfully',
        bookingId: booking.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error booking consultation:', error);
    return NextResponse.json(
      { error: 'Failed to book consultation' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await postgresDb.users.findByEmail(decoded.email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's consultations
    const consultations = await postgresDb.consultations.findMany({ user_id: user.id });

    return NextResponse.json({ consultations });

  } catch (error) {
    console.error('Error fetching consultations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}
