import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      return NextResponse.json({
        user: null,
        expires: null
      });
    }

    return NextResponse.json({
      user: {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        doctorProfileId: token.doctorProfileId,
        isVerified: token.isVerified,
        verificationStatus: token.verificationStatus
      },
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Session API error:', error);

    return NextResponse.json({
      user: null,
      expires: null
    });
  }
}
