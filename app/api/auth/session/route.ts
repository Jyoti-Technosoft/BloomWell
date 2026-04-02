import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (token) {
      return NextResponse.json({
        valid: true,
        user: {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          doctorProfileId: token.doctorProfileId,
          isVerified: token.isVerified,
          verificationStatus: token.verificationStatus
        }
      });
    } else {
      return NextResponse.json({ 
        valid: false,
        user: null 
      }, { status: 401 }); // Return 401 for invalid session
    }
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ 
      valid: false,
      user: null 
    }, { status: 500 }); // Return 500 for errors
  }
}
