import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/doctor/auth/signin',
    '/doctor/auth/register',
    '/privacy',
    '/terms',
    '/hipaa',
    '/api/auth',
    '/api/doctor/auth'
  ];

  // Check if the path is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from request
  const token = await getToken({ 
    req: request, 
    secret: process.env.JWT_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });

  // If no token, redirect to appropriate sign in
  if (!token) {
    if (pathname.startsWith('/doctor')) {
      const signInUrl = new URL('/doctor/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    } else {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Role-based access control
  const userRole = token.role as string;
  
  // Doctor routes protection
  if (pathname.startsWith('/doctor')) {
    if (userRole !== 'doctor') {
      const signInUrl = new URL('/doctor/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if doctor is verified (except for profile page)
    if (!token.isVerified && pathname !== '/doctor/profile') {
      const profileUrl = new URL('/doctor/profile', request.url);
      return NextResponse.redirect(profileUrl);
    }
  }

  // Patient routes protection
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/evaluations') || pathname.startsWith('/appointments')) {
    if (userRole !== 'patient') {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
};
