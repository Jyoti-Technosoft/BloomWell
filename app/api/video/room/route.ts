import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const response = await axios.post(
      "https://api.daily.co/v1/rooms",
      { 
        properties: { 
          exp: Math.floor(Date.now() / 1000) + 3600,
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

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating Daily.co room:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await axios.get(
      "https://api.daily.co/v1/rooms",
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching Daily.co rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
