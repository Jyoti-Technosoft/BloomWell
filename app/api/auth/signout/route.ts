import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Signed out successfully' });
    
    // Clear the auth cookie with matching attributes
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // Clear NextAuth session token cookies with environment-specific names
    const sessionTokenName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
    
    const csrfTokenName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.csrf-token'
      : 'next-auth.csrf-token';
    
    const callbackUrlName = process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.callback-url'
      : 'next-auth.callback-url';

    // Clear session token
    response.cookies.set({
      name: sessionTokenName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // Clear CSRF token
    response.cookies.set({
      name: csrfTokenName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // Clear callback URL
    response.cookies.set({
      name: callbackUrlName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // Also clear the alternative names for safety
    response.cookies.set({
      name: 'next-auth.session-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set({
      name: 'next-auth.csrf-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set({
      name: 'next-auth.callback-url',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    // Clear secure versions for production
    response.cookies.set({
      name: '__Secure-next-auth.session-token',
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}