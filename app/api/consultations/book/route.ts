import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { physicians } from '@/app/data/physicians';
import { generateNextSevenDays, generateTimeSlotsForDate, isPast } from '@/app/lib/dateUtils';

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
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;
    const bookingData = await request.json();

    // Validate required fields - matching new BookingModal structure
    const requiredFields = ['physicianId', 'date', 'time', 'consultationType', 'chiefComplaint'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate consultation type
    const validTypes = ['video', 'phone', 'in-person'];
    if (!validTypes.includes(bookingData.consultationType)) {
      return NextResponse.json(
        { error: 'Invalid consultation type' },
        { status: 400 }
      );
    }

    // Find physician
    const physician = physicians.find(p => p.id === bookingData.physicianId);
    if (!physician) {
      return NextResponse.json(
        { error: 'Physician not found' },
        { status: 404 }
      );
    }

    // Generate dynamic available dates and time slots
    const availableDates = generateNextSevenDays();
    const availableTimeSlots = bookingData.date ? generateTimeSlotsForDate(bookingData.date) : [];

    // Validate that requested date is within the next 7 days
    if (!availableDates.includes(bookingData.date)) {
      return NextResponse.json(
        { error: `Date ${bookingData.date} is not available. Please select a date within the next 7 days.` },
        { status: 400 }
      );
    }

    // Validate that requested time slot is available
    if (!availableTimeSlots.includes(bookingData.time)) {
      return NextResponse.json(
        { error: `Time slot ${bookingData.time} is not available for ${bookingData.date}. Available slots: ${availableTimeSlots.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date is in the future
    if (isPast(bookingData.date)) {
      return NextResponse.json(
        { error: 'Consultation date must be in the future' },
        { status: 400 }
      );
    }

    // Create consultation record matching existing database schema
    const consultation = {
      id: `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId, // Use the database user ID
      doctor_name: bookingData.doctorName, // This should be doctor name, but we'll map it
      doctor_specialty: bookingData.doctorSpecialty, // Map consultation type to specialty
      consultation_date: bookingData.date,
      consultation_time: bookingData.time,
      reason: bookingData.chiefComplaint, // Map chiefComplaint to reason
      status: 'scheduled',
      // Additional fields from new booking flow
      consultation_type: bookingData.consultationType,
      medical_history: bookingData.medicalHistory || '',
      medications: bookingData.medications || '',
      allergies: bookingData.allergies || '',
      preferred_pharmacy: bookingData.preferredPharmacy || '',
      insurance_provider: bookingData.insuranceInfo?.provider || '',
      insurance_member_id: bookingData.insuranceInfo?.memberId || '',
      consultation_fee: bookingData.consultationFee || 150,
      created_at: new Date().toISOString(),
    };

    const insertQuery = `
      INSERT INTO consultations (
        id, user_id, doctor_name, doctor_specialty, consultation_date, 
        consultation_time, reason, status, consultation_type, medical_history, 
        medications, allergies, preferred_pharmacy, insurance_provider, 
        insurance_member_id, consultation_fee, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `;

    await pool.query(insertQuery, [
      consultation.id,
      consultation.user_id,
      consultation.doctor_name,
      consultation.doctor_specialty,
      consultation.consultation_date,
      consultation.consultation_time,
      consultation.reason,
      consultation.status,
      consultation.consultation_type,
      consultation.medical_history,
      consultation.medications,
      consultation.allergies,
      consultation.preferred_pharmacy,
      consultation.insurance_provider,
      consultation.insurance_member_id,
      consultation.consultation_fee,
      consultation.created_at
    ]);

    let consultationLink = null;
    if (bookingData.consultationType === 'video') {
      // Generate a secure consultation link
      consultationLink = `https://consult.bloomwell.com/room/${consultation.id}`;
    }

    // await sendConfirmationEmail(session.user.email, consultation);

    return NextResponse.json({
      success: true,
      consultation: {
        ...consultation,
        consultationLink
      },
      message: 'Consultation booked successfully'
    });

  } catch (error) {
    console.error('Booking consultation error:', error);
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
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    // Get user's consultations
    // In a real implementation, fetch from database
    const consultations: any[] = []; // Placeholder

    return NextResponse.json({
      consultations,
      total: consultations.length
    });

  } catch (error) {
    console.error('Fetching consultations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultations' },
      { status: 500 }
    );
  }
}
