import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { postgresDb } from '../../lib/postgres-db';

export async function POST(request: NextRequest) {
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

    // Get email from NextAuth token
    const userEmail = token.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - no email found' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await postgresDb.users.findByEmail(userEmail);
    
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

    // Get email from NextAuth token
    const userEmail = token.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - no email found' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await postgresDb.users.findByEmail(userEmail);
    
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
