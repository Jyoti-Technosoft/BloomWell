import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      doctorProfileId?: string;
      isVerified?: boolean;
      verificationStatus?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    doctorProfileId?: string;
    isVerified?: boolean;
    verificationStatus?: string;
  }
}

const handler = NextAuth({
  secret: process.env.JWT_SECRET,
  providers: [
    // Patient credentials provider
    CredentialsProvider({
      id: 'patient-credentials',
      name: 'Patient Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
          const response = await fetch(`${baseUrl}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          if (!response.ok) return null;

          const data = await response.json();
          if (data.error) return null;

          if (!data.user || !data.user.id || !data.user.fullName) {
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            role: data.user.role || 'patient'
          };
        } catch (error) {
          console.error('Patient authorize error:', error);
          return null;
        }
      },
    }),

    // Doctor credentials provider
    CredentialsProvider({
      id: 'doctor-credentials',
      name: 'Doctor Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
          const response = await fetch(`${baseUrl}/api/doctor/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          if (!response.ok) return null;

          const data = await response.json();
          if (data.error) return null;

          if (!data.user || !data.user.id || !data.user.email) {
            return null;
          }

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            doctorProfileId: data.user.doctorProfileId,
            isVerified: data.user.isVerified,
            verificationStatus: data.user.verificationStatus
          };
        } catch (error) {
          console.error('Doctor authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes for HIPAA compliance
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined,
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        return {
          ...token,
          id: user.id,
          role: (user as any).role || 'patient',
          doctorProfileId: (user as any).doctorProfileId,
          isVerified: (user as any).isVerified,
          verificationStatus: (user as any).verificationStatus
        };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.doctorProfileId = token.doctorProfileId as string;
        session.user.isVerified = token.isVerified as boolean;
        session.user.verificationStatus = token.verificationStatus as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
