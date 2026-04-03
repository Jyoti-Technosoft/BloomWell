import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import axios from 'axios';

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

    // Check if user is a doctor
    const userRole = token.role as string;
    if (userRole !== 'doctor') {
      return NextResponse.json(
        { error: 'Access denied - only doctors can join calls' },
        { status: 403 }
      );
    }

    const { consultationId } = await request.json();

    if (!consultationId) {
      return NextResponse.json(
        { error: 'Consultation ID is required' },
        { status: 400 }
      );
    }

    // Get consultation details
    const consultationResult = await pool.query(
      'SELECT * FROM consultations WHERE id = $1',
      [consultationId]
    );

    if (consultationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Consultation not found' },
        { status: 404 }
      );
    }

    const consultation = consultationResult.rows[0];

    // Check if consultation is scheduled and in the future
    if (consultation.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Consultation is not scheduled' },
        { status: 400 }
      );
    }

    // Create Daily.co room for the consultation
    const roomResponse = await axios.post(
      "https://api.daily.co/v1/rooms",
      { 
        name: `consultation-${consultationId}`,
        properties: { 
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: true,
          start_video_off: false,
          start_audio_off: false,
          lang: "en"
        } 
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // TODO: Store room URL in database when video_room_url column is available
    // await pool.query(
    //   'UPDATE consultations SET video_room_url = $1 WHERE id = $2',
    //   [roomResponse.data.url, consultationId]
    // );

    return NextResponse.json({
      roomUrl: roomResponse.data.url,
      roomName: roomResponse.data.name,
      consultation: {
        id: consultation.id,
        doctorName: consultation.doctor_name,
        consultationDate: consultation.consultation_date,
        consultationTime: consultation.consultation_time
      }
    });

  } catch (error) {
    console.error('Error creating video room:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}
