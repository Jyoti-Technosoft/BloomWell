import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { postgresDb } from '../../../lib/postgres-db';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

const handler = NextAuth({
  secret: process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Call signin API to get decrypted user data
          const baseUrl = process.env.NEXTAUTH_URL || 
            (process.env.PROD_URL ? `https://${process.env.PROD_URL}` : 'http://localhost:3000');
          const response = await fetch(`${baseUrl}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });

          if (!response.ok) {
            console.error('Signin API response not ok:', response.status);
            return null;
          }

          const data = await response.json();
          if (data.error) {
            console.error('Signin API returned error:', data.error);
            return null;
          }

          console.log('Signin API response:', data);

          // Check if user data exists and has required fields
          if (!data.user || !data.user.id || !data.user.fullName || !data.user.email) {
            console.error('Invalid signin API response - missing user object:', data);
            return null;
          }

          // The response structure is correct, so return the user object
          return {
            id: data.user.id,
            name: data.user.fullName, // Use decrypted name from signin API
            email: data.user.email,
          };
        } catch (error) {
          console.error('Authorize function error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes for HIPAA compliance
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - token:', token);
      console.log('JWT callback - user:', user);
      
      if (!user) {
        console.error('JWT callback - user is null or undefined');
        return token;
      }
      
      if (!user.id) {
        console.error('JWT callback - user.id is missing');
        return token;
      }
      
      token.id = user.id;
      console.log('JWT callback - setting token.id to:', user.id);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
