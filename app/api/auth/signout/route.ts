import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Signed out successfully' });
    
    // Clear the auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
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